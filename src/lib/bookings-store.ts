import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import type {
  BookingHistoryEntry,
  BookingRecord,
  BookingStatus,
  BookingSource,
} from "./bookings-types";
import { isBookingStatus, MIN_LEAD_MS } from "./bookings-types";

// Persistent cloud JSON bin. Set BOOKINGS_DB_URL in env — never expose it to
// the client bundle. The fallback keeps existing deployments working; rotate
// the bin and move the URL to an env var as soon as possible.
function cloudDbUrl(): string | null {
  return (
    process.env.BOOKINGS_DB_URL?.trim() ||
    "***REMOVED_LEGACY_STORAGE_URL***"
  );
}

// Writable file path in OS temp directory
const TMP_DATA_FILE = path.join(os.tmpdir(), "alghdeer-bookings.json");
// Local project data directory
const LOCAL_DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_DATA_FILE = path.join(LOCAL_DATA_DIR, "bookings.json");

// In-memory cache across warm serverless requests
declare global {
  var __alghdeer_bookings_memory__: BookingRecord[] | undefined;
}

if (!globalThis.__alghdeer_bookings_memory__) {
  globalThis.__alghdeer_bookings_memory__ = [];
}

let mutex: Promise<void> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = mutex.then(fn);
  mutex = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

function normalizeHistory(value: unknown): BookingHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (entry): entry is { status: BookingStatus; at: string } =>
        Boolean(entry) &&
        isBookingStatus(entry.status) &&
        typeof entry.at === "string" &&
        Number.isFinite(Date.parse(entry.at))
    )
    .map((entry) => ({
      status: entry.status,
      at: new Date(entry.at).toISOString(),
    }))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
    .slice(-100);
}

export function normalizeRecord(o: any): BookingRecord {
  const now = new Date().toISOString();
  if (!o || typeof o !== "object") {
    return {
      id: "ALG-" + randomUUID().substring(0, 6).toUpperCase(),
      name: "ضيف",
      phone: "—",
      email: "",
      company: "—",
      groupSize: 10,
      notes: "",
      preferredAt: now,
      status: "pending",
      source: "website",
      createdAt: now,
      history: [{ status: "pending", at: now }],
    };
  }

  const status = isBookingStatus(o.status) ? o.status : "pending";
  return {
    id: String(o.id || "ALG-" + randomUUID().substring(0, 6).toUpperCase()),
    name: String(o.name || "ضيف"),
    phone: String(o.phone || "—"),
    email: String(o.email || ""),
    company: String(o.company || "—"),
    groupSize: Number.isFinite(Number(o.groupSize)) && Number(o.groupSize) >= 1 ? Number(o.groupSize) : 10,
    notes: String(o.notes || ""),
    preferredAt: String(o.preferredAt || now),
    status,
    source: (o.source === "staff" ? "staff" : "website") as BookingSource,
    createdAt: String(o.createdAt || now),
    updatedAt: o.updatedAt ? String(o.updatedAt) : undefined,
    history: normalizeHistory(o.history),
  };
}

/**
 * Fetch latest bookings from persistent cloud database with timeout protection
 */
export async function fetchFromCloudDB(): Promise<BookingRecord[] | null> {
  const url = cloudDbUrl();
  if (!url) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const json = await res.json();
    if (json && Array.isArray(json.bookings)) {
      return json.bookings.map(normalizeRecord);
    }
  } catch (err) {
    // Cloud fetch timeout or network error - fallback to disk/memory
  }
  return null;
}

/**
 * Save bookings to persistent cloud database
 */
export async function saveToCloudDB(rows: BookingRecord[]): Promise<void> {
  const url = cloudDbUrl();
  if (!url) return;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bookings: rows }),
      signal: controller.signal,
    });
    clearTimeout(timer);
  } catch (err) {
    console.error("Cloud DB save error:", err);
  }
}

async function readFromDisk(): Promise<BookingRecord[]> {
  // 1. Try reading from tmp directory (Vercel writable)
  try {
    const raw = await fs.readFile(TMP_DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(normalizeRecord);
    }
  } catch {}

  // 2. Try reading from local project data directory
  try {
    const raw = await fs.readFile(LOCAL_DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(normalizeRecord);
    }
  } catch {}

  return [];
}

async function writeToDisk(rows: BookingRecord[]): Promise<void> {
  const jsonStr = JSON.stringify(rows, null, 2);

  // 1. Write to OS temp directory
  try {
    await fs.writeFile(TMP_DATA_FILE, jsonStr, "utf8");
  } catch {}

  // 2. Write to local project data directory
  try {
    await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
    await fs.writeFile(LOCAL_DATA_FILE, jsonStr, "utf8");
  } catch {}
}

