"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  GitBranch,
  Home,
  Inbox,
  LayoutDashboard,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import StaffLogoutButton from "./StaffLogoutButton";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "نظرة عامة",
    mobileLabel: "الرئيسية",
    description: "التحليلات ونبض التشغيل",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/bookings",
    label: "الحجوزات والاستفسارات",
    mobileLabel: "الحجوزات",
    description: "البحث والإدخال والتواصل مع العملاء",
    icon: Inbox,
  },
  {
    href: "/dashboard/pipeline",
    label: "مسار الحجوزات",
    mobileLabel: "المسار",
    description: "إدارة المراحل من الطلب إلى الإتمام",
    icon: GitBranch,
  },
  {
    href: "/dashboard/invoices",
    label: "التسعير والفواتير",
    mobileLabel: "الفواتير",
    description: "التسعير الذكي واعتماد عروض الأسعار",
    icon: FileText,
  },
  {
    href: "/dashboard/customers",
    label: "العملاء",
    mobileLabel: "العملاء",
    description: "ملفات العملاء وسجل الحجوزات والفواتير",
    icon: UsersRound,
  },
  {
    href: "/dashboard/system",
    label: "حالة النظام",
    mobileLabel: "النظام",
    description: "الإشعارات والتخزين والحماية",
    icon: ShieldCheck,
  },
];

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export default function DashboardChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => isActive(pathname, item.href)) ?? NAV_ITEMS[0]!;

  return (
    <div className="min-h-screen bg-[#0b0c10] flex" dir="rtl">
      <aside className="hidden md:flex md:w-64 lg:w-[272px] md:h-screen md:sticky md:top-0 bg-[#08090b] border-l border-white/[0.08] flex-col shrink-0 z-40">
        <div className="h-24 px-6 border-b border-white/[0.07] flex items-center">
          <Link href="/dashboard" aria-label="لوحة تحكم الغدير">
            <Image src="/logo-dark-bg.png" alt="الغدير كامب" width={1205} height={190} className="w-[164px] h-auto" priority />
          </Link>
        </div>
        <div className="px-5 pt-6 pb-3">
          <p className="text-white/25 text-[10px] font-bold px-3">إدارة المخيم</p>
        </div>
        <nav className="flex flex-col gap-1.5 px-3 flex-1 overflow-y-auto" aria-label="التنقل الرئيسي">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${active ? "bg-[#cba135]/15 text-[#e5c979]" : "text-white/40 hover:text-white/75 hover:bg-white/[0.045]"}`}
              >
                {active ? <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-full bg-[#d4b458]" /> : null}
                <Icon size={19} strokeWidth={active ? 2.3 : 1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/[0.07]">
          <div className="mb-2 mx-2 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15 px-3 py-2.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400/70 text-[10px]">مزامنة الحجوزات مفعّلة</span>
          </div>
          <StaffLogoutButton />
          <Link href="/" className="flex items-center justify-center gap-2 mt-1 text-white/30 hover:text-white/60 text-xs py-2.5">
            <Home size={13} />
            الصفحة الرئيسية للموقع
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(circle_at_70%_0%,rgba(203,161,53,0.045),transparent_32%)]">
        <header className="hidden md:flex h-20 bg-black/25 border-b border-white/[0.07] items-center justify-between px-6 lg:px-8 shrink-0 sticky top-0 z-30 backdrop-blur-xl">
          <div>
            <h2 className="text-lg font-semibold text-white">{current.label}</h2>
            <p className="text-white/30 text-[10px] mt-1">{current.description}</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/35">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            لوحة إدارة الحجوزات
          </div>
        </header>

        <header className="md:hidden h-14 px-4 bg-[#08090b]/95 border-b border-white/[0.08] flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl">
          <Link href="/dashboard" aria-label="لوحة تحكم الغدير">
            <Image src="/logo-dark-bg.png" alt="الغدير كامب" width={1205} height={190} className="w-[112px] h-auto" priority />
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-white/45 text-[11px] font-bold">{current.label}</span>
            <Link href="/" aria-label="العودة إلى الموقع" className="w-8 h-8 rounded-full bg-white/[0.05] text-white/40 flex items-center justify-center"><Home size={14} /></Link>
          </div>
        </header>

        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">{children}</main>
      </div>

      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-[#090a0d]/95 border-t border-white/10 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]" aria-label="التنقل الرئيسي للموبايل">
        <div className="grid grid-cols-6 h-[72px] px-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`relative flex flex-col items-center justify-center gap-1.5 text-[10px] font-bold ${active ? "text-[#e5c979]" : "text-white/35"}`}>
                {active ? <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[#d4b458]" /> : null}
                <span className={`w-9 h-8 rounded-xl flex items-center justify-center ${active ? "bg-[#cba135]/12" : ""}`}><Icon size={19} strokeWidth={active ? 2.4 : 1.8} /></span>
                {item.mobileLabel}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
