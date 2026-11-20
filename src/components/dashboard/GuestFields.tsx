"use client";

import React from "react";
import { guestTotal, type GuestBreakdown } from "@/lib/guests";

/** Adults / children / extra people (maids, drivers) with a live total. */
export default function GuestFields({
  value,
  onChange,
  inputClassName,
  labelClassName,
}: {
  value: GuestBreakdown;
  onChange: (v: GuestBreakdown) => void;
  inputClassName: string;
  labelClassName: string;
}) {
  const field = (key: keyof GuestBreakdown, label: string, hint?: string) => (
    <label className="min-w-0">
      <span className={labelClassName}>
        {label}
        {hint ? <span className="text-white/25"> {hint}</span> : null}
      </span>
      <input
        type="number"
        min={0}
        max={5000}
        inputMode="numeric"
        value={value[key] || ""}
        placeholder="0"
        onChange={(e) => onChange({ ...value, [key]: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
        className={`${inputClassName} [color-scheme:dark]`}
      />
    </label>
  );
  const total = guestTotal(value);
  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {field("adults", "الكبار")}
        {field("children", "الأطفال")}
        {field("extras", "مرافقين", "(عاملات/سائقين)")}
      </div>
      <p className="mt-1.5 text-[11px] text-white/40">
        الإجمالي: <b className="text-[#e5c979]">{total}</b> شخص
      </p>
    </div>
  );
}
