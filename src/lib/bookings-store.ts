import { randomUUID } from "crypto";
import type {
  BookingCheckInEntry,
  BookingHistoryEntry,
  BookingRecord,
  BookingStatus,
  BookingSource,
} from "./bookings-types";
import { isBookingQrActive, isBookingStatus, MIN_LEAD_MS } from "./bookings-types";
import { qrBlockReasonAr } from "./ticket-qr";
import { cleanBreakdown, guestTotal, isMissingBreakdownColumn, type GuestBreakdown } from "./guests";

type DatabaseBooking = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  company: string;
  group_size: number;
  adults?: number | null;
  children?: number | null;
  extra_guests?: number | null;
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
        Boolean(entry) &&
        !(entry as { type?: unknown }).type &&
        isBookingStatus((entry as { status?: unknown }).status) &&
        typeof (entry as { at?: unknown }).at === "string" &&
        Number.isFinite(Date.parse((entry as { at: string }).at))
    )
    .map((entry) => ({ status: entry.status, at: new Date(entry.at).toISOString() }))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
    .slice(-100);
}

function normalizeCheckIns(value: unknown): BookingCheckInEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (entry): entry is BookingCheckInEntry =>
        Boolean(entry) &&
        (entry as { type?: unknown }).type === "checkin" &&
        typeof (entry as { delta?: unknown }).delta === "number" &&
        Number.isFinite((entry as { delta: number }).delta) &&
        typeof (entry as { at?: unknown }).at === "string" &&
        Number.isFinite(Date.parse((entry as { at: string }).at))
    )
    .map((entry) => ({
      type: "checkin" as const,
      delta: Math.trunc(entry.delta),
      countAfter: typeof entry.countAfter === "number" && Number.isFinite(entry.countAfter)
        ? Math.max(0, Math.trunc(entry.countAfter))
        : 0,
      at: new Date(entry.at).toISOString(),
      ...(typeof entry.by === "string" && entry.by ? { by: entry.by } : {}),
    }))
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}

function computeCheckedInCount(checkIns: BookingCheckInEntry[], maxGuests: number): number {
  const sum = checkIns.reduce((acc, entry) => acc + entry.delta, 0);
  return Math.max(0, Math.min(maxGuests, sum));
}

function mergeHistoryForStorage(
  statuses: BookingHistoryEntry[],
  checkIns: BookingCheckInEntry[]
): Array<BookingHistoryEntry | BookingCheckInEntry> {
  return [...statuses.slice(-100), ...checkIns.slice(-400)].sort(
    (a, b) => Date.parse(a.at) - Date.parse(b.at)
  );
}

function normalizeRecord(row: DatabaseBooking): BookingRecord {
  const checkIns = normalizeCheckIns(row.history);
  const checkedInCount = computeCheckedInCount(checkIns, row.group_size);
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email || "",
    company: row.company,
    groupSize: row.group_size,
    guestBreakdown: cleanBreakdown({ adults: row.adults, children: row.children, extras: row.extra_guests }),
    notes: row.notes,
    preferredAt: new Date(row.preferred_at).toISOString(),
    status: row.status,
    source: row.source,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
    history: normalizeHistory(row.history),
    checkedInCount,
    checkIns,
  };
}

export async function listBookings(staffAccessToken: string): Promise<BookingRecord[]> {
  const response = await databaseRequest("?select=*&order=created_at.desc", {}, staffAccessToken);
  const rows = (await response.json()) as DatabaseBooking[];
  return rows.map(normalizeRecord);
}

export async function getBooking(id: string, staffAccessToken: string): Promise<BookingRecord | null> {
  const safeId = encodeURIComponent(id.trim());
  const response = await databaseRequest(`?id=eq.${safeId}&select=*&limit=1`, {}, staffAccessToken);
  const rows = (await response.json()) as DatabaseBooking[];
  return rows[0] ? normalizeRecord(rows[0]) : null;
}

