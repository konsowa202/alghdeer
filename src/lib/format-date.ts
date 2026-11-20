/**
 * Dashboard dates: day + English month abbreviation + year, Gregorian, Riyadh time.
 * e.g. "20-Nov-2026" and "20-Nov-2026 · 7:30 PM". Never locale-dependent, so the
 * dashboard never shows Hijri or US-style (11/20/2026) dates.
 */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function riyadhParts(iso: string | Date | null | undefined) {
  if (!iso) return null;
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return null;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Riyadh",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  return { y: parts.year, m: Number(parts.month), d: Number(parts.day), h: Number(parts.hour), min: parts.minute };
}

export function formatShortDate(iso: string | Date | null | undefined): string {
  const p = riyadhParts(iso);
  return p ? ltr(`${p.d}-${MONTHS[p.m - 1]}-${p.y}`) : "—";
}

export function formatDateTime(iso: string | Date | null | undefined): string {
  const p = riyadhParts(iso);
  if (!p) return "—";
  const h12 = p.h % 12 || 12;
  return ltr(`${p.d}-${MONTHS[p.m - 1]}-${p.y} · ${h12}:${p.min} ${p.h < 12 ? "AM" : "PM"}`);
}

/** Keeps "20-Nov-2026 · 7:30 PM" in order inside Arabic (RTL) text. */
const ltr = (s: string) => `⁦${s}⁩`;

/** "YYYY-MM-DDTHH:mm" entered in the dashboard always means Riyadh time (UTC+3, no DST). */
export function riyadhLocalToIso(local: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(local)) return null;
  const d = new Date(`${local.slice(0, 16)}:00+03:00`);
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}

export function isoToRiyadhLocal(iso: string | null | undefined): string {
  const p = riyadhParts(iso);
  if (!p) return "";
  const z = (n: number | string) => String(n).padStart(2, "0");
  return `${p.y}-${z(p.m)}-${z(p.d)}T${z(p.h)}:${z(p.min)}`;
}

export { MONTHS };
