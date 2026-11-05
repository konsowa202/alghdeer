"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  FileText,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  UserRound,
  Wand2,
} from "lucide-react";
import type { BookingRecord } from "@/lib/bookings-types";
import type { CommissionType, InvoiceInput, InvoiceLineItem, InvoiceRecord, InvoiceStatus } from "@/lib/invoices-types";
import { INVOICE_STATUS_LABELS } from "@/lib/invoices-types";
import { formatSar, invoiceTotals } from "@/lib/invoice-pricing";
import { SUPPLIER_COSTS, SUPPLIER_COSTS_NOTE, type SupplierCost } from "@/data/supplier-costs";

const emptyDraft = (): InvoiceInput => ({
  bookingId: null,
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  company: "",
  eventAt: null,
  guestCount: 1,
  status: "draft",
  items: [],
  discount: 0,
  commissionType: "none",
  commissionValue: 0,
  showCommission: true,
  taxRate: 0,
  notes: "",
});

const inputClass = "w-full rounded-xl border border-white/10 bg-black/25 px-3.5 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#cba135]/60";
const labelClass = "mb-1.5 block text-[11px] font-bold text-white/45";

function toDateTimeLocal(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function fromInvoice(invoice: InvoiceRecord): InvoiceInput {
  return {
    bookingId: invoice.bookingId,
    customerName: invoice.customerName,
    customerPhone: invoice.customerPhone,
    customerEmail: invoice.customerEmail,
    company: invoice.company,
    eventAt: invoice.eventAt,
    guestCount: invoice.guestCount,
    status: invoice.status,
    items: invoice.items,
    discount: invoice.discount,
    commissionType: invoice.commissionType,
    commissionValue: invoice.commissionValue,
    showCommission: invoice.showCommission,
    taxRate: invoice.taxRate,
    notes: invoice.notes,
  };
}

function costItem(cost: SupplierCost): InvoiceLineItem {
  const known = cost.min !== null && cost.max !== null;
  return {
    id: crypto.randomUUID(),
    descriptionAr: cost.nameAr,
    descriptionEn: cost.nameEn,
    quantity: cost.quantity,
    unitAr: cost.unitAr,
    unitEn: cost.unitEn,
    unitPrice: known ? ((cost.min ?? 0) + (cost.max ?? 0)) / 2 : 0,
    costMin: cost.min ?? 0,
    costMax: cost.max ?? 0,
    needsReview: !known,
  };
}

export default function QuoteStudio({ initialBookingId = "", initialPhone = "", initialInvoiceId = "" }: { initialBookingId?: string; initialPhone?: string; initialInvoiceId?: string }) {
  const [form, setForm] = useState<InvoiceInput>(emptyDraft);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [prompt, setPrompt] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState<InvoiceStatus | null>(null);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const totals = useMemo(() => invoiceTotals(form), [form]);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/invoices", { cache: "no-store" }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "تعذر تحميل الفواتير");
        return data.invoices as InvoiceRecord[];
      }),
      fetch("/api/bookings", { cache: "no-store" }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "تعذر تحميل الحجوزات");
        return data.bookings as BookingRecord[];
      }),
    ]).then(([invoiceRows, bookingRows]) => {
      if (!active) return;
      setInvoices(invoiceRows);
      setBookings(bookingRows);
      const booking = bookingRows.find((row) => row.id === initialBookingId);
      const existingInvoice = invoiceRows.find((row) => row.id === initialInvoiceId);
      if (existingInvoice) {
        setSelectedId(existingInvoice.id);
        setInvoiceNumber(existingInvoice.invoiceNumber);
        setForm(fromInvoice(existingInvoice));
        setPrompt(existingInvoice.notes);
      } else if (booking) {
        setForm({
          ...emptyDraft(),
          bookingId: booking.id,
          customerName: booking.name,
          customerPhone: booking.phone === "—" ? "" : booking.phone,
          customerEmail: booking.email || "",
          company: booking.company === "—" ? "" : booking.company,
          eventAt: booking.preferredAt,
          guestCount: booking.groupSize,
          notes: booking.notes,
          items: [],
        });
        setPrompt(booking.notes || `حجز لعدد ${booking.groupSize} شخص بتاريخ ${booking.preferredAt}`);
      } else if (initialPhone) {
        setForm({ ...emptyDraft(), customerPhone: initialPhone });
      }
    }).catch((reason: Error) => {
      if (active) setError(reason.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [initialBookingId, initialPhone, initialInvoiceId]);

  function update<K extends keyof InvoiceInput>(key: K, value: InvoiceInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setNotice("");
  }

  function updateItem<K extends keyof InvoiceLineItem>(id: string, key: K, value: InvoiceLineItem[K]) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, [key]: value };
        if (key === "unitPrice") next.needsReview = Number(value) <= 0;
        return next;
      }),
    }));
    setNotice("");
  }

  function selectInvoice(invoice: InvoiceRecord) {
    setSelectedId(invoice.id);
    setInvoiceNumber(invoice.invoiceNumber);
    setForm(fromInvoice(invoice));
    setPrompt(invoice.notes);
    setError("");
    setNotice(`تم فتح ${invoice.invoiceNumber} للتعديل.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function newQuote() {
    setSelectedId(null);
    setInvoiceNumber("");
    setForm(emptyDraft());
    setPrompt("");
    setError("");
    setNotice("");
    setAiMessage("");
  }

  function linkBooking(bookingId: string) {
    const booking = bookings.find((row) => row.id === bookingId);
    update("bookingId", bookingId || null);
    if (!booking) return;
    setForm((current) => ({
      ...current,
      bookingId,
      customerName: booking.name,
      customerPhone: booking.phone === "—" ? "" : booking.phone,
      customerEmail: booking.email || "",
      company: booking.company === "—" ? "" : booking.company,
      eventAt: booking.preferredAt,
      guestCount: booking.groupSize,
      notes: current.notes || booking.notes,
    }));
  }

  async function generateDraft() {
    if (prompt.trim().length < 3) {
      setError("اكتب طلب العميل أو الصق رسالته أولًا.");
      return;
    }
    setGenerating(true);
    setError("");
    setAiMessage("");
    try {
      const response = await fetch("/api/ai/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          context: {
            customerName: form.customerName,
            guestCount: form.guestCount,
            eventAt: form.eventAt,
            company: form.company,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر توليد المسودة");
      update("items", data.items.map((item: InvoiceLineItem) => ({ ...item, id: crypto.randomUUID() })));
      setAiMessage([data.summaryAr, data.warningAr].filter(Boolean).join("\n"));
      setNotice("المسودة جاهزة للمراجعة — لم يتم حفظ أو اعتماد أي شيء تلقائيًا.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر توليد المسودة");
    } finally {
      setGenerating(false);
    }
  }

  function addSupplierItem() {
    const cost = SUPPLIER_COSTS.find((item) => item.id === supplierId);
    if (!cost) return;
    update("items", [...form.items, costItem(cost)]);
    setSupplierId("");
  }

  function addManualItem() {
    update("items", [...form.items, {
      id: crypto.randomUUID(),
      descriptionAr: "",
      descriptionEn: "",
      quantity: 1,
      unitAr: "خدمة",
      unitEn: "service",
      unitPrice: 0,
      costMin: 0,
      costMax: 0,
      needsReview: true,
    }]);
  }

  async function save(status: InvoiceStatus) {
    if (form.customerName.trim().length < 2) return setError("أدخل اسم العميل قبل الحفظ.");
    if (!form.items.length) return setError("أضف بندًا واحدًا على الأقل قبل الحفظ.");
    if (status !== "draft" && form.items.some((item) => item.unitPrice <= 0 || item.needsReview || (!item.descriptionAr && !item.descriptionEn))) {
      return setError("راجع أسماء البنود والأسعار والبنود المعلّمة قبل الاعتماد أو الإصدار.");
    }
    setSaving(status);
    setError("");
    setNotice("");
    try {
      const payload = {
        ...form,
        status,
        eventAt: form.eventAt ? new Date(form.eventAt).toISOString() : null,
      };
      const response = await fetch(selectedId ? `/api/invoices/${selectedId}` : "/api/invoices", {
        method: selectedId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر حفظ الفاتورة");
      const invoice = data.invoice as InvoiceRecord;
      setInvoices((current) => [invoice, ...current.filter((row) => row.id !== invoice.id)]);
      setSelectedId(invoice.id);
      setInvoiceNumber(invoice.invoiceNumber);
      setForm(fromInvoice(invoice));
      setNotice(status === "draft" ? "تم حفظ المسودة." : status === "approved" ? "تم اعتماد عرض السعر." : "تم إصدار الفاتورة بنجاح.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حفظ الفاتورة");
    } finally {
      setSaving(null);
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const query = invoiceSearch.trim().toLowerCase();
    return !query || `${invoice.invoiceNumber} ${invoice.customerName} ${invoice.customerPhone}`.toLowerCase().includes(query);
  });

  return (
    <div className="mx-auto max-w-[1600px] pb-24 md:pb-8" dir="rtl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[#d4b458]">
            <Wand2 size={18} />
            <span className="text-xs font-bold">مساعد التسعير والفوترة</span>
          </div>
          <h1 className="text-2xl font-black text-white md:text-3xl">من رسالة العميل إلى فاتورة معتمدة</h1>
          <p className="mt-2 text-xs leading-6 text-white/40">مسودة ذكية، مراجعة يدوية كاملة، ثم اعتماد وإصدار وطباعة عربي/إنجليزي.</p>
        </div>
        <button type="button" onClick={newQuote} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#cba135]/35 bg-[#cba135]/10 px-5 py-3 text-sm font-bold text-[#e5c979] hover:bg-[#cba135]/15">
          <Plus size={17} /> عرض سعر جديد
        </button>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <section className="rounded-2xl border border-[#cba135]/20 bg-[linear-gradient(135deg,rgba(203,161,53,0.09),rgba(255,255,255,0.025))] p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#d4b458]" />
                <h2 className="text-sm font-bold text-white">حلّل رسالة العميل</h2>
              </div>
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/35">لا يحفظ تلقائيًا</span>
            </div>
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={4} maxLength={12000} placeholder="مثال: عميل عايز حجز لـ 200 شخص، بوفيه عشاء ودي جي وسماعات وإضاءات… أو الصق رسالة واتساب هنا" className={`${inputClass} resize-y leading-7`} />
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] leading-5 text-white/30">{SUPPLIER_COSTS_NOTE}</p>
              <button type="button" disabled={generating} onClick={generateDraft} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#cba135] px-5 py-3 text-xs font-black text-black hover:bg-[#d4b458] disabled:opacity-50">
                {generating ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {generating ? "جاري تجهيز المسودة…" : "توليد جدول مسودة"}
              </button>
            </div>
            {aiMessage ? <p className="mt-3 whitespace-pre-wrap rounded-xl border border-sky-400/15 bg-sky-400/[0.06] p-3 text-xs leading-6 text-sky-100/70">{aiMessage}</p> : null}
          </section>

          {(error || notice) ? (
            <div className={`flex items-start gap-2 rounded-xl border p-3 text-xs leading-6 ${error ? "border-red-400/20 bg-red-400/[0.07] text-red-200" : "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"}`}>
              {error ? <AlertTriangle size={17} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={17} className="mt-0.5 shrink-0" />}
              {error || notice}
            </div>
          ) : null}

          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 md:p-5">
            <div className="mb-5 flex items-center gap-2">
              <UserRound size={18} className="text-[#d4b458]" />
              <h2 className="text-sm font-bold text-white">بيانات العميل والحجز</h2>
              {invoiceNumber ? <span className="mr-auto font-mono text-xs text-[#d4b458]" dir="ltr">{invoiceNumber}</span> : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="lg:col-span-3"><span className={labelClass}>ربط بحجز موجود (اختياري)</span><select value={form.bookingId || ""} onChange={(event) => linkBooking(event.target.value)} className={inputClass}><option value="">بدون ربط / حجز جديد</option>{bookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.id} — {booking.name} — {booking.phone}</option>)}</select></label>
              <label><span className={labelClass}>اسم العميل *</span><input value={form.customerName} onChange={(event) => update("customerName", event.target.value)} className={inputClass} placeholder="الاسم الكامل" /></label>
              <label><span className={labelClass}>رقم الجوال</span><input dir="ltr" value={form.customerPhone} onChange={(event) => update("customerPhone", event.target.value)} className={`${inputClass} text-right`} placeholder="05xxxxxxxx" /></label>
              <label><span className={labelClass}>البريد الإلكتروني</span><input dir="ltr" type="email" value={form.customerEmail} onChange={(event) => update("customerEmail", event.target.value)} className={`${inputClass} text-right`} placeholder="client@example.com" /></label>
              <label><span className={labelClass}>الشركة / المناسبة</span><input value={form.company} onChange={(event) => update("company", event.target.value)} className={inputClass} /></label>
              <label><span className={labelClass}>عدد الضيوف</span><input type="number" min={1} max={5000} value={form.guestCount} onChange={(event) => update("guestCount", Number(event.target.value))} className={inputClass} /></label>
              <label><span className={labelClass}>تاريخ المناسبة</span><input type="datetime-local" value={toDateTimeLocal(form.eventAt)} onChange={(event) => update("eventAt", event.target.value)} className={inputClass} /></label>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
            <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 md:flex-row md:items-center md:justify-between md:p-5">
              <div><h2 className="text-sm font-bold text-white">بنود عرض السعر</h2><p className="mt-1 text-[10px] text-white/30">كل بند قابل للتعديل قبل الاعتماد</p></div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className="rounded-xl border border-white/10 bg-[#111216] px-3 py-2.5 text-xs text-white/70 outline-none"><option value="">إضافة من تكاليف الموردين…</option>{SUPPLIER_COSTS.map((cost) => <option key={cost.id} value={cost.id}>{cost.nameAr}{cost.min === null ? " — بدون سعر" : ` — ${cost.min} إلى ${cost.max}`}</option>)}</select>
                <button type="button" onClick={addSupplierItem} disabled={!supplierId} className="rounded-xl border border-[#cba135]/30 px-3 py-2.5 text-xs font-bold text-[#d4b458] disabled:opacity-30">إضافة</button>
                <button type="button" onClick={addManualItem} className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-bold text-white/65 hover:bg-white/5"><Plus size={14} /> بند يدوي</button>
              </div>
            </div>

            <div className="space-y-3 p-3 md:p-5">
              {form.items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 px-4 py-12 text-center"><FileText size={28} className="mx-auto mb-3 text-white/15" /><p className="text-sm text-white/35">ولّد مسودة بالذكاء الاصطناعي أو أضف بندًا يدويًا</p></div>
              ) : form.items.map((item, index) => (
                <div key={item.id} className={`rounded-xl border p-3 ${item.needsReview ? "border-amber-400/25 bg-amber-400/[0.035]" : "border-white/[0.07] bg-black/15"}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white/35">بند {index + 1}{item.needsReview ? <span className="mr-2 text-amber-300">• يحتاج مراجعة السعر</span> : null}</span>
                    <button type="button" aria-label="حذف البند" onClick={() => update("items", form.items.filter((row) => row.id !== item.id))} className="text-white/25 hover:text-red-300"><Trash2 size={16} /></button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-12">
                    <label className="xl:col-span-3"><span className={labelClass}>البند بالعربية</span><input value={item.descriptionAr} onChange={(event) => updateItem(item.id, "descriptionAr", event.target.value)} className={`${inputClass} py-2.5`} /></label>
                    <label className="xl:col-span-3"><span className={labelClass}>Item in English</span><input dir="ltr" value={item.descriptionEn} onChange={(event) => updateItem(item.id, "descriptionEn", event.target.value)} className={`${inputClass} py-2.5`} /></label>
                    <label className="xl:col-span-1"><span className={labelClass}>العدد</span><input type="number" min={0.01} step={0.01} value={item.quantity} onChange={(event) => updateItem(item.id, "quantity", Number(event.target.value))} className={`${inputClass} py-2.5`} /></label>
                    <label className="xl:col-span-2"><span className={labelClass}>الوحدة</span><input value={item.unitAr} onChange={(event) => updateItem(item.id, "unitAr", event.target.value)} className={`${inputClass} py-2.5`} /></label>
                    <label className="xl:col-span-1"><span className={labelClass}>Unit</span><input dir="ltr" value={item.unitEn} onChange={(event) => updateItem(item.id, "unitEn", event.target.value)} className={`${inputClass} py-2.5`} /></label>
                    <label className="xl:col-span-2"><span className={labelClass}>سعر الوحدة (ر.س)</span><input type="number" min={0} step={0.01} value={item.unitPrice} onChange={(event) => updateItem(item.id, "unitPrice", Number(event.target.value))} className={`${inputClass} py-2.5 font-bold text-[#e5c979]`} /></label>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-white/30"><span>تكلفة المورد: {item.costMin || item.costMax ? `${item.costMin ?? 0} — ${item.costMax ?? 0} ر.س` : "غير مسجلة"}</span><span className="font-bold text-white/55">الإجمالي: {formatSar(item.quantity * item.unitPrice)} ر.س</span></div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 md:p-5 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid content-start gap-4 sm:grid-cols-2">
              <label><span className={labelClass}>الخصم (ر.س)</span><input type="number" min={0} value={form.discount} onChange={(event) => update("discount", Number(event.target.value))} className={inputClass} /></label>
              <label><span className={labelClass}>نوع عمولة المنصة</span><select value={form.commissionType} onChange={(event) => update("commissionType", event.target.value as CommissionType)} className={inputClass}><option value="none">بدون عمولة</option><option value="percent">نسبة مئوية</option><option value="fixed">مبلغ ثابت</option></select></label>
              <label><span className={labelClass}>قيمة العمولة {form.commissionType === "percent" ? "(%)" : "(ر.س)"}</span><input type="number" min={0} disabled={form.commissionType === "none"} value={form.commissionValue} onChange={(event) => update("commissionValue", Number(event.target.value))} className={`${inputClass} disabled:opacity-35`} /></label>
              <label><span className={labelClass}>الضريبة (%)</span><input type="number" min={0} max={100} step={0.01} value={form.taxRate} onChange={(event) => update("taxRate", Number(event.target.value))} className={inputClass} /></label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 px-3 py-3 sm:col-span-2"><input type="checkbox" checked={form.showCommission} onChange={(event) => update("showCommission", event.target.checked)} className="accent-[#cba135]" /><span className="text-xs text-white/55">إظهار العمولة كسطر مستقل في النسخة المطبوعة</span></label>
              <label className="sm:col-span-2"><span className={labelClass}>ملاحظات وشروط الفاتورة</span><textarea rows={3} value={form.notes} onChange={(event) => update("notes", event.target.value)} className={`${inputClass} resize-y`} /></label>
            </div>
            <div className="rounded-xl border border-[#cba135]/20 bg-black/25 p-4">
              <h3 className="mb-4 text-xs font-bold text-[#d4b458]">ملخص الحساب</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-white/50"><span>الإجمالي الفرعي</span><span>{formatSar(totals.subtotal)} ر.س</span></div>
                <div className="flex justify-between text-white/50"><span>الخصم</span><span>- {formatSar(totals.discount)} ر.س</span></div>
                <div className="flex justify-between text-white/50"><span>العمولة</span><span>{formatSar(totals.commissionAmount)} ر.س</span></div>
                <div className="flex justify-between text-white/50"><span>الضريبة</span><span>{formatSar(totals.taxAmount)} ر.س</span></div>
                <div className="border-t border-[#cba135]/20 pt-4"><div className="flex items-end justify-between"><span className="font-bold text-white">الإجمالي النهائي</span><span className="text-xl font-black text-[#e5c979]">{formatSar(totals.total)} <small className="text-[10px]">ر.س</small></span></div></div>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-2 rounded-2xl border border-white/[0.08] bg-[#101115] p-4 sm:flex-row sm:flex-wrap">
            <button type="button" disabled={saving !== null} onClick={() => save("draft")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-xs font-bold text-white/75 hover:bg-white/5 disabled:opacity-40">{saving === "draft" ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} حفظ مسودة</button>
            <button type="button" disabled={saving !== null} onClick={() => save("approved")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#cba135]/35 bg-[#cba135]/10 px-4 py-3 text-xs font-bold text-[#e5c979] hover:bg-[#cba135]/15 disabled:opacity-40">{saving === "approved" ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} اعتماد عرض السعر</button>
            <button type="button" disabled={saving !== null} onClick={() => save("issued")} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#cba135] px-4 py-3 text-xs font-black text-black hover:bg-[#d4b458] disabled:opacity-40">{saving === "issued" ? <RefreshCw size={16} className="animate-spin" /> : <FileCheck2 size={16} />} إصدار الفاتورة</button>
            {selectedId ? <Link href={`/dashboard/invoices/${selectedId}/print`} target="_blank" className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/25 bg-sky-400/[0.07] px-4 py-3 text-xs font-bold text-sky-200"><Printer size={16} /> طباعة / PDF</Link> : null}
          </div>
        </div>

        <aside className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 xl:sticky xl:top-24">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold text-white">الفواتير المحفوظة</h2><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-white/40">{invoices.length}</span></div>
          <input value={invoiceSearch} onChange={(event) => setInvoiceSearch(event.target.value)} className={`${inputClass} mb-4 py-2.5 text-xs`} placeholder="بحث بالاسم أو رقم الفاتورة…" />
          <div className="max-h-[70vh] space-y-2 overflow-y-auto pl-1">
            {loading ? <div className="py-10 text-center"><RefreshCw size={20} className="mx-auto animate-spin text-[#cba135]" /></div> : null}
            {!loading && filteredInvoices.length === 0 ? <p className="rounded-xl border border-dashed border-white/10 p-5 text-center text-xs leading-6 text-white/30">لا توجد فواتير محفوظة بعد.</p> : null}
            {filteredInvoices.map((invoice) => (
              <button key={invoice.id} type="button" onClick={() => selectInvoice(invoice)} className={`w-full rounded-xl border p-3 text-right transition-colors ${selectedId === invoice.id ? "border-[#cba135]/40 bg-[#cba135]/[0.08]" : "border-white/[0.07] bg-black/15 hover:bg-white/[0.035]"}`}>
                <div className="flex items-center justify-between gap-2"><span className="font-mono text-[10px] text-[#d4b458]" dir="ltr">{invoice.invoiceNumber}</span><span className="text-[10px] text-white/35">{INVOICE_STATUS_LABELS[invoice.status]}</span></div>
                <p className="mt-2 truncate text-xs font-bold text-white/80">{invoice.customerName}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-white/35"><span dir="ltr">{invoice.customerPhone || "—"}</span><span className="font-bold text-white/65">{formatSar(invoice.total)} ر.س</span></div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
