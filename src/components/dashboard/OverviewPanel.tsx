"use client";

import React, { useMemo, type ComponentType } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpLeft,
  Banknote,
  BellRing,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Globe2,
  Inbox,
  ListChecks,
  RefreshCw,
  TrendingUp,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  buildBookingAnalytics,
  formatDuration,
} from "@/lib/bookings-analytics";
import { BOOKING_STATUS_LABELS } from "@/lib/bookings-types";
import {
  formatCreated,
  formatWhen,
  StatusBadge,
  useBookingsController,
} from "./booking-shared";
import {
  BookingsAreaChart,
  BookingFunnel,
  StatusDonutChart,
} from "./charts";

export default function OverviewPanel() {
  const controller = useBookingsController();
  const {
    rows,
    loading,
    loadError,
    unauthorized,
    newCount,
    clearNewCount,
    refresh,
  } = controller;
  const analytics = useMemo(() => buildBookingAnalytics(rows), [rows]);

  if (unauthorized) {
    return <SessionExpired />;
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-5 md:space-y-6 pb-24 md:pb-0">
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1 pt-1">
        <div>
          <p className="text-[#d4b458] text-[11px] font-bold tracking-wide mb-1.5">مركز التشغيل</p>
          <h1 className="text-2xl md:text-3xl text-white font-bold">صورة كاملة، لحظة بلحظة</h1>
          <p className="text-white/40 text-xs md:text-sm mt-2">
            تحليل الطلبات والمناسبات وكفاءة مسار الحجز من نفس البيانات المباشرة.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`inline-flex items-center gap-1.5 text-[11px] rounded-full px-3 py-2 border ${loadError ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${loadError ? "bg-red-400" : "bg-emerald-400 animate-pulse"}`} />
            {loadError ? "اتصال متقطع" : "مباشر"}
          </span>
          <button
            type="button"
            onClick={() => void refresh()}
            className="h-9 px-3.5 rounded-xl bg-white/[0.06] border border-white/10 text-white/65 hover:text-white hover:bg-white/10 text-xs font-bold inline-flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            تحديث
          </button>
        </div>
      </section>

      {newCount > 0 ? (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-2 ps-4">
          <button type="button" onClick={clearNewCount} className="flex-1 flex items-center gap-2 text-emerald-300 text-sm font-bold text-right py-2">
            <BellRing size={18} />
            {newCount === 1 ? "وصل طلب جديد من الموقع" : `وصل ${newCount} طلبات جديدة من الموقع`}
          </button>
          <Link href="/dashboard/bookings" className="px-4 py-2 rounded-xl bg-emerald-400 text-[#07150f] text-xs font-black text-center">
            مراجعة الآن
          </Link>
        </div>
      ) : null}

      {loadError ? <ErrorBanner message={loadError} /> : null}
      {controller.mutationError ? <ErrorBanner message={controller.mutationError} /> : null}

      {analytics.overduePending > 0 ? (
        <Link
          href="/dashboard/pipeline"
          className="group flex items-center gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] p-4 hover:bg-amber-500/[0.12] transition-colors"
        >
          <span className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-300 flex items-center justify-center shrink-0">
            <AlertTriangle size={19} />
          </span>
          <span className="flex-1">
            <strong className="block text-amber-200 text-sm">{analytics.overduePending} طلبات تنتظر المراجعة منذ أكثر من 24 ساعة</strong>
            <span className="block text-amber-200/45 text-[11px] mt-1">ابدأ بها لتقليل زمن الاستجابة وتحسين التحويل.</span>
          </span>
          <ArrowLeft size={18} className="text-amber-300/60 group-hover:-translate-x-1 transition-transform" />
        </Link>
      ) : null}

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricCard
          label="إجمالي الطلبات"
          value={analytics.total}
          note={`${analytics.currentWeek} خلال آخر 7 أيام`}
          icon={Inbox}
          tone="gold"
          trend={analytics.weeklyDelta}
        />
        <MetricCard
          label="تحتاج إجراء"
          value={analytics.pending}
          note={`${analytics.active} حجز نشط في المسار`}
          icon={Clock3}
          tone="amber"
        />
        <MetricCard
          label="مناسبات خلال 7 أيام"
          value={analytics.upcoming7Count}
          note={`${analytics.upcoming.length} ضمن أقرب المواعيد`}
          icon={CalendarDays}
          tone="sky"
        />
        <MetricCard
          label="ضيوف مؤكدون قادمون"
          value={analytics.expectedGuests}
          note={`متوسط المجموعة ${analytics.averageGroupSize} شخص`}
          icon={UsersRound}
          tone="violet"
        />
        <MetricCard
          label="معدل التحويل"
          value={`${analytics.conversionRate}%`}
          note={`إتمام ${analytics.completionRate}% · إلغاء ${analytics.cancellationRate}%`}
          icon={TrendingUp}
          tone="emerald"
          className="col-span-2 lg:col-span-1"
        />
      </section>

      <section className="grid xl:grid-cols-[minmax(0,1.75fr)_minmax(300px,0.8fr)] gap-4">
        <DashboardCard
          title="حركة الطلبات"
          subtitle="آخر 30 يوماً · الموقع والإدخال اليدوي"
          icon={Activity}
          action={<span className="text-[11px] text-white/35">{analytics.today} طلبات اليوم</span>}
        >
          {loading && rows.length === 0 ? <ChartSkeleton /> : <BookingsAreaChart data={analytics.dailySeries} />}
        </DashboardCard>
        <DashboardCard title="توزيع الحالات" subtitle="أين تقف كل الطلبات الآن؟" icon={ListChecks}>
          {loading && rows.length === 0 ? <ChartSkeleton /> : <StatusDonutChart data={analytics.statusDistribution} total={analytics.total} />}
        </DashboardCard>
      </section>

      <section className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <DashboardCard title="تحليل مسار التحويل" subtitle="نسبة الوصول لكل مرحلة من الطلبات غير الملغاة" icon={TrendingUp}>
          <BookingFunnel flow={analytics.flow} />
        </DashboardCard>

        <DashboardCard title="كفاءة التشغيل" subtitle="متوسط الزمن المحسوب من سجل الحالات الفعلي" icon={Clock3}>
          <div className="space-y-3">
            {analytics.processDurations.map((duration, index) => {
              const icons = [CheckCircle2, Banknote, CalendarClock];
              const Icon = icons[index]!;
              return (
                <div key={duration.key} className="rounded-xl bg-white/[0.035] border border-white/[0.07] p-3.5">
                  <div className="flex items-center gap-2 text-white/50 text-xs mb-2">
                    <Icon size={15} className="text-[#d4b458]" />
                    {duration.label}
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <strong className={`text-lg ${duration.hours === null ? "text-white/30 text-sm" : "text-white"}`}>
                      {formatDuration(duration.hours)}
                    </strong>
                    <span className="text-[10px] text-white/30">{duration.samples} عينة</span>
                  </div>
                </div>
              );
            })}
            <p className="text-[10px] text-white/25 leading-relaxed">الحجوزات القديمة التي لا تحتوي سجل انتقالات لا تدخل في حساب الزمن، حتى لا تظهر أرقام غير حقيقية.</p>
          </div>
        </DashboardCard>

        <DashboardCard
          title="أقرب المناسبات"
          subtitle="مرتبة بالموعد، ولا تشمل الملغى أو المكتمل"
          icon={CalendarClock}
          action={<Link href="/dashboard/bookings" className="text-[#d4b458] text-[11px] font-bold">كل الحجوزات</Link>}
          className="lg:col-span-2 xl:col-span-1"
        >
          <div className="space-y-2">
            {analytics.upcoming.length === 0 ? (
              <EmptyState text="لا توجد مناسبات قادمة مسجلة." />
            ) : (
              analytics.upcoming.map((booking) => (
                <div key={booking.id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <span className="w-9 h-9 rounded-lg bg-[#cba135]/10 text-[#d4b458] flex items-center justify-center shrink-0">
                    <CalendarDays size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-xs font-bold truncate">{booking.name} <span className="text-white/30 font-normal">· {booking.groupSize} ضيوف</span></p>
                    <p className="text-white/40 text-[10px] mt-1 truncate">{formatWhen(booking.preferredAt)}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))
            )}
          </div>
        </DashboardCard>
      </section>

      <section className="grid xl:grid-cols-2 gap-4">
        <DashboardCard title="أحدث النشاط" subtitle="آخر انتقالات الحالة المسجلة على الحجوزات" icon={Activity}>
          {analytics.activity.length === 0 ? (
            <EmptyState text="سيظهر هنا كل تغيير حالة فور حدوثه." />
          ) : (
            <div className="relative space-y-1 before:absolute before:right-[15px] before:top-4 before:bottom-4 before:w-px before:bg-white/[0.08]">
              {analytics.activity.map((event, index) => (
                <div key={`${event.booking.id}-${event.at}-${index}`} className="relative flex gap-3 py-2.5">
                  <span className="relative z-10 w-8 h-8 rounded-full bg-[#191a20] border border-white/10 text-[#d4b458] flex items-center justify-center shrink-0">
                    <Activity size={13} />
                  </span>
                  <div className="min-w-0 flex-1 border-b border-white/[0.055] pb-3">
                    <p className="text-xs text-white/70 leading-relaxed">
                      <strong className="text-white">{event.booking.name}</strong>
                      <span> انتقل إلى </span>
                      <strong style={{ color: event.status === "cancelled" ? "#ef7474" : "#d4b458" }}>{BOOKING_STATUS_LABELS[event.status]}</strong>
                    </p>
                    <p className="text-[10px] text-white/30 mt-1" dir="ltr">{event.booking.id} · {formatCreated(event.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          title="أحدث الطلبات"
          subtitle={`${analytics.sources.website} من الموقع · ${analytics.sources.staff} من الفريق`}
          icon={Inbox}
          action={<Link href="/dashboard/pipeline" className="text-[#d4b458] text-[11px] font-bold">فتح المسار</Link>}
        >
          <div className="space-y-2">
            {analytics.recentBookings.length === 0 ? (
              <EmptyState text="لا توجد طلبات حتى الآن." />
            ) : (
              analytics.recentBookings.map((booking) => (
                <Link key={booking.id} href="/dashboard/bookings" className="flex items-center gap-3 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/[0.035] p-2.5 transition-colors">
                  <span className="w-9 h-9 rounded-full bg-white/[0.06] text-white/50 flex items-center justify-center shrink-0">
                    {booking.source === "website" ? <Globe2 size={16} /> : <UserRound size={16} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-white text-xs font-bold truncate">{booking.name} · {booking.company}</span>
                    <span className="block text-white/30 text-[10px] mt-1">{formatCreated(booking.createdAt)}</span>
                  </span>
                  <StatusBadge status={booking.status} />
                  <ChevronLeft size={15} className="text-white/20 shrink-0" />
                </Link>
              ))
            )}
          </div>
        </DashboardCard>
      </section>
    </div>
  );
}

function DashboardCard({
  title,
  subtitle,
  icon: Icon,
  action,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  icon: ComponentType<{ size?: number | string; className?: string }>;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <article className={`rounded-2xl border border-white/[0.09] bg-[#121318]/90 shadow-[0_16px_45px_rgba(0,0,0,0.12)] overflow-hidden ${className}`}>
      <header className="flex items-center gap-3 px-4 md:px-5 py-4 border-b border-white/[0.07]">
        <span className="w-9 h-9 rounded-xl bg-[#cba135]/10 text-[#d4b458] flex items-center justify-center shrink-0">
          <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-white text-sm md:text-base font-bold">{title}</h2>
          {subtitle ? <p className="text-white/30 text-[10px] mt-0.5 leading-relaxed">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      <div className="p-4 md:p-5">{children}</div>
    </article>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
  trend,
  className = "",
}: {
  label: string;
  value: number | string;
  note: string;
  icon: ComponentType<{ size?: number | string }>;
  tone: "gold" | "amber" | "sky" | "violet" | "emerald";
  trend?: number | null;
  className?: string;
}) {
  const tones = {
    gold: "text-[#d4b458] bg-[#cba135]/12 border-[#cba135]/20",
    amber: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    sky: "text-sky-300 bg-sky-500/10 border-sky-500/20",
    violet: "text-violet-300 bg-violet-500/10 border-violet-500/20",
    emerald: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  };
  return (
    <article className={`rounded-2xl border border-white/[0.09] bg-[#121318]/90 p-4 min-h-[142px] flex flex-col justify-between ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-white/45 text-[11px] leading-relaxed">{label}</p>
        <span className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${tones[tone]}`}><Icon size={16} /></span>
      </div>
      <div className="mt-3">
        <div className="flex items-center gap-2">
          <strong className="text-2xl md:text-[28px] text-white tabular-nums">{value}</strong>
          {trend !== undefined && trend !== null ? (
            <span className={`inline-flex items-center text-[10px] font-bold ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`} dir="ltr">
              {trend >= 0 ? <ArrowUpLeft size={12} /> : <ArrowDownLeft size={12} />}
              {Math.abs(trend)}%
            </span>
          ) : null}
        </div>
        <p className="text-white/28 text-[10px] mt-1.5 truncate" title={note}>{note}</p>
      </div>
    </article>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="min-h-28 flex items-center justify-center text-center text-white/25 text-xs border border-dashed border-white/[0.08] rounded-xl p-4">{text}</div>;
}

function ChartSkeleton() {
  return <div className="h-[250px] rounded-xl bg-white/[0.035] animate-pulse" />;
}

function ErrorBanner({ message }: { message: string }) {
  return <p className="rounded-xl border border-red-500/25 bg-red-500/10 text-red-300 text-xs p-3.5">{message}</p>;
}

function SessionExpired() {
  return (
    <div className="max-w-md mx-auto mt-16 rounded-2xl bg-red-500/10 border border-red-500/25 p-8 text-center">
      <p className="text-red-300 font-bold mb-2">انتهت الجلسة</p>
      <p className="text-white/45 text-sm mb-5">سجل الدخول مرة أخرى لعرض بيانات التشغيل.</p>
      <Link href="/dashboard/login" className="inline-block px-6 py-2.5 bg-[#cba135] text-black font-bold rounded-lg">تسجيل الدخول</Link>
    </div>
  );
}
