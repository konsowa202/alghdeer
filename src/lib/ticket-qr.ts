import { BOOKING_STATUS_LABELS, type BookingStatus } from "./bookings-types";

export function buildTicketQrPayload(ticket: {
  id: string;
  name?: string;
  preferredAt?: string;
}): string {
  const parts = [`ALGHDEER-PASS:${ticket.id}`];
  if (ticket.name) parts.push(`GUEST:${ticket.name}`);
  if (ticket.preferredAt) parts.push(`DATE:${ticket.preferredAt}`);
  return parts.join("|");
}

/**
 * Extracts the booking ID from any QR code format or manual input:
 * - `ALGHDEER-PASS:ALG-4894|GUEST:...|DATE:...`
 * - `https://alghdeer.vercel.app/ticket/ALG-4894?guest=...`
 * - `ALG-4894` or `#ALG-4894` or `* ALG-4894 *`
 */
export function parseTicketBookingId(rawInput: string): string | null {
  const cleaned = (rawInput || "").trim();
  if (!cleaned) return null;

  const passMatch = cleaned.match(/ALGHDEER-PASS:([^|\s]+)/i);
  if (passMatch?.[1]) return passMatch[1].trim().toUpperCase();

  const urlMatch = cleaned.match(/\/ticket\/([^/?#\s]+)/i);
  if (urlMatch?.[1]) {
    try {
      return decodeURIComponent(urlMatch[1]).trim().toUpperCase();
    } catch {
      return urlMatch[1].trim().toUpperCase();
    }
  }

  const algMatch = cleaned.match(/\b(ALG-[A-Z0-9-]{2,40})\b/i);
  if (algMatch?.[1]) return algMatch[1].trim().toUpperCase();

  const stripped = cleaned.replace(/^[*#\s]+|[*#\s]+$/g, "");
  if (/^[A-Za-z0-9_-]{3,40}$/.test(stripped)) {
    return stripped;
  }

  return null;
}

export function qrBlockReasonAr(status: BookingStatus): string | null {
  switch (status) {
    case "pending":
      return `الحجز لا يزال «${BOOKING_STATUS_LABELS.pending}» ولم يتم تأكيده بعد — رمز QR غير مفعل للدخول.`;
    case "cancelled":
      return "هذا الحجز ملغى — التذكرة غير صالحة للدخول.";
    case "completed":
      return "تم إغلاق هذا الحجز (مكتمل مسبقًا) — التذكرة منتهية الصلاحية.";
    case "confirmed":
    case "deposit":
      return null;
  }
}
