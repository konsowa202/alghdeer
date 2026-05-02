/** `min` / `value` for HTML `datetime-local` in the user's local timezone. */
export function toDatetimeLocalValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

export function minPreferredDatetimeLocal(leadMs: number): string {
  return toDatetimeLocalValue(new Date(Date.now() + leadMs));
}
