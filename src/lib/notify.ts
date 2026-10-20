import type { BookingRecord } from "./bookings-types";
import { BOOKING_STATUS_LABELS } from "./bookings-types";

/**
 * Booking email notifications.
 *
 * Provider chain (first configured provider wins):
 *  1. Resend          — RESEND_API_KEY + EMAIL_FROM            (recommended)
 *  2. SMTP/nodemailer — SMTP_HOST/PORT/USER/PASS + EMAIL_FROM  (if installed)
 *  3. Web3Forms       — WEB3FORMS_ACCESS_KEY
 *  4. FormSubmit      — NOTIFY_EMAIL only (one-time activation email required)
 *
 * Recipients: NOTIFY_EMAIL (comma-separated).
 * Nothing is sent and nothing breaks when no provider is configured — a
 * warning is logged server-side instead.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function notifyRecipients(): string[] {
  return (process.env.NOTIFY_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toLocaleString("ar-SA", {
    timeZone: "Asia/Riyadh",
    dateStyle: "full",
    timeStyle: "short",
  });
}

function buildEmailHtml(b: BookingRecord, dashboardUrl: string): string {
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 14px;color:#8b8b94;font-size:13px;border-bottom:1px solid #22242b;white-space:nowrap;">${label}</td>
      <td style="padding:10px 14px;color:#ffffff;font-size:14px;font-weight:bold;border-bottom:1px solid #22242b;">${value}</td>
    </tr>`;

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<body style="margin:0;padding:24px;background:#0b0c10;font-family:Tahoma,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#14151b;border:1px solid #26272f;border-radius:16px;overflow:hidden;">
    <div style="background:#cba135;padding:18px 24px;">
      <div style="color:#0b0c10;font-size:18px;font-weight:900;">حجز جديد — مخيمات الغدير</div>
      <div style="color:#0b0c10;font-size:12px;opacity:.75;">تم استلام طلب حجز من الموقع</div>
    </div>
    <table style="width:100%;border-collapse:collapse;background:#14151b;">
      ${row("رقم التذكرة", `<span style="font-family:monospace;color:#d4b458;">${escapeHtml(b.id)}</span>`)}
      ${row("اسم العميل", escapeHtml(b.name))}
      ${row("الجوال / واتساب", `<span dir="ltr">${escapeHtml(b.phone)}</span>`)}
      ${b.email ? row("البريد الإلكتروني", `<span dir="ltr">${escapeHtml(b.email)}</span>`) : ""}
      ${row("الجهة / المناسبة", escapeHtml(b.company))}
      ${row("عدد الضيوف", `${b.groupSize} شخص`)}
      ${row("الموعد المطلوب", escapeHtml(formatWhen(b.preferredAt)))}
      ${b.notes ? row("ملاحظات", escapeHtml(b.notes)) : ""}
      ${row("الحالة", BOOKING_STATUS_LABELS[b.status])}
    </table>
    <div style="padding:20px 24px;">
      <a href="${dashboardUrl}" style="display:block;text-align:center;background:#cba135;color:#0b0c10;text-decoration:none;font-weight:900;font-size:14px;padding:14px;border-radius:10px;">
        فتح لوحة التحكم
      </a>
      <div style="text-align:center;color:#5a5b64;font-size:11px;margin-top:14px;">
        ${escapeHtml(new Date(b.createdAt).toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" }))} — نظام حجوزات الغدير
      </div>
    </div>
  </div>
</body>
</html>`;
}

function buildEmailText(b: BookingRecord, dashboardUrl: string): string {
  return [
    "حجز جديد — مخيمات الغدير",
    `رقم التذكرة: ${b.id}`,
    `الاسم: ${b.name}`,
    `الجوال: ${b.phone}`,
    b.email ? `البريد: ${b.email}` : null,
    `الجهة: ${b.company}`,
    `عدد الضيوف: ${b.groupSize}`,
    `الموعد: ${formatWhen(b.preferredAt)}`,
    b.notes ? `ملاحظات: ${b.notes}` : null,
    `لوحة التحكم: ${dashboardUrl}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendViaResend(
  to: string[],
  subject: string,
  html: string,
  text: string
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return false;
  const from = process.env.EMAIL_FROM?.trim() || "Alghdeer Bookings <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html, text }),
  });
  if (!res.ok) {
    console.error("[notify] Resend failed:", res.status, await res.text().catch(() => ""));
  }
  return res.ok;
}

async function sendViaSmtp(
  to: string[],
  subject: string,
  html: string,
  text: string
): Promise<boolean> {
  if (!process.env.SMTP_HOST) return false;
  try {
    // Optional dependency — resolved at runtime only (never bundled), so the
    // build succeeds whether or not nodemailer is installed.
    const spec = "nodemailer";
    const mod = await import(/* webpackIgnore: true */ spec).catch(() => null);
    if (!mod) return false;
    const nodemailer = mod.default ?? mod;
    const port = Number(process.env.SMTP_PORT || 465);
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
    await transport.sendMail({
      from: process.env.EMAIL_FROM?.trim() || process.env.SMTP_USER,
      to: to.join(", "),
      subject,
      html,
      text,
    });
    return true;
  } catch (err) {
    console.error("[notify] SMTP failed:", err);
    return false;
  }
}

