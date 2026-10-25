"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Ban,
  BellRing,
  CalendarDays,
  Check,
  ChevronLeft,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Inbox,
  ListFilter,
  Loader2,
  MessageCircle,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  StickyNote,
  UsersRound,
} from "lucide-react";
import type { BookingRecord, BookingStatus } from "@/lib/bookings-types";
import {
  BOOKING_FLOW_STATUSES,
  BOOKING_STATUS_LABELS,
} from "@/lib/bookings-types";
import {
  buildBookingAnalytics,
  getBookingLastActivityAt,
} from "@/lib/bookings-analytics";
import {
  formatCreated,
  formatWhen,
  useBookingsController,
  waHref,
  type BookingsController,
} from "./booking-shared";
import { STATUS_COLORS } from "./charts";
import BookingDetailSheet from "./BookingDetailSheet";

const COLUMNS: {
  status: BookingStatus;
  shortLabel: string;
  description: string;
}[] = [
  { status: "pending", shortLabel: "المراجعة", description: "التحقق من الطلب والتواصل مع العميل" },
  { status: "confirmed", shortLabel: "مؤكد", description: "الموعد مؤكد مع العميل" },
  { status: "deposit", shortLabel: "الديبوزيت", description: "تم استلام المقدم" },
  { status: "completed", shortLabel: "مكتمل", description: "تم تنفيذ المناسبة" },
  { status: "cancelled", shortLabel: "ملغى", description: "طلبات خارج المسار النشط" },
];

export default function PipelinePanel() {
  const controller = useBookingsController();
  const { rows, loading, loadError, unauthorized, newCount, clearNewCount, refresh } = controller;
  const [query, setQuery] = useState("");
  const [activeStage, setActiveStage] = useState<BookingStatus>("pending");
  const [selected, setSelected] = useState<BookingRecord | null>(null);
  const analytics = useMemo(() => buildBookingAnalytics(rows), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result = !q
      ? rows
      : rows.filter((row) =>
          [row.id, row.name, row.phone, row.company, row.email ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(q)
        );
    return [...result].sort((a, b) => {
      if (a.status === "completed" || a.status === "cancelled") {
        return Date.parse(getBookingLastActivityAt(b)) - Date.parse(getBookingLastActivityAt(a));
      }
      return Date.parse(a.preferredAt) - Date.parse(b.preferredAt);
    });
  }, [rows, query]);

  const selectedLive = selected
    ? rows.find((row) => row.id === selected.id) ?? selected
    : null;

  if (unauthorized) {
    return (
      <div className="max-w-md mx-auto mt-16 rounded-2xl bg-red-500/10 border border-red-500/25 p-8 text-center">
        <p className="text-red-300 font-bold mb-4">انتهت الجلسة. سجل الدخول للمتابعة.</p>
        <Link href="/dashboard/login" className="inline-block px-6 py-2.5 bg-[#cba135] text-black font-bold rounded-lg">تسجيل الدخول</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto space-y-5 pb-24 md:pb-0">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1 pt-1">
        <div>
          <p className="text-[#d4b458] text-[11px] font-bold mb-1.5">مسار العمل</p>
          <h1 className="text-2xl md:text-3xl text-white font-bold">من أول طلب لحد تنفيذ المناسبة</h1>
          <p className="text-white/40 text-xs md:text-sm mt-2">كل بطاقة هي حجز حقيقي. انقله للخطوة التالية بعد إتمام إجرائها، وافتحه لعرض السجل الكامل.</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button type="button" onClick={() => void refresh()} className="h-10 px-3.5 rounded-xl bg-white/[0.06] border border-white/10 text-white/65 hover:text-white text-xs font-bold inline-flex items-center gap-2">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            تحديث
          </button>
          <Link href="/dashboard/bookings" className="h-10 px-4 rounded-xl bg-[#cba135] text-black hover:bg-[#d4b458] text-xs font-black inline-flex items-center gap-2">
            <Plus size={16} />
            حجز يدوي
          </Link>
        </div>
      </section>

      {newCount > 0 ? (
        <button type="button" onClick={clearNewCount} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-sm font-bold">
          <BellRing size={17} />
          {newCount === 1 ? "وصل طلب جديد إلى أول المسار" : `وصل ${newCount} طلبات جديدة إلى أول المسار`}
        </button>
      ) : null}
      {loadError ? <p className="rounded-xl border border-red-500/25 bg-red-500/10 text-red-300 text-xs p-3.5">{loadError}</p> : null}
      {controller.mutationError ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-500/25 bg-red-500/10 text-red-300 text-xs p-3.5">
          <span>{controller.mutationError}</span>
          <button type="button" onClick={controller.clearMutationError} className="text-white/60 hover:text-white">إغلاق</button>
        </div>
      ) : null}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5" aria-label="ملخص مسار التحويل">
        {analytics.flow.map((stage, index) => {
          const icons = [Inbox, ClipboardCheck, CircleDollarSign, Check];
          const Icon = icons[index]!;
          return (
            <button
              key={stage.status}
              type="button"
              onClick={() => setActiveStage(stage.status)}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121318] p-3.5 text-right hover:border-white/20 transition-colors"
            >
              <span className="absolute inset-x-0 top-0 h-0.5" style={{ backgroundColor: STATUS_COLORS[stage.status] }} />
              <span className="flex items-center justify-between gap-2">
                <span className="text-white/45 text-[11px]">{BOOKING_STATUS_LABELS[stage.status]}</span>
                <Icon size={16} style={{ color: STATUS_COLORS[stage.status] }} />
              </span>
              <span className="flex items-end gap-2 mt-2.5">
                <strong className="text-2xl text-white tabular-nums">{stage.count}</strong>
                <span className="text-white/30 text-[10px] mb-1">وصلوا للمرحلة · {stage.percentage}%</span>
              </span>
            </button>
          );
        })}
      </section>

      <div className="relative max-w-xl">
        <Search size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ابحث داخل المسار بالاسم أو الجوال أو رقم التذكرة…"
          className="w-full ps-10 pe-4 py-3 rounded-xl bg-[#121318] border border-white/10 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#cba135]"
        />
      </div>

      <section className="hidden lg:grid lg:grid-cols-5 gap-3 items-start">
        {COLUMNS.map((column) => (
          <PipelineColumn
            key={column.status}
            column={column}
            bookings={filtered.filter((row) => row.status === column.status)}
            loading={loading && rows.length === 0}
            controller={controller}
            onOpen={setSelected}
          />
        ))}
      </section>

      <section className="lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {COLUMNS.map((column) => {
            const count = filtered.filter((row) => row.status === column.status).length;
            const active = activeStage === column.status;
            return (
              <button
                key={column.status}
                type="button"
                onClick={() => setActiveStage(column.status)}
                className={`shrink-0 min-w-[96px] px-3 py-2.5 rounded-xl border text-xs font-bold transition-colors ${active ? "text-black border-transparent" : "bg-[#121318] border-white/10 text-white/50"}`}
                style={active ? { backgroundColor: STATUS_COLORS[column.status] } : undefined}
              >
                {column.shortLabel}
                <span className={`ms-1.5 ${active ? "text-black/60" : "text-white/30"}`}>{count}</span>
              </button>
            );
          })}
        </div>
        <PipelineColumn
          column={COLUMNS.find((column) => column.status === activeStage)!}
          bookings={filtered.filter((row) => row.status === activeStage)}
          loading={loading && rows.length === 0}
          controller={controller}
          onOpen={setSelected}
          mobile
        />
      </section>

      {selectedLive ? (
        <BookingDetailSheet booking={selectedLive} controller={controller} onClose={() => setSelected(null)} sheet={false} />
      ) : null}
    </div>
  );
}

