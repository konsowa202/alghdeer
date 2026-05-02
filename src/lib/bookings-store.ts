import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { BookingRecord, BookingStatus, BookingSource } from "./bookings-types";
import { MIN_LEAD_MS } from "./bookings-types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "bookings.json");

let mutex: Promise<void> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = mutex.then(fn);
  mutex = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function readRaw(): Promise<BookingRecord[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isBookingRecord);
  } catch {
    return [];
  }
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

async function writeRaw(rows: BookingRecord[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(rows, null, 2), "utf8");
}

export async function listBookings(): Promise<BookingRecord[]> {
  return readRaw();
}

export type NewBookingInput = {
  name: string;
  company: string;
  groupSize: number;
  notes: string;
  preferredAt: string;
  status: BookingStatus;
  source: BookingSource;
};

export async function appendBooking(input: NewBookingInput): Promise<BookingRecord> {
  return enqueue(async () => {
    const rows = await readRaw();
    const row: BookingRecord = {
      id: randomUUID(),
      name: input.name,
      company: input.company,
      groupSize: input.groupSize,
      notes: input.notes,
      preferredAt: input.preferredAt,
      status: input.status,
      source: input.source,
      createdAt: new Date().toISOString(),
    };
    rows.unshift(row);
    await writeRaw(rows);
    return row;
  });
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<BookingRecord | null> {
  return enqueue(async () => {
    const rows = await readRaw();
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) return null;
    rows[i] = { ...rows[i], status };
    await writeRaw(rows);
    return rows[i];
  });
}

export async function deleteBooking(id: string): Promise<boolean> {
  return enqueue(async () => {
    const rows = await readRaw();
    const next = rows.filter((r) => r.id !== id);
    if (next.length === rows.length) return false;
    await writeRaw(next);
    return true;
  });
}

export function isPreferredAtValidForPublic(preferredAtIso: string): boolean {
  const t = Date.parse(preferredAtIso);
  if (!Number.isFinite(t)) return false;
  return t >= Date.now() + MIN_LEAD_MS;
}

export function sanitizeBookingFields(body: Record<string, unknown>) {
  const name = String(body.name ?? "").trim().slice(0, 120);
  const company = String(body.company ?? "").trim().slice(0, 120);
  const notes = String(body.notes ?? "").trim().slice(0, 4000);
  const preferredAtRaw = String(body.preferredAt ?? "").trim();
  const groupSize = Number(body.groupSize);
  const groupSizeClean =
    Number.isFinite(groupSize) && groupSize >= 1
      ? Math.min(Math.floor(groupSize), 5000)
      : NaN;

  return { name, company, notes, preferredAtRaw, groupSizeClean };
}
