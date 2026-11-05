import { NextResponse } from "next/server";
import { getStaffContext } from "@/lib/staff-session";
import { isSameOriginRequest } from "@/lib/request-guard";
import { rateLimit } from "@/lib/rate-limit";
import { normalizeLineItems } from "@/lib/invoice-pricing";
import { SUPPLIER_COSTS, SUPPLIER_COSTS_NOTE } from "@/data/supplier-costs";

function extractJson(content: string) {
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI response did not contain JSON.");
  return JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
}

export async function POST(req: Request) {
  const staff = await getStaffContext();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isSameOriginRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const limit = rateLimit(`ai-quote:${staff.userId}`, 20, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "وصلت لحد المحاولات المؤقت. حاول بعد قليل." }, { status: 429 });
  }
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return NextResponse.json({ error: "خدمة الذكاء الاصطناعي غير مضبوطة. يمكنك التسعير يدويًا." }, { status: 503 });

  try {
    const body = await req.json() as Record<string, unknown>;
    const prompt = String(body.prompt ?? "").trim().slice(0, 12_000);
    if (prompt.length < 3) return NextResponse.json({ error: "اكتب طلب العميل أو الصق رسالته أولًا." }, { status: 400 });
    const context = body.context && typeof body.context === "object" ? body.context : {};
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45_000);
    let groqResponse: Response;
    try {
      groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b",
          temperature: 0.2,
          max_completion_tokens: 5000,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are a pricing assistant for Alghdeer Camp in Saudi Arabia. Convert Arabic or English customer requests into editable quote line items. Return ONLY one JSON object with keys: items (array), summaryAr (string), warningAr (string). Each item must have descriptionAr, descriptionEn, quantity (number), unitAr, unitEn, unitPrice (number), costMin (number), costMax (number), needsReview (boolean). Use the supplied supplier costs as the initial baseline; these are costs, not final selling prices. For catalogue items, choose a baseline unitPrice within costMin and costMax and set needsReview=false. Never invent prices for unknown items: set unitPrice, costMin and costMax to 0 and needsReview=true. Buffet for 200 and Wrangler three laps are total service prices, not per-person prices. Include camp rental, extra services, or requested custom items as separate lines, with zero price and needsReview=true when no reliable cost exists. Do not add commission, profit, discount or VAT as line items; the admin controls those separately. Do not save or approve anything. Quantity must reflect the request; if unspecified use 1. warningAr must mention any assumptions or missing prices, otherwise be an empty string. Supplier costs JSON: ${JSON.stringify(SUPPLIER_COSTS)}. ${SUPPLIER_COSTS_NOTE}`,
            },
            { role: "user", content: JSON.stringify({ request: prompt, bookingContext: context }) },
          ],
        }),
      });
    } finally {
      clearTimeout(timer);
    }
    if (!groqResponse.ok) {
      console.error("[ai-quote] Groq returned", groqResponse.status);
      return NextResponse.json({ error: "تعذر توليد المسودة الآن. يمكنك إضافة البنود يدويًا." }, { status: 502 });
    }
    const payload = await groqResponse.json() as { choices?: { message?: { content?: string } }[] };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");
    const draft = extractJson(content);
    const items = normalizeLineItems(draft.items);
    if (!items.length) throw new Error("AI returned no line items");
    return NextResponse.json({
      items,
      summaryAr: String(draft.summaryAr ?? "").slice(0, 1000),
      warningAr: String(draft.warningAr ?? "").slice(0, 1000),
      saved: false,
    });
  } catch (error) {
    console.error("[ai-quote] generation error:", error);
    return NextResponse.json({ error: "لم نتمكن من قراءة مسودة التسعير. عدّل الطلب أو استخدم الإدخال اليدوي." }, { status: 502 });
  }
}
