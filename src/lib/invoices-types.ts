export type InvoiceStatus = "draft" | "approved" | "issued";
export type CommissionType = "none" | "percent" | "fixed";

export type InvoiceLineItem = {
  id: string;
  descriptionAr: string;
  descriptionEn: string;
  quantity: number;
  unitAr: string;
  unitEn: string;
  unitPrice: number;
  costMin?: number;
  costMax?: number;
  needsReview?: boolean;
};

export type InvoiceInput = {
  bookingId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  company: string;
  eventAt: string | null;
  guestCount: number;
  status: InvoiceStatus;
  items: InvoiceLineItem[];
  discount: number;
  commissionType: CommissionType;
  commissionValue: number;
  showCommission: boolean;
  taxRate: number;
  notes: string;
};

export type InvoiceRecord = InvoiceInput & {
  id: string;
  invoiceNumber: string;
  currency: "SAR";
  subtotal: number;
  commissionAmount: number;
  taxAmount: number;
  total: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "مسودة",
  approved: "معتمد",
  issued: "فاتورة صادرة",
};
