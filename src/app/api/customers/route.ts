import { NextResponse } from "next/server";
import { getStaffContext } from "@/lib/staff-session";
import { deleteBooking, listBookings } from "@/lib/bookings-store";
import { deleteInvoice, listInvoices } from "@/lib/invoices-store";
import { buildCustomerProfiles, normalizePhone } from "@/lib/customers";
import { isSameOriginRequest } from "@/lib/request-guard";
import { rateLimit } from "@/lib/rate-limit";

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

export async function DELETE(req: Request) {
  const staff = await getStaffContext();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOriginRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const limit = rateLimit(`customers:delete:${staff.userId}`, 60, 10 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ error: "طلبات كثيرة. حاول بعد قليل." }, { status: 429 });

  try {
    const urlPhone = new URL(req.url).searchParams.get("phone") || "";
    const body = (await req.json().catch(() => ({}))) as { phone?: string };
    const targetPhone = normalizePhone(body.phone || urlPhone);
    if (!targetPhone) {
      return NextResponse.json({ error: "رقم الجوال غير صالح للحذف." }, { status: 400 });
    }

    const [bookings, invoices] = await Promise.all([
      listBookings(staff.accessToken),
      listInvoices(staff.accessToken),
    ]);

    const matchingBookings = bookings.filter((b) => normalizePhone(b.phone) === targetPhone);
    const matchingBookingIds = new Set(matchingBookings.map((b) => b.id));
    const matchingInvoices = invoices.filter(
      (inv) =>
        normalizePhone(inv.customerPhone) === targetPhone ||
        (inv.bookingId ? matchingBookingIds.has(inv.bookingId) : false)
    );

    if (matchingBookings.length === 0 && matchingInvoices.length === 0) {
      return NextResponse.json({ error: "لم يتم العثور على سجلات لهذا العميل." }, { status: 404 });
    }

    await Promise.all(matchingInvoices.map((inv) => deleteInvoice(inv.id, staff.accessToken)));
    await Promise.all(matchingBookings.map((b) => deleteBooking(b.id, staff.accessToken)));

    return NextResponse.json({
      ok: true,
      deletedBookings: matchingBookings.length,
      deletedInvoices: matchingInvoices.length,
    });
  } catch (error) {
    console.error("[customers] delete error:", error);
    return NextResponse.json({ error: "تعذر حذف العميل وسجلاته." }, { status: 500 });
  }
}
