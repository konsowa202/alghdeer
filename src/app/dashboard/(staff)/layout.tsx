import React from "react";
import { redirect } from "next/navigation";
import DashboardChrome from "@/components/dashboard/DashboardChrome";
import { isStaffSession } from "@/lib/staff-session";

export default function StaffDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cryptographic session verification on the server — a forged cookie
  // never reaches any dashboard route or its data.
  if (!isStaffSession()) {
    redirect("/dashboard/login");
  }

  return <DashboardChrome>{children}</DashboardChrome>;
}
