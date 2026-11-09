type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (command: "event", eventName: "conversion", parameters: {
    send_to: string;
    transaction_id: string;
  }) => void;
};

export function trackBookingConversion(bookingId: string) {
  if (typeof window === "undefined") return;
  const analyticsWindow = window as AnalyticsWindow;
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  analyticsWindow.dataLayer.push({
    event: "booking_form_submission",
    booking_id: bookingId,
  });
  analyticsWindow.gtag?.("event", "conversion", {
    send_to: "AW-18563757916/0n-kCLrV7rQdENzu8ZNF",
    transaction_id: bookingId,
  });
}
