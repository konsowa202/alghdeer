/**
 * Guest breakdown: adults, children and extra people (maids, drivers…) are priced
 * differently, so staff enter them separately. The total (wristbands / guest count)
 * is always their sum.
 */
export type GuestBreakdown = { adults: number; children: number; extras: number };

const clamp = (v: unknown) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n > 0 ? Math.min(n, 5000) : 0;
};

export function cleanBreakdown(raw: unknown): GuestBreakdown | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const b = { adults: clamp(r.adults), children: clamp(r.children), extras: clamp(r.extras ?? r.extraGuests) };
  return guestTotal(b) > 0 ? b : null;
}

export const guestTotal = (b: GuestBreakdown) => b.adults + b.children + b.extras;

/** "60 بالغ · 15 طفل · 5 مرافق" — omits zero parts. */
export function breakdownLabel(b: GuestBreakdown | null | undefined, lang: "ar" | "en" = "ar"): string {
  if (!b) return "";
  const parts: string[] = [];
  if (b.adults) parts.push(lang === "ar" ? `${b.adults} بالغ` : `${b.adults} adults`);
  if (b.children) parts.push(lang === "ar" ? `${b.children} طفل` : `${b.children} children`);
  if (b.extras) parts.push(lang === "ar" ? `${b.extras} مرافق (عاملات/سائقين)` : `${b.extras} staff (maids/drivers)`);
  return parts.join(" · ");
}

/** True when PostgREST rejected a write because the breakdown columns are not migrated yet. */
export function isMissingBreakdownColumn(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return /PGRST204|column/i.test(msg) && /adults|children|extra_guests/.test(msg);
}
