"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  History,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { CustomerProfile } from "@/lib/customers";
import { normalizePhone } from "@/lib/customers";
import { matchesNormalizedQuery } from "@/lib/search-normalize";
import { BOOKING_STATUS_LABELS } from "@/lib/bookings-types";
import { INVOICE_STATUS_LABELS } from "@/lib/invoices-types";
import { formatSar } from "@/lib/invoice-pricing";
import { formatCreated, formatWhen, waHref } from "./booking-shared";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#cba135]/60";

export default function CustomersPanel({ initialPhone = "" }: { initialPhone?: string }) {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [selectedPhone, setSelectedPhone] = useState(normalizePhone(initialPhone));
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCustomers = useCallback(async () => {
    const response = await fetch("/api/customers", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "تعذر تحميل العملاء");
    const rows = data.customers as CustomerProfile[];
    setCustomers(rows);
    setSelectedPhone((current) => {
      if (current && rows.some((row) => row.phone === current)) return current;
      return rows[0]?.phone || "";
    });
  }, []);

  useEffect(() => {
    let active = true;
    loadCustomers()
      .catch((reason: Error) => {
        if (active) setError(reason.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadCustomers]);

  const filtered = useMemo(() => {
    const query = search.trim();
    if (!query) return customers;
    return customers.filter((customer) =>
      matchesNormalizedQuery(
        query,
        [customer.name, customer.company, customer.email, customer.phone],
        [customer.phone]
      )
    );
  }, [customers, search]);

  const selected =
    customers.find((customer) => customer.phone === selectedPhone) || filtered[0] || null;

  async function handleDeleteCustomer(customer: CustomerProfile) {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف العميل "${customer.name}" نهائيًا؟\nسيتم حذف (${customer.bookingCount}) حجوزات و (${customer.invoiceCount}) فواتير مرتبطة بهذا الرقم (${customer.phone}).`
    );
    if (!confirmed) return;

    setBusyKey(`customer:${customer.phone}`);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/customers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: customer.phone }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "تعذر حذف العميل.");
      await loadCustomers();
      setNotice(`تم حذف العميل "${customer.name}" وجميع سجلاته بنجاح.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حذف العميل.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleDeleteBooking(bookingId: string) {
    if (!window.confirm(`هل تريد حذف الحجز ${bookingId} نهائيًا؟`)) return;
    setBusyKey(`booking:${bookingId}`);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/bookings/${encodeURIComponent(bookingId)}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "تعذر حذف الحجز.");
      await loadCustomers();
      setNotice(`تم حذف الحجز ${bookingId}.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حذف الحجز.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleDeleteInvoice(invoiceId: string, invoiceNumber: string) {
    if (!window.confirm(`هل تريد حذف الفاتورة ${invoiceNumber} نهائيًا؟`)) return;
    setBusyKey(`invoice:${invoiceId}`);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/invoices/${encodeURIComponent(invoiceId)}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "تعذر حذف الفاتورة.");
      await loadCustomers();
      setNotice(`تم حذف الفاتورة ${invoiceNumber}.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حذف الفاتورة.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1450px] pb-24 md:pb-8" dir="rtl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[#d4b458]">
            <UsersRound size={18} />
            <span className="text-xs font-bold">دليل العملاء</span>
          </div>
          <h1 className="text-2xl font-black text-white md:text-3xl">
            ملف العميل وسجل التعاملات
          </h1>
          <p className="mt-2 text-xs text-white/40">
            ابحث بالاسم أو رقم الجوال لعرض الحجوزات والتفاصيل والفواتير وإدارتها في مكان واحد.
          </p>
        </div>
        <Link
          href={`/dashboard/invoices${selected ? `?phone=${encodeURIComponent(selected.phone)}` : ""}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#cba135] px-5 py-3 text-xs font-black text-black hover:bg-[#d4b458]"
        >
          <Plus size={16} /> عرض سعر للعميل
        </Link>
      </div>

      <div className="relative mb-5 max-w-xl">
        <Search size={17} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className={`${inputClass} pr-11`}
          placeholder="ابحث بالاسم أو رقم الجوال أو الشركة…"
        />
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-3 text-xs text-red-200">
          {error}
        </p>
      ) : null}

      {notice ? (
        <p className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] p-3 text-xs text-emerald-200">
          <CheckCircle2 size={15} className="shrink-0" />
          {notice}
        </p>
      ) : null}

      <div className="grid items-start gap-5 lg:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
          <div className="flex items-center justify-between px-2 pb-3 pt-1">
            <span className="text-xs font-bold text-white/55">العملاء</span>
            <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-white/35">
              {filtered.length}
            </span>
          </div>
          <div className="max-h-[68vh] space-y-2 overflow-y-auto">
            {loading ? (
              <div className="py-16 text-center">
                <RefreshCw size={22} className="mx-auto animate-spin text-[#cba135]" />
              </div>
            ) : null}
            {!loading && !filtered.length ? (
              <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs leading-6 text-white/30">
                لا توجد نتائج مطابقة.
              </p>
            ) : null}
            {filtered.map((customer) => (
              <button
                type="button"
                key={customer.phone}
                onClick={() => setSelectedPhone(customer.phone)}
                className={`w-full rounded-xl border p-3.5 text-right ${
                  selected?.phone === customer.phone
                    ? "border-[#cba135]/40 bg-[#cba135]/[0.08]"
                    : "border-white/[0.06] bg-black/15 hover:bg-white/[0.035]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#cba135]/10 text-[#d4b458]">
                    <UserRound size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-white/85">{customer.name}</p>
                    <p className="mt-1 font-mono text-[10px] text-white/35" dir="ltr">
                      {customer.phone}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-3 text-[10px] text-white/35">
                  <span>{customer.bookingCount} حجوزات</span>
                  <span>{customer.invoiceCount} فواتير</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {selected ? (
          <main className="min-w-0 space-y-5">
            <section className="rounded-2xl border border-white/[0.08] bg-[linear-gradient(135deg,rgba(203,161,53,0.08),rgba(255,255,255,0.02))] p-5">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#cba135]/15 text-[#d4b458]">
                    <UserRound size={26} />
                  </span>
                  <div>
                    <h2 className="text-xl font-black text-white">{selected.name}</h2>
                    <p className="mt-1.5 font-mono text-sm text-[#d4b458]" dir="ltr">
                      {selected.phone}
                    </p>
                    {selected.company ? (
                      <p className="mt-1 text-xs text-white/40">{selected.company}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {waHref(selected.phone) ? (
                    <a
                      href={waHref(selected.phone) || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.07] px-4 py-2.5 text-xs font-bold text-emerald-300"
                    >
                      <MessageCircle size={15} /> واتساب
                    </a>
                  ) : null}
                  <a
                    href={`tel:${selected.phone}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-sky-400/25 bg-sky-400/[0.07] px-4 py-2.5 text-xs font-bold text-sky-300"
                  >
                    <Phone size={15} /> اتصال
                  </a>
                  {selected.email ? (
                    <a
                      href={`mailto:${selected.email}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-white/60"
                    >
                      <Mail size={15} /> إيميل
                    </a>
                  ) : null}
                  <button
                    type="button"
                    disabled={busyKey === `customer:${selected.phone}`}
                    onClick={() => void handleDeleteCustomer(selected)}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-400/25 bg-red-400/[0.07] px-4 py-2.5 text-xs font-bold text-red-300 transition-colors hover:bg-red-400/15 disabled:opacity-40"
                  >
                    {busyKey === `customer:${selected.phone}` ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                    حذف العميل
                  </button>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/[0.07] pt-5">
                <div>
                  <p className="text-[10px] text-white/35">الحجوزات</p>
                  <p className="mt-1 text-lg font-black text-white">{selected.bookingCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/35">الفواتير</p>
                  <p className="mt-1 text-lg font-black text-white">{selected.invoiceCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/35">إجمالي الصادر</p>
                  <p className="mt-1 text-lg font-black text-[#e5c979]">
                    {formatSar(selected.totalInvoiced)} <small className="text-[9px]">ر.س</small>
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
              <div className="flex items-center gap-2 border-b border-white/[0.07] p-4">
                <History size={17} className="text-[#d4b458]" />
                <h2 className="text-sm font-bold text-white">سجل الحجوزات</h2>
              </div>
              <div className="space-y-3 p-4">
                {!selected.bookings.length ? (
                  <p className="py-5 text-center text-xs text-white/30">
                    لا توجد حجوزات مرتبطة بهذا الرقم.
                  </p>
                ) : (
                  selected.bookings.map((booking) => (
                    <article
                      key={booking.id}
                      className="rounded-xl border border-white/[0.07] bg-black/15 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-[#d4b458]" dir="ltr">
                          {booking.id}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/50">
                            {BOOKING_STATUS_LABELS[booking.status]}
                          </span>
                          <button
                            type="button"
                            disabled={busyKey === `booking:${booking.id}`}
                            onClick={() => void handleDeleteBooking(booking.id)}
                            title="حذف الحجز"
                            className="inline-flex items-center gap-1 rounded-lg border border-red-400/20 px-2.5 py-1 text-[10px] font-bold text-red-300/80 hover:bg-red-400/10 hover:text-red-200 disabled:opacity-40"
                          >
                            <Trash2 size={12} /> حذف
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-3 text-xs sm:grid-cols-3">
                        <p className="flex items-center gap-2 text-white/55">
                          <CalendarDays size={14} className="text-white/25" />
                          {formatWhen(booking.preferredAt)}
                        </p>
                        <p className="text-white/55">العدد: {booking.groupSize} شخص</p>
                        <p className="text-white/35">سُجل: {formatCreated(booking.createdAt)}</p>
                      </div>
                      {booking.company !== "—" ? (
                        <p className="mt-3 text-xs text-white/45">
                          الجهة / المناسبة: {booking.company}
                        </p>
                      ) : null}
                      {booking.notes ? (
                        <p className="mt-3 whitespace-pre-wrap rounded-lg bg-white/[0.03] p-3 text-xs leading-6 text-white/55">
                          {booking.notes}
                        </p>
                      ) : null}
                      <Link
                        href={`/dashboard/invoices?booking=${booking.id}`}
                        className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#d4b458]"
                      >
                        <Plus size={13} /> إنشاء عرض سعر من الحجز
                      </Link>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
              <div className="flex items-center gap-2 border-b border-white/[0.07] p-4">
                <FileText size={17} className="text-[#d4b458]" />
                <h2 className="text-sm font-bold text-white">الفواتير وعروض الأسعار</h2>
              </div>
              <div className="space-y-3 p-4">
                {!selected.invoices.length ? (
                  <p className="py-5 text-center text-xs text-white/30">
                    لا توجد فواتير مرتبطة بهذا الرقم.
                  </p>
                ) : (
                  selected.invoices.map((invoice) => (
                    <article
                      key={invoice.id}
                      className="flex flex-col gap-3 rounded-xl border border-white/[0.07] bg-black/15 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <Link
                          href={`/dashboard/invoices?invoice=${invoice.id}`}
                          className="font-mono text-xs text-[#d4b458]"
                          dir="ltr"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                        <p className="mt-2 text-[11px] text-white/35">
                          {INVOICE_STATUS_LABELS[invoice.status]} • {formatCreated(invoice.updatedAt)} •{" "}
                          {invoice.items.length} بنود
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
                        <span className="ml-2 text-sm font-black text-[#e5c979]">
                          {formatSar(invoice.total)} ر.س
                        </span>
                        <Link
                          href={`/dashboard/invoices/${invoice.id}/print`}
                          target="_blank"
                          className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-bold text-white/60 hover:bg-white/5"
                        >
                          عرض وطباعة
                        </Link>
                        <button
                          type="button"
                          disabled={busyKey === `invoice:${invoice.id}`}
                          onClick={() => void handleDeleteInvoice(invoice.id, invoice.invoiceNumber)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-400/20 px-3 py-2 text-[10px] font-bold text-red-300/80 hover:bg-red-400/10 hover:text-red-200 disabled:opacity-40"
                        >
                          <Trash2 size={12} /> حذف
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </main>
        ) : !loading ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-20 text-center text-sm text-white/30">
            اختر عميلًا لعرض ملفه.
          </div>
        ) : null}
      </div>
    </div>
  );
}
