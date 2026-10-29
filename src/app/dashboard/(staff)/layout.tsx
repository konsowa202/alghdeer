import React from "react";
import { redirect } from "next/navigation";
import DashboardChrome from "@/components/dashboard/DashboardChrome";
import { isStaffSession } from "@/lib/staff-session";

export default async function StaffDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Supabase validates the session and the active staff grant on the server.
  if (!(await isStaffSession())) {
    redirect("/dashboard/login");
  }

  return <DashboardChrome>{children}</DashboardChrome>;
}
