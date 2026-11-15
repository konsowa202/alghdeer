import CustomersPanel from "@/components/dashboard/CustomersPanel";

export default async function CustomersPage(props: { searchParams: { phone?: string } | Promise<{ phone?: string }> }) {
  const searchParams = await Promise.resolve(props.searchParams);
  return <CustomersPanel initialPhone={searchParams.phone || ""} />;
}
