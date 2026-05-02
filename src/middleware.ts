import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STAFF_COOKIE_NAME } from "@/lib/staff-auth";

function isStaffSession(req: NextRequest) {
  return req.cookies.get(STAFF_COOKIE_NAME)?.value === "1";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (pathname === "/dashboard/login") {
    if (isStaffSession(req)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (!isStaffSession(req)) {
    return NextResponse.redirect(new URL("/dashboard/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
