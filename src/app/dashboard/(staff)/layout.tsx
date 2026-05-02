import React from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import StaffLogoutButton from "@/components/dashboard/StaffLogoutButton";

export default function StaffDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0b0c10] flex flex-col md:flex-row" dir="rtl">
      <aside className="w-full md:w-64 bg-black border-b md:border-b-0 md:border-l border-white/10 flex md:flex-col shrink-0">
        <div className="p-5 md:p-6 border-b border-white/10 flex items-center justify-between md:block">
          <h1 className="text-xl font-heading text-white">
            الغدير — لوحة التحكم
          </h1>
        </div>
        <nav className="flex md:flex-col gap-1 p-3 md:p-4 md:flex-1 md:overflow-y-auto overflow-x-auto">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 bg-[#cba135]/20 text-[#d4b458] rounded-lg font-medium whitespace-nowrap shrink-0"
          >
            <Inbox size={20} />
            الحجوزات والاستفسارات
          </Link>
        </nav>
        <div className="p-3 md:p-4 border-t border-white/10 shrink-0">
          <StaffLogoutButton />
          <Link
            href="/"
            className="block mt-2 text-center text-white/35 hover:text-white/60 text-xs py-2"
          >
            الصفحة الرئيسية للموقع
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 md:h-20 bg-black/40 border-b border-white/10 flex items-center px-4 sm:px-6 lg:px-8 shrink-0">
          <h2 className="text-lg md:text-xl font-semibold text-white">
            لوحة الحجوزات
          </h2>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
