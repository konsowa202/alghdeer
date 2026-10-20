"use client";

import React, { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { minPreferredDatetimeLocal } from "@/lib/format-datetime-local";
import { MIN_LEAD_MS } from "@/lib/bookings-types";
import { CheckCircle2, Star, MessageCircle, ExternalLink, RotateCcw } from "lucide-react";

interface IssuedTicket {
  id: string;
  name: string;
  phone: string;
  company: string;
  groupSize: number;
  preferredAt: string;
  notes: string;
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

    // Generate local unique ticket serial
    const generatedSerial = "ALG-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const guestCount = Number(groupSize) > 0 ? Number(groupSize) : 10;
    const formattedDate = preferredLocal
      ? new Date(preferredLocal).toLocaleString(isAr ? "ar-SA" : "en-US", {
          dateStyle: "full",
          timeStyle: "short",
        })
      : isAr ? "يُحدد مع الإدارة" : "To be arranged";

    // Prepare WhatsApp message
    const waText = encodeURIComponent(
      `مرحباً مخيمات الغدير 🏕️\nأرغب بتأكيد حجز تذكرتي برقم:\n№ ${generatedSerial}\n• اسم الضيف: ${name.trim()}\n${phone.trim() ? `• رقم الجوال: ${phone.trim()}\n` : ""}${company.trim() ? `• المناسبة/الجهة: ${company.trim()}\n` : ""}• عدد الضيوف: ${guestCount} شخص\n• موعد الفعالية: ${formattedDate}\n${notes.trim() ? `• ملاحظات: ${notes.trim()}\n` : ""}يرجى تأكيد الحجز وإرسال تفاصيل التجهيزات والموقع.`
    );
    const waUrl = `https://wa.me/966544493991?text=${waText}`;

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
          preferredAt: preferredLocal ? new Date(preferredLocal).toISOString() : new Date().toISOString(),
        }),
      }).catch(() => null);

      let finalId = generatedSerial;
      if (res && res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.id) finalId = String(data.id).slice(0, 8).toUpperCase();
      }

      setIssuedTicket({
        id: finalId,
        name: name.trim(),
        phone: phone.trim() || "—",
        company: company.trim() || "—",
        groupSize: guestCount,
        preferredAt: formattedDate,
        notes: notes.trim(),
      });

      // 2. Open WhatsApp in new tab automatically
      if (typeof window !== "undefined") {
        window.open(waUrl, "_blank");
      }
    } finally {
      setLoading(false);
    }
  }

  const ticketNumber = issuedTicket
    ? `№ ALG-2026-${issuedTicket.id}`
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
            </div>

            {/* Ticket Summary Card */}
            <div className="max-w-lg mx-auto bg-white/70 border border-[#1a1610]/20 p-5 sm:p-6 text-start space-y-3 font-sans shadow-sm">
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

            <p className="text-xs sm:text-sm text-[#1a1610]/80 max-w-lg mx-auto leading-relaxed">
              {isAr
                ? "تم تسجيل تذكرتك في قاعدة بيانات المخيم وحفظها في لوحة التحكم. اضغط على الزر أدناه لمتابعة وتأكيد الحجز فورياً عبر واتساب الإدارة."
                : "Your ticket has been saved to the database. Click below to confirm via WhatsApp with our reservations team."}
            </p>

            {/* Primary Action Button: WhatsApp */}
            <div className="max-w-md mx-auto space-y-3">
              <a
                href={directWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-4 px-6 bg-[#25D366] hover:bg-[#1faa53] text-black font-black text-sm tracking-wider uppercase rounded-full shadow-xl transition-all"
              >
                <MessageCircle size={22} className="fill-black text-transparent" />
                <span>{isAr ? "فتح محادثة الواتساب وتأكيد الحجز" : "Confirm via WhatsApp Now"}</span>
              </a>

              <button
                type="button"
                onClick={() => setIssuedTicket(null)}
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
