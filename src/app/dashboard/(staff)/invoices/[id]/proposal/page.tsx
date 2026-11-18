import { notFound } from "next/navigation";
import ProposalDeck from "@/components/dashboard/proposal/ProposalDeck";
import { getStaffContext } from "@/lib/staff-session";
import { getInvoice } from "@/lib/invoices-store";

export const metadata = { title: "بروبوزل العميل | ALGHDEER camp" };

export default async function ProposalPage(props: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = await Promise.resolve(props.params);
  const staff = await getStaffContext();
  if (!staff) notFound();
  const invoice = await getInvoice(id, staff.accessToken);
  if (!invoice) notFound();
  return <ProposalDeck invoice={invoice} />;
}