export type NewBookingInput = {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  groupSize?: number;
  guestBreakdown?: GuestBreakdown | null;
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
      group_size: input.guestBreakdown
        ? guestTotal(input.guestBreakdown)
        : Number.isFinite(input.groupSize) && Number(input.groupSize) >= 1 ? Number(input.groupSize) : 10,
      ...(input.guestBreakdown
        ? { adults: input.guestBreakdown.adults, children: input.guestBreakdown.children, extra_guests: input.guestBreakdown.extras }
        : {}),
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
      if (isMissingBreakdownColumn(error) && "adults" in row) {
        // Database not migrated yet: save without the breakdown columns.
        const { adults: _a, children: _c, extra_guests: _e, ...plain } = row;
        void _a; void _c; void _e;
        const response = await databaseRequest("?select=*", {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(plain),
        }, staffAccessToken);
        const inserted = (await response.json()) as DatabaseBooking[];
        if (!inserted[0]) throw new Error("Booking database returned no inserted record.");
        return normalizeRecord(inserted[0]);
      }
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
  const statuses = [...normalizeHistory(current.history), { status, at }].slice(-100);
  const checkIns = normalizeCheckIns(current.history);
  const history = mergeHistoryForStorage(statuses, checkIns);
  // The old history is the optimistic lock: a concurrent status/check-in change fails
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

export type CheckInResult =
  | { ok: true; booking: BookingRecord }
  | {
      ok: false;
      reason: "not_found" | "not_confirmed" | "capacity_exceeded" | "below_zero" | "invalid_delta" | "concurrent";
      error: string;
      statusCode: number;
      booking?: BookingRecord;
    };

export async function recordBookingCheckIn(
  id: string,
  deltaInput: number,
  staffAccessToken: string,
  staffUserId?: string
): Promise<CheckInResult> {
  const delta = Math.trunc(deltaInput);
  if (!Number.isFinite(delta) || delta === 0 || Math.abs(delta) > 5000) {
    return {
      ok: false,
      reason: "invalid_delta",
      error: "عدد الأساور المطلوب غير صالح.",
      statusCode: 400,
    };
  }

  const safeId = encodeURIComponent(id.trim());
  const response = await databaseRequest(`?id=eq.${safeId}&select=*`, {}, staffAccessToken);
  const rows = (await response.json()) as DatabaseBooking[];
  const current = rows[0];
  if (!current) {
    return {
      ok: false,
      reason: "not_found",
      error: "لم يتم العثور على تذكرة بهذا الرقم.",
      statusCode: 404,
    };
  }

  const normalized = normalizeRecord(current);
  if (delta > 0 && !isBookingQrActive(current.status)) {
    return {
      ok: false,
      reason: "not_confirmed",
      error: qrBlockReasonAr(current.status) || "الحجز غير مؤكد — رمز QR غير مفعل للدخول.",
      statusCode: 409,
      booking: normalized,
    };
  }

  const currentChecked = normalized.checkedInCount;
  const remaining = Math.max(0, current.group_size - currentChecked);

  if (delta > 0 && currentChecked + delta > current.group_size) {
    return {
      ok: false,
      reason: "capacity_exceeded",
      error:
        remaining === 0
          ? `اكتمل عدد التذكرة بالكامل (${currentChecked}/${current.group_size}) — لا توجد أساور متبقية.`
          : `العدد المطلوب (${delta}) يتجاوز المتبقي على التذكرة (${remaining} فقط من أصل ${current.group_size}).`,
      statusCode: 409,
      booking: normalized,
    };
  }

  if (delta < 0 && currentChecked + delta < 0) {
    return {
      ok: false,
      reason: "below_zero",
      error: "العدد المسجل بالفعل 0 — لا يمكن التراجع أكثر.",
      statusCode: 409,
      booking: normalized,
    };
  }

  const nextCount = currentChecked + delta;
  const at = new Date().toISOString();
  const statuses = normalizeHistory(current.history);
  const checkIns: BookingCheckInEntry[] = [
    ...normalizeCheckIns(current.history),
    {
      type: "checkin",
      delta,
      countAfter: nextCount,
      at,
      ...(staffUserId ? { by: staffUserId } : {}),
    },
  ];
  const history = mergeHistoryForStorage(statuses, checkIns);

  const updated = await databaseRequest(
    `?id=eq.${safeId}&history=eq.${encodeURIComponent(JSON.stringify(current.history))}&select=*`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ updated_at: at, history }),
    },
    staffAccessToken
  );
  const result = (await updated.json()) as DatabaseBooking[];
  if (!result[0]) {
    return {
      ok: false,
      reason: "concurrent",
      error: "تم مسح التذكرة وتحديث العدد للتو من جهاز آخر — أعد الفحص لرؤية العدد الحالي.",
      statusCode: 409,
    };
  }

  return { ok: true, booking: normalizeRecord(result[0]) };
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
  const guestBreakdown = cleanBreakdown(body.guestBreakdown);
  return { id, name, phone, email, company, notes, preferredAtRaw, groupSizeClean, guestBreakdown, honeypot };
}
