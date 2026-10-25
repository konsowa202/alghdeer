/** Minimum lead time for website bookings (24 hours). Shared client/server. */
export const MIN_LEAD_MS = 24 * 60 * 60 * 1000;

export type BookingSource = "website" | "staff";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "deposit"
  | "completed"
  | "cancelled";

export const BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "deposit",
  "completed",
  "cancelled",
];

export const BOOKING_FLOW_STATUSES: Exclude<BookingStatus, "cancelled">[] = [
  "pending",
  "confirmed",
  "deposit",
  "completed",
];

export function isBookingStatus(value: unknown): value is BookingStatus {
  return typeof value === "string" && BOOKING_STATUSES.includes(value as BookingStatus);
}

export type BookingHistoryEntry = {
  status: BookingStatus;
  /** ISO 8601 (UTC). Recorded by the server, never supplied by the browser. */
  at: string;
};

export type BookingRecord = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company: string;
  groupSize: number;
  notes: string;
  /** ISO 8601 (UTC), from client via Date.toISOString() */
  preferredAt: string;
  status: BookingStatus;
  source: BookingSource;
  createdAt: string;
  updatedAt?: string;
  /** Empty only for legacy records created before status auditing existed. */
  history: BookingHistoryEntry[];
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "قيد المراجعة",
  confirmed: "مؤكد",
  deposit: "تم استلام الديبوزيت",
  completed: "مكتمل",
  cancelled: "ملغى",
};
