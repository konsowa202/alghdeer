import { randomUUID } from "crypto";
import type { InvoiceInput, InvoiceRecord } from "./invoices-types";
import { invoiceTotals, normalizeLineItems } from "./invoice-pricing";

type DatabaseInvoice = {
  id: string;
  invoice_number: string;
  booking_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  company: string;
  event_at: string | null;
  guest_count: number;
  status: InvoiceRecord["status"];
  currency: "SAR";
  line_items: unknown;
  discount: number | string;
  commission_type: InvoiceRecord["commissionType"];
  commission_value: number | string;
  show_commission: boolean;
  tax_rate: number | string;
  subtotal: number | string;
  commission_amount: number | string;
  tax_amount: number | string;
  total: number | string;
  notes: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

function config(accessToken: string) {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const apiKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !apiKey) throw new Error("Supabase server environment is not configured.");
  return {
    endpoint: `${url}/rest/v1/invoices`,
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };
}

async function request(path: string, accessToken: string, init: RequestInit = {}) {
  const { endpoint, headers } = config(accessToken);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(`${endpoint}${path}`, {
      ...init,
      headers: { ...headers, ...init.headers },
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Invoice database request failed (${response.status}): ${details.slice(0, 500)}`);
    }
    return response;
  } finally {
    clearTimeout(timer);
  }
}

function normalize(row: DatabaseInvoice): InvoiceRecord {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    bookingId: row.booking_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    company: row.company,
    eventAt: row.event_at ? new Date(row.event_at).toISOString() : null,
    guestCount: row.guest_count,
    status: row.status,
    currency: "SAR",
    items: normalizeLineItems(row.line_items),
    discount: Number(row.discount),
    commissionType: row.commission_type,
    commissionValue: Number(row.commission_value),
    showCommission: row.show_commission,
    taxRate: Number(row.tax_rate),
    subtotal: Number(row.subtotal),
    commissionAmount: Number(row.commission_amount),
    taxAmount: Number(row.tax_amount),
    total: Number(row.total),
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function databaseFields(input: InvoiceInput, userId?: string) {
  const totals = invoiceTotals(input);
  return {
    booking_id: input.bookingId,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    customer_email: input.customerEmail,
    company: input.company,
    event_at: input.eventAt,
    guest_count: input.guestCount,
    status: input.status,
    currency: "SAR",
    line_items: input.items,
    discount: totals.discount,
    commission_type: input.commissionType,
    commission_value: totals.commissionValue,
    show_commission: input.showCommission,
    tax_rate: totals.taxRate,
    subtotal: totals.subtotal,
    commission_amount: totals.commissionAmount,
    tax_amount: totals.taxAmount,
    total: totals.total,
    notes: input.notes,
    ...(userId ? { created_by: userId } : {}),
  };
}

export async function listInvoices(accessToken: string): Promise<InvoiceRecord[]> {
  const response = await request("?select=*&order=created_at.desc", accessToken);
  return ((await response.json()) as DatabaseInvoice[]).map(normalize);
}

export async function getInvoice(id: string, accessToken: string): Promise<InvoiceRecord | null> {
  const response = await request(`?id=eq.${encodeURIComponent(id)}&select=*&limit=1`, accessToken);
  const rows = (await response.json()) as DatabaseInvoice[];
  return rows[0] ? normalize(rows[0]) : null;
}

export async function createInvoice(input: InvoiceInput, userId: string, accessToken: string) {
  const now = new Date().toISOString();
  for (let attempt = 0; attempt < 5; attempt++) {
    const date = now.slice(0, 10).replaceAll("-", "");
    const invoiceNumber = `INV-${date}-${randomUUID().slice(0, 6).toUpperCase()}`;
    try {
      const response = await request("?select=*", accessToken, {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          invoice_number: invoiceNumber,
          ...databaseFields(input, userId),
          created_at: now,
          updated_at: now,
        }),
      });
      const rows = (await response.json()) as DatabaseInvoice[];
      if (!rows[0]) throw new Error("Invoice database returned no inserted record.");
      return normalize(rows[0]);
    } catch (error) {
      if (attempt < 4 && error instanceof Error && error.message.includes("(409)")) continue;
      throw error;
    }
  }
  throw new Error("Could not allocate a unique invoice number.");
}

export async function updateInvoice(id: string, input: InvoiceInput, accessToken: string) {
  const current = await getInvoice(id, accessToken);
  if (!current) return null;
  const updatedAt = new Date().toISOString();
  const response = await request(
    `?id=eq.${encodeURIComponent(id)}&updated_at=eq.${encodeURIComponent(current.updatedAt)}&select=*`,
    accessToken,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ ...databaseFields(input), updated_at: updatedAt }),
    },
  );
  const rows = (await response.json()) as DatabaseInvoice[];
  if (!rows[0]) throw new Error("Invoice changed concurrently. Refresh and retry.");
  return normalize(rows[0]);
}
