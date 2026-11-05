import { NextResponse } from "next/server";
import { getStaffContext } from "@/lib/staff-session";
import { listBookings } from "@/lib/bookings-store";
import { listInvoices } from "@/lib/invoices-store";
import { buildCustomerProfiles } from "@/lib/customers";

export async function GET() {
  const staff = await getStaffContext();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const [bookings, invoices] = await Promise.all([
      listBookings(staff.accessToken),
      listInvoices(staff.accessToken),
    ]);
    return NextResponse.json({ customers: buildCustomerProfiles(bookings, invoices) });
  } catch (error) {
    console.error("[customers] list error:", error);
    return NextResponse.json({ error: "تعذر تحميل ملفات العملاء." }, { status: 500 });
  }
}
