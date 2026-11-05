import CustomersPanel from "@/components/dashboard/CustomersPanel";

export default function CustomersPage({ searchParams }: { searchParams: { phone?: string } }) {
  return <CustomersPanel initialPhone={searchParams.phone || ""} />;
}
