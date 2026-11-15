"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  MessageCircle,
  Printer,
  RefreshCw,
  ShieldCheck,
  Ticket,
  X,
} from "lucide-react";
import {
  BOOKING_STATUS_LABELS,
  isBookingQrActive,
  type BookingRecord,
} from "@/lib/bookings-types";
import type { TicketDetails } from "@/lib/calendar-wallet";
import { downloadTicketImage } from "@/lib/ticket-canvas";
import { buildTicketQrPayload, qrBlockReasonAr } from "@/lib/ticket-qr";
import { formatWhen, waHref } from "./booking-shared";

function toTicketDetails(booking: BookingRecord): TicketDetails {
  return {
    id: booking.id,
    name: booking.name,
    phone: booking.phone,
    company: booking.company,
    groupSize: booking.groupSize,
    preferredAt: formatWhen(booking.preferredAt),
    rawDate: booking.preferredAt,
    notes: booking.notes,
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default function TicketPassModal({
  booking,
  onClose,
  onBookingUpdated,
}: {
  booking: BookingRecord | null;
  onClose: () => void;
  onBookingUpdated?: (updated: BookingRecord) => void;
}) {
  const [liveBooking, setLiveBooking] = useState<BookingRecord | null>(booking);
  const [qrUrl, setQrUrl] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    setLiveBooking(booking);
    setActionError("");
    setCopied(false);
  }, [booking]);

  useEffect(() => {
    let active = true;
    if (!liveBooking) {
      setQrUrl("");
      return;
    }
    QRCode.toDataURL(
      buildTicketQrPayload({
        id: liveBooking.id,
        name: liveBooking.name,
        preferredAt: formatWhen(liveBooking.preferredAt),
      }),
      { width: 260, margin: 1, color: { dark: "#1a1610", light: "#f4ead2" } }
    )
      .then((url) => {
        if (active) setQrUrl(url);
      })
      .catch(() => {
        if (active) setQrUrl("");
      });
    return () => {
      active = false;
    };
  }, [liveBooking]);

  if (!liveBooking) return null;

  const qrActive = isBookingQrActive(liveBooking.status);
  const remaining = Math.max(0, liveBooking.groupSize - liveBooking.checkedInCount);
  const blockReason = qrBlockReasonAr(liveBooking.status);
  const ticketDetails = toTicketDetails(liveBooking);
  const formattedDate = ticketDetails.preferredAt;

  const waShareHref = (() => {
    const base = waHref(liveBooking.phone);
    if (!base) return null;
    const msg =
      `مرحباً ${liveBooking.name} 🏕️\n` +
      `هذه بيانات تذكرتك الرسمية في *مخيمات الغدير الشتوية*:\n` +
      `• رقم التذكرة: *${liveBooking.id}*\n` +
      `• عدد الضيوف المسموح به (الأساور): *${liveBooking.groupSize} شخص*\n` +
      `• الموعد: *${formattedDate}*\n` +
      `• حالة التذكرة: *${BOOKING_STATUS_LABELS[liveBooking.status]}* ${qrActive ? "✅ (رمز QR مفعل)" : "⏳ (بانتظار التأكيد)"}\n\n` +
      `يرجى إبراز التذكرة عند بوابة الدخول لاستلام أساور الضيوف.`;
    return `${base}?text=${encodeURIComponent(msg)}`;
  })();

  async function handleDownloadPng() {
    setDownloading(true);
    setActionError("");
    try {
      await downloadTicketImage(ticketDetails);
    } catch {
      setActionError("تعذر توليد صورة التذكرة.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopyId() {
    if (!liveBooking) return;
    try {
      await navigator.clipboard.writeText(liveBooking.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  async function handleConfirmNow() {
    if (!liveBooking) return;
    setConfirming(true);
    setActionError("");
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(liveBooking.id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "confirmed" }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        booking?: BookingRecord;
        error?: string;
      };
      if (!res.ok || !data.booking) {
        throw new Error(data.error || "تعذر تأكيد الحجز.");
      }
      setLiveBooking(data.booking);
      onBookingUpdated?.(data.booking);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "تعذر تأكيد الحجز.");
    } finally {
      setConfirming(false);
    }
  }

  function handlePrintTicket() {
    if (!liveBooking) return;
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>تذكرة الغدير - ${escapeHtml(liveBooking.id)}</title>
  <style>
    @page { size: A5 landscape; margin: 8mm; }
    body { margin: 0; font-family: Tahoma, Arial, sans-serif; background: #fff; color: #1a1610; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .ticket { width: 100%; max-width: 720px; border: 2px solid #1a1610; background: #f4ead2; display: grid; grid-template-columns: 1fr 220px; overflow: hidden; }
    .main { padding: 20px 24px; border-left: 2px dashed rgba(26,22,16,.35); }
    .stub { background: #b5382a; color: #f4ead2; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    h1 { margin: 0 0 4px; font-size: 20px; }
    .id { font-family: monospace; font-weight: 800; color: #b5382a; font-size: 14px; }
    .row { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; border-bottom: 1px dashed rgba(26,22,16,.2); font-size: 12px; }
    .row strong { font-size: 13px; }
    .qr { width: 150px; height: 150px; background: #f4ead2; padding: 6px; margin: 10px 0; }
    .badge { margin-top: 8px; padding: 4px 10px; font-size: 11px; font-weight: 700; border: 1px solid rgba(244,234,210,.5); }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="main">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <div>
          <div style="font-size:10px;letter-spacing:2px;opacity:.65;">ALGHDEER VIP PASS</div>
          <h1>مخيمات الغدير الشتوية</h1>
        </div>
        <div class="id" dir="ltr">№ ${escapeHtml(liveBooking.id)}</div>
      </div>
      <div class="row"><span>اسم الضيف</span><strong>${escapeHtml(liveBooking.name)}</strong></div>
      <div class="row"><span>رقم الجوال</span><strong dir="ltr">${escapeHtml(liveBooking.phone)}</strong></div>
      <div class="row"><span>المناسبة / الجهة</span><strong>${escapeHtml(liveBooking.company !== "—" ? liveBooking.company : "حجز خاص")}</strong></div>
      <div class="row"><span>عدد الضيوف (الأساور)</span><strong>${liveBooking.groupSize} شخص</strong></div>
      <div class="row"><span>موعد الفعالية</span><strong>${escapeHtml(formattedDate)}</strong></div>
      <div class="row" style="border:0;"><span>الحالة</span><strong>${escapeHtml(BOOKING_STATUS_LABELS[liveBooking.status])}</strong></div>
    </div>
    <div class="stub">
      <div style="font-size:11px;font-weight:700;letter-spacing:2px;">GATE QR PASS</div>
      ${qrUrl ? `<img class="qr" src="${qrUrl}" alt="QR" />` : ""}
      <div style="font-family:monospace;font-size:12px;font-weight:700;" dir="ltr">${escapeHtml(liveBooking.id)}</div>
      <div class="badge">${liveBooking.groupSize} أساور مسموحة</div>
    </div>
  </div>
</body>
</html>`;

    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        iframe.remove();
      }, 1500);
    }, 250);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-5"
      onClick={onClose}
    >
      <div
        dir="rtl"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#cba135]/35 bg-[#121319] shadow-2xl max-h-[92vh]"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#cba135]/15 text-[#e5c979]">
              <Ticket size={18} />
            </span>
            <div>
              <h3 className="text-sm font-black text-white sm:text-base">
                إصدار واستعراض تذكرة الدخول (QR)
              </h3>
              <p className="text-[11px] text-white/50">
                في حال لم يحفظ العميل تذكرته — حمّلها أو أرسلها أو اطبعها مباشرة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {/* Live QR Activation Banner */}
          <div
            className={`rounded-xl border p-3.5 text-xs ${
              qrActive
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : "border-red-400/30 bg-red-500/10 text-red-200"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold">
                {qrActive ? (
                  <CheckCircle2 size={17} className="shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle size={17} className="shrink-0 text-red-400" />
                )}
                <span>
                  {qrActive
                    ? `رمز QR مفعل للدخول (${BOOKING_STATUS_LABELS[liveBooking.status]})`
                    : blockReason}
                </span>
              </div>
              {liveBooking.status === "pending" ? (
                <button
                  type="button"
                  disabled={confirming}
                  onClick={() => void handleConfirmNow()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#cba135] px-3 py-1.5 text-[11px] font-black text-black hover:bg-[#d4b458] disabled:opacity-50"
                >
                  {confirming ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={13} />
                  )}
                  تأكيد الحجز وتفعيل QR
                </button>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-[11px] opacity-85">
              <span>إجمالي التذكرة: {liveBooking.groupSize} شخص</span>
              <span>تم تسليمهم الأساور: {liveBooking.checkedInCount}</span>
              <span>المتبقي: {remaining}</span>
            </div>
          </div>

          {actionError ? (
            <p className="rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-xs text-red-200">
              {actionError}
            </p>
          ) : null}

          {/* Authentic Vintage Alghdeer Ticket Preview */}
          <div className="relative overflow-hidden bg-[#f4ead2] text-[#1a1610] shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-12">
              <div className="md:col-span-8 p-4 sm:p-5">
                <div className="flex items-center justify-between border-b-2 border-[#1a1610]/20 pb-3 mb-3">
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-[#1a1610]/60">
                      ALGHDEER VIP PASS
                    </span>
                    <h4 className="text-lg font-black text-[#1a1610]">مخيمات الغدير الشتوية</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleCopyId()}
                    className="inline-flex items-center gap-1 bg-[#1a1610]/10 px-2.5 py-1 font-mono text-xs font-black text-[#b5382a] hover:bg-[#1a1610]/15"
                    dir="ltr"
                  >
                    № {liveBooking.id}
                    <Copy size={11} />
                  </button>
                </div>

                {copied ? (
                  <p className="mb-2 text-[11px] font-bold text-emerald-700">
                    تم نسخ رقم التذكرة!
                  </p>
                ) : null}

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="border-b border-[#1a1610]/15 pb-1.5">
                    <span className="block text-[10px] font-bold text-[#1a1610]/60">اسم الضيف</span>
                    <span className="font-black">{liveBooking.name}</span>
                  </div>
                  <div className="border-b border-[#1a1610]/15 pb-1.5">
                    <span className="block text-[10px] font-bold text-[#1a1610]/60">الجوال</span>
                    <span className="font-mono font-bold" dir="ltr">
                      {liveBooking.phone}
                    </span>
                  </div>
                  <div className="border-b border-[#1a1610]/15 pb-1.5">
                    <span className="block text-[10px] font-bold text-[#1a1610]/60">
                      عدد الأشخاص (الأساور)
                    </span>
                    <span className="font-black text-[#b5382a]">
                      {liveBooking.groupSize} شخص
                    </span>
                  </div>
                  <div className="border-b border-[#1a1610]/15 pb-1.5">
                    <span className="block text-[10px] font-bold text-[#1a1610]/60">الموعد</span>
                    <span className="font-bold">{formattedDate}</span>
                  </div>
                  {liveBooking.company && liveBooking.company !== "—" ? (
                    <div className="col-span-2 border-b border-[#1a1610]/15 pb-1.5">
                      <span className="block text-[10px] font-bold text-[#1a1610]/60">
                        الجهة / المناسبة
                      </span>
                      <span className="font-bold">{liveBooking.company}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="md:col-span-4 bg-[#b5382a] p-4 text-[#f4ead2] flex flex-col items-center justify-center text-center border-t-2 md:border-t-0 md:border-r-2 border-dashed border-[#0B0C10]/35">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-85 mb-2">
                  GATE QR PASS
                </span>
                <div className="bg-[#f4ead2] p-2 shadow-md">
                  {qrUrl ? (
                    <img src={qrUrl} alt={`QR ${liveBooking.id}`} className="w-32 h-32" />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center text-xs text-[#1a1610]">
                      …
                    </div>
                  )}
                </div>
                <span className="mt-2 font-mono text-xs font-black tracking-wider" dir="ltr">
                  {liveBooking.id}
                </span>
                <span className="mt-1 rounded bg-black/25 px-2 py-0.5 text-[10px] font-bold">
                  {qrActive ? "مفعل للدخول" : BOOKING_STATUS_LABELS[liveBooking.status]}
                </span>
              </div>
            </div>
          </div>

          {/* Staff Issuance Actions */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <button
              type="button"
              disabled={downloading}
              onClick={() => void handleDownloadPng()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#cba135] px-4 py-3 text-xs font-black text-black hover:bg-[#d4b458] disabled:opacity-50"
            >
              {downloading ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <Download size={15} />
              )}
              {downloading ? "جاري التجهيز…" : "تحميل التذكرة (PNG)"}
            </button>

            {waShareHref ? (
              <a
                href={waShareHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-xs font-bold text-emerald-300 hover:bg-emerald-500/25"
              >
                <MessageCircle size={15} />
                إرسال عبر واتساب
              </a>
            ) : (
              <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/30">
                <MessageCircle size={15} />
                لا يوجد رقم واتساب
              </span>
            )}

            <button
              type="button"
              onClick={handlePrintTicket}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-xs font-bold text-white hover:bg-white/10"
            >
              <Printer size={15} />
              طباعة التذكرة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
