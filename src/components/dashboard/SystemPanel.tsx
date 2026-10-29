"use client";

import React, { useCallback, useEffect, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BellRing,
  Check,
  CheckCircle2,
  Cloud,
  Database,
  Globe2,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  RefreshCw,
  ServerCog,
  ShieldCheck,
  TimerReset,
  XCircle,
} from "lucide-react";
import { formatCreated } from "./booking-shared";
import StaffLogoutButton from "./StaffLogoutButton";

type SystemStatus = {
  checkedAt: string;
  notifications: {
    recipientCount: number;
    provider: "resend" | "smtp" | "web3forms" | "formsubmit" | "none";
    configured: boolean;
    requiresActivation: boolean;
  };
  storage: {
    cloudReachable: boolean;
    configuredFromEnvironment: boolean;
    localFallback: boolean;
  };
  protection: {
    signedSessions: boolean;
    rateLimiting: boolean;
    sameOriginMutations: boolean;
    securityHeaders: boolean;
    botHoneypot: boolean;
  };
};

const PROVIDER_LABELS = {
  resend: "Resend",
  smtp: "SMTP",
  web3forms: "Web3Forms",
  formsubmit: "FormSubmit",
  none: "غير محدد",
};

export default function SystemPanel() {
  const [data, setData] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const check = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/system/status", {
        credentials: "include",
        cache: "no-store",
      });
      if (res.status === 401) {
        window.location.href = "/dashboard/login";
        return;
      }
      const body = (await res.json().catch(() => ({}))) as SystemStatus & { error?: string };
      if (!res.ok) throw new Error(body.error || "تعذر فحص حالة النظام.");
      setData(body);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "تعذر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  return (
    <div className="max-w-[1300px] mx-auto space-y-5 md:space-y-6 pb-24 md:pb-0">
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1 pt-1">
        <div>
          <p className="text-[#d4b458] text-[11px] font-bold mb-1.5">الجاهزية والحماية</p>
          <h1 className="text-2xl md:text-3xl text-white font-bold">حالة النظام، من غير تجميل</h1>
          <p className="text-white/40 text-xs md:text-sm mt-2">فحص مباشر للتخزين والإشعارات، وقائمة واضحة بالحمايات المفعّلة والإعدادات الناقصة.</p>
        </div>
        <button type="button" onClick={() => void check()} disabled={loading} className="self-start h-10 px-4 rounded-xl bg-white/[0.06] border border-white/10 text-white/65 hover:text-white text-xs font-bold inline-flex items-center gap-2 disabled:opacity-50">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          إعادة الفحص
        </button>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 flex items-center gap-3 text-red-300 text-sm">
          <XCircle size={19} />
          {error}
        </div>
      ) : null}

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <HealthCard
          label="إشعارات الإيميل"
          icon={Mail}
          ready={Boolean(data?.notifications.configured && !data.notifications.requiresActivation)}
          loading={loading && !data}
          value={!data ? "بانتظار الفحص" : data.notifications.recipientCount === 0 ? "المستلم غير مضبوط" : data.notifications.requiresActivation ? "تحتاج تفعيلاً" : "الإعدادات مكتملة"}
          note={!data ? "—" : data.notifications.recipientCount === 0 ? "أضف NOTIFY_EMAIL" : `${PROVIDER_LABELS[data.notifications.provider]} · ${data.notifications.recipientCount} مستلم`}
        />
        <HealthCard
          label="التخزين السحابي"
          icon={Cloud}
          ready={Boolean(data?.storage.cloudReachable)}
          loading={loading && !data}
          value={!data ? "بانتظار الفحص" : data.storage.cloudReachable ? "الاتصال يعمل" : "تعذر الاتصال"}
          note="Supabase · PostgreSQL · RLS مفعّلة"
        />
        <HealthCard label="التحديث المباشر" icon={Activity} ready value="كل 10 ثوانٍ" note="مع صوت وتنبيه عند طلب جديد" />
        <HealthCard label="جلسة الإدارة" icon={LockKeyhole} ready value="موقّعة ومؤقتة" note="صلاحية الجلسة 12 ساعة" />
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <article className="rounded-2xl border border-white/[0.09] bg-[#121318] overflow-hidden">
          <CardHeader icon={BellRing} title="إشعارات الحجوزات" subtitle="الإعداد الفعلي الذي يراه الخادم" />
          <div className="p-4 md:p-5 space-y-4">
            {!data || (loading && !data) ? (
              <div className="h-36 rounded-xl bg-white/[0.035] animate-pulse" />
            ) : (
              <>
                <div className={`rounded-xl border p-4 ${data.notifications.configured ? "bg-emerald-500/[0.06] border-emerald-500/20" : "bg-amber-500/[0.06] border-amber-500/20"}`}>
                  <div className="flex items-start gap-3">
                    {data.notifications.configured ? <CheckCircle2 size={20} className="text-emerald-400 shrink-0" /> : <AlertTriangle size={20} className="text-amber-400 shrink-0" />}
                    <div>
                      <p className={`text-sm font-bold ${data.notifications.configured ? "text-emerald-300" : "text-amber-300"}`}>
                        {data.notifications.recipientCount === 0
                          ? "إشعار الإيميل لسه غير مفعّل"
                          : data.notifications.requiresActivation
                            ? "قناة FormSubmit تحتاج تفعيل أول رسالة"
                            : "بيانات المستلم ومزود الإرسال موجودة"}
                      </p>
                      <p className="text-white/40 text-xs mt-2 leading-relaxed">
                        {data.notifications.recipientCount === 0
                          ? "لن يدّعي النظام إرسال إيميل حتى تضيف عنوان المستلم. الحجز نفسه يستمر في الحفظ والظهور باللوحة."
                          : data.notifications.requiresActivation
                            ? "افتح أول رسالة من FormSubmit واضغط Activate مرة واحدة. لا يمكن للوحة تأكيد هذا الإجراء نيابة عنك."
                            : "هذه قراءة للإعدادات وليست ادعاءً بأن رسالة اختبار تم تسليمها. نتيجة الإرسال الفعلية تظهر في سجلات الخادم."}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <InfoTile label="عدد المستلمين" value={String(data.notifications.recipientCount)} />
                  <InfoTile label="مزود الإرسال" value={PROVIDER_LABELS[data.notifications.provider]} />
                </div>
                {data.notifications.recipientCount === 0 ? (
                  <div className="rounded-xl bg-black/25 border border-white/[0.07] p-4" dir="ltr">
                    <p className="text-white/35 text-[10px] mb-2" dir="rtl">متغير البيئة المطلوب لعنوان المستلم:</p>
                    <code className="text-[#d4b458] text-xs">NOTIFY_EMAIL=bookings@your-domain.com</code>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-white/[0.09] bg-[#121318] overflow-hidden">
          <CardHeader icon={Database} title="التخزين والمزامنة" subtitle="فحص قراءة حقيقي من قاعدة الحجوزات" />
          <div className="p-4 md:p-5 space-y-3">
            <StatusLine icon={Cloud} label="قراءة التخزين السحابي" ok={Boolean(data?.storage.cloudReachable)} loading={loading && !data} okText="ناجحة" failText="فشلت" />
            <StatusLine icon={Database} label="قاعدة البيانات" ok okText="Supabase / PostgreSQL" />
            <StatusLine icon={ServerCog} label="إعدادات Supabase الخاصة بالبيئة" ok={Boolean(data?.storage.configuredFromEnvironment)} okText="مضبوطة" failText="ناقصة" warning={!data?.storage.configuredFromEnvironment} />
            <StatusLine icon={LockKeyhole} label="حماية صفوف الحجوزات RLS" ok okText="مفعّلة وإلزامية" />
            <div className="pt-2 text-[10px] text-white/25 flex items-center gap-1.5">
              <TimerReset size={12} />
              {data ? `آخر فحص: ${formatCreated(data.checkedAt)}` : "لم يكتمل الفحص بعد"}
            </div>
          </div>
        </article>
      </section>

      <article className="rounded-2xl border border-white/[0.09] bg-[#121318] overflow-hidden">
        <CardHeader icon={ShieldCheck} title="الحمايات المفعّلة داخل التطبيق" subtitle="هذه إعدادات الكود الحالية؛ أمان الاستضافة وشهادة HTTPS يُراجعان كذلك على الخادم" />
        <div className="p-4 md:p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <ProtectionItem active={Boolean(data?.protection.signedSessions)} icon={KeyRound} title="جلسات HMAC موقّعة" description="الكوكي المزوّر أو المعدّل لا يفتح البيانات" />
          <ProtectionItem active={Boolean(data?.protection.rateLimiting)} icon={TimerReset} title="حدود المحاولات" description="على الدخول والنماذج وتعديلات الحجوزات" />
          <ProtectionItem active={Boolean(data?.protection.sameOriginMutations)} icon={Globe2} title="فحص مصدر الطلب" description="منع تعديلات cross-site غير الموثوقة" />
          <ProtectionItem active={Boolean(data?.protection.securityHeaders)} icon={ShieldCheck} title="Security Headers" description="CSP وHSTS ومنع التضمين وتخمين النوع" />
          <ProtectionItem active={Boolean(data?.protection.botHoneypot)} icon={CheckCircle2} title="فخ الروبوتات" description="حقل خفي مع تحقق من المدخلات وحدود الإرسال" />
          <ProtectionItem active icon={LockKeyhole} title="أسرار خارج الواجهة" description="الفحص لا يعرض كلمات المرور أو مفاتيح API" />
        </div>
      </article>

      <div className="md:hidden rounded-2xl border border-white/[0.09] bg-[#121318] p-2">
        <StaffLogoutButton />
        <Link href="/" className="block text-center text-white/35 text-xs py-3">العودة إلى الموقع</Link>
      </div>
    </div>
  );
}

function CardHeader({ icon: Icon, title, subtitle }: { icon: ComponentType<{ size?: number | string }>; title: string; subtitle: string }) {
  return (
    <header className="flex items-center gap-3 px-4 md:px-5 py-4 border-b border-white/[0.07]">
      <span className="w-9 h-9 rounded-xl bg-[#cba135]/10 text-[#d4b458] flex items-center justify-center"><Icon size={17} /></span>
      <div><h2 className="text-white text-base font-bold">{title}</h2><p className="text-white/30 text-[10px] mt-0.5">{subtitle}</p></div>
    </header>
  );
}

function HealthCard({ label, value, note, icon: Icon, ready, loading = false }: { label: string; value: string; note: string; icon: ComponentType<{ size?: number | string }>; ready: boolean; loading?: boolean }) {
  return (
    <article className="rounded-2xl border border-white/[0.09] bg-[#121318] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${ready ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}><Icon size={17} /></span>
        {loading ? <Loader2 size={15} className="text-white/30 animate-spin" /> : <span className={`w-2 h-2 rounded-full ${ready ? "bg-emerald-400" : "bg-amber-400"}`} />}
      </div>
      <p className="text-white/35 text-[10px] mt-4">{label}</p>
      <p className="text-white text-sm font-bold mt-1">{value}</p>
      <p className="text-white/25 text-[10px] mt-1 truncate" title={note}>{note}</p>
    </article>
  );
}

function StatusLine({ icon: Icon, label, ok, okText, failText = "غير مفعّل", loading = false, warning = false }: { icon: ComponentType<{ size?: number | string; className?: string }>; label: string; ok: boolean; okText: string; failText?: string; loading?: boolean; warning?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
      <Icon size={16} className="text-white/35" />
      <span className="flex-1 text-white/55 text-xs">{label}</span>
      {loading ? <Loader2 size={14} className="text-white/30 animate-spin" /> : <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${ok ? "text-emerald-400" : warning ? "text-amber-400" : "text-red-400"}`}>{ok ? <Check size={12} /> : <AlertTriangle size={12} />}{ok ? okText : failText}</span>}
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3"><p className="text-white/30 text-[10px]">{label}</p><p className="text-white text-sm font-bold mt-1.5">{value}</p></div>;
}

function ProtectionItem({ active, icon: Icon, title, description }: { active: boolean; icon: ComponentType<{ size?: number | string }>; title: string; description: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3.5 flex gap-3">
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/[0.05] text-white/30"}`}><Icon size={15} /></span>
      <div><p className="text-white/70 text-xs font-bold">{title}</p><p className="text-white/30 text-[10px] mt-1 leading-relaxed">{description}</p></div>
    </div>
  );
}
