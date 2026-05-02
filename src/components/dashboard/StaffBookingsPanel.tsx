"use client";

import React, { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import {
  CheckCircle,
  Clock,
  Trash2,
  Banknote,
  BadgeCheck,
  Ban,
} from "lucide-react";
import type { BookingRecord, BookingStatus } from "@/lib/bookings-types";
import { BOOKING_STATUS_LABELS } from "@/lib/bookings-types";

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleString("ar-SA", {
    timeZone: "Asia/Riyadh",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusBadgeClass(s: BookingStatus) {
  switch (s) {
    case "confirmed":
      return "bg-sky-500/20 text-sky-300";
    case "deposit":
      return "bg-violet-500/20 text-violet-300";
    case "completed":
      return "bg-emerald-500/20 text-emerald-400";
    case "cancelled":
      return "bg-red-500/20 text-red-400";
    default:
      return "bg-amber-500/20 text-amber-400";
  }
}

export default function StaffBookingsPanel() {
  const [rows, setRows] = useState<BookingRecord[]>([]);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoadError("");
    const res = await fetch("/api/bookings", { credentials: "include" });
    if (!res.ok) {
      setLoadError("تعذر تحميل الحجوزات.");
      return;
    }
    const data = (await res.json()) as { bookings?: BookingRecord[] };
    setRows(Array.isArray(data.bookings) ? data.bookings : []);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [preferredLocal, setPreferredLocal] = useState("");
  const [notes, setNotes] = useState("");
  const [addStatus, setAddStatus] = useState<BookingStatus>("pending");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const stats = useMemo(() => {
    const total = rows.length;
    const pending = rows.filter((r) => r.status === "pending").length;
    const confirmed = rows.filter((r) => r.status === "confirmed").length;
    const deposit = rows.filter((r) => r.status === "deposit").length;
    const completed = rows.filter((r) => r.status === "completed").length;
    const cancelled = rows.filter((r) => r.status === "cancelled").length;
    return { total, pending, confirmed, deposit, completed, cancelled };
  }, [rows]);

  async function setStatus(id: string, status: BookingStatus) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("حذف هذا السجل نهائياً؟")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function addBooking(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAdding(true);
    try {
      const d = new Date(preferredLocal);
      if (!Number.isFinite(d.getTime())) {
        setAddError("اختر تاريخاً ووقتاً صالحين.");
        return;
      }
      const n = Number(groupSize);
      if (!Number.isFinite(n) || n < 1) {
        setAddError("أدخل عدداً صحيحاً للمجموعة.");
        return;
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim(),
          groupSize: n,
          notes: notes.trim(),
          preferredAt: d.toISOString(),
          status: addStatus,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setAddError(data.error || "فشل الحفظ.");
        return;
      }

      setName("");
      setCompany("");
      setGroupSize("");
      setPreferredLocal("");
      setNotes("");
      setAddStatus("pending");
      await refresh();
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-8">
      {loadError ? (
        <p className="text-red-400 text-sm">{loadError}</p>
      ) : null}

      <div className="bg-white/5 rounded-2xl border border-white/10 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white mb-2">
          تسجيل حجز أو استفسار (يدوي)
        </h3>
        <p className="text-white/45 text-sm mb-6">
          إدخال من الفريق بعد التواصل؛ يُخزَّن مع طلبات الموقع في نفس القائمة.
        </p>
        <form
          onSubmit={addBooking}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6"
          dir="rtl"
        >
          <div>
            <label className="block text-white/40 text-xs tracking-wider mb-2">
              اسم العميل
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cba135]"
            />
          </div>
          <div>
            <label className="block text-white/40 text-xs tracking-wider mb-2">
              الشركة / الجهة
            </label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cba135]"
            />
          </div>
          <div>
            <label className="block text-white/40 text-xs tracking-wider mb-2">
              عدد الأشخاص
            </label>
            <input
              required
              type="number"
              min={1}
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cba135] [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-white/40 text-xs tracking-wider mb-2">
              تاريخ ووقت المناسبة
            </label>
            <input
              required
              type="datetime-local"
              value={preferredLocal}
              onChange={(e) => setPreferredLocal(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cba135] [color-scheme:dark]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-white/40 text-xs tracking-wider mb-2">
              ملاحظات وطلبات خاصة
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cba135] resize-none"
            />
          </div>
          <div className="md:col-span-2 flex flex-wrap items-end gap-4">
            <div className="min-w-[180px]">
              <label className="block text-white/40 text-xs tracking-wider mb-2">
                الحالة عند الإدخال
              </label>
              <select
                value={addStatus}
                onChange={(e) =>
                  setAddStatus(e.target.value as BookingStatus)
                }
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cba135]"
              >
                {(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map(
                  (k) => (
                    <option key={k} value={k}>
                      {BOOKING_STATUS_LABELS[k]}
                    </option>
                  )
                )}
              </select>
            </div>
            <button
              type="submit"
              disabled={adding}
              className="px-8 py-3 bg-[#cba135] text-black font-bold rounded-lg hover:bg-[#d4b458] transition-colors mt-6 md:mt-0 disabled:opacity-50"
            >
              {adding ? "جاري الحفظ…" : "حفظ في النظام"}
            </button>
          </div>
          {addError ? (
            <p className="md:col-span-2 text-red-400 text-sm">{addError}</p>
          ) : null}
        </form>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatChip label="إجمالي الطلبات" value={stats.total} icon={Clock} tone="neutral" />
        <StatChip label="قيد المراجعة" value={stats.pending} icon={Clock} tone="amber" />
        <StatChip label="مؤكد" value={stats.confirmed} icon={CheckCircle} tone="sky" />
        <StatChip label="ديبوزيت" value={stats.deposit} icon={Banknote} tone="violet" />
        <StatChip label="مكتمل" value={stats.completed} icon={BadgeCheck} tone="emerald" />
        <StatChip label="ملغى" value={stats.cancelled} icon={Ban} tone="red" />
      </div>

      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">كل الحجوزات والطلبات</h3>
          <p className="text-white/45 text-xs mt-1">
            يشمل طلبات الموقع والإدخال اليدوي. الملف:{" "}
            <code className="text-white/60">data/bookings.json</code> على السيرفر.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[900px]" dir="rtl">
            <thead className="bg-white/5 text-white/60 text-sm font-medium">
              <tr>
                <th className="px-3 py-3">المصدر</th>
                <th className="px-3 py-3">العميل</th>
                <th className="px-3 py-3">الشركة</th>
                <th className="px-3 py-3">الموعد</th>
                <th className="px-3 py-3">العدد</th>
                <th className="px-3 py-3">الحالة</th>
                <th className="px-3 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-white/35 text-sm"
                  >
                    لا توجد طلبات بعد.
                  </td>
                </tr>
              ) : (
                rows.map((order) => {
                  const isBusy = busyId === order.id;
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-white/[0.03] transition-colors align-top"
                    >
                      <td className="px-3 py-3 text-white/70 text-xs whitespace-nowrap">
                        {order.source === "website" ? "موقع" : "فريق"}
                      </td>
                      <td className="px-3 py-3 font-medium text-white">
                        {order.name}
                      </td>
                      <td className="px-3 py-3 text-white/65">
                        {order.company || "—"}
                      </td>
                      <td className="px-3 py-3 text-white/85 text-xs whitespace-nowrap">
                        {formatWhen(order.preferredAt)}
                      </td>
                      <td className="px-3 py-3 text-white/85 whitespace-nowrap">
                        {order.groupSize} شخص
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass(order.status)}`}
                        >
                          {BOOKING_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2 justify-start">
                          <MiniBtn
                            disabled={isBusy}
                            label="مراجعة"
                            onClick={() => setStatus(order.id, "pending")}
                          />
                          <MiniBtn
                            disabled={isBusy}
                            label="تأكيد"
                            onClick={() => setStatus(order.id, "confirmed")}
                          />
                          <MiniBtn
                            disabled={isBusy}
                            label="ديبوزيت"
                            onClick={() => setStatus(order.id, "deposit")}
                          />
                          <MiniBtn
                            disabled={isBusy}
                            label="اكتمال"
                            onClick={() => setStatus(order.id, "completed")}
                          />
                          <MiniBtn
                            disabled={isBusy}
                            label="إلغاء"
                            onClick={() => setStatus(order.id, "cancelled")}
                            danger
                          />
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => remove(order.id)}
                            className="text-red-400/90 hover:text-red-300 inline-flex items-center gap-1 text-xs px-2 py-1 rounded border border-red-500/25"
                          >
                            <Trash2 size={14} /> حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ size?: number | string }>;
  tone: "neutral" | "amber" | "sky" | "violet" | "emerald" | "red";
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

function MiniBtn({
  label,
  onClick,
  disabled,
  danger,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`text-[10px] sm:text-xs px-2 py-1 rounded border transition-colors disabled:opacity-40 ${
        danger
          ? "border-red-500/30 text-red-300 hover:bg-red-500/10"
          : "border-white/15 text-white/80 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}