function PipelineColumn({
  column,
  bookings,
  loading,
  controller,
  onOpen,
  mobile = false,
}: {
  column: (typeof COLUMNS)[number];
  bookings: BookingRecord[];
  loading: boolean;
  controller: BookingsController;
  onOpen: (booking: BookingRecord) => void;
  mobile?: boolean;
}) {
  return (
    <div className={`rounded-2xl border border-white/[0.08] bg-white/[0.025] ${mobile ? "min-h-[420px]" : "min-w-0"}`}>
      <header className="p-3.5 border-b border-white/[0.07]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[column.status] }} />
          <h2 className="text-white text-xs font-bold flex-1">{BOOKING_STATUS_LABELS[column.status]}</h2>
          <span className="min-w-6 h-6 px-1.5 rounded-md bg-white/[0.06] text-white/50 text-[11px] flex items-center justify-center tabular-nums">{bookings.length}</span>
        </div>
        <p className="text-white/25 text-[9px] mt-1.5 leading-relaxed">{column.description}</p>
      </header>
      <div className={`p-2.5 space-y-2.5 ${mobile ? "max-h-none" : "max-h-[65vh] overflow-y-auto"}`}>
        {loading ? (
          <div className="space-y-2.5">{[0, 1, 2].map((item) => <div key={item} className="h-40 rounded-xl bg-white/[0.04] animate-pulse" />)}</div>
        ) : bookings.length === 0 ? (
          <div className="min-h-36 flex flex-col items-center justify-center text-center border border-dashed border-white/[0.07] rounded-xl p-4">
            <ListFilter size={20} className="text-white/15 mb-2" />
            <p className="text-white/25 text-[11px]">لا توجد حجوزات في هذه المرحلة</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <PipelineCard key={booking.id} booking={booking} controller={controller} onOpen={() => onOpen(booking)} />
          ))
        )}
      </div>
    </div>
  );
}

