import { NextResponse } from "next/server";
import { isStaffSession } from "@/lib/staff-session";
import { fetchFromCloudDB } from "@/lib/bookings-store";
import { getNotificationReadiness } from "@/lib/notify";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isStaffSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cloudRows = await fetchFromCloudDB();
    return NextResponse.json(
      {
        checkedAt: new Date().toISOString(),
        notifications: getNotificationReadiness(),
        storage: {
          cloudReachable: cloudRows !== null,
          configuredFromEnvironment: Boolean(process.env.BOOKINGS_DB_URL?.trim()),
          localFallback: true,
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
