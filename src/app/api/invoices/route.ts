import { NextResponse } from "next/server";
import { getStaffContext } from "@/lib/staff-session";
import { createInvoice, listInvoices } from "@/lib/invoices-store";
import { normalizeInvoiceInput } from "@/lib/invoice-pricing";
import { isEmailValid } from "@/lib/bookings-store";
import { isSameOriginRequest } from "@/lib/request-guard";
import { rateLimit } from "@/lib/rate-limit";

export async function GET() {
  const staff = await getStaffContext();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ invoices: await listInvoices(staff.accessToken) });
  } catch (error) {
    console.error("[invoices] list error:", error);
    return NextResponse.json({ error: "تعذر تحميل الفواتير." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const staff = await getStaffContext();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOriginRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const limit = rateLimit(`invoices:${staff.userId}`, 90, 10 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ error: "طلبات كثيرة. حاول بعد قليل." }, { status: 429 });
  try {
    const body = await req.json() as Record<string, unknown>;
    const input = normalizeInvoiceInput(body);
    if (input.customerName.length < 2) {
      return NextResponse.json({ error: "أدخل اسم العميل." }, { status: 400 });
    }
    if (input.customerEmail && !isEmailValid(input.customerEmail)) {
      return NextResponse.json({ error: "صيغة البريد الإلكتروني غير صحيحة." }, { status: 400 });
    }
    if (input.items.length === 0) {
      return NextResponse.json({ error: "أضف بندًا واحدًا على الأقل." }, { status: 400 });
    }
    if (input.status !== "draft" && input.items.some((item) => item.unitPrice <= 0 || item.needsReview)) {
      return NextResponse.json({ error: "راجع الأسعار والبنود المعلّمة قبل الاعتماد أو الإصدار." }, { status: 400 });
    }
    const invoice = await createInvoice(input, staff.userId, staff.accessToken);
    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error("[invoices] create error:", error);
    return NextResponse.json({ error: "تعذر حفظ الفاتورة. راجع البيانات وحاول مرة أخرى." }, { status: 500 });
  }
}
