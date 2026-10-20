"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { BookingRecord, BookingStatus } from "@/lib/bookings-types";
import { BOOKING_STATUS_LABELS } from "@/lib/bookings-types";

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

export function formatWhen(iso: string) {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleString("ar-SA", {
    timeZone: "Asia/Riyadh",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatCreated(iso: string) {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleString("ar-SA", {
    timeZone: "Asia/Riyadh",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function waHref(phone: string): string | null {
  const clean = (phone || "").replace(/\D/g, "");
  if (!clean) return null;
  const intl = clean.startsWith("05") ? "966" + clean.slice(1) : clean;
  return `https://wa.me/${intl}`;
}

export function telHref(phone: string): string | null {
  const clean = (phone || "").replace(/[^\d+]/g, "");
  return clean ? `tel:${clean}` : null;
}

export function statusBadgeClass(s: BookingStatus) {
  switch (s) {
    case "confirmed":
      return "bg-sky-500/20 text-sky-300";
    case "deposit":
      return "bg-violet-500/20 text-violet-300";
    case "completed":
      return "bg-emerald-500/20 text-emerald-400";
    case "cancelled":
      return "bg-red-500/20 text-red-400";
    default:
      return "bg-amber-500/20 text-amber-400";
  }
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusBadgeClass(status)}`}
    >
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "؟";
  if (parts.length === 1) return parts[0]!.slice(0, 2);
  return parts[0]![0]! + parts[1]![0]!;
}

/* ------------------------------------------------------------------ */
/* Data controller hook — single source of truth for both views        */
/* ------------------------------------------------------------------ */

export type BookingStats = {
  total: number;
  pending: number;
  confirmed: number;
  deposit: number;
  completed: number;
  cancelled: number;
  today: number;
};

export function useBookingsController() {
  const [rows, setRows] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const knownIdsRef = useRef<Set<string> | null>(null);
  const [soundOn, setSoundOn] = useState(true);

  const beep = useCallback(() => {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.65);
      setTimeout(() => void ctx.close().catch(() => {}), 900);
    } catch {}
  }, []);

  const refresh = useCallback(async () => {
    setLoadError("");
    try {
      const res = await fetch("/api/bookings", {
        credentials: "include",
        cache: "no-store",
      });
      if (res.status === 401) {
        setUnauthorized(true);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { bookings?: BookingRecord[] };
      const serverRows = Array.isArray(data.bookings) ? data.bookings : [];

      // Detect brand-new records to notify the staff member on duty
      if (knownIdsRef.current) {
        const fresh = serverRows.filter((r) => !knownIdsRef.current!.has(r.id));
        const freshWebsite = fresh.filter((r) => r.source === "website");
        if (freshWebsite.length > 0) {
          setNewCount((c) => c + freshWebsite.length);
          if (soundOn) beep();
          try {
            navigator.vibrate?.([120, 60, 120]);
          } catch {}
        }
      }
      knownIdsRef.current = new Set(serverRows.map((r) => r.id));

      setRows(serverRows);
    } catch {
      setLoadError("تعذر تحديث الحجوزات، تأكد من الاتصال بالإنترنت.");
    } finally {
      setLoading(false);
    }
  }, [beep, soundOn]);

  useEffect(() => {
    void refresh();
    const interval = setInterval(() => void refresh(), 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  const stats = useMemo<BookingStats>(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return {
      total: rows.length,
      pending: rows.filter((r) => r.status === "pending").length,
      confirmed: rows.filter((r) => r.status === "confirmed").length,
      deposit: rows.filter((r) => r.status === "deposit").length,
      completed: rows.filter((r) => r.status === "completed").length,
      cancelled: rows.filter((r) => r.status === "cancelled").length,
      today: rows.filter(
        (r) => new Date(r.createdAt).getTime() >= startOfToday.getTime()
      ).length,
    };
  }, [rows]);

  const setStatus = useCallback(
    async (id: string, status: BookingStatus) => {
      setBusyId(id);
      try {
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
        const res = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (res.status === 401) setUnauthorized(true);
        if (res.ok) await refresh();
      } finally {
        setBusyId(null);
      }
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      setBusyId(id);
      try {
        setRows((prev) => prev.filter((r) => r.id !== id));
        const res = await fetch(`/api/bookings/${encodeURIComponent(id)}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.status === 401) setUnauthorized(true);
        if (res.ok) await refresh();
      } finally {
        setBusyId(null);
      }
    },
    [refresh]
  );

  const addBooking = useCallback(
    async (input: {
      name: string;
      phone: string;
      email: string;
      company: string;
      groupSize: number;
      preferredLocal: string;
      notes: string;
      status: BookingStatus;
    }): Promise<{ ok: boolean; error?: string }> => {
      const d = new Date(input.preferredLocal);
      if (!Number.isFinite(d.getTime())) {
        return { ok: false, error: "اختر تاريخاً ووقتاً صالحين." };
      }
      try {
        const res = await fetch("/api/bookings", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: input.name,
            phone: input.phone,
            email: input.email,
            company: input.company,
            groupSize: input.groupSize,
            notes: input.notes,
            preferredAt: d.toISOString(),
            status: input.status,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) {
          if (res.status === 401) setUnauthorized(true);
          return { ok: false, error: data.error || "فشل الحفظ." };
        }
        await refresh();
        return { ok: true };
      } catch {
        return { ok: false, error: "تعذر الاتصال بالخادم." };
      }
    },
    [refresh]
  );

  const clearNewCount = useCallback(() => setNewCount(0), []);

  return {
    rows,
    loading,
    loadError,
    busyId,
    unauthorized,
    stats,
    newCount,
    clearNewCount,
    soundOn,
    setSoundOn,
    refresh,
    setStatus,
    remove,
    addBooking,
  };
}

export type BookingsController = ReturnType<typeof useBookingsController>;

/* ------------------------------------------------------------------ */
/* Search + filter hook                                                */
/* ------------------------------------------------------------------ */

export type StatusFilter = BookingStatus | "all";

export function useBookingsFilter(rows: BookingRecord[]) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return [r.name, r.phone, r.email ?? "", r.company, r.notes, r.id]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, query, statusFilter]);

  return { query, setQuery, statusFilter, setStatusFilter, filtered };
}