async function sendViaWeb3Forms(
  to: string[],
  subject: string,
  html: string,
  text: string
): Promise<boolean> {
  const key = process.env.WEB3FORMS_ACCESS_KEY?.trim();
  if (!key) return false;
  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: key,
      subject,
      message: text,
      html,
      email: to[0],
    }),
  });
  if (!res.ok) console.error("[notify] Web3Forms failed:", res.status);
  return res.ok;
}

async function sendViaFormSubmit(
  to: string[],
  subject: string,
  text: string
): Promise<boolean> {
  // Zero-config fallback: https://formsubmit.co — the FIRST submission sends
  // an activation email to NOTIFY_EMAIL; click "Activate" once and every
  // following booking lands in the inbox.
  if (to.length === 0) return false;
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to[0])}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: subject, _captcha: "false", message: text }),
    });
    if (!res.ok) console.error("[notify] FormSubmit failed:", res.status);
    return res.ok;
  } catch (err) {
    console.error("[notify] FormSubmit error:", err);
    return false;
  }
}

export type NotifyResult = {
  sent: boolean;
  provider: "resend" | "smtp" | "web3forms" | "formsubmit" | "none";
};

/** Send the "new booking" notification. Never throws. */
export async function notifyNewBooking(booking: BookingRecord): Promise<NotifyResult> {
  try {
    const to = notifyRecipients();
    const baseUrl =
      process.env.SITE_URL?.trim().replace(/\/$/, "") || "https://alghdeer.com";
    const dashboardUrl = `${baseUrl}/dashboard`;

    if (to.length === 0) {
      console.warn(
        "[notify] NOTIFY_EMAIL is not set — booking notification skipped."
      );
      return { sent: false, provider: "none" };
    }

    const subject = `حجز جديد ${booking.id} — ${booking.name}`;
    const html = buildEmailHtml(booking, dashboardUrl);
    const text = buildEmailText(booking, dashboardUrl);

    if (await sendViaResend(to, subject, html, text)) {
      return { sent: true, provider: "resend" };
    }
    if (await sendViaSmtp(to, subject, html, text)) {
      return { sent: true, provider: "smtp" };
    }
    if (await sendViaWeb3Forms(to, subject, html, text)) {
      return { sent: true, provider: "web3forms" };
    }
    if (await sendViaFormSubmit(to, subject, text)) {
      return { sent: true, provider: "formsubmit" };
    }

    console.error("[notify] All providers failed or unconfigured.");
    return { sent: false, provider: "none" };
  } catch (err) {
    console.error("[notify] Unexpected error:", err);
    return { sent: false, provider: "none" };
  }
}
