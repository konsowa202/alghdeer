import { notFound } from "next/navigation";
import ProposalDeck from "@/components/dashboard/proposal/ProposalDeck";
import { getStaffContext } from "@/lib/staff-session";
import { getInvoice } from "@/lib/invoices-store";

export const metadata = { title: "بروبوزل العميل | ALGHDEER camp" };

type Params = { id: string };
type Search = { lang?: string };

export default async function ProposalPage(props: { params: Params | Promise<Params>; searchParams?: Search | Promise<Search> }) {
  const { id } = await Promise.resolve(props.params);
  const search = (await Promise.resolve(props.searchParams)) ?? {};
  const initialLang = search.lang === "en" ? "en" : search.lang === "ar" ? "ar" : undefined;
  const staff = await getStaffContext();
  if (!staff) notFound();
  const invoice = await getInvoice(id, staff.accessToken);
  if (!invoice) notFound();
  return <ProposalDeck invoice={invoice} initialLang={initialLang} />;
}
