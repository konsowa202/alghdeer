import { NextResponse } from "next/server";
import { getStaffContext } from "@/lib/staff-session";
import { listBookings } from "@/lib/bookings-store";
import { getNotificationReadiness } from "@/lib/notify";

export const dynamic = "force-dynamic";

export async function GET() {
  const staff = await getStaffContext();
  if (!staff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await listBookings(staff.accessToken);
    return NextResponse.json(
      {
        checkedAt: new Date().toISOString(),
        notifications: getNotificationReadiness(),
        storage: {
          cloudReachable: true,
          configuredFromEnvironment: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY && process.env.SUPABASE_SERVER_KEY),
          localFallback: false,
        },
        protection: {
          signedSessions: true,
          rateLimiting: true,
          sameOriginMutations: true,
          securityHeaders: true,
          botHoneypot: true,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[system] status check failed:", error);
    return NextResponse.json(
      { error: "تعذر فحص حالة النظام." },
      { status: 500 }
    );
  }
}
