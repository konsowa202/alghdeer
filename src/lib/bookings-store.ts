import { randomUUID } from "crypto";
import type {
  BookingHistoryEntry,
  BookingRecord,
  BookingStatus,
  BookingSource,
} from "./bookings-types";
import { isBookingStatus, MIN_LEAD_MS } from "./bookings-types";

type DatabaseBooking = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  company: string;
  group_size: number;
  notes: string;
  preferred_at: string;
  status: BookingStatus;
  source: BookingSource;
  created_at: string;
  updated_at: string | null;
  history: unknown;
};

function databaseConfig(staffAccessToken?: string) {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const apiKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  const serverKey = process.env.SUPABASE_SERVER_KEY?.trim();
  if (!url || !apiKey || (!staffAccessToken && !serverKey)) {
    throw new Error("Supabase server environment is not configured.");
  }
  return {
    endpoint: `${url}/rest/v1/bookings`,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${staffAccessToken || apiKey}`,
      ...(staffAccessToken ? {} : { "x-alghdeer-key": serverKey as string }),
      "Content-Type": "application/json",
    },
  };
}

async function databaseRequest(path: string, init: RequestInit = {}, staffAccessToken?: string): Promise<Response> {
  const { endpoint, headers } = databaseConfig(staffAccessToken);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${endpoint}${path}`, {
      ...init,
      headers: { ...headers, ...init.headers },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Booking database request failed (${response.status}): ${details.slice(0, 500)}`);
    }
    return response;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeHistory(value: unknown): BookingHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (entry): entry is { status: BookingStatus; at: string } =>
        Boolean(entry) && isBookingStatus(entry.status) &&
        typeof entry.at === "string" && Number.isFinite(Date.parse(entry.at))
    )
    .map((entry) => ({ status: entry.status, at: new Date(entry.at).toISOString() }))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
    .slice(-100);
}

function normalizeRecord(row: DatabaseBooking): BookingRecord {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email || "",
    company: row.company,
    groupSize: row.group_size,
    notes: row.notes,
    preferredAt: new Date(row.preferred_at).toISOString(),
    status: row.status,
    source: row.source,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
    history: normalizeHistory(row.history),
  };
}

export async function listBookings(staffAccessToken: string): Promise<BookingRecord[]> {
  const response = await databaseRequest("?select=*&order=created_at.desc", {}, staffAccessToken);
  const rows = (await response.json()) as DatabaseBooking[];
  return rows.map(normalizeRecord);
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

export async function appendBooking(input: NewBookingInput, staffAccessToken?: string): Promise<BookingRecord> {
  const createdAt = new Date().toISOString();
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = attempt === 0 && input.id?.trim()
      ? input.id.trim()
      : `ALG-${randomUUID().substring(0, 6).toUpperCase()}`;
    const row: DatabaseBooking = {
      id,
      name: input.name || "ضيف",
      phone: input.phone || "—",
      email: input.email || "",
      company: input.company || "—",
      group_size: Number.isFinite(input.groupSize) && Number(input.groupSize) >= 1 ? Number(input.groupSize) : 10,
      notes: input.notes || "",
      preferred_at: input.preferredAt || new Date(Date.now() + 86400000).toISOString(),
      status: input.status || "pending",
      source: input.source || "website",
      created_at: createdAt,
      updated_at: createdAt,
      history: [{ status: input.status || "pending", at: createdAt }],
    };
    try {
      const response = await databaseRequest("?select=*", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(row),
      }, staffAccessToken);
      const inserted = (await response.json()) as DatabaseBooking[];
      if (!inserted[0]) throw new Error("Booking database returned no inserted record.");
      return normalizeRecord(inserted[0]);
    } catch (error) {
      if (attempt < 4 && error instanceof Error && error.message.includes("(409)")) continue;
      throw error;
    }
  }
  throw new Error("Could not allocate a unique booking ID.");
}

export async function updateBookingStatus(id: string, status: BookingStatus, staffAccessToken: string): Promise<BookingRecord | null> {
  const safeId = encodeURIComponent(id);
  const response = await databaseRequest(`?id=eq.${safeId}&select=*`, {}, staffAccessToken);
  const rows = (await response.json()) as DatabaseBooking[];
  const current = rows[0];
  if (!current) return null;
  if (current.status === status) return normalizeRecord(current);
  const at = new Date().toISOString();
  const history = [...normalizeHistory(current.history), { status, at }].slice(-100);
  // The old history is the optimistic lock: a concurrent status change fails
  // instead of silently erasing another staff member's audit entry.
  const updated = await databaseRequest(
    `?id=eq.${safeId}&status=eq.${encodeURIComponent(current.status)}&history=eq.${encodeURIComponent(JSON.stringify(current.history))}&select=*`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ status, updated_at: at, history }),
    },
    staffAccessToken
  );
  const result = (await updated.json()) as DatabaseBooking[];
  if (!result[0]) throw new Error("Booking changed concurrently. Refresh and retry the status update.");
  return normalizeRecord(result[0]);
}

export async function deleteBooking(id: string, staffAccessToken: string): Promise<boolean> {
  const response = await databaseRequest(`?id=eq.${encodeURIComponent(id)}&select=id`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" },
  }, staffAccessToken);
  return ((await response.json()) as { id: string }[]).length > 0;
}

export function isPreferredAtValidForPublic(preferredAtIso: string): boolean {
  const time = Date.parse(preferredAtIso);
  return Number.isFinite(time) && time >= Date.now() + MIN_LEAD_MS;
}

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
export function isEmailValid(email: string): boolean {
  return EMAIL_RE.test(email);
}

function stripControlChars(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

export function sanitizeBookingFields(body: Record<string, unknown>) {
  const id = body.id ? String(body.id).trim().slice(0, 40) : undefined;
  const name = stripControlChars(String(body.name ?? "")).trim().slice(0, 120);
  const phone = String(body.phone ?? "").trim().slice(0, 40);
  const email = String(body.email ?? "").trim().slice(0, 160);
  const company = stripControlChars(String(body.company ?? "")).trim().slice(0, 120);
  const notes = stripControlChars(String(body.notes ?? "")).trim().slice(0, 4000);
  const preferredAtRaw = String(body.preferredAt ?? "").trim();
  const honeypot = String(body.website ?? "").trim();
  const rawSize = Number(body.groupSize);
  const groupSizeClean = Number.isFinite(rawSize) && rawSize >= 1 ? Math.min(Math.floor(rawSize), 5000) : 10;
  return { id, name, phone, email, company, notes, preferredAtRaw, groupSizeClean, honeypot };
}