export async function listBookings(): Promise<BookingRecord[]> {
  // 1. First fetch from Cloud Database
  const cloudRows = await fetchFromCloudDB();
  const diskRows = await readFromDisk();
  const memRows = globalThis.__alghdeer_bookings_memory__ || [];

  // Merge unique by ID
  const map = new Map<string, BookingRecord>();
  for (const r of memRows) map.set(r.id, r);
  for (const r of diskRows) map.set(r.id, r);
  if (cloudRows) {
    for (const r of cloudRows) map.set(r.id, r);
  }

  const combined = Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  globalThis.__alghdeer_bookings_memory__ = combined;
  return combined;
}

export type NewBookingInput = {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  groupSize?: number;
  notes?: string;
  preferredAt?: string;
  status: BookingStatus;
  source: BookingSource;
};

export async function appendBooking(input: NewBookingInput): Promise<BookingRecord> {
  return enqueue(async () => {
    const rows = await listBookings();
    const createdAt = new Date().toISOString();
    let id = input.id?.trim() || "ALG-" + randomUUID().substring(0, 6).toUpperCase();

    // A client-supplied ticket ID may never overwrite an existing booking.
    while (rows.some((row) => row.id === id)) {
      id = "ALG-" + randomUUID().substring(0, 6).toUpperCase();
    }

    const row: BookingRecord = {
      id,
      name: input.name || "ضيف",
      phone: input.phone || "—",
      email: input.email || "",
      company: input.company || "—",
      groupSize: Number.isFinite(input.groupSize) && Number(input.groupSize) >= 1 ? Number(input.groupSize) : 10,
      notes: input.notes || "",
      preferredAt: input.preferredAt || new Date(Date.now() + 86400000).toISOString(),
      status: input.status || "pending",
      source: input.source || "website",
      createdAt,
      updatedAt: createdAt,
      history: [{ status: input.status || "pending", at: createdAt }],
    };

    rows.unshift(row);
    globalThis.__alghdeer_bookings_memory__ = rows;

    // Parallel persist to disk and cloud database
    await Promise.allSettled([
      writeToDisk(rows),
      saveToCloudDB(rows),
    ]);

    return row;
  });
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<BookingRecord | null> {
  return enqueue(async () => {
    const rows = await listBookings();
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) return null;
    if (rows[i]!.status === status) return rows[i]!;

    const at = new Date().toISOString();
    rows[i] = {
      ...rows[i]!,
      status,
      updatedAt: at,
      history: [...rows[i]!.history, { status, at }].slice(-100),
    };
    globalThis.__alghdeer_bookings_memory__ = rows;

    await Promise.allSettled([
      writeToDisk(rows),
      saveToCloudDB(rows),
    ]);

    return rows[i]!;
  });
}

export async function deleteBooking(id: string): Promise<boolean> {
  return enqueue(async () => {
    const rows = await listBookings();
    const next = rows.filter((r) => r.id !== id);
    if (next.length === rows.length) return false;
    globalThis.__alghdeer_bookings_memory__ = next;

    await Promise.allSettled([
      writeToDisk(next),
      saveToCloudDB(next),
    ]);

    return true;
  });
}

export function isPreferredAtValidForPublic(preferredAtIso: string): boolean {
  const t = Date.parse(preferredAtIso);
  if (!Number.isFinite(t)) return false;
  // Website bookings require at least MIN_LEAD_MS of lead time (24h)
  return t >= Date.now() + MIN_LEAD_MS;
}

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

export function isEmailValid(email: string): boolean {
  return EMAIL_RE.test(email);
}

/** Strips control characters that could break logs, CSV exports or mail headers. */
function stripControlChars(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

export function sanitizeBookingFields(body: Record<string, unknown>) {
  const id = body.id ? String(body.id).trim().slice(0, 40) : undefined;
  const name = stripControlChars(String(body.name ?? "")).trim().slice(0, 120);
  const phone = String(body.phone ?? "").trim().slice(0, 40);
  const email = String(body.email ?? "").trim().slice(0, 160);
  const company = stripControlChars(String(body.company ?? "")).trim().slice(0, 120);
  const notes = stripControlChars(String(body.notes ?? "")).trim().slice(0, 4000);
  const preferredAtRaw = String(body.preferredAt ?? "").trim();
  // Honeypot field — invisible to humans, filled by bots
  const honeypot = String(body.website ?? "").trim();
  const rawSize = Number(body.groupSize);
  const groupSizeClean =
    Number.isFinite(rawSize) && rawSize >= 1
      ? Math.min(Math.floor(rawSize), 5000)
      : 10;

  return { id, name, phone, email, company, notes, preferredAtRaw, groupSizeClean, honeypot };
}