function PipelineCard({
  booking,
  controller,
  onOpen,
}: {
  booking: BookingRecord;
  controller: BookingsController;
  onOpen: () => void;
}) {
  const busy = controller.busyId === booking.id;
  const flowIndex = BOOKING_FLOW_STATUSES.indexOf(booking.status as (typeof BOOKING_FLOW_STATUSES)[number]);
  const previous = flowIndex > 0 ? BOOKING_FLOW_STATUSES[flowIndex - 1]! : null;
  const next = flowIndex >= 0 && flowIndex < BOOKING_FLOW_STATUSES.length - 1 ? BOOKING_FLOW_STATUSES[flowIndex + 1]! : null;
  const isStale = booking.status === "pending" && Date.now() - Date.parse(booking.createdAt) >= 24 * 60 * 60 * 1000;
  const wa = waHref(booking.phone);

  return (
    <article className={`rounded-xl border bg-[#16171d] overflow-hidden ${isStale ? "border-amber-500/35" : "border-white/[0.09]"}`}>
      <button type="button" onClick={onOpen} className="w-full text-right p-3.5 hover:bg-white/[0.025] transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-white text-sm font-bold truncate">{booking.name}</h3>
              {booking.notes ? <StickyNote size={12} className="text-amber-400/70 shrink-0" /> : null}
            </div>
            <p className="text-[#d4b458]/70 text-[9px] font-mono mt-1" dir="ltr">{booking.id}</p>
          </div>
          <ChevronLeft size={15} className="text-white/20 shrink-0" />
        </div>
        <p className="text-white/40 text-[10px] truncate mt-2.5">{booking.company}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3 text-[10px] text-white/45">
          <span className="inline-flex items-center gap-1"><CalendarDays size={12} />{formatWhen(booking.preferredAt)}</span>
          <span className="inline-flex items-center gap-1"><UsersRound size={12} />{booking.groupSize}</span>
        </div>
      </button>

      <div className="px-3.5 pb-2.5 flex items-center justify-between gap-2 text-[9px] text-white/25">
        <span className="inline-flex items-center gap-1"><Clock3 size={11} />آخر حركة: {formatCreated(getBookingLastActivityAt(booking))}</span>
        {isStale ? <span className="inline-flex items-center gap-1 text-amber-400"><AlertTriangle size={11} />متأخر</span> : null}
      </div>

      <div className="flex items-center gap-1.5 border-t border-white/[0.065] p-2">
        {booking.status === "cancelled" ? (
          <button type="button" disabled={busy} onClick={() => void controller.setStatus(booking.id, "pending")} className="flex-1 h-8 rounded-lg bg-white/[0.06] hover:bg-white/10 text-white/65 text-[10px] font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-40">
            <RotateCcw size={12} />إعادة للمراجعة
          </button>
        ) : (
          <>
            {previous ? (
              <button type="button" disabled={busy} onClick={() => void controller.setStatus(booking.id, previous)} title={`رجوع إلى ${BOOKING_STATUS_LABELS[previous]}`} className="h-8 px-2 rounded-lg border border-white/10 text-white/40 hover:text-white hover:bg-white/[0.06] text-[10px] inline-flex items-center gap-1 disabled:opacity-40">
                <ArrowRight size={12} />رجوع
              </button>
            ) : null}
            {next ? (
              <button type="button" disabled={busy} onClick={() => void controller.setStatus(booking.id, next)} className="flex-1 h-8 rounded-lg text-black text-[10px] font-black inline-flex items-center justify-center gap-1.5 disabled:opacity-40" style={{ backgroundColor: STATUS_COLORS[next] }}>
                {busy ? <Loader2 size={12} className="animate-spin" /> : <ArrowLeft size={12} />}
                {next === "confirmed" ? "تأكيد" : next === "deposit" ? "استلام ديبوزيت" : "إتمام الحجز"}
              </button>
            ) : (
              <span className="flex-1 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold inline-flex items-center justify-center gap-1.5"><Check size={13} />اكتمل المسار</span>
            )}
          </>
        )}
        {wa ? <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="تواصل واتساب" className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0"><MessageCircle size={13} /></a> : null}
        {booking.status !== "cancelled" && booking.status !== "completed" ? (
          <button type="button" disabled={busy} onClick={onOpen} title="الإلغاء والتفاصيل داخل بطاقة الحجز" className="w-8 h-8 rounded-lg bg-white/[0.04] text-white/25 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center disabled:opacity-40"><Ban size={12} /></button>
        ) : null}
      </div>
    </article>
  );
}
