import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { isSameOriginRequest } from "@/lib/request-guard";

const GENERIC_ERROR = "بيانات الدخول غير صحيحة.";

export async function POST(req: Request) {
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

  const email = String(body.email ?? "").trim().slice(0, 200);
  const password = String(body.password ?? "").slice(0, 200);
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.warn(`[auth] Supabase staff login rejected from ${ip}`);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: membership } = user
    ? await supabase
        .from("staff_members")
        .select("user_id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle()
    : { data: null };

  if (!membership) {
    await supabase.auth.signOut({ scope: "local" });
    return NextResponse.json(
      { error: "هذا الحساب غير مصرح له بالوصول إلى الداش بورد." },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true });
}
