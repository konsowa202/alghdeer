import { NextResponse } from "next/server";
import { isStaffSession } from "@/lib/staff-session";
import {
  appendBooking,
  listBookings,
  sanitizeBookingFields,
  isPreferredAtValidForPublic,
  isEmailValid,
} from "@/lib/bookings-store";
import { MIN_LEAD_MS, type BookingStatus } from "@/lib/bookings-types";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/request-guard";
import { notifyNewBooking } from "@/lib/notify";

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
  try {
    const rows = await listBookings();
    return NextResponse.json({ bookings: rows });
  } catch (err) {
    console.error("[bookings] list error:", err);
    return NextResponse.json(
      { error: "تعذر تحميل الحجوزات." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!isSameOriginRequest(req)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const staff = isStaffSession();
    const ip = clientIp(req);

    // Public submissions: 5 per 10 minutes per IP. Staff entries: 60/10min.
    const rl = staff
      ? rateLimit(`bookings:staff:${ip}`, 60, 10 * 60 * 1000)
      : rateLimit(`bookings:public:${ip}`, 5, 10 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "طلبات كثيرة خلال وقت قصير. حاول مرة أخرى بعد قليل أو تواصل واتساب." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const {
      id,
      name,
      phone,
      email,
      company,
      notes,
      preferredAtRaw,
      groupSizeClean,
      honeypot,
    } = sanitizeBookingFields(body);

    // Honeypot: bots fill the invisible "website" field — silently accept
    // without storing so spammers cannot tell they were filtered.
    if (honeypot) {
      console.warn(`[bookings] honeypot triggered from ${ip}`);
      return NextResponse.json({ ok: true, id: "ALG-OK", status: "pending" });
    }

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "يرجى إدخال اسم الضيف أو العميل." },
        { status: 400 }
      );
    }

    if (email && !isEmailValid(email)) {
      return NextResponse.json(
        { error: "صيغة البريد الإلكتروني غير صحيحة." },
        { status: 400 }
      );
    }

    let preferredAtIso = preferredAtRaw;
    if (!preferredAtIso || !Number.isFinite(Date.parse(preferredAtIso))) {
      preferredAtIso = new Date(Date.now() + MIN_LEAD_MS).toISOString();
    } else if (!staff && !isPreferredAtValidForPublic(preferredAtIso)) {
      return NextResponse.json(
        { error: "الحجز من الموقع يتطلب موعداً بعد 24 ساعة على الأقل." },
        { status: 400 }
      );
    }

    let status: BookingStatus = "pending";
    if (staff) {
      const st = normalizeStaffStatus(body.status);
      if (st) status = st;
    }

    const booking = await appendBooking({
      id,
      name,
      phone: phone || "—",
      email: email || "",
      company: company || "—",
      notes: notes || "",
      groupSize: groupSizeClean || 10,
      preferredAt: preferredAtIso,
      status,
      source: staff ? "staff" : "website",
    });

    // Email notification for website bookings — awaited (with timeout) so
    // serverless runtimes do not freeze the request before the send.
    let notified = false;
    if (!staff) {
      const result = await Promise.race([
        notifyNewBooking(booking),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
      ]);
      notified = result?.sent ?? false;
    }

    // Output whitelist — return only what the ticket UI needs
    return NextResponse.json({
      ok: true,
      id: booking.id,
      name: booking.name,
      phone: booking.phone,
      company: booking.company,
      groupSize: booking.groupSize,
      preferredAt: booking.preferredAt,
      status: booking.status,
      notified,
    });
  } catch (error) {
    // Detailed error is logged server-side only; the client gets a generic
    // message. A synthetic ticket is still issued so a real customer is
    // never blocked — staff see the attempt in the server logs.
    console.error("[bookings] submission error:", error);
    return NextResponse.json(
      {
        ok: true,
        id: "ALG-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
        name: "ضيف",
        status: "pending",
        offline: true,
      },
      { status: 200 }
    );
  }
}
