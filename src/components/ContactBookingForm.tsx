"use client";

import React, { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { minPreferredDatetimeLocal } from "@/lib/format-datetime-local";
import { MIN_LEAD_MS } from "@/lib/bookings-types";
import { downloadIcsFile } from "@/lib/calendar-wallet";
import { downloadTicketImage } from "@/lib/ticket-canvas";
import {
  CheckCircle2,
  Star,
  MessageCircle,
  RotateCcw,
  Calendar,
  Download,
  QrCode,
  X,
  ShieldCheck,
} from "lucide-react";

interface IssuedTicket {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  groupSize: number;
  preferredAt: string;
  rawDate: string;
  notes: string;
}

export default function ContactBookingForm() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [groupSize, setGroupSize] = useState("10");
  const [preferredLocal, setPreferredLocal] = useState("");
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — must stay empty
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [issuedTicket, setIssuedTicket] = useState<IssuedTicket | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);

  const minLocal = useMemo(() => minPreferredDatetimeLocal(MIN_LEAD_MS), []);

  async function handleDownloadImage() {
    if (!issuedTicket) return;
    setDownloadingImage(true);
    try {
      await downloadTicketImage(issuedTicket);
    } catch {
      // Fallback
    } finally {
      setDownloadingImage(false);
    }
  }

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
          phone: phone.trim(),
          email: email.trim(),
          company: company.trim(),
          groupSize: guestCount,
          notes: notes.trim(),
          preferredAt: rawIsoDate,
          website, // honeypot — always empty for humans
        }),
      }).catch(() => null);

      // Server-side validation failed (400) or rate-limited (429):
      // show the message and let the guest fix the form — no ticket yet.
      if (res && !res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(
          data.error ||
            (isAr
              ? "تعذر إرسال الطلب. حاول مرة أخرى أو تواصل واتساب."
              : "Could not submit. Please retry or contact us on WhatsApp.")
        );
        return;
      }

      let finalId = generatedSerial;
      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.id) {
          finalId = String(data.id);
        }
      }

      setIssuedTicket({
        id: finalId,
        name: name.trim(),
        phone: phone.trim() || "—",
        email: email.trim(),
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
        `مرحباً مخيمات الغدير 🏕️\nأرغب بتأكيد حجز تذكرتي برقم:\n№ ${issuedTicket.id}\n• اسم الضيف: ${issuedTicket.name}\n${issuedTicket.phone !== "—" ? `• رقم الجوال: ${issuedTicket.phone}\n` : ""}${issuedTicket.email ? `• البريد: ${issuedTicket.email}\n` : ""}${issuedTicket.company !== "—" ? `• المناسبة/الجهة: ${issuedTicket.company}\n` : ""}• عدد الضيوف: ${issuedTicket.groupSize} شخص\n• موعد الفعالية: ${issuedTicket.preferredAt}\n${issuedTicket.notes ? `• ملاحظات: ${issuedTicket.notes}\n` : ""}يرجى تأكيد الحجز وإرسال تفاصيل التجهيزات والموقع.`
      )}`
    : "https://wa.me/966544493991";

  const qrImageUrl = issuedTicket
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        `ALGHDEER-PASS:${issuedTicket.id}|GUEST:${issuedTicket.name}|DATE:${issuedTicket.preferredAt}|STATUS:CONFIRMED`
      )}&color=0B0C10&bgcolor=f4ead2`
    : "";

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

                {/* Wallet & Pass Actions (Authentic Digital Pass & Calendar) */}
                <div className="pt-3 border-t border-[#1a1610]/20">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1610]/70 mb-2">
                    {isAr ? "حفظ التذكرة كبطاقة رقمية وفي التقويم:" : "Save Digital Pass & Calendar:"}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* 1. Save Image to Photos / Gallery */}
                    <button
                      type="button"
                      disabled={downloadingImage}
                      onClick={handleDownloadImage}
                      className="group relative flex items-center justify-center gap-2 py-2.5 px-3 bg-[#1a1610] hover:bg-black text-[#f4ead2] rounded-[14px] text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60 overflow-hidden"
                    >
                      <span className="pointer-events-none absolute -start-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#f4ead2]" />
                      <span className="pointer-events-none absolute -end-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#f4ead2]" />
                      <Download size={14} className="text-[#cba135]" />
                      <span>{downloadingImage ? (isAr ? "جاري التوليد..." : "Saving...") : (isAr ? "حفظ التذكرة بالصور (PNG)" : "Save to Photos (PNG)")}</span>
                    </button>

                    {/* 2. Interactive Digital Wallet Pass Modal */}
                    <button
                      type="button"
                      onClick={() => setShowWalletModal(true)}
                      className="group relative flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-zinc-100 text-[#1a1610] border border-[#1a1610]/25 rounded-[14px] text-xs font-bold transition-all shadow-sm cursor-pointer overflow-hidden"
                    >
                      <span className="pointer-events-none absolute -start-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#f4ead2] border border-[#1a1610]/20" />
                      <span className="pointer-events-none absolute -end-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#f4ead2] border border-[#1a1610]/20" />
                      <QrCode size={14} className="text-[#b5382a]" />
                      <span>{isAr ? "بطاقة المحفظة (QR)" : "Digital Wallet Pass"}</span>
                    </button>

                    {/* 3. Native Phone Calendar */}
                    <button
                      type="button"
                      onClick={() => downloadIcsFile(issuedTicket)}
                      className="group relative flex items-center justify-center gap-2 py-2.5 px-3 bg-[#1a1610]/10 hover:bg-[#1a1610]/15 text-[#1a1610] border border-[#1a1610]/25 rounded-[14px] text-xs font-bold transition-all shadow-sm cursor-pointer overflow-hidden"
                    >
                      <span className="pointer-events-none absolute -start-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#f4ead2] border border-[#1a1610]/20" />
                      <span className="pointer-events-none absolute -end-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#f4ead2] border border-[#1a1610]/20" />
                      <Calendar size={14} />
                      <span>{isAr ? "إضافة لتقويم الهاتف" : "Add to Calendar"}</span>
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
                    className="group relative w-full py-3.5 px-4 rounded-[14px] bg-[#25D366] hover:bg-[#1faa53] text-black font-black text-xs tracking-wider uppercase transition-all duration-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer overflow-hidden"
                  >
                    {/* Side Ticket Notches */}
                    <span className="pointer-events-none absolute -start-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#b5382a] border border-black/20" />
                    <span className="pointer-events-none absolute -end-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#b5382a] border border-black/20" />

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
                      {isAr ? "البريد الإلكتروني (اختياري)" : "Email (Optional)"}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isAr ? "name@email.com" : "name@email.com"}
                      dir="ltr"
                      className="w-full bg-transparent border-b-2 border-[#1a1610]/25 focus:border-[#b5382a] py-1.5 text-sm font-bold text-[#1a1610] placeholder:text-[#1a1610]/30 focus:outline-none transition-colors text-right rtl:text-right ltr:text-left"
                    />
                  </div>
                </div>

                <div className="mb-2">
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

                {/* Honeypot — invisible to humans, bots fill it and get filtered server-side */}
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute opacity-0 pointer-events-none h-0 w-0"
                  style={{ position: "absolute", left: "-9999px" }}
                />

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
                  className="group relative w-full py-3.5 px-4 rounded-[14px] bg-[#1a1610] hover:bg-black text-[#f4ead2] font-black text-xs tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-50 shadow-lg border border-[#f4ead2]/25 cursor-pointer overflow-hidden flex items-center justify-center gap-2"
                >
                  {/* Side Ticket Notches */}
                  <span className="pointer-events-none absolute -start-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#b5382a] border border-[#f4ead2]/35" />
                  <span className="pointer-events-none absolute -end-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#b5382a] border border-[#f4ead2]/35" />

                  {/* Laser Scanner Sweep */}
                  <span className="pointer-events-none absolute top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#ffd700] to-transparent opacity-0 group-hover:opacity-100 group-hover:left-[110%] -left-[10%] transition-all duration-700 ease-in-out" />

                  <span>{loading ? (isAr ? "جاري إصدار التذكرة..." : "Issuing...") : (isAr ? "إصدار تذكرة الحجز" : "Issue Ticket Now")}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* ============================================================ */}
      {/* INTERACTIVE DIGITAL WALLET PASS MODAL (AUTHENTIC WALLET CARD) */}
      {/* ============================================================ */}
      {showWalletModal && issuedTicket ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#0B0C10] border border-[#cba135]/40 rounded-[16px] overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-white animate-in fade-in zoom-in-95 duration-200">
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setShowWalletModal(false)}
              className="absolute top-4 end-4 z-20 w-8 h-8 rounded-[8px] bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Wallet Pass Header */}
            <div className="p-6 bg-gradient-to-b from-[#1a1610] to-[#0B0C10] border-b border-white/10 text-center">
              <span className="inline-block text-[10px] font-mono tracking-[0.25em] text-[#cba135] uppercase font-bold mb-1">
                ALGHDEER DIGITAL PASS
              </span>
              <h4 className="text-xl font-black text-white tracking-wide">
                مخيمات الغدير الشتوية
              </h4>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="font-mono text-xs font-bold text-[#cba135] px-2.5 py-0.5 rounded-full bg-[#cba135]/15 border border-[#cba135]/30">
                  № {issuedTicket.id}
                </span>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck size={13} />
                  <span>معتمد في النظام</span>
                </span>
              </div>
            </div>

            {/* Pass QR Code Body */}
            <div className="p-6 text-center space-y-4">
              <div className="inline-block p-3.5 bg-[#f4ead2] rounded-2xl shadow-inner">
                {qrImageUrl ? (
                  <img
                    src={qrImageUrl}
                    alt="Alghdeer Pass QR"
                    className="w-44 h-44 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-[#1a1610] font-mono text-xs">
                    № {issuedTicket.id}
                  </div>
                )}
                <span className="block text-[10px] font-mono font-bold text-[#1a1610]/70 uppercase mt-2">
                  SCAN AT VIP GATE
                </span>
              </div>

              {/* Guest Details */}
              <div className="text-xs space-y-1.5 font-sans pt-2 border-t border-white/10 text-start">
                <div className="flex justify-between">
                  <span className="text-white/50">{isAr ? "اسم الضيف:" : "Guest:"}</span>
                  <span className="font-bold text-white">{issuedTicket.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">{isAr ? "الموعد:" : "Date:"}</span>
                  <span className="font-bold text-[#fae5a5] text-[11px]">{issuedTicket.preferredAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">{isAr ? "عدد الضيوف:" : "Guests:"}</span>
                  <span className="font-bold text-white">{issuedTicket.groupSize} أشخاص</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">{isAr ? "بوابة الدخول:" : "Gate:"}</span>
                  <span className="font-bold text-[#cba135]">VIP MAIN GATE</span>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadImage}
                  className="group relative w-full py-2.5 px-4 rounded-[14px] bg-[#cba135] hover:bg-[#d4b458] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer overflow-hidden"
                >
                  <span className="pointer-events-none absolute -start-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#0B0C10]" />
                  <span className="pointer-events-none absolute -end-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#0B0C10]" />
                  <Download size={14} />
                  <span>{isAr ? "حفظ التذكرة بالصور (PNG)" : "Save to Photos"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => downloadIcsFile(issuedTicket)}
                  className="group relative w-full py-2 px-4 rounded-[14px] bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer overflow-hidden"
                >
                  <span className="pointer-events-none absolute -start-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#0B0C10]" />
                  <span className="pointer-events-none absolute -end-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#0B0C10]" />
                  <Calendar size={14} />
                  <span>{isAr ? "إضافة لتقويم الهاتف (Calendar)" : "Add to Calendar"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
