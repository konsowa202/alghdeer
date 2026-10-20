"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Search,
  RefreshCw,
  Plus,
  BellRing,
  Volume2,
  VolumeX,
  MessageCircle,
  StickyNote,
  ChevronLeft,
  X,
} from "lucide-react";
import type { BookingRecord } from "@/lib/bookings-types";
import {
  useBookingsController,
  useBookingsFilter,
  formatWhen,
  waHref,
  StatusBadge,
  initialsOf,
  type StatusFilter,
} from "./booking-shared";
import BookingDetailSheet from "./BookingDetailSheet";
import AddBookingForm from "./AddBookingForm";

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "pending", label: "قيد المراجعة" },
  { key: "confirmed", label: "مؤكد" },
  { key: "deposit", label: "ديبوزيت" },
  { key: "completed", label: "مكتمل" },
  { key: "cancelled", label: "ملغى" },
];

/**
 * Dedicated mobile experience — NOT a shrunk table. Card list, bottom
 * sheets, thumb-reachable actions, pull-to-refresh.
 */
export default function BookingsMobilePanel() {
  const controller = useBookingsController();
  const { query, setQuery, statusFilter, setStatusFilter, filtered } =
    useBookingsFilter(controller.rows);
  const [selected, setSelected] = useState<BookingRecord | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    rows,
    loading,
    loadError,
    unauthorized,
    stats,
    newCount,
    clearNewCount,
    soundOn,
    setSoundOn,
    refresh,
  } = controller;

  const selectedLive = selected
    ? rows.find((r) => r.id === selected.id) ?? selected
    : null;

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: rows.length,
      pending: 0,
      confirmed: 0,
      deposit: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const r of rows) c[r.status] += 1;
    return c;
  }, [rows]);

  /* Simple pull-to-refresh on the scroll container */
  function onTouchStart(e: React.TouchEvent) {
    if (listRef.current && listRef.current.scrollTop <= 0) {
      touchStartY.current = e.touches[0]!.clientY;
    } else {
      touchStartY.current = null;
    }
  }
  function onTouchMove(e: React.TouchEvent) {
    if (touchStartY.current === null) return;
    const d = e.touches[0]!.clientY - touchStartY.current;
    setPullDistance(d > 0 ? Math.min(d, 110) : 0);
  }
  function onTouchEnd() {
    if (pullDistance > 70) void refresh();
    touchStartY.current = null;
    setPullDistance(0);
  }

  if (unauthorized) {
    return (
      <div className="mx-4 mt-10 bg-red-500/10 border border-red-500/25 rounded-2xl p-6 text-center">
        <p className="text-red-300 font-bold mb-2">انتهت الجلسة</p>
        <a
          href="/dashboard/login"
          className="inline-block mt-2 px-6 py-2.5 bg-[#cba135] text-black font-bold rounded-lg"
        >
          تسجيل الدخول
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#0b0c10] flex flex-col -m-4" dir="rtl">
      {/* Sticky app bar */}
      <header className="sticky top-0 z-30 bg-[#0b0c10]/95 backdrop-blur border-b border-white/10">
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-lg leading-tight">
              الحجوزات
            </h1>
            <p className="text-white/40 text-[11px]">
              {stats.today > 0 ? `${stats.today} طلب اليوم · ` : ""}
              {stats.pending} بانتظار المراجعة
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundOn(!soundOn)}
              className="w-9 h-9 rounded-full bg-white/5 text-white/60 flex items-center justify-center"
            >
              {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              type="button"
              onClick={() => void refresh()}
              className="w-9 h-9 rounded-full bg-white/5 text-white/60 flex items-center justify-center"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search
              size={15}
              className="absolute start-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="بحث…"
              className="w-full ps-9 pe-8 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#cba135]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute end-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 text-white/50 flex items-center justify-center"
              >
                <X size={12} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Filter chips */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTER_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setStatusFilter(t.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === t.key
                  ? "bg-[#cba135] text-black"
                  : "bg-white/5 text-white/55 border border-white/10"
              }`}
            >
              {t.label}
              <span className="opacity-60"> {counts[t.key]}</span>
            </button>
          ))}
        </div>
      </header>

      {/* New booking banner */}
      {newCount > 0 ? (
        <button
          type="button"
          onClick={clearNewCount}
          className="mx-4 mt-3 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-sm"
        >
          <BellRing size={17} />
          {newCount === 1 ? "وصل حجز جديد من الموقع 🎉" : `وصل ${newCount} حجوزات جديدة 🎉`}
        </button>
      ) : null}

      {/* Pull-to-refresh indicator */}
      <div
        className="flex justify-center overflow-hidden transition-[height] duration-150"
        style={{ height: pullDistance > 0 ? pullDistance / 2 : 0 }}
      >
        <RefreshCw
          size={18}
          className={`text-[#d4b458] self-end mb-1 ${pullDistance > 70 ? "animate-spin" : ""}`}
        />
      </div>

      {/* Cards list */}
      <div
        ref={listRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="flex-1 overflow-y-auto px-4 pt-3 pb-28 space-y-2.5"
      >
        {loadError ? (
          <p className="text-red-400 text-sm text-center py-4">{loadError}</p>
        ) : null}

        {loading && rows.length === 0 ? (
          <div className="space-y-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[86px] rounded-2xl bg-white/[0.04] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/30 text-sm">
              {rows.length === 0 ? "لا توجد حجوزات بعد." : "لا نتائج مطابقة."}
            </p>
          </div>
        ) : (
          filtered.map((order) => (
            <MobileBookingCard
              key={order.id}
              order={order}
              onOpen={() => setSelected(order)}
            />
          ))
        )}
      </div>

      {/* FAB — add booking */}
      <button
        type="button"
        onClick={() => setShowAdd(true)}
        className="fixed bottom-6 end-5 z-40 w-14 h-14 rounded-full bg-[#cba135] text-black shadow-[0_10px_30px_rgba(203,161,53,0.35)] flex items-center justify-center active:scale-95 transition-transform"
        aria-label="تسجيل حجز يدوي"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Detail bottom sheet */}
      {selectedLive ? (
        <BookingDetailSheet
          booking={selectedLive}
          controller={controller}
          onClose={() => setSelected(null)}
          sheet
        />
      ) : null}

      {/* Add booking bottom sheet */}
      {showAdd ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm"
          onClick={() => setShowAdd(false)}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[92dvh] overflow-y-auto bg-[#14151b] border-t border-white/10 rounded-t-3xl p-5"
          >
            <div className="flex justify-center pb-2">
              <span className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">تسجيل حجز يدوي</h3>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="w-8 h-8 rounded-full bg-white/5 text-white/60 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
            <AddBookingForm
              controller={controller}
              onDone={() => setShowAdd(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MobileBookingCard({
  order,
  onOpen,
}: {
  order: BookingRecord;
  onOpen: () => void;
}) {
  const wa = waHref(order.phone);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-start bg-white/[0.04] active:bg-white/[0.08] border border-white/10 rounded-2xl p-3.5 flex items-center gap-3 transition-colors"
    >
      {/* Avatar */}
      <span className="w-11 h-11 rounded-full bg-[#cba135]/15 text-[#d4b458] font-black text-sm flex items-center justify-center shrink-0">
        {initialsOf(order.name)}
      </span>

      {/* Main info */}
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2">
          <span className="text-white font-bold text-sm truncate">
            {order.name}
          </span>
          {order.notes ? (
            <StickyNote size={13} className="text-amber-400/80 shrink-0" />
          ) : null}
        </span>
        <span className="block text-white/45 text-[11px] mt-0.5 truncate">
          {formatWhen(order.preferredAt)} · {order.groupSize} شخص
          {order.source === "website" ? " · موقع" : " · فريق"}
        </span>
        <span className="block mt-1.5">
          <StatusBadge status={order.status} />
        </span>
      </span>

      {/* Quick WhatsApp + chevron */}
      <span className="flex flex-col items-center gap-1.5 shrink-0">
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center"
            aria-label="واتساب"
          >
            <MessageCircle size={16} />
          </a>
        ) : null}
        <ChevronLeft size={16} className="text-white/25" />
      </span>
    </button>
  );
}
