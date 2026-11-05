import type { BookingRecord } from "./bookings-types";
import type { InvoiceRecord } from "./invoices-types";

export type CustomerProfile = {
  phone: string;
  name: string;
  email: string;
  company: string;
  bookingCount: number;
  invoiceCount: number;
  totalInvoiced: number;
  lastActivity: string;
  bookings: BookingRecord[];
  invoices: InvoiceRecord[];
};

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 5 ? digits : "";
}

export function buildCustomerProfiles(bookings: BookingRecord[], invoices: InvoiceRecord[]): CustomerProfile[] {
  const profiles = new Map<string, CustomerProfile>();
  const bookingPhones = new Map(bookings.map((booking) => [booking.id, normalizePhone(booking.phone)]));
  const ensure = (phone: string) => {
    let profile = profiles.get(phone);
    if (!profile) {
      profile = { phone, name: "", email: "", company: "", bookingCount: 0, invoiceCount: 0, totalInvoiced: 0, lastActivity: "", bookings: [], invoices: [] };
      profiles.set(phone, profile);
    }
    return profile;
  };
  const newest = (current: string, candidate: string) => !current || Date.parse(candidate) > Date.parse(current) ? candidate : current;

  for (const booking of bookings) {
    const phone = normalizePhone(booking.phone);
    if (!phone) continue;
    const profile = ensure(phone);
    profile.bookings.push(booking);
    profile.lastActivity = newest(profile.lastActivity, booking.updatedAt || booking.createdAt);
    if (!profile.name || Date.parse(booking.createdAt) >= Date.parse(profile.lastActivity)) profile.name = booking.name;
    if (booking.email) profile.email = booking.email;
    if (booking.company && booking.company !== "—") profile.company = booking.company;
  }

  for (const invoice of invoices) {
    const phone = normalizePhone(invoice.customerPhone) || (invoice.bookingId ? bookingPhones.get(invoice.bookingId) || "" : "");
    if (!phone) continue;
    const profile = ensure(phone);
    profile.invoices.push(invoice);
    profile.lastActivity = newest(profile.lastActivity, invoice.updatedAt);
    if (!profile.name) profile.name = invoice.customerName;
    if (invoice.customerEmail) profile.email = invoice.customerEmail;
    if (invoice.company) profile.company = invoice.company;
  }

  return Array.from(profiles.values()).map((profile) => ({
    ...profile,
    name: profile.name || "عميل بدون اسم",
    bookingCount: profile.bookings.length,
    invoiceCount: profile.invoices.length,
    totalInvoiced: profile.invoices.filter((invoice) => invoice.status === "issued").reduce((sum, invoice) => sum + invoice.total, 0),
    bookings: [...profile.bookings].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    invoices: [...profile.invoices].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
  })).sort((a, b) => Date.parse(b.lastActivity) - Date.parse(a.lastActivity));
}
