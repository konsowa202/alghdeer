"use client";

import React, { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { minPreferredDatetimeLocal } from "@/lib/format-datetime-local";
import { MIN_LEAD_MS } from "@/lib/bookings-types";
import { CheckCircle2, Star } from "lucide-react";

export default function ContactBookingForm() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [preferredLocal, setPreferredLocal] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const minLocal = useMemo(() => minPreferredDatetimeLocal(MIN_LEAD_MS), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const d = new Date(preferredLocal);
      if (!Number.isFinite(d.getTime())) {
        setError(isAr ? "اختر تاريخاً ووقتاً صالحين." : "Please choose a valid date and time.");
        return;
      }
      if (d.getTime() < Date.now() + MIN_LEAD_MS) {
        setError(
          isAr
            ? "يجب أن يكون الموعد بعد 24 ساعة على الأقل من الآن."
            : "The event must be at least 24 hours from now.",
        );
        return;
      }

      const n = Number(groupSize);
      if (!Number.isFinite(n) || n < 1) {
        setError(isAr ? "أدخل عدداً صحيحاً للضيوف." : "Enter a valid guest count.");
        return;
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim(),
          groupSize: n,
          notes: notes.trim(),
          preferredAt: d.toISOString(),
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(
          data.error ||
            (isAr ? "تعذر إرسال الطلب. حاول مرة أخرى." : "Could not send your request. Please try again."),
        );
        return;
      }

      setDone(true);
      setName("");
      setCompany("");
      setGroupSize("");
      setPreferredLocal("");
      setNotes("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full">
      {/* Outer Ticket Body with Corner Cutout Notches */}
      <div className="relative bg-[#f4ead2] text-[#1a1610] rounded-none shadow-[0_20px_60px_rgba(0,0,0,0.65)] overflow-hidden">
        {/* 4 Outer Corner Semi-Circle Cutouts (matching #0B0C10 footer background) */}
        <span className="pointer-events-none absolute -top-4 -left-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />
        <span className="pointer-events-none absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />
        <span className="pointer-events-none absolute -bottom-4 -left-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />
        <span className="pointer-events-none absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />

        {done ? (
          <div className="p-8 sm:p-12 text-center space-y-4 border-2 border-[#1a1610]/25 m-3 sm:m-4">
            <div className="flex justify-center text-[#8a6412]">
              <CheckCircle2 size={48} strokeWidth={1.75} />
            </div>
            <p className="text-xl sm:text-2xl font-black uppercase tracking-wider text-[#1a1610]">
              {isAr ? "تم إصدار تذكرة طلبك بنجاح" : "VIP TICKET REQUEST ISSUED"}
            </p>
            <p className="text-sm text-[#1a1610]/75 max-w-md mx-auto leading-relaxed">
              {isAr
                ? "تم تسجيل بيانات فعاليتك في مخيمات الغدير، وسيتواصل معك فريق الحجوزات لتأكيد الموعد."
                : "Your event details have been registered. Our bookings team will contact you shortly to confirm."}
            </p>
            <button
              type="button"
              onClick={() => setDone(false)}
              className="mt-2 inline-block px-6 py-2.5 bg-[#1a1610] text-[#f4ead2] text-xs font-bold tracking-widest uppercase"
            >
              {isAr ? "إصدار تذكرة جديدة" : "Issue Another Ticket"}
            </button>
          </div>
        ) : (
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

                {/* Ticket Form Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#1a1610]/65 mb-1">
                      {t("nameLabel")}
                    </label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isAr ? "الاسم الثلاثي" : "Your full name"}
                      className="w-full bg-transparent border-b-2 border-[#1a1610]/25 focus:border-[#b5382a] py-1.5 text-sm font-bold text-[#1a1610] placeholder:text-[#1a1610]/30 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#1a1610]/65 mb-1">
                      {t("companyLabel")}
                    </label>
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder={isAr ? "شركة / عائلة / مناسبة" : "Company or occasion"}
                      className="w-full bg-transparent border-b-2 border-[#1a1610]/25 focus:border-[#b5382a] py-1.5 text-sm font-bold text-[#1a1610] placeholder:text-[#1a1610]/30 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#1a1610]/65 mb-1">
                      {t("groupSizeLabel")}
                    </label>
                    <input
                      required
                      type="number"
                      min={1}
                      value={groupSize}
                      onChange={(e) => setGroupSize(e.target.value)}
                      placeholder={isAr ? "مثال: 50" : "e.g. 50"}
                      className="w-full bg-transparent border-b-2 border-[#1a1610]/25 focus:border-[#b5382a] py-1.5 text-sm font-bold text-[#1a1610] placeholder:text-[#1a1610]/30 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#1a1610]/65 mb-1">
                      {t("dateLabel")}
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
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#1a1610]/65 mb-1">
                    {t("requestsLabel")}
                  </label>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={isAr ? "تفاصيل إضافية أو تجهيزات مطلوبة..." : "Any special setup or catering notes..."}
                    className="w-full bg-transparent border-b-2 border-[#1a1610]/25 focus:border-[#b5382a] py-1.5 text-sm font-bold text-[#1a1610] placeholder:text-[#1a1610]/30 focus:outline-none transition-colors"
                  />
                </div>

                {error ? (
                  <p className="text-[#b5382a] text-xs font-bold mt-3" role="alert">
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
                      {name ? name : isAr ? "ضيف مخيم الغدير" : "Alghdeer VIP Guest"}
                    </p>
                    <p className="text-[11px] text-[#f4ead2]/80">
                      {groupSize
                        ? isAr
                          ? `${groupSize} ضيف`
                          : `${groupSize} Guests`
                        : isAr
                          ? "حجز خاص • جدة"
                          : "Private Event • Jeddah"}
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
                  className="relative group w-full py-3.5 rounded-full bg-gradient-to-r from-[#1a1610] via-[#2c2419] to-[#1a1610] hover:from-[#cba135] hover:to-[#f3da8c] hover:text-black text-[#f4ead2] font-black text-xs tracking-[0.22em] uppercase transition-all duration-300 disabled:opacity-50 shadow-[0_10px_25px_rgba(0,0,0,0.4)] overflow-hidden border border-[#f4ead2]/30 hover:border-[#ffe8a3]"
                >
                  {/* Top Specular Glass Edge */}
                  <span className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (isAr ? "جاري إصدار التذكرة..." : "Issuing Ticket...") : t("submitBtn")}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
