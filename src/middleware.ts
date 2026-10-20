import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STAFF_COOKIE_NAME } from "@/lib/staff-auth-public";
import { sessionTokenLooksValid } from "@/lib/staff-token-format";

/**
 * Middleware is a UX gate only: it redirects based on the token's shape and
 * expiry. Real verification (HMAC signature) happens in `isStaffSession()`
 * inside every protected API route and the dashboard server layout — a
 * forged cookie can reach the page shell but never the data.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const hasSession = sessionTokenLooksValid(
    req.cookies.get(STAFF_COOKIE_NAME)?.value
  );

  if (pathname === "/dashboard/login") {
    if (hasSession) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL("/dashboard/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
