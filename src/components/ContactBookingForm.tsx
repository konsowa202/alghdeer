"use client";

import React, { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { minPreferredDatetimeLocal } from "@/lib/format-datetime-local";
import { MIN_LEAD_MS } from "@/lib/bookings-types";
import {
  downloadIcsFile,
  getGoogleCalendarUrl,
  downloadAppleWalletPass,
  openGoogleWalletPass,
} from "@/lib/calendar-wallet";
import {
  CheckCircle2,
  MessageCircle,
  ExternalLink,
  RotateCcw,
  Calendar,
  Download,
  CalendarCheck,
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

    // Generate local unique ticket serial (e.g. ALG-4796)
    const generatedSerial = "ALG-" + Math.floor(1000 + Math.random() * 9000);
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

    const ticketObj: IssuedTicket = {
      id: generatedSerial,
      name: name.trim(),
      phone: phone.trim() || "—",
      company: company.trim() || "—",
      groupSize: guestCount,
      preferredAt: formattedDate,
      rawDate: rawIsoDate,
      notes: notes.trim(),
    };

    try {
      // 1. Post to API to store in database/dashboard with EXACT generatedSerial
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: generatedSerial,
          name: name.trim(),
          phone: phone.trim() || "—",
          company: company.trim() || "—",
          groupSize: guestCount,
          notes: notes.trim(),
          preferredAt: rawIsoDate,
        }),
      }).catch(() => null);

      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.id) ticketObj.id = String(data.id);
      }

      setIssuedTicket(ticketObj);

      // Save to localStorage backup
      if (typeof window !== "undefined") {
        try {
          const localArr = JSON.parse(localStorage.getItem("alghdeer_local_bookings") || "[]");
          localArr.unshift({
            id: ticketObj.id,
            name: ticketObj.name,
            phone: ticketObj.phone,
            company: ticketObj.company,
            groupSize: ticketObj.groupSize,
            notes: ticketObj.notes,
            preferredAt: rawIsoDate,
            status: "pending",
            source: "website",
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem("alghdeer_local_bookings", JSON.stringify(localArr.slice(0, 50)));
        } catch {}
      }

      // Auto-download .ics calendar invite
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
      : `№ ALG-${issuedTicket.id}`
    : "№ ALG-2026";

  const directWaUrl = issuedTicket
    ? `https://wa.me/966544493991?text=${encodeURIComponent(
        `مرحباً مخيمات الغدير 🏕️\nأرغب بتأكيد حجز تذكرتي برقم:\n${ticketNumber}\n• اسم الضيف: ${issuedTicket.name}\n${issuedTicket.phone !== "—" ? `• رقم الجوال: ${issuedTicket.phone}\n` : ""}${issuedTicket.company !== "—" ? `• المناسبة/الجهة: ${issuedTicket.company}\n` : ""}• عدد الضيوف: ${issuedTicket.groupSize} شخص\n• موعد الفعالية: ${issuedTicket.preferredAt}\n${issuedTicket.notes ? `• ملاحظات: ${issuedTicket.notes}\n` : ""}يرجى تأكيد الحجز وإرسال تفاصيل التجهيزات والموقع.`
      )}`
    : "https://wa.me/966544493991";

  return (
    <div className="relative w-full">
      {/* Outer Luxury VIP Pass Container (Dark Obsidian & Gold) */}
      <div className="relative bg-[#0c0d12] text-white rounded-3xl border border-[#cba135]/40 shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Ticket Perforation Cutout Notches */}
        <span className="pointer-events-none absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-black border border-[#cba135]/30 z-20" />
        <span className="pointer-events-none absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-black border border-[#cba135]/30 z-20" />

        {issuedTicket ? (
          /* ============================================================ */
          /* TICKET ISSUED SUCCESS VIEW: LUXURY VIP PASS                   */
          /* ============================================================ */
          <div className="p-6 sm:p-10 md:p-12 text-center m-2 sm:m-4 space-y-7 relative z-10">
            <div className="flex justify-center text-[#cba135]">
              <CheckCircle2 size={50} strokeWidth={1.75} />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-[#cba135]/15 border border-[#cba135]/40 text-[#fae5a5] text-xs font-mono font-bold tracking-widest uppercase mb-2 rounded-full">
                {ticketNumber} • VIP INVITATION
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wider text-white">
                {isAr ? "تم إصدار تذكرة الحجز بنجاح" : "YOUR VIP TICKET IS ISSUED"}
              </h3>
              <p className="text-xs sm:text-sm text-white/60 mt-1 max-w-md mx-auto">
                {isAr
                  ? "احفظ التذكرة في محفظتك الإلكترونية وتقويمك أولاً، ثم أكد الحجز عبر الواتساب"
                  : "Save your ticket to Apple Wallet, Google Wallet or Calendar, then confirm via WhatsApp."}
              </p>
            </div>

            {/* The Authentic Digital VIP Pass Card */}
            <div className="max-w-lg mx-auto bg-white/[0.03] border border-white/15 p-6 text-start space-y-4 rounded-2xl shadow-xl relative overflow-hidden backdrop-blur-xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#cba135] block">
                    ALGHDEER WINTER CAMPS
                  </span>
                  <span className="text-xs text-white/60 font-medium">
                    {isAr ? "تذكرة دخول وحجز VIP" : "VIP Event Entry Pass"}
                  </span>
                </div>
                <span className="font-mono font-black text-lg text-[#ffd700] tracking-wider">
                  {ticketNumber}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <span className="text-white/40 block mb-1">{isAr ? "اسم الضيف:" : "Guest Name:"}</span>
                  <span className="font-bold text-white text-sm">{issuedTicket.name}</span>
                </div>
                {issuedTicket.phone !== "—" && (
                  <div>
                    <span className="text-white/40 block mb-1">{isAr ? "رقم الجوال:" : "Phone:"}</span>
                    <span dir="ltr" className="font-mono font-bold text-white text-sm">{issuedTicket.phone}</span>
                  </div>
                )}
                {issuedTicket.company !== "—" && (
                  <div>
                    <span className="text-white/40 block mb-1">{isAr ? "الجهة / المناسبة:" : "Occasion:"}</span>
                    <span className="font-bold text-white">{issuedTicket.company}</span>
                  </div>
                )}
                <div>
                  <span className="text-white/40 block mb-1">{isAr ? "عدد الضيوف:" : "Guests:"}</span>
                  <span className="font-bold text-white">{issuedTicket.groupSize} {isAr ? "شخص" : "guests"}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3">
                <span className="text-white/40 text-xs block mb-1">{isAr ? "موعد الفعالية:" : "Event Date:"}</span>
                <span className="font-bold text-sm text-[#fae5a5]">{issuedTicket.preferredAt}</span>
              </div>

              {/* Barcode representation */}
              <div className="border-t border-white/10 pt-4 flex flex-col items-center">
                <div className="flex items-end gap-[2px] h-9 bg-white/10 p-1.5 rounded">
                  {[3, 1, 4, 2, 5, 2, 1, 4, 3, 2, 5, 1, 3, 4, 2, 1, 5, 3, 2, 4, 1, 3, 2, 4, 2, 5, 1, 3].map(
                    (h, i) => (
                      <span
                        key={i}
                        className="bg-white/80"
                        style={{
                          width: i % 3 === 0 ? "2.5px" : "1.5px",
                          height: `${(h / 5) * 100}%`,
                        }}
                      />
                    )
                  )}
                </div>
                <span className="font-mono text-[9px] tracking-widest text-white/40 mt-1 uppercase">
                  {issuedTicket.id} • JEDDAH VIP
                </span>
              </div>
            </div>

            {/* ============================================================ */}
            {/* WALLET & CALENDAR ACTION BAR (SEAMLESS LUXURY DESIGN)         */}
            {/* ============================================================ */}
            <div className="max-w-lg mx-auto space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#cba135]/80 block font-bold">
                {isAr ? "✦ إضافة التذكرة إلى محفظتك والتقويم ✦" : "✦ ADD TICKET TO WALLET & CALENDAR ✦"}
              </span>

              {/* Apple Wallet & Google Wallet Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Apple Wallet */}
                <button
                  type="button"
                  onClick={() => {
                    downloadAppleWalletPass(issuedTicket);
                    setCalendarDownloaded(true);
                  }}
                  className="flex items-center justify-center gap-2.5 py-3.5 px-5 bg-black hover:bg-neutral-900 border border-white/20 rounded-2xl font-bold text-xs text-white shadow-lg transition-all active:scale-95"
                >
                  <AppleIcon className="w-4 h-4 fill-white" />
                  <span>{isAr ? "إضافة إلى Apple Wallet" : "Add to Apple Wallet"}</span>
                </button>

                {/* 2. Google Wallet */}
                <button
                  type="button"
                  onClick={() => openGoogleWalletPass(issuedTicket)}
                  className="flex items-center justify-center gap-2.5 py-3.5 px-5 bg-neutral-900 hover:bg-neutral-800 border border-white/20 rounded-2xl font-bold text-xs text-white shadow-lg transition-all active:scale-95"
                >
                  <GoogleWalletIcon className="w-4 h-4" />
                  <span>{isAr ? "حفظ في Google Wallet" : "Save to Google Wallet"}</span>
                </button>
              </div>

              {/* 3. Calendar Links */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    downloadIcsFile(issuedTicket);
                    setCalendarDownloaded(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] hover:bg-white/10 text-white/80 text-[11px] font-bold rounded-lg border border-white/10 transition-all"
                >
                  <Download size={13} />
                  <span>{isAr ? "تنزيل ملف التقويم (.ics)" : "Download iCal (.ics)"}</span>
                </button>

                <a
                  href={getGoogleCalendarUrl(issuedTicket)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] hover:bg-white/10 text-white/80 text-[11px] font-bold rounded-lg border border-white/10 transition-all"
                >
                  <Calendar size={13} />
                  <span>{isAr ? "تقويم Google Calendar" : "Google Calendar"}</span>
                </a>
              </div>

              {calendarDownloaded && (
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 py-1.5 px-3 rounded-lg border border-emerald-500/20">
                  <CalendarCheck size={14} />
                  <span>{isAr ? "تم إرسال موعد التذكرة إلى جهازك بنجاح!" : "Event saved to your device!"}</span>
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* FINAL STEP: WHATSAPP CONFIRMATION                            */}
            {/* ============================================================ */}
            <div className="max-w-md mx-auto space-y-3 pt-4 border-t border-white/10">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-white/50 block">
                {isAr ? "✦ الخطوة الأخيرة: تثبيت وتأكيد الحجز ✦" : "✦ FINAL STEP: CONFIRM BOOKING ✦"}
              </span>

              <a
                href={directWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-4 px-6 bg-[#25D366] hover:bg-[#1faa53] text-black font-black text-sm tracking-wider uppercase rounded-full shadow-2xl transition-all active:scale-98"
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
                className="inline-flex items-center justify-center gap-1.5 w-full py-2 text-xs text-white/50 hover:text-white underline font-bold tracking-wider"
              >
                <RotateCcw size={13} />
                <span>{isAr ? "إصدار تذكرة إضافية" : "Issue Another Ticket"}</span>
              </button>
            </div>

            {/* Staff Dashboard Shortcut */}
            <div className="pt-3 border-t border-white/[0.08] text-[11px] text-white/40">
              <span>{isAr ? "إدارة المخيم: تظهر جميع التذاكر فورياً في " : "Staff: All tickets appear in "}</span>
              <a
                href="/dashboard"
                className="font-bold text-[#cba135] hover:underline inline-flex items-center gap-1"
              >
                <span>{isAr ? "لوحة تحكم الحجوزات" : "Staff Dashboard"}</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        ) : (
          /* ============================================================ */
          /* TICKET INPUT FORM: LUXURY OBSIDIAN & GOLD PASS               */
          /* ============================================================ */
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-12">
            {/* Main Form Area (8 cols) */}
            <div className="md:col-span-8 p-6 sm:p-8 md:p-10">
              <div className="border border-white/10 rounded-2xl p-5 sm:p-7 relative bg-white/[0.02]">
                {/* Header Bar */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs tracking-widest uppercase bg-[#cba135] text-black px-2.5 py-0.5 rounded">
                      PASS № 2026
                    </span>
                    <span className="text-[10px] font-mono tracking-wider uppercase text-white/50 hidden sm:inline">
                      • JEDDAH, BURAYMAN
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#cba135] tracking-wider uppercase">
                    VIP INVITATION
                  </span>
                </div>

                {/* Event Title */}
                <div className="mb-6">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#cba135] block mb-1">
                    EVENT ACCESS • تصريح حضور فعالية
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-none">
                    {isAr ? "مخيمات الغدير الشتوية" : "ALGHDEER WINTER CAMPS"}
                  </h3>
                  <p className="text-xs text-white/60 mt-1 font-sans">
                    {isAr
                      ? "أمسيات شتوية فاخرة • طابع بوهيمي عصري • بريمان، جدة"
                      : "Luxury Winter Nights • Modern Bohemian • Burayman, Jeddah"}
                  </p>
                </div>

                {/* Form Inputs */}
                <div className="space-y-4">
                  {/* Row 1: Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1.5 font-bold">
                        {isAr ? "اسم الضيف / العميل *" : "GUEST NAME *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isAr ? "الاسم الكريم" : "Your full name"}
                        className="w-full bg-white/[0.04] border border-white/15 rounded-xl focus:border-[#cba135] focus:bg-white/[0.07] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none font-sans font-medium transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1.5 font-bold">
                        {isAr ? "رقم الجوال (واتساب) *" : "PHONE (WHATSAPP) *"}
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05xxxxxxxx"
                        dir="ltr"
                        className="w-full bg-white/[0.04] border border-white/15 rounded-xl focus:border-[#cba135] focus:bg-white/[0.07] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none font-mono font-medium transition-all text-right"
                      />
                    </div>
                  </div>

                  {/* Row 2: Company/Occasion & Guests */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1.5 font-bold">
                        {isAr ? "الجهة / نوع المناسبة" : "COMPANY / OCCASION"}
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder={isAr ? "عائلي / شركة / مناسبة خاصة" : "Family / Corporate / Private"}
                        className="w-full bg-white/[0.04] border border-white/15 rounded-xl focus:border-[#cba135] focus:bg-white/[0.07] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none font-sans font-medium transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1.5 font-bold">
                        {isAr ? "عدد الضيوف المتوقع *" : "EXPECTED GUESTS *"}
                      </label>
                      <select
                        value={groupSize}
                        onChange={(e) => setGroupSize(e.target.value)}
                        className="w-full bg-[#14151b] border border-white/15 rounded-xl focus:border-[#cba135] px-3.5 py-2.5 text-sm text-white outline-none font-sans font-medium transition-all"
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
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1.5 font-bold">
                      {isAr ? "الموعد المقترح للفعالية" : "PREFERRED DATE & TIME"}
                    </label>
                    <input
                      type="datetime-local"
                      min={minLocal}
                      value={preferredLocal}
                      onChange={(e) => setPreferredLocal(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/15 rounded-xl focus:border-[#cba135] focus:bg-white/[0.07] px-3.5 py-2.5 text-sm text-white outline-none font-sans font-medium transition-all"
                    />
                  </div>

                  {/* Row 4: Notes (Optional) */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70 mb-1.5 font-bold">
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
                      className="w-full bg-white/[0.04] border border-white/15 rounded-xl focus:border-[#cba135] focus:bg-white/[0.07] px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none font-sans font-medium transition-all resize-none"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold rounded-xl">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 px-6 bg-gradient-to-r from-[#d4a73b] via-[#f3da8c] to-[#c1942a] text-[#0b0c10] font-black text-sm tracking-wider uppercase rounded-xl shadow-[0_10px_30px_rgba(203,161,53,0.3)] hover:shadow-[0_15px_40px_rgba(203,161,53,0.5)] transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                    >
                      {loading ? (
                        <span>{isAr ? "جاري إصدار التذكرة..." : "ISSUING PASS..."}</span>
                      ) : (
                        <>
                          <span>{isAr ? "إصدار تذكرة الحجز" : "ISSUE VIP TICKET"}</span>
                          <span className="font-mono text-base">→</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-white/50 mt-2 font-mono">
                      {isAr
                        ? "✦ سيتم تسجيل التذكرة وتجهيز خيارات Apple Wallet و Google Wallet والتقويم"
                        : "✦ Ticket will be generated with Apple Wallet, Google Wallet & Calendar sync"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stub Area (4 cols) */}
            <div className="md:col-span-4 border-t border-white/10 md:border-t-0 md:border-r border-dashed md:border-white/20 p-6 sm:p-8 flex flex-col justify-between bg-white/[0.01]">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#cba135] block mb-1">
                  STUB • قسيمة الدخول
                </span>
                <h4 className="font-mono font-bold text-sm uppercase text-white mb-4">
                  ALGHDEER VIP
                </h4>
                <div className="space-y-2.5 text-xs font-mono text-white/70 border-b border-white/10 pb-4 mb-4">
                  <div className="flex justify-between">
                    <span className="text-white/40">ZONE:</span>
                    <span className="font-bold text-white">BURAYMAN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">GATE:</span>
                    <span className="font-bold text-white">VIP MAIN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">SEASON:</span>
                    <span className="font-bold text-white">WINTER 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">STATUS:</span>
                    <span className="font-bold text-emerald-400">RESERVED</span>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="my-4 text-center">
                  <div className="flex justify-center items-end gap-[2px] h-12 bg-white/[0.03] p-2 border border-white/10 rounded-lg">
                    {[3, 1, 4, 2, 5, 2, 1, 4, 3, 2, 5, 1, 3, 4, 2, 1, 5, 3, 2, 4, 1, 3, 2, 4, 2, 5, 1, 3].map(
                      (h, i) => (
                        <span
                          key={i}
                          className="bg-white/70"
                          style={{
                            width: i % 3 === 0 ? "2.5px" : "1.5px",
                            height: `${(h / 5) * 100}%`,
                          }}
                        />
                      )
                    )}
                  </div>
                  <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase mt-1.5 block">
                    № ALG-2026-VIP-PASS
                  </span>
                </div>
              </div>

              {/* Notice */}
              <div className="text-[10px] text-white/45 font-mono leading-relaxed pt-3 border-t border-white/10">
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
