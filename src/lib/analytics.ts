"use client";

const ADS_BOOKING_CONVERSION = "AW-18563757916/uZxsCPq20bUdENzu8ZNF";

type AnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  const analyticsWindow = window as AnalyticsWindow;
  if (typeof analyticsWindow.gtag === "function") {
    analyticsWindow.gtag(...args);
  }
}

/** Call once only after the server confirms the booking was saved. */
export function trackBooking({ occasion, guests }: { occasion: string; guests: number }) {
  try {
    gtag("event", "booking_submitted", {
      occasion: String(occasion || "").slice(0, 100),
      guests: Number(guests) || 0,
    });
    gtag("event", "conversion", { send_to: ADS_BOOKING_CONVERSION });
  } catch {
    // Analytics must never interrupt a successful booking.
  }
}

/** Analytics contact clicks; these are not Google Ads conversions. */
export function trackContactClick(kind: "whatsapp" | "phone") {
  try {
    gtag("event", kind === "whatsapp" ? "whatsapp_click" : "phone_click");
  } catch {
    // Tracking must never prevent the contact link from opening.
  }
}
