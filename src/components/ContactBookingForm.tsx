"use client";

import React, { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { minPreferredDatetimeLocal } from "@/lib/format-datetime-local";
import { MIN_LEAD_MS } from "@/lib/bookings-types";
import { CheckCircle2, Star, MessageCircle, ArrowRight, ExternalLink } from "lucide-react";

interface IssuedTicket {
  id: string;
  name: string;
  phone: string;
  company?: string;
  groupSize: number;
  preferredAt: string;
}

export default function ContactBookingForm() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [preferredLocal, setPreferredLocal] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [issuedTicket, setIssuedTicket] = useState<IssuedTicket | null>(null);

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

      if (!phone.trim() || phone.trim().length < 8) {
        setError(isAr ? "أدخل رقم جوال صحيح للتواصل وتأكيد الحجز." : "Enter a valid phone number.");
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
          phone: phone.trim(),
          email: email.trim(),
          company: company.trim(),
          groupSize: n,
          notes: notes.trim(),
          preferredAt: d.toISOString(),
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        id?: string;
        name?: string;
        phone?: string;
        groupSize?: number;
        preferredAt?: string;
        error?: string;
      };

      if (!res.ok || !data.id) {
        setError(
          data.error ||
            (isAr ? "تعذر إرسال الطلب. حاول مرة أخرى." : "Could not send your request. Please try again."),
        );
        return;
      }

      setIssuedTicket({
        id: data.id,
        name: name.trim(),
        phone: phone.trim(),
        company: company.trim(),
        groupSize: n,
        preferredAt: d.toLocaleString(isAr ? "ar-SA" : "en-US", {
          dateStyle: "full",
          timeStyle: "short",
        }),
      });
      setName("");
      setPhone("");
      setEmail("");
      setCompany("");
      setGroupSize("");
      setPreferredLocal("");
      setNotes("");
    } finally {
      setLoading(false);
    }
  }

  const ticketNumber = issuedTicket
    ? `ALG-${issuedTicket.id.slice(0, 8).toUpperCase()}`
    : "2026";

  const whatsappMessage = issuedTicket
    ? encodeURIComponent(
        `مرحباً مخيمات الغدير 🏕️\nأود تأكيد حجز تذكرتي الصادرة عبر الموقع برقم:\n№ ${ticketNumber}\n• الاسم: ${issuedTicket.name}\n• رقم الجوال: ${issuedTicket.phone}\n• موعد الفعالية: ${issuedTicket.preferredAt}\n• عدد الضيوف: ${issuedTicket.groupSize} شخص\n${issuedTicket.company ? `• الجهة: ${issuedTicket.company}\n` : ""}يرجى تأكيد الحجز وإرسال تفاصيل التجهيزات والموقع.`
      )
    : "";

  return (
    <div className="relative w-full">
      {/* Outer Perforated Ticket Body */}
      <div className="relative bg-[#f4ead2] text-[#1a1610] rounded-none shadow-[0_20px_60px_rgba(0,0,0,0.65)] overflow-hidden">
        {/* Corner Cutout Notches */}
        <span className="pointer-events-none absolute -top-4 -left-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />
        <span className="pointer-events-none absolute -top-4 -right-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />
        <span className="pointer-events-none absolute -bottom-4 -left-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />
        <span className="pointer-events-none absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-[#0B0C10] z-20" />

        {issuedTicket ? (
          /* ============================================================ */
          /* TICKET ISSUED SUCCESS VIEW                                   */
          /* Shows where the ticket went + instant WhatsApp dispatch      */
          /* ============================================================ */
          <div className="p-6 sm:p-10 md:p-12 text-center border-2 border-[#1a1610]/25 m-3 sm:m-4 space-y-6">
            <div className="flex justify-center text-[#8a6412]">
              <CheckCircle2 size={54} strokeWidth={1.75} />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-[#1a1610] text-[#f4ead2] text-xs font-mono font-bold tracking-widest uppercase mb-2">
                № {ticketNumber} • VIP PASS
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wider text-[#1a1610]">
                {isAr ? "تم إصدار وحفظ تذكرتك بنجاح" : "YOUR VIP TICKET IS ISSUED"}
              </h3>
            </div>

            {/* Issued Ticket Summary Card */}
            <div className="max-w-lg mx-auto bg-white/60 border border-[#1a1610]/20 p-5 sm:p-6 text-start space-y-3 font-sans">
              <div className="flex justify-between items-center border-b border-[#1a1610]/15 pb-2">
                <span className="text-xs text-[#1a1610]/70 font-bold">{isAr ? "رقم التذكرة:" : "Ticket No:"}</span>
                <span className="font-mono font-bold text-[#b5382a]">{ticketNumber}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1a1610]/15 pb-2">
                <span className="text-xs text-[#1a1610]/70 font-bold">{isAr ? "اسم الضيف:" : "Guest Name:"}</span>
                <span className="font-bold text-[#1a1610]">{issuedTicket.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1a1610]/15 pb-2">
                <span className="text-xs text-[#1a1610]/70 font-bold">{isAr ? "رقم الجوال:" : "Phone:"}</span>
                <span dir="ltr" className="font-mono font-bold text-[#1a1610]">{issuedTicket.phone}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1a1610]/15 pb-2">
                <span className="text-xs text-[#1a1610]/70 font-bold">{isAr ? "تاريخ الفعالية:" : "Event Date:"}</span>
                <span className="font-bold text-xs text-[#1a1610]">{issuedTicket.preferredAt}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#1a1610]/70 font-bold">{isAr ? "عدد الضيوف:" : "Guests:"}</span>
                <span className="font-bold text-[#1a1610]">{issuedTicket.groupSize} {isAr ? "شخص" : "guests"}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#1a1610]/80 max-w-lg mx-auto leading-relaxed">
              {isAr
                ? "تم تسجيل تذكرتك رسمياً في نظام حجوزات مخيمات الغدير. لتسريع التأكيد الفوري واستلام تفاصيل الموقع وخيارات البوفيه، اضغط على الزر أدناه لإرسال التذكرة مباشرة إلى واتساب الإدارة."
                : "Your ticket has been registered in Alghdeer Camp reservations. Click below to confirm via WhatsApp with our reservations team."}
            </p>

            {/* Direct WhatsApp Action Button */}
            <div className="max-w-md mx-auto space-y-3">
              <a
                href={`https://wa.me/966544493991?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#1faa53] text-black font-black text-sm tracking-wider uppercase rounded-full shadow-lg transition-all"
              >
                <MessageCircle size={20} className="fill-black text-transparent" />
                <span>{isAr ? "إرسال التذكرة ومتابعة الحجز واتساب" : "Confirm via WhatsApp Now"}</span>
              </a>

              <button
                type="button"
                onClick={() => setIssuedTicket(null)}
                className="w-full py-2.5 text-xs text-[#1a1610]/70 hover:text-[#1a1610] underline font-bold tracking-wider"
              >
                {isAr ? "إصدار تذكرة إضافية" : "Issue Another Ticket"}
              </button>
            </div>

            {/* Staff / Management Access Notice */}
            <div className="pt-4 border-t border-[#1a1610]/15 text-[11px] text-[#1a1610]/60">
              <span>{isAr ? "إدارة المخيم: يمكن مراجعة وتحديث كافة التذاكر المسجلة عبر " : "Staff: Manage all bookings in "}</span>
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

                {/* Ticket Form Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#1a1610]/65 mb-1">
                      {isAr ? "الاسم الكريم *" : "Full Name *"}
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
                      {isAr ? "رقم الجوال / الواتساب *" : "Phone / WhatsApp *"}
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={isAr ? "05xxxxxxxx" : "+966 5x xxx xxxx"}
                      dir="ltr"
                      className="w-full bg-transparent border-b-2 border-[#1a1610]/25 focus:border-[#b5382a] py-1.5 text-sm font-bold text-[#1a1610] placeholder:text-[#1a1610]/30 focus:outline-none transition-colors text-right rtl:text-right ltr:text-left font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#1a1610]/65 mb-1">
                      {isAr ? "الشركة أو المناسبة (اختياري)" : "Company / Occasion"}
                    </label>
                    <input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder={isAr ? "شركة / عائلة / تخرج" : "Company or occasion"}
                      className="w-full bg-transparent border-b-2 border-[#1a1610]/25 focus:border-[#b5382a] py-1.5 text-sm font-bold text-[#1a1610] placeholder:text-[#1a1610]/30 focus:outline-none transition-colors"
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
                      placeholder={isAr ? "name@example.com" : "name@example.com"}
                      dir="ltr"
                      className="w-full bg-transparent border-b-2 border-[#1a1610]/25 focus:border-[#b5382a] py-1.5 text-sm font-bold text-[#1a1610] placeholder:text-[#1a1610]/30 focus:outline-none transition-colors text-right rtl:text-right ltr:text-left font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
                      placeholder={isAr ? "مثال: 50" : "e.g. 50"}
                      className="w-full bg-transparent border-b-2 border-[#1a1610]/25 focus:border-[#b5382a] py-1.5 text-sm font-bold text-[#1a1610] placeholder:text-[#1a1610]/30 focus:outline-none transition-colors"
                    />
                  </div>
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
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-[0.18em] uppercase text-[#1a1610]/65 mb-1">
                    {t("requestsLabel")}
                  </label>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={isAr ? "تفاصيل إضافية أو تجهيزات مطلوبة (بوفيه، قاعة زجاجية، شواء...)" : "Special setup, catering, or VIP lounge notes..."}
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
                      {phone ? phone : isAr ? "رقم الجوال للتأكيد" : "Phone required"}
                    </p>
                    <p className="text-[11px] text-[#f4ead2]/80">
                      {groupSize
                        ? isAr
                          ? `${groupSize} ضيف`
                          : `${groupSize} Guests`
                        : isAr
                          ? "حجز خاص • بريمان"
                          : "Private Event • Burayman"}
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
                  className="w-full py-3.5 rounded-full bg-[#1a1610] hover:bg-black text-[#f4ead2] font-black text-xs tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-50 shadow-lg border border-[#f4ead2]/25"
                >
                  {loading ? (isAr ? "جاري إصدار التذكرة..." : "Issuing...") : (isAr ? "إصدار التذكرة الآن" : "Issue Ticket Now")}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
