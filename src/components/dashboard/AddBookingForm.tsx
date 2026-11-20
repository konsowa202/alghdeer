"use client";

import React, { useState } from "react";
import type { BookingStatus } from "@/lib/bookings-types";
import { BOOKING_STATUS_LABELS } from "@/lib/bookings-types";
import type { BookingsController } from "./booking-shared";
import DateTimeField from "./DateTimeField";
import GuestFields from "./GuestFields";
import { guestTotal, type GuestBreakdown } from "@/lib/guests";

const inputCls =
  "w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cba135]";
const labelCls = "block text-white/40 text-xs tracking-wider mb-2";

export default function AddBookingForm({
  controller,
  onDone,
}: {
  controller: BookingsController;
  onDone?: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [guests, setGuests] = useState<GuestBreakdown>({ adults: 0, children: 0, extras: 0 });
  const [preferredLocal, setPreferredLocal] = useState("");
  const [notes, setNotes] = useState("");
  const [addStatus, setAddStatus] = useState<BookingStatus>("pending");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    const n = guestTotal(guests);
    if (n < 1) {
      setAddError("أدخل عدد الكبار أو الأطفال أو المرافقين.");
      return;
    }
    if (!preferredLocal) {
      setAddError("اختر تاريخ ووقت المناسبة.");
      return;
    }
    setAdding(true);
    try {
      const result = await controller.addBooking({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        company: company.trim(),
        groupSize: n,
        guestBreakdown: guests,
        preferredLocal,
        notes: notes.trim(),
        status: addStatus,
      });
      if (!result.ok) {
        setAddError(result.error || "فشل الحفظ.");
        return;
      }
      setName("");
      setPhone("");
      setEmail("");
      setCompany("");
      setGuests({ adults: 0, children: 0, extras: 0 });
      setPreferredLocal("");
      setNotes("");
      setAddStatus("pending");
      onDone?.();
    } finally {
      setAdding(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6"
      dir="rtl"
    >
      <div>
        <label className={labelCls}>اسم العميل</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>رقم الجوال / الواتساب</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="05xxxxxxxx"
          dir="ltr"
          className={`${inputCls} text-right font-mono`}
        />
      </div>
      <div>
        <label className={labelCls}>البريد الإلكتروني</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@email.com"
          dir="ltr"
          className={`${inputCls} text-right`}
        />
      </div>
      <div>
        <label className={labelCls}>الشركة / الجهة</label>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>عدد الأشخاص</label>
        <GuestFields value={guests} onChange={setGuests} inputClassName={inputCls} labelClassName={labelCls} />
      </div>
      <div>
        <label className={labelCls}>تاريخ ووقت المناسبة</label>
        <DateTimeField required value={preferredLocal} onChange={setPreferredLocal} />
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>ملاحظات وطلبات خاصة</label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${inputCls} resize-none`}
        />
      </div>
      <div className="md:col-span-2 flex flex-wrap items-end gap-4">
        <div className="min-w-[180px] flex-1 md:flex-none">
          <label className={labelCls}>الحالة عند الإدخال</label>
          <select
            value={addStatus}
            onChange={(e) => setAddStatus(e.target.value as BookingStatus)}
            className={`${inputCls} bg-[#14151b] [color-scheme:dark]`}
          >
            {(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map((k) => (
              <option key={k} value={k} className="bg-[#14151b] text-white">
                {BOOKING_STATUS_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={adding}
          className="px-8 py-3 bg-[#cba135] text-black font-bold rounded-lg hover:bg-[#d4b458] transition-colors disabled:opacity-50"
        >
          {adding ? "جاري الحفظ…" : "حفظ في النظام"}
        </button>
      </div>
      {addError ? (
        <p className="text-red-400 text-sm md:col-span-2">{addError}</p>
      ) : null}
    </form>
  );
}
