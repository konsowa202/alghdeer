import type { BookingRecord } from "./bookings-types";
import { BOOKING_STATUS_LABELS } from "./bookings-types";
import { isEmailValid } from "./bookings-store";

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
  const list = (process.env.NOTIFY_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (list.length > 0) return list;
  return ["abeer.alghader@gmail.com"];
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

  const cleanPhone = b.phone && b.phone !== "—" ? b.phone.replace(/[^0-9]/g, "") : "";
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : "";

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<body style="margin:0;padding:24px;background:#0b0c10;font-family:Tahoma,Arial,sans-serif;">
  <div style="max-width:540px;margin:0 auto;background:#14151b;border:1px solid #26272f;border-radius:16px;overflow:hidden;">
    <div style="background:#cba135;padding:20px 24px;">
      <div style="color:#0b0c10;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">FORM SUBMITTED • تم إرسال الفورم</div>
      <div style="color:#0b0c10;font-size:20px;font-weight:900;">طلب حجز جديد — مخيمات الغدير</div>
      <div style="color:#0b0c10;font-size:12px;opacity:.85;margin-top:2px;">تم استلام طلب تذكرة جديد من واجهة الموقع</div>
    </div>
    <table style="width:100%;border-collapse:collapse;background:#14151b;">
      ${row("حالة الطلب", '<span style="color:#4ade80;font-weight:bold;">تم إرسال الفورم (Form Submitted)</span>')}
      ${row("رقم التذكرة", `<span style="font-family:monospace;color:#d4b458;font-size:15px;">${escapeHtml(b.id)}</span>`)}
      ${row("اسم العميل", escapeHtml(b.name))}
      ${row("الجوال / واتساب", `<span dir="ltr">${escapeHtml(b.phone)}</span>`)}
      ${b.email ? row("البريد الإلكتروني", `<span dir="ltr">${escapeHtml(b.email)}</span>`) : ""}
      ${row("الجهة / المناسبة", escapeHtml(b.company))}
      ${row("عدد الضيوف", `${b.groupSize} شخص`)}
      ${row("الموعد المطلوب", escapeHtml(formatWhen(b.preferredAt)))}
      ${b.notes ? row("ملاحظات", escapeHtml(b.notes)) : ""}
      ${row("الحالة الحالية", BOOKING_STATUS_LABELS[b.status])}
    </table>
    <div style="padding:20px 24px;display:flex;flex-direction:column;gap:12px;">
      ${waUrl ? `
      <a href="${waUrl}" style="display:block;text-align:center;background:#25D366;color:#ffffff;text-decoration:none;font-weight:900;font-size:14px;padding:12px;border-radius:10px;margin-bottom:8px;">
        مراسلة العميل مباشرة على واتساب
      </a>` : ""}
      <a href="${dashboardUrl}/bookings" style="display:block;text-align:center;background:#cba135;color:#0b0c10;text-decoration:none;font-weight:900;font-size:14px;padding:12px;border-radius:10px;">
        فتح لوحة التحكم للحجوزات
      </a>
      <div style="text-align:center;color:#5a5b64;font-size:11px;margin-top:10px;">
        ${escapeHtml(new Date(b.createdAt).toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" }))} — نظام حجوزات مخيمات الغدير
      </div>
    </div>
  </div>
</body>
</html>`;
}

function buildEmailText(b: BookingRecord, dashboardUrl: string): string {
  const cleanPhone = b.phone && b.phone !== "—" ? b.phone.replace(/[^0-9]/g, "") : "";
  return [
    "[Form Submitted] طلب حجز جديد — مخيمات الغدير",
    "تم إرسال نموذج الحجز بنجاح عبر الموقع الإلكتروني",
    "----------------------------------------",
    `رقم التذكرة: ${b.id}`,
    `اسم العميل: ${b.name}`,
    `الجوال / واتساب: ${b.phone}`,
    b.email ? `البريد الإلكتروني: ${b.email}` : null,
    `الجهة / المناسبة: ${b.company}`,
    `عدد الضيوف: ${b.groupSize} شخص`,
    `الموعد المطلوب: ${formatWhen(b.preferredAt)}`,
    b.notes ? `ملاحظات: ${b.notes}` : null,
    cleanPhone ? `واتساب العميل: https://wa.me/${cleanPhone}` : null,
    `لوحة التحكم: ${dashboardUrl}/bookings`,
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
  const host =
    process.env.SMTP_HOST?.trim() ||
    (process.env.SMTP_USER?.includes("gmail.com") || process.env.GMAIL_APP_PASSWORD
      ? "smtp.gmail.com"
      : "");
  if (!host) return false;
  try {
    const spec = "nodemailer";
    const mod = await import(/* webpackIgnore: true */ spec).catch(() => null);
    if (!mod) return false;
    const nodemailer = mod.default ?? mod;
    const port = Number(process.env.SMTP_PORT || (host === "smtp.gmail.com" ? 465 : 587));
    const user = process.env.SMTP_USER?.trim() || process.env.GMAIL_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim() || process.env.GMAIL_APP_PASSWORD?.trim();
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
    await transport.sendMail({
      from: process.env.EMAIL_FROM?.trim() || user || "Alghdeer <bookings@alghder.com>",
      to: to.join(", "),
      subject,
      html,
      text,
    });
    console.log(`[notify] SMTP email sent successfully to ${to.join(", ")}`);
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
  booking: BookingRecord,
  dashboardUrl: string
): Promise<boolean> {
  if (to.length === 0) return false;
  const recipient = to[0] || "abeer.alghader@gmail.com";
  try {
    const cleanPhone =
      booking.phone && booking.phone !== "—" ? booking.phone.replace(/[^0-9]/g, "") : "";
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : "";

    const payload: Record<string, string> = {
      _subject: subject,
      _template: "table",
      _captcha: "false",
      "حالة النموذج": "تم إرسال الفورم (Form Submitted)",
      "رقم التذكرة": booking.id,
      "اسم العميل": booking.name,
      "الجوال / واتساب": booking.phone,
      "البريد الإلكتروني": booking.email || "—",
      "الجهة / المناسبة": booking.company || "—",
      "عدد الضيوف": `${booking.groupSize} شخص`,
      "الموعد المطلوب": formatWhen(booking.preferredAt),
      "ملاحظات": booking.notes || "—",
      "تاريخ الإرسال": formatWhen(booking.createdAt),
      "واتساب العميل": waUrl || "—",
      "لوحة التحكم": `${dashboardUrl}/bookings`,
    };

    if (booking.email && isEmailValid(booking.email)) {
      payload._replyto = booking.email;
    }

    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Referer: "https://www.alghder.com/",
        Origin: "https://www.alghder.com",
        "User-Agent": "Alghdeer-Notification-Service/1.0",
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => null)) as { success?: string | boolean; message?: string } | null;
    if (data?.success === "true" || data?.success === true) {
      console.log(`[notify] FormSubmit sent successfully to ${recipient}`);
      return true;
    }
    console.warn(`[notify] FormSubmit response:`, data?.message || res.status);
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

function selectedProvider(recipientCount: number): NotifyResult["provider"] {
  const preferred = process.env.NOTIFY_PROVIDER?.trim().toLowerCase();
  if (preferred === "resend" && process.env.RESEND_API_KEY?.trim()) return "resend";
  if (preferred === "smtp" && (process.env.SMTP_HOST?.trim() || process.env.SMTP_PASS?.trim() || process.env.GMAIL_APP_PASSWORD?.trim())) return "smtp";
  if (preferred === "web3forms" && process.env.WEB3FORMS_ACCESS_KEY?.trim()) return "web3forms";
  if (preferred === "formsubmit") return recipientCount > 0 ? "formsubmit" : "none";

  if (process.env.RESEND_API_KEY?.trim()) return "resend";
  if (process.env.SMTP_HOST?.trim() || process.env.SMTP_PASS?.trim() || process.env.GMAIL_APP_PASSWORD?.trim()) return "smtp";
  if (process.env.WEB3FORMS_ACCESS_KEY?.trim()) return "web3forms";
  return recipientCount > 0 ? "formsubmit" : "none";
}

/** Non-secret configuration health for the authenticated system-status page. */
export function getNotificationReadiness() {
  const recipientCount = notifyRecipients().length;
  const provider = selectedProvider(recipientCount);
  return {
    recipientCount,
    provider,
    configured: recipientCount > 0 && provider !== "none",
    requiresActivation: provider === "formsubmit",
  };
}

/** Send the "new booking" notification. Never throws. */
export async function notifyNewBooking(booking: BookingRecord): Promise<NotifyResult> {
  try {
    const to = notifyRecipients();
    const baseUrl =
      process.env.SITE_URL?.trim().replace(/\/$/, "") || "https://www.alghder.com";
    const dashboardUrl = `${baseUrl}/dashboard`;
    const provider = selectedProvider(to.length);

    if (provider === "none") {
      console.warn("[notify] No configured notification provider — booking notification skipped.");
      return { sent: false, provider: "none" };
    }

    const subject = `[Form Submitted] حجز جديد ${booking.id} — ${booking.name}`;
    const html = buildEmailHtml(booking, dashboardUrl);
    const text = buildEmailText(booking, dashboardUrl);

    let sent = false;
    if (provider === "resend") {
      sent = await sendViaResend(to, subject, html, text);
    } else if (provider === "smtp") {
      sent = await sendViaSmtp(to, subject, html, text);
    } else if (provider === "web3forms") {
      sent = await sendViaWeb3Forms(to, subject, html, text);
    } else {
      sent = await sendViaFormSubmit(to, subject, booking, dashboardUrl);
    }

    // Fallback cascade: if selected provider failed, attempt FormSubmit
    if (!sent && provider !== "formsubmit") {
      console.warn(`[notify] Provider ${provider} failed, attempting fallback via FormSubmit...`);
      sent = await sendViaFormSubmit(to, subject, booking, dashboardUrl);
    }

    if (!sent) console.error(`[notify] Notification failed for booking ${booking.id}`);
    return { sent, provider: sent ? provider : "none" };
  } catch (err) {
    console.error("[notify] Unexpected error:", err);
    return { sent: false, provider: "none" };
  }
}
