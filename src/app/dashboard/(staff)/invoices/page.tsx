import QuoteStudio from "@/components/dashboard/QuoteStudio";

export default async function InvoicesPage(props: { searchParams: { booking?: string; phone?: string; invoice?: string } | Promise<{ booking?: string; phone?: string; invoice?: string }> }) {
  const searchParams = await Promise.resolve(props.searchParams);
  return <QuoteStudio initialBookingId={searchParams.booking || ""} initialPhone={searchParams.phone || ""} initialInvoiceId={searchParams.invoice || ""} />;
}
