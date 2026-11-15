import { NextResponse } from "next/server";
import { getStaffContext } from "@/lib/staff-session";
import { getBooking, recordBookingCheckIn } from "@/lib/bookings-store";
import { isBookingQrActive } from "@/lib/bookings-types";
import { parseTicketBookingId, qrBlockReasonAr } from "@/lib/ticket-qr";
import { isSameOriginRequest } from "@/lib/request-guard";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const staff = await getStaffContext();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rawCode = new URL(req.url).searchParams.get("code") || "";
  const bookingId = parseTicketBookingId(rawCode);
  if (!bookingId) {
    return NextResponse.json(
      { error: "صيغة رمز QR أو رقم التذكرة غير صالحة." },
      { status: 400 }
    );
  }

  try {
    const booking = await getBooking(bookingId, staff.accessToken);
    if (!booking) {
      return NextResponse.json(
        { error: `لم يتم العثور على تذكرة برقم ${bookingId}.`, bookingId },
        { status: 404 }
      );
    }

    const qrActive = isBookingQrActive(booking.status);
    const remaining = Math.max(0, booking.groupSize - booking.checkedInCount);
    const blockReason = qrBlockReasonAr(booking.status);

    return NextResponse.json({
      booking,
      qrActive,
      remaining,
      blockReason,
    });
  } catch (error) {
    console.error("[scanner] verify error:", error);
    return NextResponse.json(
      { error: "تعذر التحقق من التذكرة. حاول مرة أخرى." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const staff = await getStaffContext();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOriginRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rl = rateLimit(`scanner:checkin:${staff.userId}:${clientIp(req)}`, 240, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "طلبات كثيرة جداً. انتظر قليلاً." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  let body: { id?: string; code?: string; delta?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bookingId = parseTicketBookingId(body.id || body.code || "");
  if (!bookingId) {
    return NextResponse.json({ error: "رقم التذكرة غير صالح." }, { status: 400 });
  }

  const delta = Number(body.delta ?? 1);
  try {
    const result = await recordBookingCheckIn(bookingId, delta, staff.accessToken, staff.userId);
    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          reason: result.reason,
          ...(result.booking ? { booking: result.booking } : {}),
        },
        { status: result.statusCode }
      );
    }

    const remaining = Math.max(0, result.booking.groupSize - result.booking.checkedInCount);
    return NextResponse.json({
      ok: true,
      booking: result.booking,
      remaining,
      qrActive: isBookingQrActive(result.booking.status),
    });
  } catch (error) {
    console.error("[scanner] checkin error:", error);
    return NextResponse.json(
      { error: "تعذر تسجيل الدخول والأساور. حاول مرة أخرى." },
      { status: 500 }
    );
  }
}
