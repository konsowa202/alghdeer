"use client";

import React from "react";
import { MONTHS } from "@/lib/format-date";

/**
 * Day / month-name / year / time selectors instead of the browser's
 * datetime-local picker (which follows the device locale, e.g. 11/20/2026).
 * Value and onChange use the same "YYYY-MM-DDTHH:mm" local string as datetime-local.
 */
export default function DateTimeField({
  value,
  onChange,
  required,
  selectClassName = "",
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  selectClassName?: string;
}) {
  const now = new Date();
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value || "");
  const y = m ? Number(m[1]) : 0;
  const mo = m ? Number(m[2]) : 0;
  const d = m ? Number(m[3]) : 0;
  const h = m ? Number(m[4]) : 19;
  const mi = m ? Number(m[5]) : 0;

  const emit = (next: Partial<{ y: number; mo: number; d: number; h: number; mi: number }>) => {
    const v = { y: y || now.getFullYear(), mo: mo || now.getMonth() + 1, d: d || now.getDate(), h, mi, ...next };
    const dim = new Date(v.y, v.mo, 0).getDate();
    v.d = Math.min(v.d, dim);
    const p = (n: number) => String(n).padStart(2, "0");
    onChange(`${v.y}-${p(v.mo)}-${p(v.d)}T${p(v.h)}:${p(v.mi)}`);
  };

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 1 + i);
  if (y && !years.includes(y)) years.unshift(y);
  const daysIn = new Date(y || now.getFullYear(), mo || now.getMonth() + 1, 0).getDate();
  const h12 = h % 12 || 12;
  const pm = h >= 12;
  const minutes = [0, 15, 30, 45].includes(mi) ? [0, 15, 30, 45] : [0, 15, 30, 45, mi].sort((a, b) => a - b);
  const cls = `rounded-xl border border-white/10 bg-[#14151b] px-2.5 py-3 text-sm text-white outline-none [color-scheme:dark] focus:border-[#cba135]/60 ${selectClassName}`;

  return (
    <div className="flex flex-wrap items-center gap-1.5" dir="ltr">
      <select aria-label="Day" required={required} className={cls} value={d || ""} onChange={(e) => emit({ d: Number(e.target.value) })}>
        <option value="" disabled>Day</option>
        {Array.from({ length: daysIn }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      <select aria-label="Month" required={required} className={cls} value={mo || ""} onChange={(e) => emit({ mo: Number(e.target.value) })}>
        <option value="" disabled>Month</option>
        {MONTHS.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
      </select>
      <select aria-label="Year" required={required} className={cls} value={y || ""} onChange={(e) => emit({ y: Number(e.target.value) })}>
        <option value="" disabled>Year</option>
        {years.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      <span className="px-1 text-white/25">·</span>
      <select aria-label="Hour" className={cls} value={h12} onChange={(e) => emit({ h: (Number(e.target.value) % 12) + (pm ? 12 : 0) })}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      <select aria-label="Minute" className={cls} value={mi} onChange={(e) => emit({ mi: Number(e.target.value) })}>
        {minutes.map((n) => <option key={n} value={n}>{String(n).padStart(2, "0")}</option>)}
      </select>
      <select aria-label="AM/PM" className={cls} value={pm ? "PM" : "AM"} onChange={(e) => emit({ h: (h % 12) + (e.target.value === "PM" ? 12 : 0) })}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
