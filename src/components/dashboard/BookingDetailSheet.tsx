"use client";

import React from "react";
import {
  X,
  MessageCircle,
  Phone,
  Mail,
  Copy,
  Trash2,
  Globe,
  UserRound,
} from "lucide-react";
import type { BookingRecord, BookingStatus } from "@/lib/bookings-types";
import { BOOKING_STATUS_LABELS } from "@/lib/bookings-types";
import {
  formatWhen,
  formatCreated,
  waHref,
  telHref,
  StatusBadge,
  type BookingsController,
} from "./booking-shared";

const STATUS_ORDER: BookingStatus[] = [
  "pending",
  "confirmed",
  "deposit",
  "completed",
  "cancelled",
];

/**
 * Full booking detail + actions. Rendered as a centered dialog on desktop
 * and as a bottom sheet on mobile (`sheet` prop).
 */
export default function BookingDetailSheet({
  booking,
  controller,
  onClose,
  sheet,
}: {
  booking: BookingRecord;
  controller: BookingsController;
  onClose: () => void;
  sheet?: boolean;
}) {
  const isBusy = controller.busyId === booking.id;
  const wa = waHref(booking.phone);
  const tel = telHref(booking.phone);

  async function copyId() {
    try {
      await navigator.clipboard.writeText(booking.id);
    } catch {}
  }

  async function handleDelete() {
    if (!window.confirm("حذف هذا السجل نهائياً؟")) return;
    await controller.remove(booking.id);
    onClose();
  }

  const detailRow = (label: string, value: React.ReactNode) => (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-white/45 text-xs shrink-0 pt-0.5">{label}</span>
      <span className="text-white text-sm font-medium text-left">{value}</span>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm md:p-4"
      onClick={onClose}
    >
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className={`w-full bg-[#14151b] border border-white/10 overflow-hidden shadow-2xl ${
          sheet
            ? "rounded-t-3xl max-h-[92dvh] overflow-y-auto"
            : "rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto"
        }`}
      >
        {/* Grab handle (mobile sheet) */}
        {sheet ? (
          <div className="pt-2 pb-0 flex justify-center">
            <span className="w-10 h-1 rounded-full bg-white/20" />
          </div>
        ) : null}

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-full bg-[#cba135]/15 text-[#d4b458] flex items-center justify-center shrink-0">
              <UserRound size={20} />
            </span>
            <div className="min-w-0">
              <h3 className="text-white font-bold truncate">{booking.name}</h3>
              <button
                type="button"
                onClick={copyId}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-[#d4b458] hover:text-[#e5c979]"
                dir="ltr"
              >
                {booking.id}
                <Copy size={11} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={booking.status} />
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Quick contact actions */}
          <div className="grid grid-cols-3 gap-2">
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold"
              >
                <MessageCircle size={18} />
                واتساب
              </a>
            ) : (
              <span className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-white/25 text-xs">
                <MessageCircle size={18} />
                واتساب
              </span>
            )}
            {tel ? (
              <a
                href={tel}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-bold"
              >
                <Phone size={18} />
                اتصال
              </a>
            ) : (
              <span className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-white/25 text-xs">
                <Phone size={18} />
                اتصال
              </span>
            )}
            {booking.email ? (
              <a
                href={`mailto:${booking.email}`}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-[#cba135]/10 border border-[#cba135]/25 text-[#d4b458] text-xs font-bold"
              >
                <Mail size={18} />
                إيميل
              </a>
            ) : (
              <span className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-white/25 text-xs">
                <Mail size={18} />
                إيميل
              </span>
            )}
          </div>

          {/* Details */}
          <div className="rounded-xl bg-white/[0.03] border border-white/5 px-4 py-1">
            {detailRow(
              "الجوال",
              <span dir="ltr" className="font-mono">
                {booking.phone}
              </span>
            )}
            {detailRow(
              "البريد",
              booking.email ? (
                <span dir="ltr">{booking.email}</span>
              ) : (
                <span className="text-white/30">—</span>
              )
            )}
            {detailRow("الجهة / المناسبة", booking.company)}
            {detailRow("عدد الضيوف", `${booking.groupSize} شخص`)}
            {detailRow("موعد المناسبة", formatWhen(booking.preferredAt))}
            {detailRow("تاريخ التسجيل", formatCreated(booking.createdAt))}
            {detailRow(
              "المصدر",
              <span className="inline-flex items-center gap-1">
                <Globe size={12} className="text-white/40" />
                {booking.source === "website" ? "الموقع" : "الفريق"}
              </span>
            )}
          </div>

          {/* Notes */}
          {booking.notes ? (
            <div className="rounded-xl bg-amber-500/[0.07] border border-amber-500/20 p-4">
              <p className="text-amber-300/80 text-[11px] font-bold mb-1">
                ملاحظات وطلبات خاصة
              </p>
              <p className="text-white/85 text-sm whitespace-pre-wrap leading-relaxed">
                {booking.notes}
              </p>
            </div>
          ) : null}

          {/* Status actions */}
          <div>
            <p className="text-white/40 text-xs mb-2">تغيير الحالة</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_ORDER.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={isBusy || booking.status === s}
                  onClick={() => controller.setStatus(booking.id, s)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors disabled:opacity-40 ${
                    booking.status === s
                      ? "bg-[#cba135] text-black border-[#cba135]"
                      : "border-white/15 text-white/75 hover:bg-white/10"
                  }`}
                >
                  {BOOKING_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Delete */}
          <button
            type="button"
            disabled={isBusy}
            onClick={handleDelete}
            className="w-full py-3 rounded-xl border border-red-500/25 text-red-400 hover:bg-red-500/10 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Trash2 size={16} />
            حذف السجل نهائياً
          </button>
        </div>
      </div>
    </div>
  );
}
