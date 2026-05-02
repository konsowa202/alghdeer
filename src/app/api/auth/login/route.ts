import { NextResponse } from "next/server";
import {
  STAFF_COOKIE_NAME,
  STAFF_SESSION_MAX_AGE,
  validateStaffLogin,
} from "@/lib/staff-auth";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const email = body.email ?? "";
  const password = body.password ?? "";

  if (!validateStaffLogin(email, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(STAFF_COOKIE_NAME, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STAFF_SESSION_MAX_AGE,
  });
  return res;
}
