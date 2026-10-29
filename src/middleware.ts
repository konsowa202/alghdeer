import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

export async function middleware(req: NextRequest) {
  return updateSupabaseSession(req);
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
