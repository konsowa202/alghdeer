"use client";

import React, { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { minPreferredDatetimeLocal } from "@/lib/format-datetime-local";
import { MIN_LEAD_MS } from "@/lib/bookings-types";
import { CheckCircle2 } from "lucide-react";

export default function ContactBookingForm() {
  const { t, lang } = useLanguage();
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
        setError(
          lang === "ar"
            ? "اختر تاريخاً ووقتاً صالحين."
            : "Please choose a valid date and time."
        );
        return;
      }
      if (d.getTime() < Date.now() + MIN_LEAD_MS) {
        setError(
          lang === "ar"
            ? "يجب أن يكون الموعد بعد 24 ساعة على الأقل من الآن."
            : "The event must be at least 24 hours from now."
        );
        return;
      }

      const n = Number(groupSize);
      if (!Number.isFinite(n) || n < 1) {
        setError(
          lang === "ar" ? "أدخل عدداً صحيحاً للمجموعة." : "Enter a valid group size."
        );
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

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!res.ok) {
        setError(
          data.error ||
            (lang === "ar"
              ? "تعذر إرسال الطلب. حاول مرة أخرى."
              : "Could not send your request. Please try again.")
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

  if (done) {
    return (
      <div
        className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-8 text-center space-y-4"
        role="status"
      >
        <div className="flex justify-center text-emerald-400">
          <CheckCircle2 size={48} strokeWidth={1.5} />
        </div>
        <p className="text-emerald-100 text-lg font-bold">
          {lang === "ar" ? "اكتمال الطلب" : "Request complete"}
        </p>
        <p className="text-emerald-200/90 text-sm leading-relaxed">
          {lang === "ar"
            ? "تم استلام طلبك بنجاح. سيتم مراجعته في لوحة الحجوزات وسنتواصل معك قريباً."
            : "Your request was received successfully. Our team will review it and contact you shortly."}
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="text-emerald-300/80 hover:text-emerald-200 text-xs tracking-widest uppercase underline underline-offset-4"
        >
          {lang === "ar" ? "إرسال طلب آخر" : "Send another request"}
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-5 sm:space-y-6" onSubmit={onSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        <div>
          <label className="block text-white/40 text-xs tracking-widest uppercase mb-2 sm:mb-3">
            {t("nameLabel")}
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border-b border-white/10 pb-3 text-white text-sm focus:outline-none focus:border-white/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-white/40 text-xs tracking-widest uppercase mb-2 sm:mb-3">
            {t("companyLabel")}
          </label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full bg-transparent border-b border-white/10 pb-3 text-white text-sm focus:outline-none focus:border-white/50 transition-colors"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        <div>
          <label className="block text-white/40 text-xs tracking-widest uppercase mb-2 sm:mb-3">
            {t("groupSizeLabel")}
          </label>
          <input
            required
            type="number"
            min={1}
            value={groupSize}
            onChange={(e) => setGroupSize(e.target.value)}
            className="w-full bg-transparent border-b border-white/10 pb-3 text-white text-sm focus:outline-none focus:border-white/50 transition-colors [color-scheme:dark]"
          />
        </div>
        <div>
          <label className="block text-white/40 text-[10px] sm:text-xs tracking-widest uppercase mb-2 sm:mb-3">
            {lang === "ar"
              ? "تاريخ ووقت المناسبة"
              : "Event date & time"}
          </label>
          <input
            required
            type="datetime-local"
            min={minLocal}
            value={preferredLocal}
            onChange={(e) => setPreferredLocal(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-2 text-white text-sm focus:outline-none focus:border-white/50 transition-colors [color-scheme:dark]"
          />
          <p className="text-white/35 text-[10px] sm:text-xs mt-2 leading-relaxed">
            {lang === "ar"
              ? "الحد الأدنى: موعد بعد 24 ساعة من لحظة الإرسال (حسب توقيت جهازك)."
              : "Minimum lead time: 24 hours from when you submit (your device time)."}
          </p>
        </div>
      </div>
      <div>
        <label className="block text-white/40 text-[10px] sm:text-xs tracking-widest uppercase mb-2 sm:mb-3">
          {t("requestsLabel")}
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full bg-transparent border-b border-white/10 pb-3 text-white text-sm focus:outline-none focus:border-white/50 transition-colors resize-none"
        />
      </div>
      {error ? (
        <p className="text-red-400 text-sm" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 px-8 sm:px-10 py-3.5 sm:py-4 bg-white text-black font-bold tracking-widest uppercase hover:bg-white/90 transition-all text-xs sm:text-sm w-full sm:w-auto disabled:opacity-50"
      >
        {loading
          ? lang === "ar"
            ? "جاري الإرسال…"
            : "Sending…"
          : t("submitBtn")}
      </button>
    </form>
  );
}
