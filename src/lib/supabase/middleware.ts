import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { fetchWithTimeout, getSupabaseConfig } from "./config";

export async function updateSupabaseSession(req: NextRequest) {
  let response = NextResponse.next({ request: req });
  const { url, publishableKey } = getSupabaseConfig();
  const supabase = createServerClient(url, publishableKey, {
    global: { fetch: fetchWithTimeout() },
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
        response = NextResponse.next({ request: req });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // getClaims() also refreshes an expired session (writing the new cookies),
  // but verifies the JWT without an extra Auth round trip when possible.
  const { data: claimsData } = await supabase.auth.getClaims().catch(() => ({ data: null }));
  const userId = claimsData?.claims?.sub;

  let isStaff = false;
  if (userId) {
    const { data } = await supabase
      .from("staff_members")
      .select("user_id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();
    isStaff = Boolean(data);
  }

  const { pathname } = req.nextUrl;
  if (pathname === "/dashboard/login") {
    if (isStaff) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return response;
  }

  if (!isStaff) {
    const loginUrl = new URL("/dashboard/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
