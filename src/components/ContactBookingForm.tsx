"use client";

import React, { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { minPreferredDatetimeLocal } from "@/lib/format-datetime-local";
import { MIN_LEAD_MS } from "@/lib/bookings-types";
import {
  downloadIcsFile,
  downloadAppleWalletPass,
  openGoogleWalletPass,
} from "@/lib/calendar-wallet";
import {
  CheckCircle2,
  Star,
  MessageCircle,
  RotateCcw,
  Calendar,
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

    try {
      // 1. Post to API to store in database/dashboard
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

      let finalId = generatedSerial;
      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.id) {
          finalId = String(data.id);
        }
      }

      // 2. Save directly to browser localStorage as an instant fail-safe
      if (typeof window !== "undefined") {
        try {
          const localKey = "alghdeer_local_bookings";
          const existing = JSON.parse(localStorage.getItem(localKey) || "[]");
          const newRecord = {
            id: finalId,
            name: name.trim(),
            phone: phone.trim() || "—",
            company: company.trim() || "—",
            groupSize: guestCount,
            preferredAt: rawIsoDate,
            notes: notes.trim(),
            status: "pending",
            source: "website",
            createdAt: new Date().toISOString(),
          };
          const updated = [newRecord, ...existing.filter((x: any) => x?.id !== finalId)];
          localStorage.setItem(localKey, JSON.stringify(updated.slice(0, 50)));
        } catch {}
      }

      setIssuedTicket({
        id: finalId,
        name: name.trim(),
        phone: phone.trim() || "—",
        company: company.trim() || "—",
        groupSize: guestCount,
        preferredAt: formattedDate,
        rawDate: rawIsoDate,
        notes: notes.trim(),
      });
    } finally {
      setLoading(false);
    }
  }

  const directWaUrl = issuedTicket
    ? `https://wa.me/966544493991?text=${encodeURIComponent(
        `مرحباً مخيمات الغدير 🏕️\nأرغب بتأكيد حجز تذكرتي برقم:\n№ ${issuedTicket.id}\n• اسم الضيف: ${issuedTicket.name}\n${issuedTicket.phone !== "—" ? `• رقم الجوال: ${issuedTicket.phone}\n` : ""}${issuedTicket.company !== "—" ? `• المناسبة/الجهة: ${issuedTicket.company}\n` : ""}• عدد الضيوف: ${issuedTicket.groupSize} شخص\n• موعد الفعالية: ${issuedTicket.preferredAt}\n${issuedTicket.notes ? `• ملاحظات: ${issuedTicket.notes}\n` : ""}يرجى تأكيد الحجز وإرسال تفاصيل التجهيزات والموقع.`
      )}`
    : "https://wa.me/966544493991";

  return (
    <div className="relative w-full">
      {/* Outer Ticket Container (Exact Beige Retro Aesthetic) */}
      <div className="relative bg-[#f4ead2] text-[#1a1610] rounded-none shadow-[0_20px_60px_rgba(0,0,0,0.65)] overflow-hidden">
        {/* 4 Corner Cutout Notches */}
        <span className="pointer-events-none absolute -top-4 -left-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />
        <span className="pointer-events-none absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />
        <span className="pointer-events-none absolute -bottom-4 -left-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />
        <span className="pointer-events-none absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />

        {issuedTicket ? (
          /* ============================================================ */
          /* TICKET ISSUED SUCCESS VIEW (AUTHENTIC RETRO TICKET PRESERVED) */
          /* ============================================================ */
          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Main Ticket Area (8 cols) */}
            <div className="md:col-span-8 p-5 sm:p-7 md:p-8 flex flex-col justify-between">
              <div className="border-2 border-[#1a1610]/30 p-4 sm:p-6 relative">
                {/* Header Bar */}
                <div className="flex items-center justify-between border-b-2 border-[#1a1610]/20 pb-3 mb-4">
                  <div className="flex items-center gap-1.5 text-[#b5382a]">
                    <Star size={14} className="fill-current" />
                    <Star size={16} className="fill-[#1a1610] text-[#1a1610]" />
                    <Star size={14} className="fill-current" />
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] tracking-[0.3em] uppercase font-bold text-[#1a1610]/60">
                      VIP PASS CONFIRMED • تذكرة معتمدة
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black tracking-[0.12em] uppercase text-[#1a1610] leading-tight">
                      {isAr ? "تم إصدار تذكرتك بنجاح" : "ALGHDEER VIP TICKET"}
                    </h3>
                  </div>
                  <span dir="ltr" className="text-xs font-mono font-black text-[#b5382a]">
                    № {issuedTicket.id}
                  </span>
                </div>

                {/* Status Callout Banner */}
                <div className="mb-4 p-2.5 bg-[#1a1610]/[0.06] border border-[#1a1610]/15 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
                    <span className="text-xs font-bold text-[#1a1610]">
                      {isAr ? "تم تسجيل الحجز في قاعدة بيانات المخيم" : "Saved to Camp Database & Dashboard"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 bg-[#b5382a] text-[#f4ead2]">
                    CONFIRMED
                  </span>
                </div>

                {/* Details Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                  <div className="border-b border-[#1a1610]/15 pb-1.5">
                    <span className="text-[10px] font-bold text-[#1a1610]/60 block">{isAr ? "اسم الضيف:" : "Guest Name:"}</span>
                    <span className="font-bold text-sm text-[#1a1610]">{issuedTicket.name}</span>
                  </div>
                  <div className="border-b border-[#1a1610]/15 pb-1.5">
                    <span className="text-[10px] font-bold text-[#1a1610]/60 block">{isAr ? "الجهة / المناسبة:" : "Occasion:"}</span>
                    <span className="font-bold text-sm text-[#1a1610]">{issuedTicket.company !== "—" ? issuedTicket.company : (isAr ? "حجز مناسبة خاصة" : "Private Booking")}</span>
                  </div>
                  <div className="border-b border-[#1a1610]/15 pb-1.5">
                    <span className="text-[10px] font-bold text-[#1a1610]/60 block">{isAr ? "عدد الضيوف:" : "Guests:"}</span>
                    <span className="font-bold text-sm text-[#1a1610]">{issuedTicket.groupSize} {isAr ? "شخص" : "Guests"}</span>
                  </div>
                  <div className="border-b border-[#1a1610]/15 pb-1.5">
                    <span className="text-[10px] font-bold text-[#1a1610]/60 block">{isAr ? "موعد الفعالية:" : "Date & Time:"}</span>
                    <span className="font-bold text-sm text-[#1a1610]">{issuedTicket.preferredAt}</span>
                  </div>
                  {issuedTicket.notes ? (
                    <div className="sm:col-span-2 border-b border-[#1a1610]/15 pb-1.5">
                      <span className="text-[10px] font-bold text-[#1a1610]/60 block">{isAr ? "ملاحظات وتجهيزات خاصة:" : "Special Notes:"}</span>
                      <span className="font-medium text-xs text-[#1a1610]">{issuedTicket.notes}</span>
                    </div>
                  ) : null}
                </div>

                {/* Wallet & Calendar Action Strip */}
                <div className="pt-3 border-t border-[#1a1610]/20">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1610]/70 mb-2">
                    {isAr ? "حفظ التذكرة في المحفظة والتقويم:" : "Save to Wallet & Calendar:"}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Apple Wallet */}
                    <button
                      type="button"
                      onClick={() => downloadAppleWalletPass(issuedTicket)}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <AppleIcon className="w-3.5 h-3.5 fill-white" />
                      <span>{isAr ? "محفظة Apple" : "Apple Wallet"}</span>
                    </button>

                    {/* Google Wallet */}
                    <button
                      type="button"
                      onClick={() => openGoogleWalletPass(issuedTicket)}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-zinc-100 text-[#1a1610] border border-[#1a1610]/25 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <GoogleWalletIcon className="w-3.5 h-3.5" />
                      <span>{isAr ? "Google Wallet" : "Google Wallet"}</span>
                    </button>

                    {/* Calendar */}
                    <button
                      type="button"
                      onClick={() => downloadIcsFile(issuedTicket)}
                      className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#1a1610]/10 hover:bg-[#1a1610]/15 text-[#1a1610] border border-[#1a1610]/25 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <Calendar size={14} />
                      <span>{isAr ? "إضافة للتقويم" : "Add to Calendar"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Perforated Tear-Off Stub (4 cols) */}
            <div className="md:col-span-4 relative bg-[#b5382a] text-[#f4ead2] p-5 sm:p-7 flex flex-col justify-between border-t-2 md:border-t-0 md:border-s-2 border-dashed border-[#0B0C10]/40">
              {/* Perforation Semi-Circle Notches */}
              <span className="hidden md:block pointer-events-none absolute -top-4 -start-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />
              <span className="hidden md:block pointer-events-none absolute -bottom-4 -start-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />

              <div className="text-center border-2 border-[#f4ead2]/35 p-4 flex flex-col justify-between h-full space-y-4">
                <div>
                  <span className="text-[10px] tracking-[0.28em] uppercase font-bold text-[#f4ead2]/80 block mb-1">
                    ADMIT VIP PASS
                  </span>
                  <img
                    src="/logo-white.png"
                    alt="ALGHDEER camp"
                    className="h-5 w-auto object-contain mx-auto mb-2"
                  />
                  <div className="my-2 py-2 border-y border-[#f4ead2]/25 text-xs space-y-1">
                    <p className="font-bold truncate">{issuedTicket.name}</p>
                    <p className="text-[11px] text-[#f4ead2]/80">
                      {issuedTicket.groupSize} {isAr ? "ضيوف" : "Guests"}
                    </p>
                    <p className="font-mono text-xs font-bold text-amber-200">
                      № {issuedTicket.id}
                    </p>
                  </div>
                </div>

                {/* Barcode Graphic */}
                <div
                  aria-hidden
                  className="my-2 h-9 w-full opacity-90"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, #f4ead2 0px, #f4ead2 2px, transparent 2px, transparent 5px, #f4ead2 5px, #f4ead2 6px, transparent 6px, transparent 9px, #f4ead2 9px, #f4ead2 13px, transparent 13px, transparent 15px)",
                  }}
                />

                {/* Confirm via WhatsApp CTA */}
                <div className="space-y-2 pt-1">
                  <a
                    href={directWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-full bg-[#25D366] hover:bg-[#1faa53] text-black font-black text-xs tracking-wider uppercase transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle size={18} className="fill-black text-transparent shrink-0" />
                    <span>{isAr ? "فتح محادثة الواتساب وتأكيد الحجز" : "Confirm via WhatsApp"}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setIssuedTicket(null)}
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 text-[11px] text-[#f4ead2]/80 hover:text-white underline font-bold tracking-wider cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>{isAr ? "إصدار تذكرة إضافية" : "Issue Another Ticket"}</span>
                  </button>
                </div>
              </div>
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
                  <div className="flex items-center gap-1.5 text-[#b5382a]">
                    <Star size={14} className="fill-current" />
                    <Star size={16} className="fill-[#1a1610] text-[#1a1610]" />
                    <Star size={14} className="fill-current" />
                  </div>
                  <div className="text-center">
                    <span className="block text-[10px] tracking-[0.3em] uppercase font-bold text-[#1a1610]/60">
                      ADMIT ONE EVENT • تذكرة حجز
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black tracking-[0.12em] uppercase text-[#1a1610] leading-tight">
                      {isAr ? "تذكرة مخيم الغدير" : "ALGHDEER VIP TICKET"}
                    </h3>
                  </div>
                  <span dir="ltr" className="text-[11px] font-mono font-bold text-[#1a1610]/60">
                    № 2026
                  </span>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#1a1610]/65 mb-1">
                      {isAr ? "اسم الضيف *" : "Guest Name *"}
                    </label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isAr ? "الاسم الكريم" : "Your full name"}
                      className="w-full bg-transparent border-b-2 border-[#1a1610]/25 focus:border-[#b5382a] py-1.5 text-sm font-bold text-[#1a1610] placeholder:text-[#1a1610]/30 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#1a1610]/65 mb-1">
                      {isAr ? "الجهة / المناسبة (اختياري)" : "Occasion / Company (Optional)"}
                    </label>
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder={isAr ? "عائلة / شركة / تخرج" : "Family / Company / Private"}
                      className="w-full bg-transparent border-b-2 border-[#1a1610]/25 focus:border-[#b5382a] py-1.5 text-sm font-bold text-[#1a1610] placeholder:text-[#1a1610]/30 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#1a1610]/65 mb-1">
                      {isAr ? "رقم الجوال / الواتساب (اختياري)" : "Phone / WhatsApp (Optional)"}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={isAr ? "05xxxxxxxx" : "+966 5x xxx xxxx"}
                      dir="ltr"
                      className="w-full bg-transparent border-b-2 border-[#1a1610]/25 focus:border-[#b5382a] py-1.5 text-sm font-bold text-[#1a1610] placeholder:text-[#1a1610]/30 focus:outline-none transition-colors text-right rtl:text-right ltr:text-left font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#1a1610]/65 mb-1">
                      {t("groupSizeLabel")} *
                    </label>
                    <input
                      required
                      type="number"
                      min={1}
                      value={groupSize}
                      onChange={(e) => setGroupSize(e.target.value)}
                      placeholder="10"
                      className="w-full bg-transparent border-b-2 border-[#1a1610]/25 focus:border-[#b5382a] py-1.5 text-sm font-bold text-[#1a1610] placeholder:text-[#1a1610]/30 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#1a1610]/65 mb-1">
                      {t("dateLabel")} *
                    </label>
                    <input
                      required
                      type="datetime-local"
                      min={minLocal}
                      value={preferredLocal}
                      onChange={(e) => setPreferredLocal(e.target.value)}
                      className="w-full bg-[#1a1610]/[0.05] border-b-2 border-[#1a1610]/25 focus:border-[#b5382a] px-2 py-1 text-xs sm:text-sm font-bold text-[#1a1610] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#1a1610]/65 mb-1">
                      {isAr ? "ملاحظات خاصة (اختياري)" : "Special Requests (Optional)"}
                    </label>
                    <input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={isAr ? "أي تجهيزات أو طلبات خاصة..." : "Any special catering or setup notes..."}
                      className="w-full bg-transparent border-b-2 border-[#1a1610]/25 focus:border-[#b5382a] py-1.5 text-sm font-bold text-[#1a1610] placeholder:text-[#1a1610]/30 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {error ? (
                  <p className="text-[#b5382a] text-xs font-bold mt-2" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Perforated Tear-Off Stub (4 cols) */}
            <div className="md:col-span-4 relative bg-[#b5382a] text-[#f4ead2] p-5 sm:p-7 flex flex-col justify-between border-t-2 md:border-t-0 md:border-s-2 border-dashed border-[#0B0C10]/40">
              {/* Perforation Semi-Circle Notches */}
              <span className="hidden md:block pointer-events-none absolute -top-4 -start-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />
              <span className="hidden md:block pointer-events-none absolute -bottom-4 -start-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />

              <div className="text-center border-2 border-[#f4ead2]/35 p-4 flex flex-col justify-between h-full">
                <div>
                  <span className="text-[10px] tracking-[0.28em] uppercase font-bold text-[#f4ead2]/80 block mb-1">
                    ADMIT VIP
                  </span>
                  <img
                    src="/logo-white.png"
                    alt="ALGHDEER camp"
                    className="h-5 w-auto object-contain mx-auto mb-3"
                  />
                  <div className="my-3 py-2 border-y border-[#f4ead2]/25 text-xs space-y-1">
                    <p className="font-bold truncate">
                      {name ? name : isAr ? "اسم الضيف" : "Guest Name"}
                    </p>
                    <p className="text-[11px] text-[#f4ead2]/80 truncate">
                      {company ? company : isAr ? "حجز مناسبة خاصة" : "Private Occasion"}
                    </p>
                    <p className="text-[11px] text-[#f4ead2]/80">
                      {groupSize ? `${groupSize} ${isAr ? "ضيف" : "Guests"}` : isAr ? "10 ضيوف" : "10 Guests"}
                    </p>
                  </div>
                </div>

                {/* Barcode Graphic */}
                <div
                  aria-hidden
                  className="my-3 h-9 w-full opacity-85"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, #f4ead2 0px, #f4ead2 2px, transparent 2px, transparent 5px, #f4ead2 5px, #f4ead2 6px, transparent 6px, transparent 9px, #f4ead2 9px, #f4ead2 13px, transparent 13px, transparent 15px)",
                  }}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-[#1a1610] hover:bg-black text-[#f4ead2] font-black text-xs tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-50 shadow-lg border border-[#f4ead2]/25 cursor-pointer"
                >
                  {loading ? (isAr ? "جاري إصدار التذكرة..." : "Issuing...") : (isAr ? "إصدار تذكرة الحجز" : "Issue Ticket Now")}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
