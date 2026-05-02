import { NextResponse } from "next/server";
import { isStaffSession } from "@/lib/staff-session";
import {
  appendBooking,
  isPreferredAtValidForPublic,
  listBookings,
  sanitizeBookingFields,
} from "@/lib/bookings-store";
import type { BookingStatus } from "@/lib/bookings-types";

const ALLOWED_STAFF_POST_STATUS: BookingStatus[] = [
  "pending",
  "confirmed",
  "deposit",
  "completed",
  "cancelled",
];

function normalizeStaffStatus(raw: unknown): BookingStatus | null {
  const s = String(raw ?? "");
  return ALLOWED_STAFF_POST_STATUS.includes(s as BookingStatus)
    ? (s as BookingStatus)
    : null;
}

export async function GET() {
  if (!isStaffSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await listBookings();
  return NextResponse.json({ bookings: rows });
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const staff = isStaffSession();
  const {
    name,
    company,
    notes,
    preferredAtRaw,
    groupSizeClean,
  } = sanitizeBookingFields(body);

  if (!name || !Number.isFinite(groupSizeClean)) {
    return NextResponse.json(
      { error: "Missing or invalid fields" },
      { status: 400 }
    );
  }

  const preferredAtIso = preferredAtRaw;
  const parsed = Date.parse(preferredAtIso);
  if (!Number.isFinite(parsed)) {
    return NextResponse.json(
      { error: "Invalid date" },
      { status: 400 }
    );
  }

  if (!staff && !isPreferredAtValidForPublic(preferredAtIso)) {
    return NextResponse.json(
          {
        error:
          "موعد المناسبة يجب أن يكون بعد 24 ساعة على الأقل من الآن.",
      },
      { status: 400 }
    );
  }

  let status: BookingStatus = "pending";
  if (staff) {
    const st = normalizeStaffStatus(body.status);
    if (st) status = st;
  }

  const booking = await appendBooking({
    name,
    company,
    notes,
    groupSize: groupSizeClean,
    preferredAt: preferredAtIso,
    status,
    source: staff ? "staff" : "website",
  });

  return NextResponse.json({
    ok: true,
    id: booking.id,
    status: booking.status,
  });
}
