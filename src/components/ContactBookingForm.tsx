"use client";

import React, { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { minPreferredDatetimeLocal } from "@/lib/format-datetime-local";
import { MIN_LEAD_MS } from "@/lib/bookings-types";
import {
  downloadIcsFile,
  getGoogleCalendarUrl,
  downloadAppleWalletPass,
  getGoogleWalletUrl,
  type TicketDetails,
} from "@/lib/calendar-wallet";
import {
  CheckCircle2,
  Star,
  MessageCircle,
  ExternalLink,
  RotateCcw,
  Calendar,
  Download,
  CalendarCheck,
  Smartphone,
} from "lucide-react";

interface IssuedTicket {
  id: string;
  name: string;
  phone: string;
  company: string;
  groupSize: number;
  preferredAt: string;
  rawDate: string;
  notes: string;
}

function AppleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 170 170" fill="currentColor">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.98-5.99-9.13-10.43-19.46-13.32-30.98-2.89-11.53-4.34-22.39-4.34-32.58 0-14.46 3.73-26.47 11.19-36.03 7.46-9.56 16.73-14.4 27.81-14.52 4.13 0 9.04 1.16 14.74 3.49 5.7 2.33 9.4 3.55 11.09 3.66 1.8 0 5.61-1.28 11.44-3.83 5.83-2.55 10.45-3.77 13.86-3.66 10.23.64 18.66 4.34 25.29 11.11 6.63 6.76 10.66 14.86 12.09 24.31-9.24 5.54-13.75 13.25-13.53 23.13.22 9.46 4.29 17.26 12.21 23.4 3.81 2.93 8.05 5.05 12.73 6.36-1.96 5.87-4.13 11.69-6.52 17.47zM119.22 31.84c0-7.39 2.61-14.28 7.83-20.67 5.22-6.39 11.63-10.43 19.23-12.12 1.09 7.72-1.3 14.89-7.17 21.51-5.87 6.63-12.5 10.38-19.89 11.28z" />
    </svg>
  );
}

function GoogleWalletIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function ContactBookingForm() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [groupSize, setGroupSize] = useState("10");
  const [preferredLocal, setPreferredLocal] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [calendarDownloaded, setCalendarDownloaded] = useState(false);
  const [issuedTicket, setIssuedTicket] = useState<IssuedTicket | null>(null);

  const minLocal = useMemo(() => minPreferredDatetimeLocal(MIN_LEAD_MS), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError(isAr ? "يرجى كتابة اسم الضيف." : "Please enter your name.");
      return;
    }

    setLoading(true);

    // Generate local unique ticket serial
    const generatedSerial = "ALG-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const guestCount = Number(groupSize) > 0 ? Number(groupSize) : 10;
    const formattedDate = preferredLocal
      ? new Date(preferredLocal).toLocaleString(isAr ? "ar-SA" : "en-US", {
          dateStyle: "full",
          timeStyle: "short",
        })
      : isAr ? "يُحدد مع الإدارة" : "To be arranged";

    const rawIsoDate = preferredLocal
      ? new Date(preferredLocal).toISOString()
      : new Date().toISOString();

    try {
      // 1. Post to API to store in database/dashboard
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || "—",
          company: company.trim() || "—",
          groupSize: guestCount,
          notes: notes.trim(),
          preferredAt: rawIsoDate,
        }),
      }).catch(() => null);

      let finalId = generatedSerial;
      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.id) finalId = String(data.id).slice(0, 8).toUpperCase();
      }

      const ticketObj: IssuedTicket = {
        id: finalId,
        name: name.trim(),
        phone: phone.trim() || "—",
        company: company.trim() || "—",
        groupSize: guestCount,
        preferredAt: formattedDate,
        rawDate: rawIsoDate,
        notes: notes.trim(),
      };

      setIssuedTicket(ticketObj);

      // Save to localStorage so it is immediately visible in dashboard on this browser
      if (typeof window !== "undefined") {
        try {
          const localArr = JSON.parse(localStorage.getItem("alghdeer_local_bookings") || "[]");
          localArr.unshift({
            id: finalId,
            name: name.trim(),
            phone: phone.trim() || "—",
            company: company.trim() || "—",
            groupSize: guestCount,
            notes: notes.trim(),
            preferredAt: rawIsoDate,
            status: "pending",
            source: "website",
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem("alghdeer_local_bookings", JSON.stringify(localArr.slice(0, 50)));
        } catch {}
      }

      // Auto-trigger calendar file download for seamless instant import
      try {
        downloadIcsFile(ticketObj);
        setCalendarDownloaded(true);
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  const ticketNumber = issuedTicket
    ? issuedTicket.id.startsWith("ALG-")
      ? `№ ${issuedTicket.id}`
      : `№ ALG-2026-${issuedTicket.id}`
    : "№ 2026";

  const directWaUrl = issuedTicket
    ? `https://wa.me/966544493991?text=${encodeURIComponent(
        `مرحباً مخيمات الغدير 🏕️\nأرغب بتأكيد حجز تذكرتي برقم:\n${ticketNumber}\n• اسم الضيف: ${issuedTicket.name}\n${issuedTicket.phone !== "—" ? `• رقم الجوال: ${issuedTicket.phone}\n` : ""}${issuedTicket.company !== "—" ? `• المناسبة/الجهة: ${issuedTicket.company}\n` : ""}• عدد الضيوف: ${issuedTicket.groupSize} شخص\n• موعد الفعالية: ${issuedTicket.preferredAt}\n${issuedTicket.notes ? `• ملاحظات: ${issuedTicket.notes}\n` : ""}يرجى تأكيد الحجز وإرسال تفاصيل التجهيزات والموقع.`
      )}`
    : "https://wa.me/966544493991";

  return (
    <div className="relative w-full">
      {/* Outer Ticket Container */}
      <div className="relative bg-[#f4ead2] text-[#1a1610] rounded-none shadow-[0_20px_60px_rgba(0,0,0,0.65)] overflow-hidden">
        {/* 4 Corner Cutout Notches */}
        <span className="pointer-events-none absolute -top-4 -left-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />
        <span className="pointer-events-none absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />
        <span className="pointer-events-none absolute -bottom-4 -left-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />
        <span className="pointer-events-none absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />

        {issuedTicket ? (
          /* ============================================================ */
          /* TICKET ISSUED SUCCESS VIEW                                   */
          /* ============================================================ */
          <div className="p-6 sm:p-10 md:p-12 text-center border-2 border-[#1a1610]/25 m-3 sm:m-4 space-y-6">
            <div className="flex justify-center text-[#25D366]">
              <CheckCircle2 size={54} strokeWidth={1.75} />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-[#1a1610] text-[#f4ead2] text-xs font-mono font-bold tracking-widest uppercase mb-2">
                {ticketNumber} • VIP PASS
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wider text-[#1a1610]">
                {isAr ? "تم إصدار التذكرة وتسجيلها بنجاح" : "YOUR VIP TICKET IS ISSUED"}
              </h3>
              <p className="text-xs sm:text-sm text-[#1a1610]/70 mt-1">
                {isAr
                  ? "يمكنك الآن حفظ التذكرة في محفظتك الإلكترونية وتقويمك قبل إرسال التأكيد"
                  : "Save your ticket to your mobile wallet and calendar before WhatsApp confirmation."}
              </p>
            </div>

            {/* Ticket Summary Card */}
            <div className="max-w-lg mx-auto bg-white/80 border border-[#1a1610]/20 p-5 sm:p-6 text-start space-y-3 font-sans shadow-sm rounded-lg">
              <div className="flex justify-between items-center border-b border-[#1a1610]/15 pb-2">
                <span className="text-xs text-[#1a1610]/70 font-bold">{isAr ? "رقم التذكرة:" : "Ticket No:"}</span>
                <span className="font-mono font-bold text-[#b5382a]">{ticketNumber}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1a1610]/15 pb-2">
                <span className="text-xs text-[#1a1610]/70 font-bold">{isAr ? "اسم الضيف:" : "Guest Name:"}</span>
                <span className="font-bold text-[#1a1610]">{issuedTicket.name}</span>
              </div>
              {issuedTicket.phone !== "—" && (
                <div className="flex justify-between items-center border-b border-[#1a1610]/15 pb-2">
                  <span className="text-xs text-[#1a1610]/70 font-bold">{isAr ? "رقم الجوال:" : "Phone:"}</span>
                  <span dir="ltr" className="font-mono font-bold text-[#1a1610]">{issuedTicket.phone}</span>
                </div>
              )}
              {issuedTicket.company !== "—" && (
                <div className="flex justify-between items-center border-b border-[#1a1610]/15 pb-2">
                  <span className="text-xs text-[#1a1610]/70 font-bold">{isAr ? "الجهة / المناسبة:" : "Occasion:"}</span>
                  <span className="font-bold text-[#1a1610]">{issuedTicket.company}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-b border-[#1a1610]/15 pb-2">
                <span className="text-xs text-[#1a1610]/70 font-bold">{isAr ? "موعد الفعالية:" : "Event Date:"}</span>
                <span className="font-bold text-xs text-[#1a1610]">{issuedTicket.preferredAt}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#1a1610]/70 font-bold">{isAr ? "عدد الضيوف:" : "Guests:"}</span>
                <span className="font-bold text-[#1a1610]">{issuedTicket.groupSize} {isAr ? "شخص" : "guests"}</span>
              </div>
            </div>

            {/* ============================================================ */}
            {/* WALLET & CALENDAR ACTION SECTION (BEFORE WHATSAPP)            */}
            {/* ============================================================ */}
            <div className="max-w-lg mx-auto bg-[#1a1610]/05 border-2 border-dashed border-[#1a1610]/20 p-5 rounded-xl space-y-4">
              <div className="text-center">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#1a1610]/60 block mb-1">
                  {isAr ? "✦ الخطوة الأولى: احفظ التذكرة في هاتفك" : "✦ STEP 1: SAVE TICKET TO YOUR DEVICE"}
                </span>
                <p className="text-xs font-bold text-[#1a1610]">
                  {isAr
                    ? "أضف التذكرة إلى Apple Wallet أو Google Wallet وتقويم جهازك"
                    : "Add to Apple Wallet, Google Wallet, or your device calendar"}
                </p>
              </div>

              {/* 3 Main Action Badges: Apple Wallet / Google Wallet / Calendar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Apple Wallet Button */}
                <button
                  type="button"
                  onClick={() => {
                    downloadAppleWalletPass(issuedTicket);
                    setCalendarDownloaded(true);
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-black text-white hover:bg-neutral-800 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <AppleIcon className="w-4 h-4 fill-white" />
                  <span>{isAr ? "إضافة إلى Apple Wallet" : "Add to Apple Wallet"}</span>
                </button>

                {/* 2. Google Wallet Button */}
                <a
                  href={getGoogleWalletUrl(issuedTicket)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white text-[#1f1f1f] hover:bg-neutral-100 border border-neutral-300 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <GoogleWalletIcon className="w-4 h-4" />
                  <span>{isAr ? "حفظ في Google Wallet" : "Save to Google Wallet"}</span>
                </a>
              </div>

              {/* 3. Automatic Calendar Options */}
              <div className="pt-2 border-t border-[#1a1610]/10 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    downloadIcsFile(issuedTicket);
                    setCalendarDownloaded(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/70 hover:bg-white text-[#1a1610] text-[11px] font-bold rounded-lg border border-[#1a1610]/15 transition-all shadow-sm"
                >
                  <Download size={13} />
                  <span>{isAr ? "تنزيل ملف التقويم (iCal / Outlook)" : "Download iCal (.ics)"}</span>
                </button>

                <a
                  href={getGoogleCalendarUrl(issuedTicket)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/70 hover:bg-white text-[#1a1610] text-[11px] font-bold rounded-lg border border-[#1a1610]/15 transition-all shadow-sm"
                >
                  <Calendar size={13} />
                  <span>{isAr ? "تقويم Google Calendar" : "Google Calendar"}</span>
                </a>
              </div>

              {calendarDownloaded && (
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 py-1.5 px-3 rounded-md">
                  <CalendarCheck size={14} />
                  <span>{isAr ? "تم إرسال موعد التذكرة إلى جهازك بنجاح!" : "Event saved to your device!"}</span>
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* WHATSAPP CONFIRMATION SECTION (STEP 2)                        */}
            {/* ============================================================ */}
            <div className="max-w-md mx-auto space-y-3 pt-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#1a1610]/60 block">
                {isAr ? "✦ الخطوة الثانية والأخيرة: تثبيت الحجز" : "✦ FINAL STEP: CONFIRM BOOKING"}
              </span>

              <a
                href={directWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-4 px-6 bg-[#25D366] hover:bg-[#1faa53] text-black font-black text-sm tracking-wider uppercase rounded-full shadow-xl transition-all active:scale-98"
              >
                <MessageCircle size={22} className="fill-black text-transparent" />
                <span>{isAr ? "فتح محادثة الواتساب وتأكيد الحجز الآن" : "Confirm via WhatsApp Now"}</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setIssuedTicket(null);
                  setCalendarDownloaded(false);
                }}
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 text-xs text-[#1a1610]/70 hover:text-[#1a1610] underline font-bold tracking-wider"
              >
                <RotateCcw size={13} />
                <span>{isAr ? "إصدار تذكرة إضافية" : "Issue Another Ticket"}</span>
              </button>
            </div>

            {/* Staff Dashboard Shortcut */}
            <div className="pt-4 border-t border-[#1a1610]/15 text-[11px] text-[#1a1610]/60">
              <span>{isAr ? "إدارة المخيم: تظهر جميع التذاكر فورياً في " : "Staff: All tickets appear in "}</span>
              <a
                href="/dashboard"
                className="font-bold text-[#b5382a] hover:underline inline-flex items-center gap-1"
              >
                <span>{isAr ? "لوحة تحكم الحجوزات" : "Staff Dashboard"}</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* TICKET INPUT FORM                                            */
          /* ============================================================ */
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-12">
            {/* Main Ticket Area (8 cols) */}
            <div className="md:col-span-8 p-5 sm:p-7 md:p-8">
              <div className="border-2 border-[#1a1610]/30 p-4 sm:p-6 relative">
                {/* Ticket Header Bar */}
                <div className="flex items-center justify-between border-b-2 border-[#1a1610]/20 pb-3 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs tracking-widest uppercase bg-[#1a1610] text-[#f4ead2] px-2 py-0.5">
                      PASS № 2026
                    </span>
                    <span className="text-[10px] font-mono tracking-wider uppercase text-[#1a1610]/60 hidden sm:inline">
                      • JEDDAH, BURAYMAN
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#b5382a]">
                    <span>VIP INVITATION</span>
                  </div>
                </div>

                {/* Event Title on Ticket */}
                <div className="mb-6">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#1a1610]/60 block mb-1">
                    EVENT ACCESS • تصريح حضور فعالية
                  </span>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-[#1a1610] leading-none">
                    {isAr ? "مخيمات الغدير الشتوية" : "ALGHDEER WINTER CAMPS"}
                  </h3>
                  <p className="text-xs text-[#1a1610]/70 mt-1 font-sans">
                    {isAr
                      ? "أمسيات شتوية فاخرة • طابع بوهيمي عصري • بريمان، جدة"
                      : "Luxury Winter Nights • Modern Bohemian • Burayman, Jeddah"}
                  </p>
                </div>

                {/* Form Fields Styled as Ticket Metadata */}
                <div className="space-y-4">
                  {/* Row 1: Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1a1610]/70 mb-1 font-bold">
                        {isAr ? "اسم الضيف / العميل *" : "GUEST NAME *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isAr ? "الاسم الكريم" : "Your full name"}
                        className="w-full bg-white/70 border-b-2 border-[#1a1610]/40 focus:border-[#1a1610] focus:bg-white px-3 py-2 text-sm text-[#1a1610] placeholder-[#1a1610]/40 outline-none font-sans font-medium transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1a1610]/70 mb-1 font-bold">
                        {isAr ? "رقم الجوال (واتساب) *" : "PHONE (WHATSAPP) *"}
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05xxxxxxxx"
                        dir="ltr"
                        className="w-full bg-white/70 border-b-2 border-[#1a1610]/40 focus:border-[#1a1610] focus:bg-white px-3 py-2 text-sm text-[#1a1610] placeholder-[#1a1610]/40 outline-none font-mono font-medium transition-colors text-right"
                      />
                    </div>
                  </div>

                  {/* Row 2: Company/Occasion & Guests */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1a1610]/70 mb-1 font-bold">
                        {isAr ? "الجهة / نوع المناسبة" : "COMPANY / OCCASION"}
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder={isAr ? "عائلي / شركة / مناسبة خاصة" : "Family / Corporate / Private"}
                        className="w-full bg-white/70 border-b-2 border-[#1a1610]/40 focus:border-[#1a1610] focus:bg-white px-3 py-2 text-sm text-[#1a1610] placeholder-[#1a1610]/40 outline-none font-sans font-medium transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1a1610]/70 mb-1 font-bold">
                        {isAr ? "عدد الضيوف المتوقع *" : "EXPECTED GUESTS *"}
                      </label>
                      <select
                        value={groupSize}
                        onChange={(e) => setGroupSize(e.target.value)}
                        className="w-full bg-white/70 border-b-2 border-[#1a1610]/40 focus:border-[#1a1610] focus:bg-white px-3 py-2 text-sm text-[#1a1610] outline-none font-sans font-medium transition-colors"
                      >
                        <option value="5">5 {isAr ? "أشخاص" : "guests"}</option>
                        <option value="10">10 {isAr ? "أشخاص" : "guests"}</option>
                        <option value="20">20 {isAr ? "شخص" : "guests"}</option>
                        <option value="35">35 {isAr ? "شخص" : "guests"}</option>
                        <option value="50">50 {isAr ? "شخص" : "guests"}</option>
                        <option value="100">100+ {isAr ? "شخص (حفل كبير)" : "guests"}</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Preferred Date & Time */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1a1610]/70 mb-1 font-bold">
                      {isAr ? "الموعد المقترح للفعالية" : "PREFERRED DATE & TIME"}
                    </label>
                    <input
                      type="datetime-local"
                      min={minLocal}
                      value={preferredLocal}
                      onChange={(e) => setPreferredLocal(e.target.value)}
                      className="w-full bg-white/70 border-b-2 border-[#1a1610]/40 focus:border-[#1a1610] focus:bg-white px-3 py-2 text-sm text-[#1a1610] outline-none font-sans font-medium transition-colors"
                    />
                  </div>

                  {/* Row 4: Notes (Optional) */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-[#1a1610]/70 mb-1 font-bold">
                      {isAr ? "ملاحظات خاصة (اختياري)" : "SPECIAL REQUESTS (OPTIONAL)"}
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={
                        isAr
                          ? "أي تفاصيل إضافية (بوفيه، قاعة زجاجية، ألعاب أطفال...)"
                          : "Any specific arrangements (catering, VIP lounge...)"
                      }
                      className="w-full bg-white/70 border-b-2 border-[#1a1610]/40 focus:border-[#1a1610] focus:bg-white px-3 py-2 text-sm text-[#1a1610] placeholder-[#1a1610]/40 outline-none font-sans font-medium transition-colors resize-none"
                    />
                  </div>

                  {error && (
                    <div className="p-2.5 bg-red-100 border border-red-300 text-red-700 text-xs font-bold rounded">
                      {error}
                    </div>
                  )}

                  {/* Submit Button inside Ticket */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 px-6 bg-[#1a1610] hover:bg-black text-[#f4ead2] font-black text-sm tracking-wider uppercase shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                    >
                      {loading ? (
                        <span>{isAr ? "جاري إصدار التذكرة..." : "ISSUING PASS..."}</span>
                      ) : (
                        <>
                          <span>{isAr ? "إصدار تذكرة الحجز والتقويم" : "ISSUE VIP TICKET & PASS"}</span>
                          <span className="text-[#b5382a] font-mono">→</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-[#1a1610]/60 mt-2 font-mono">
                      {isAr
                        ? "✦ سيتم حفظ التذكرة وتجهيز خيارات Apple Wallet و Google Wallet والتقويم"
                        : "✦ Ticket will be generated with Apple Wallet, Google Wallet & Calendar sync"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Perforated Stub / Ticket Tear-Off Area (4 cols) */}
            <div className="md:col-span-4 border-t-2 md:border-t-0 md:border-r-2 border-dashed border-[#1a1610]/30 p-5 sm:p-7 flex flex-col justify-between bg-[#ece0c4] relative">
              {/* Circular Notches Along the Perforation line */}
              <span className="hidden md:block absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />
              <span className="hidden md:block absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />

              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#1a1610]/60 block mb-1">
                  STUB • قسيمة الدخول
                </span>
                <h4 className="font-mono font-bold text-sm uppercase text-[#1a1610] mb-3">
                  ALGHDEER VIP
                </h4>
                <div className="space-y-2 text-xs font-mono text-[#1a1610]/80 border-b border-[#1a1610]/15 pb-4 mb-4">
                  <div className="flex justify-between">
                    <span className="text-[#1a1610]/50">ZONE:</span>
                    <span className="font-bold">BURAYMAN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1a1610]/50">GATE:</span>
                    <span className="font-bold">VIP MAIN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1a1610]/50">SEASON:</span>
                    <span className="font-bold">WINTER 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1a1610]/50">STATUS:</span>
                    <span className="font-bold text-[#b5382a]">RESERVED</span>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="my-4 text-center">
                  <div className="flex justify-center items-end gap-[2px] h-14 bg-white/60 p-2 border border-[#1a1610]/20">
                    {[3, 1, 4, 2, 5, 2, 1, 4, 3, 2, 5, 1, 3, 4, 2, 1, 5, 3, 2, 4, 1, 3, 2, 4, 2, 5, 1, 3].map(
                      (h, i) => (
                        <span
                          key={i}
                          className="bg-[#1a1610]"
                          style={{
                            width: i % 3 === 0 ? "3px" : "1.5px",
                            height: `${(h / 5) * 100}%`,
                          }}
                        />
                      )
                    )}
                  </div>
                  <span className="font-mono text-[9px] tracking-widest text-[#1a1610]/60 uppercase mt-1 block">
                    № ALG-2026-VIP-PASS
                  </span>
                </div>
              </div>

              {/* Bottom Notice */}
              <div className="text-[10px] text-[#1a1610]/60 font-mono leading-relaxed pt-3 border-t border-[#1a1610]/15">
                {isAr
                  ? "يُرجى إبراز هذه التذكرة أو رقم الحجز عند الوصول للبوابة."
                  : "Please present this pass or serial upon arrival at the main gate."}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
