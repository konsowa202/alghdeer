import { promises as fs } from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import type { BookingRecord, BookingStatus, BookingSource } from "./bookings-types";
import { MIN_LEAD_MS } from "./bookings-types";

// Persistent Cloud Database URL (Rest JSON Bin shared across all serverless invocations and devices)
const CLOUD_DB_URL = "https://extendsclass.com/api/json-storage/bin/daddacf";

// Writable file path in OS temp directory (works on Vercel Serverless / Lambda)
const TMP_DATA_FILE = path.join(os.tmpdir(), "alghdeer-bookings.json");
// Local development path
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

function isBookingRecord(x: unknown): x is BookingRecord {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.company === "string" &&
    typeof o.notes === "string" &&
    typeof o.groupSize === "number" &&
    typeof o.preferredAt === "string" &&
    typeof o.status === "string" &&
    typeof o.source === "string" &&
    typeof o.createdAt === "string"
  );
}

/**
 * Fetch latest bookings from persistent cloud database with timeout protection
 */
async function fetchFromCloudDB(): Promise<BookingRecord[] | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(CLOUD_DB_URL, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const json = await res.json();
    if (json && Array.isArray(json.bookings)) {
      return json.bookings.filter(isBookingRecord);
    }
  } catch (err) {
    // Cloud fetch timeout or network error - fallback to disk/memory
  }
  return null;
}

/**
 * Save bookings to persistent cloud database
 */
async function saveToCloudDB(rows: BookingRecord[]): Promise<void> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    await fetch(CLOUD_DB_URL, {
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
      return parsed.filter(isBookingRecord);
    }
  } catch {}

  // 2. Try reading from local project data directory
  try {
    const raw = await fs.readFile(LOCAL_DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter(isBookingRecord);
    }
  } catch {}

  return [];
}

async function writeToDisk(rows: BookingRecord[]): Promise<void> {
  const jsonStr = JSON.stringify(rows, null, 2);

  // 1. Write to OS temp directory (always writable on Vercel / Linux / Windows)
  try {
    await fs.writeFile(TMP_DATA_FILE, jsonStr, "utf8");
  } catch {}

  // 2. Try writing to local project data directory (works in local dev, ignored if Vercel is read-only)
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
    const row: BookingRecord = {
      id: "ALG-" + randomUUID().substring(0, 6).toUpperCase(),
      name: input.name || "ضيف",
      phone: input.phone || "—",
      email: input.email || "",
      company: input.company || "—",
      groupSize: Number.isFinite(input.groupSize) && Number(input.groupSize) >= 1 ? Number(input.groupSize) : 10,
      notes: input.notes || "",
      preferredAt: input.preferredAt || new Date(Date.now() + 86400000).toISOString(),
      status: input.status || "pending",
      source: input.source || "website",
      createdAt: new Date().toISOString(),
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
    rows[i] = { ...rows[i], status };
    globalThis.__alghdeer_bookings_memory__ = rows;

    await Promise.allSettled([
      writeToDisk(rows),
      saveToCloudDB(rows),
    ]);

    return rows[i];
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
  return true;
}

export function sanitizeBookingFields(body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim().slice(0, 120);
  const phone = String(body.phone ?? "").trim().slice(0, 40);
  const email = String(body.email ?? "").trim().slice(0, 160);
  const company = String(body.company ?? "").trim().slice(0, 120);
  const notes = String(body.notes ?? "").trim().slice(0, 4000);
  const preferredAtRaw = String(body.preferredAt ?? "").trim();
  const rawSize = Number(body.groupSize);
  const groupSizeClean =
    Number.isFinite(rawSize) && rawSize >= 1
      ? Math.min(Math.floor(rawSize), 5000)
      : 10;

  return { name, phone, email, company, notes, preferredAtRaw, groupSizeClean };
}
