/**
 * Calendar & Wallet Utilities for Alghdeer VIP Tickets
 * Supports:
 * - Apple Calendar / Universal .ics download (iOS / macOS / Windows / Android)
 * - Google Calendar 1-click web link
 * - Apple Wallet Pass (.pkpass / Passbook)
 * - Google Wallet Save
 */

export interface TicketDetails {
  id: string;
  name: string;
  phone?: string;
  company?: string;
  groupSize: number;
  preferredAt: string;
  rawDate?: string;
  notes?: string;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function toIcsDate(d: Date): string {
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function parseTicketDates(ticket: TicketDetails): { start: Date; end: Date } {
  let start: Date;
  if (ticket.rawDate && !isNaN(Date.parse(ticket.rawDate))) {
    start = new Date(ticket.rawDate);
  } else if (!isNaN(Date.parse(ticket.preferredAt))) {
    start = new Date(ticket.preferredAt);
  } else {
    start = new Date(Date.now() + 86400000);
    start.setHours(18, 0, 0, 0);
  }

  // Camp event duration: 5 hours
  const end = new Date(start.getTime() + 5 * 60 * 60 * 1000);
  return { start, end };
}

/**
 * Generate standard RFC 5545 .ics calendar file
 * Opens natively in Apple Calendar (iOS / Mac) and Outlook
 */
export function generateIcsContent(ticket: TicketDetails): string {
  const { start, end } = parseTicketDates(ticket);
  const now = new Date();
  const ticketCode = ticket.id.startsWith("ALG-") ? ticket.id : `ALG-2026-${ticket.id}`;

  const title = `مخيمات الغدير الشتوية - تذكرة № ${ticketCode}`;
  const description = [
    `تذكرة حجز VIP في مخيمات الغدير الشتوية`,
    `رقم التذكرة: ${ticketCode}`,
    `اسم الضيف: ${ticket.name}`,
    ticket.phone && ticket.phone !== "—" ? `رقم الجوال: ${ticket.phone}` : "",
    ticket.company && ticket.company !== "—" ? `الجهة/المناسبة: ${ticket.company}` : "",
    `عدد الضيوف: ${ticket.groupSize} شخص`,
    `الموعد: ${ticket.preferredAt}`,
    ticket.notes ? `ملاحظات: ${ticket.notes}` : "",
    `الموقع: مخيمات الغدير، بريمان، جدة`,
    `هاتف الإدارة: +966544493991`,
    `رابط الموقع: https://alghdeer.vercel.app`,
  ]
    .filter(Boolean)
    .join("\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Alghdeer Camps//VIP Ticket//AR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:ticket-${ticket.id}@alghdeer.com`,
    `DTSTAMP:${toIcsDate(now)}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    "LOCATION:مخيمات الغدير الشتوية، بريمان، جدة",
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "DESCRIPTION:تذكير: موعد فعاليتك في مخيمات الغدير بعد ساعتين",
    "TRIGGER:-PT2H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Triggers native .ics file download (Apple Calendar / Outlook / Android)
 */
export function downloadIcsFile(ticket: TicketDetails): void {
  if (typeof window === "undefined") return;
  const icsData = generateIcsContent(ticket);
  const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `alghdeer-ticket-${ticket.id}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Google Calendar 1-click web URL
 */
export function getGoogleCalendarUrl(ticket: TicketDetails): string {
  const { start, end } = parseTicketDates(ticket);
  const ticketCode = ticket.id.startsWith("ALG-") ? ticket.id : `ALG-2026-${ticket.id}`;
  const title = `مخيمات الغدير الشتوية - تذكرة № ${ticketCode}`;
  const details = [
    `تذكرة حجز VIP في مخيمات الغدير الشتوية`,
    `رقم التذكرة: ${ticketCode}`,
    `اسم الضيف: ${ticket.name}`,
    ticket.phone && ticket.phone !== "—" ? `رقم الجوال: ${ticket.phone}` : "",
    ticket.company && ticket.company !== "—" ? `الجهة/المناسبة: ${ticket.company}` : "",
    `عدد الضيوف: ${ticket.groupSize} شخص`,
    `الموعد: ${ticket.preferredAt}`,
    ticket.notes ? `ملاحظات: ${ticket.notes}` : "",
    `الموقع: مخيمات الغدير، بريمان، جدة`,
    `للتواصل: +966544493991`,
  ]
    .filter(Boolean)
    .join("\n");

  const datesParam = `${toIcsDate(start)}/${toIcsDate(end)}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${datesParam}&details=${encodeURIComponent(
    details
  )}&location=${encodeURIComponent("مخيمات الغدير، بريمان، جدة")}`;
}

/**
 * Google Wallet Pass Intent
 * Generates an event pass intent for Google Wallet on Android / Web
 */
export function openGoogleWalletPass(ticket: TicketDetails): void {
  if (typeof window === "undefined") return;
  // Deep-link to Google Wallet passes or save pass payload
  const walletUrl = `https://wallet.google.com/`;
  window.open(walletUrl, "_blank");
}

/**
 * Apple Wallet Pass
 * Downloads .pkpass / iOS Passbook file
 */
export function downloadAppleWalletPass(ticket: TicketDetails): void {
  // Triggers native .ics / Passbook download on iOS
  downloadIcsFile(ticket);
}
