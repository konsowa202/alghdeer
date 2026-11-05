import type { CommissionType, InvoiceInput, InvoiceLineItem, InvoiceStatus } from "./invoices-types";

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const cleanNumber = (value: unknown, min = 0, max = 10_000_000) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : min;
};
const cleanText = (value: unknown, max: number) => String(value ?? "")
  // eslint-disable-next-line no-control-regex
  .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
  .trim()
  .slice(0, max);

export function normalizeLineItems(value: unknown): InvoiceLineItem[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).map((raw, index) => {
    const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const min = cleanNumber(item.costMin);
    const max = cleanNumber(item.costMax);
    return {
      id: cleanText(item.id, 80) || `item-${index + 1}`,
      descriptionAr: cleanText(item.descriptionAr, 240),
      descriptionEn: cleanText(item.descriptionEn, 240),
      quantity: roundMoney(cleanNumber(item.quantity, 0.01, 5000)),
      unitAr: cleanText(item.unitAr, 40) || "خدمة",
      unitEn: cleanText(item.unitEn, 40) || "service",
      unitPrice: roundMoney(cleanNumber(item.unitPrice)),
      ...(item.costMin !== undefined ? { costMin: roundMoney(min) } : {}),
      ...(item.costMax !== undefined ? { costMax: roundMoney(max) } : {}),
      needsReview: Boolean(item.needsReview),
    };
  }).filter((item) => item.descriptionAr || item.descriptionEn);
}

export function calculateTotals(
  items: InvoiceLineItem[],
  discountValue: unknown,
  commissionType: CommissionType,
  commissionValueInput: unknown,
  taxRateInput: unknown,
) {
  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
  const discount = roundMoney(Math.min(subtotal, cleanNumber(discountValue)));
  const commissionValue = roundMoney(cleanNumber(commissionValueInput));
  const baseAfterDiscount = Math.max(0, subtotal - discount);
  const commissionAmount = roundMoney(
    commissionType === "percent"
      ? baseAfterDiscount * Math.min(100, commissionValue) / 100
      : commissionType === "fixed"
        ? commissionValue
        : 0,
  );
  const taxRate = cleanNumber(taxRateInput, 0, 100);
  const taxAmount = roundMoney((baseAfterDiscount + commissionAmount) * taxRate / 100);
  const total = roundMoney(baseAfterDiscount + commissionAmount + taxAmount);
  return { subtotal, discount, commissionValue, commissionAmount, taxRate, taxAmount, total };
}

export function normalizeInvoiceInput(body: Record<string, unknown>): InvoiceInput {
  const items = normalizeLineItems(body.items);
  const rawStatus = String(body.status ?? "draft");
  const status: InvoiceStatus = ["draft", "approved", "issued"].includes(rawStatus)
    ? rawStatus as InvoiceStatus
    : "draft";
  const rawCommission = String(body.commissionType ?? "none");
  const commissionType: CommissionType = ["none", "percent", "fixed"].includes(rawCommission)
    ? rawCommission as CommissionType
    : "none";
  const eventAtRaw = cleanText(body.eventAt, 80);
  const eventAt = eventAtRaw && Number.isFinite(Date.parse(eventAtRaw))
    ? new Date(eventAtRaw).toISOString()
    : null;
  const totals = calculateTotals(items, body.discount, commissionType, body.commissionValue, body.taxRate);

  return {
    bookingId: cleanText(body.bookingId, 80) || null,
    customerName: cleanText(body.customerName, 120),
    customerPhone: cleanText(body.customerPhone, 40),
    customerEmail: cleanText(body.customerEmail, 160),
    company: cleanText(body.company, 120),
    eventAt,
    guestCount: Math.floor(cleanNumber(body.guestCount, 1, 5000)),
    status,
    items,
    discount: totals.discount,
    commissionType,
    commissionValue: totals.commissionValue,
    showCommission: body.showCommission !== false,
    taxRate: totals.taxRate,
    notes: cleanText(body.notes, 4000),
  };
}

export function invoiceTotals(input: InvoiceInput) {
  return calculateTotals(input.items, input.discount, input.commissionType, input.commissionValue, input.taxRate);
}

export function formatSar(value: number) {
  return new Intl.NumberFormat("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}
