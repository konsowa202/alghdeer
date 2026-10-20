"use client";

import React, { useState, type ComponentType } from "react";
import {
  CheckCircle,
  Clock,
  Banknote,
  BadgeCheck,
  Ban,
  MessageCircle,
  Search,
  RefreshCw,
  BellRing,
  Volume2,
  VolumeX,
  Eye,
  CalendarPlus,
} from "lucide-react";
import type { BookingRecord, BookingStatus } from "@/lib/bookings-types";
import { BOOKING_STATUS_LABELS } from "@/lib/bookings-types";
import {
  useBookingsController,
  useBookingsFilter,
  formatWhen,
  waHref,
  StatusBadge,
  type StatusFilter,
} from "./booking-shared";
import BookingDetailSheet from "./BookingDetailSheet";
import AddBookingForm from "./AddBookingForm";

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "pending", label: "قيد المراجعة" },
  { key: "confirmed", label: "مؤكد" },
  { key: "deposit", label: "الديبوزيت" },
  { key: "completed", label: "مكتمل" },
  { key: "cancelled", label: "ملغى" },
];

export default function StaffBookingsPanel() {
  const controller = useBookingsController();
  const { query, setQuery, statusFilter, setStatusFilter, filtered } =
    useBookingsFilter(controller.rows);
  const [selected, setSelected] = useState<BookingRecord | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    rows,
    loading,
    loadError,
    busyId,
    unauthorized,
    stats,
    newCount,
    clearNewCount,
    soundOn,
    setSoundOn,
    refresh,
    setStatus,
  } = controller;

  // Keep the open detail sheet in sync with live data
  const selectedLive = selected
    ? rows.find((r) => r.id === selected.id) ?? selected
    : null;

  if (unauthorized) {
    return (
      <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-8 text-center">
        <p className="text-red-300 font-bold mb-2">انتهت الجلسة</p>
        <p className="text-white/50 text-sm mb-4">
          سجل الدخول مرة أخرى لمتابعة إدارة الحجوزات.
        </p>
        <a
          href="/dashboard/login"
          className="inline-block px-6 py-2.5 bg-[#cba135] text-black font-bold rounded-lg"
        >
          تسجيل الدخول
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {newCount > 0 ? (
        <button
          type="button"
          onClick={clearNewCount}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-sm animate-pulse"
        >
          <BellRing size={18} />
          {newCount === 1 ? "وصل حجز جديد من الموقع" : `وصل ${newCount} حجوزات جديدة من الموقع`}
        </button>
      ) : null}

      {loadError ? <p className="text-red-400 text-sm">{loadError}</p> : null}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatChip label="إجمالي الطلبات" value={stats.total} icon={Clock} tone="neutral" />
        <StatChip label="اليوم" value={stats.today} icon={CalendarPlus} tone="gold" />
        <StatChip label="قيد المراجعة" value={stats.pending} icon={Clock} tone="amber" />
        <StatChip label="مؤكد" value={stats.confirmed} icon={CheckCircle} tone="sky" />
        <StatChip label="الديبوزيت" value={stats.deposit} icon={Banknote} tone="violet" />
        <StatChip label="مكتمل / ملغى" value={`${stats.completed} / ${stats.cancelled}`} icon={BadgeCheck} tone="emerald" />
      </div>

      {/* Manual entry (collapsible) */}
      <div className="bg-white/5 rounded-2xl border border-white/10 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4 mb-1">
          <div>
            <h3 className="text-lg font-bold text-white">
              تسجيل حجز أو استفسار (يدوي)
            </h3>
            <p className="text-white/45 text-sm mt-1">
              إدخال من الفريق بعد التواصل؛ يُخزَّن مع طلبات الموقع في نفس القائمة.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="px-4 py-2 text-xs font-bold bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors shrink-0"
          >
            {showAddForm ? "إخفاء النموذج" : "إظهار النموذج"}
          </button>
        </div>
        {showAddForm ? (
          <div className="mt-6">
            <AddBookingForm controller={controller} />
          </div>
        ) : null}
      </div>

      {/* Bookings table */}
      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">قائمة الحجوزات</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                تحديث كل 10 ثوانٍ
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSoundOn(!soundOn)}
                title={soundOn ? "كتم صوت التنبيه" : "تفعيل صوت التنبيه"}
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/15 text-white/70 flex items-center justify-center transition-colors"
              >
                {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button
                type="button"
                onClick={() => void refresh()}
                className="h-9 px-4 text-xs font-bold bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <RefreshCw size={14} />
                تحديث
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search
                size={16}
                className="absolute start-3 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="بحث بالاسم أو الجوال أو رقم التذكرة أو الملاحظات…"
                className="w-full ps-9 pe-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#cba135]"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto">
              {FILTER_TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setStatusFilter(t.key)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    statusFilter === t.key
                      ? "bg-[#cba135] text-black"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[900px]" dir="rtl">
            <thead className="bg-white/5 text-white/60 text-sm font-medium">
              <tr>
                <th className="px-3 py-3">المصدر</th>
                <th className="px-3 py-3">العميل</th>
                <th className="px-3 py-3">الجوال / واتساب</th>
                <th className="px-3 py-3">الموعد</th>
                <th className="px-3 py-3">العدد</th>
                <th className="px-3 py-3">الحالة</th>
                <th className="px-3 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-white/35 text-sm">
                    جاري التحميل…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-white/35 text-sm">
                    {rows.length === 0
                      ? "لا توجد طلبات بعد."
                      : "لا توجد نتائج مطابقة للبحث أو الفلتر."}
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <DesktopRow
                    key={order.id}
                    order={order}
                    isBusy={busyId === order.id}
                    onStatus={(s) => setStatus(order.id, s)}
                    onOpen={() => setSelected(order)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLive ? (
        <BookingDetailSheet
          booking={selectedLive}
          controller={controller}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}

function DesktopRow({
  order,
  isBusy,
  onStatus,
  onOpen,
}: {
  order: BookingRecord;
  isBusy: boolean;
  onStatus: (s: BookingStatus) => void;
  onOpen: () => void;
}) {
  const wa = waHref(order.phone);
  return (
    <tr className="hover:bg-white/[0.03] transition-colors align-middle">
      <td className="px-3 py-3 text-white/70 text-xs whitespace-nowrap">
        {order.source === "website" ? "موقع" : "فريق"}
      </td>
      <td className="px-3 py-3">
        <button
          type="button"
          onClick={onOpen}
          className="font-medium text-white hover:text-[#d4b458] transition-colors text-right"
        >
          {order.name}
        </button>
        {order.notes ? (
          <span className="block text-[10px] text-amber-400/70">📝 يوجد ملاحظات</span>
        ) : null}
      </td>
      <td className="px-3 py-3 text-xs whitespace-nowrap">
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-mono font-bold"
          >
            <MessageCircle size={14} />
            <span>{order.phone}</span>
          </a>
        ) : (
          <span className="text-white/40">—</span>
        )}
      </td>
      <td className="px-3 py-3 text-white/85 text-xs whitespace-nowrap">
        {formatWhen(order.preferredAt)}
      </td>
      <td className="px-3 py-3 text-white/85 whitespace-nowrap">
        {order.groupSize} شخص
      </td>
      <td className="px-3 py-3">
        <StatusBadge status={order.status} />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <select
            disabled={isBusy}
            value={order.status}
            onChange={(e) => onStatus(e.target.value as BookingStatus)}
            className="bg-white/5 border border-white/15 text-white/80 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#cba135] disabled:opacity-40"
          >
            {(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map((k) => (
              <option key={k} value={k} className="bg-[#14151b]">
                {BOOKING_STATUS_LABELS[k]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-white/15 text-white/80 hover:bg-white/10"
          >
            <Eye size={13} />
            تفاصيل
          </button>
        </div>
      </td>
    </tr>
  );
}

function StatChip({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: ComponentType<{ size?: number | string }>;
  tone: "neutral" | "amber" | "sky" | "violet" | "emerald" | "red" | "gold";
}) {
  const ring =
    tone === "amber"
      ? "bg-amber-500/20 text-amber-400"
      : tone === "sky"
        ? "bg-sky-500/20 text-sky-400"
        : tone === "violet"
          ? "bg-violet-500/20 text-violet-400"
          : tone === "emerald"
            ? "bg-emerald-500/20 text-emerald-400"
            : tone === "red"
              ? "bg-red-500/20 text-red-400"
              : tone === "gold"
                ? "bg-[#cba135]/20 text-[#d4b458]"
                : "bg-white/10 text-white/50";

  return (
    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-white/55 text-[10px] sm:text-xs font-medium leading-tight">
          {label}
        </p>
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${ring}`}
        >
          <Icon size={18} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
    </div>
  );
}
