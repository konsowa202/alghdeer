import { NextResponse } from "next/server";
import { getStaffContext } from "@/lib/staff-session";
import { getInvoice, updateInvoice } from "@/lib/invoices-store";
import { normalizeInvoiceInput } from "@/lib/invoice-pricing";
import { isEmailValid } from "@/lib/bookings-store";
import { isSameOriginRequest } from "@/lib/request-guard";
import { rateLimit } from "@/lib/rate-limit";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const staff = await getStaffContext();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!UUID_RE.test(params.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const invoice = await getInvoice(params.id, staff.accessToken);
    return invoice ? NextResponse.json({ invoice }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    console.error("[invoices] get error:", error);
    return NextResponse.json({ error: "تعذر تحميل الفاتورة." }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const staff = await getStaffContext();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOriginRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!UUID_RE.test(params.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const limit = rateLimit(`invoices:${staff.userId}`, 90, 10 * 60 * 1000);
  if (!limit.ok) return NextResponse.json({ error: "طلبات كثيرة. حاول بعد قليل." }, { status: 429 });
  try {
    const body = await req.json() as Record<string, unknown>;
    const input = normalizeInvoiceInput(body);
    if (input.customerName.length < 2 || input.items.length === 0) {
      return NextResponse.json({ error: "اسم العميل وبند واحد على الأقل مطلوبان." }, { status: 400 });
    }
    if (input.customerEmail && !isEmailValid(input.customerEmail)) {
      return NextResponse.json({ error: "صيغة البريد الإلكتروني غير صحيحة." }, { status: 400 });
    }
    if (input.status !== "draft" && input.items.some((item) => item.unitPrice <= 0 || item.needsReview)) {
      return NextResponse.json({ error: "راجع الأسعار والبنود المعلّمة قبل الاعتماد أو الإصدار." }, { status: 400 });
    }
    const invoice = await updateInvoice(params.id, input, staff.accessToken);
    return invoice ? NextResponse.json({ invoice }) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    console.error("[invoices] update error:", error);
    const concurrent = error instanceof Error && error.message.includes("concurrently");
    return NextResponse.json(
      { error: concurrent ? "تم تعديل الفاتورة من مكان آخر. أعد تحميلها ثم حاول مجددًا." : "تعذر تحديث الفاتورة." },
      { status: concurrent ? 409 : 500 },
    );
  }
}
