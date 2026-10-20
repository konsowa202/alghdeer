import { NextResponse } from "next/server";
import {
  STAFF_COOKIE_NAME,
  STAFF_SESSION_MAX_AGE,
  createSessionToken,
  validateStaffLogin,
} from "@/lib/staff-auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/request-guard";

const GENERIC_ERROR = "بيانات الدخول غير صحيحة.";

export async function POST(req: Request) {
  // CSRF / cross-site posting guard
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Brute-force protection: 5 attempts per 10 minutes per IP
  const ip = clientIp(req);
  const rl = rateLimit(`login:${ip}`, 5, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `محاولات كثيرة. حاول مرة أخرى بعد ${Math.ceil(rl.retryAfterSec / 60)} دقيقة.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const email = String(body.email ?? "").slice(0, 200);
  const password = String(body.password ?? "").slice(0, 200);

  if (!validateStaffLogin(email, password)) {
    // Log internally without leaking which field failed
    console.warn(`[auth] Failed staff login attempt for "${email.slice(0, 3)}***" from ${ip}`);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(STAFF_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STAFF_SESSION_MAX_AGE,
  });
  return res;
}
