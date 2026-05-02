/** Minimum lead time for website bookings (24 hours). Shared client/server. */
export const MIN_LEAD_MS = 24 * 60 * 60 * 1000;

export type BookingSource = "website" | "staff";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "deposit"
  | "completed"
  | "cancelled";

export type BookingRecord = {
  id: string;
  name: string;
  company: string;
  groupSize: number;
  notes: string;
  /** ISO 8601 (UTC), from client via Date.toISOString() */
  preferredAt: string;
  status: BookingStatus;
  source: BookingSource;
  createdAt: string;
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "قيد المراجعة",
  confirmed: "مؤكد",
  deposit: "تم استلام الديبوزيت",
  completed: "مكتمل",
  cancelled: "ملغى",
};
