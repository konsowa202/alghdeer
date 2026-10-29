import { NextResponse } from "next/server";
import { getStaffContext, type StaffContext } from "@/lib/staff-session";
import { deleteBooking, updateBookingStatus } from "@/lib/bookings-store";
import type { BookingStatus } from "@/lib/bookings-types";
import { isSameOriginRequest } from "@/lib/request-guard";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "deposit",
  "completed",
  "cancelled",
];

async function guardStaff(
  req: Request
): Promise<{ response: NextResponse } | { staff: StaffContext }> {
  const staff = await getStaffContext();
  if (!staff) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!isSameOriginRequest(req)) {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  const rl = rateLimit(`bookings:mutate:${clientIp(req)}`, 120, 10 * 60 * 1000);
  if (!rl.ok) {
    return {
      response: NextResponse.json(
        { error: "طلبات كثيرة. حاول بعد قليل." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      ),
    };
  }
  return { staff };
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const guard = await guardStaff(req);
  if ("response" in guard) return guard.response;

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

  const updated = await updateBookingStatus(params.id, status, guard.staff.accessToken);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, booking: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const guard = await guardStaff(req);
  if ("response" in guard) return guard.response;

  const ok = await deleteBooking(params.id, guard.staff.accessToken);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
