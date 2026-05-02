import { NextResponse } from "next/server";
import { isStaffSession } from "@/lib/staff-session";
import { deleteBooking, updateBookingStatus } from "@/lib/bookings-store";
import type { BookingStatus } from "@/lib/bookings-types";

const STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "deposit",
  "completed",
  "cancelled",
];

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!isStaffSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status = body.status as BookingStatus | undefined;
  if (!status || !STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await updateBookingStatus(params.id, status);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, booking: updated });
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  if (!isStaffSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ok = await deleteBooking(params.id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
