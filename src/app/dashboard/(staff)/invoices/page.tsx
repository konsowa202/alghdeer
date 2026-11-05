import QuoteStudio from "@/components/dashboard/QuoteStudio";

export default function InvoicesPage({ searchParams }: { searchParams: { booking?: string; phone?: string; invoice?: string } }) {
  return <QuoteStudio initialBookingId={searchParams.booking || ""} initialPhone={searchParams.phone || ""} initialInvoiceId={searchParams.invoice || ""} />;
}
