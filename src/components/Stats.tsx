"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useInView } from "framer-motion";
import { Trophy, Users, ShieldCheck, Award, Sparkles, Activity } from "lucide-react";

function AnimatedCounter({ target, duration = 1800 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count}</span>;
}

function SoundWaveEqualizer() {
  return (
    <div className="flex items-center gap-1">
      {[14, 24, 18, 30, 22, 16, 26, 12].map((h, i) => (
        <span
          key={i}
          className="w-1 bg-[#cba135] rounded-full animate-pulse"
          style={{
            height: `${h}px`,
            animationDuration: `${0.6 + (i % 4) * 0.25}s`,
            animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Stats() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [activeRow, setActiveRow] = useState<number | null>(null);

  const metrics = [
    {
      id: 1,
      value: 60,
      suffix: "+",
      label: isAr ? "فعالية شركات وموسم ناجح" : "Corporate & Seasonal Events",
      subtext: isAr
        ? "تنظيم متكامل لحفلات الشركات الكبرى والمناسبات الفاخرة بأعلى المعايير."
        : "Turnkey execution for major corporate galas and private VIP gatherings.",
      badge: isAr ? "بطولة الفعاليات • LEVEL 60" : "CHAMPION TIER • LVL 60",
      badgeClass: "bg-[#cba135]/15 text-[#fae5a5] border-[#cba135]/30",
      icon: <Trophy size={22} className="text-[#ffd700]" />,
      progress: 92,
    },
    {
      id: 2,
      value: 1500,
      suffix: "+",
      label: isAr ? "ضيف في أمسياتنا الكبرى" : "Guests Hosted Per Season",
      subtext: isAr
        ? "عائلات ووفود استمتعوا بليالٍ شتوية ساحرة حول نار السمر وقهوة المساء."
        : "Families & delegations immersed in enchanting winter campfire evenings.",
      badge: isAr ? "مجتمع الغدير • 1.5K+ GUESTS" : "COMMUNITY • 1.5K+ GUESTS",
      badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      icon: <Users size={22} className="text-[#cba135]" />,
      progress: 96,
    },
    {
      id: 3,
      value: 100,
      suffix: "%",
      label: isAr ? "تجهيز متكامل من الضيافة للترفيه" : "Turnkey Event Execution",
      subtext: isAr
        ? "بوفيهات ملكية، مسارح مضيئة، خيام مكيفة، وألعاب تفاعلية جاهزة للتشغيل."
        : "Royal banquets, illuminated stages, AC lounges & games fully operational.",
      badge: isAr ? "جاهزية تامة • TURNKEY 100%" : "TURNKEY READY • 100%",
      badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      icon: <ShieldCheck size={22} className="text-emerald-400" />,
      progress: 100,
    },
    {
      id: 4,
      value: 5,
      suffix: "★",
      label: isAr ? "الوجهة الأولى في بريمان جدة" : "Premier Camp in Burayman",
      subtext: isAr
        ? "التقييم الأعلى في مخيمات جدة الشتوية بطابع بوهيمي عصري لا يُضاهى."
        : "Highest-rated winter bohemian retreat in Jeddah with distinct luxury.",
      badge: isAr ? "المرتبة الأولى • TOP RANK" : "PREMIER RANK • BURAYMAN",
      badgeClass: "bg-[#cba135]/15 text-[#ffd700] border-[#cba135]/35",
      icon: <Award size={22} className="text-[#ffd700]" />,
      progress: 99,
    },
  ];

  return (
    <section className="relative py-24 sm:py-36 bg-[#06070a] text-white overflow-hidden">
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#cba135]/[0.03] blur-[180px] pointer-events-none -z-0" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-16">
        {/* Section Header: Minimal, Architectural, Luxury */}
        <div className="text-center mb-14 sm:mb-18 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[#cba135] text-xs font-mono font-bold tracking-widest uppercase mb-4 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#cba135] animate-pulse" />
            <span>{isAr ? "إحصائيات وإنجازات الغدير" : "VERIFIED CAMP ACHIEVEMENTS"}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-white via-[#fae5a5] to-[#cba135] bg-clip-text text-transparent">
              {isAr ? "الثقة بالأرقام" : "Trust in Numbers"}
            </span>
          </h2>
          <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto leading-relaxed">
            {isAr
              ? "أرقام موثقة تعكس حجم الإقبال والتميز في استضافة كبرى الفعاليات ومواسم الشتاء بجدة"
              : "Documented metrics reflecting our benchmark standards in luxury desert hospitality."}
          </p>

          <div className="w-20 sm:w-28 h-px bg-gradient-to-r from-transparent via-[#cba135] to-transparent mx-auto mt-6" />
        </div>

        {/* ============================================================ */}
        {/* GRAND PANORAMIC EXPERIENCE HUB (NO SMALL BOXES!)              */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left Column (5 Cols): Bespoke Looping Animated GIF Stage */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 h-full min-h-[380px] lg:min-h-[580px] relative rounded-3xl overflow-hidden border border-white/10 bg-[#0c0d12] shadow-2xl flex flex-col justify-between group"
          >
            {/* Custom Looping Animated Visual of Alghdeer Camp */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/alghdeer_experience.gif"
                alt="Alghdeer Camp Atmosphere"
                fill
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              {/* Deep Cinematic Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d12] via-[#0c0d12]/40 to-transparent" />
            </div>

            {/* Top HUD: Live Telemetry Indicator */}
            <div className="relative z-10 p-5 sm:p-6 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white text-[11px] font-mono font-bold tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400">● LIVE</span>
                <span className="text-white/60">|</span>
                <span>{isAr ? "موسم شتاء 2026" : "WINTER 2026"}</span>
              </div>

              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center text-[#cba135]">
                <Activity size={18} />
              </div>
            </div>

            {/* Bottom HUD: Camp Fire Ambiance & Soundwave Equalizer */}
            <div className="relative z-10 p-5 sm:p-6 bg-gradient-to-t from-[#0c0d12] via-[#0c0d12]/90 to-transparent pt-12">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#cba135]">
                  {isAr ? "أجواء السمر والضيافة البوهيمية" : "BOHEMIAN CAMPFIRE AMBIANCE"}
                </span>
                <SoundWaveEqualizer />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {isAr ? "نبض ليالي الغدير في بريمان" : "The Living Pulse of Alghdeer"}
              </h3>
              <p className="text-xs text-white/65 mt-1 leading-relaxed">
                {isAr
                  ? "حيث تلتقي الأصالة العربية بالفخامة العصرية تحت نجوم سماء جدة."
                  : "Where authentic Arabian desert warmth meets refined modern luxury."}
              </p>
            </div>
          </motion.div>

          {/* Right Column (7 Cols): The 4 Grand Metric Strips (No small boxes!) */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-3 sm:gap-4">
            {metrics.map((metric, idx) => {
              const isActive = activeRow === idx;
              return (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  onMouseEnter={() => setActiveRow(idx)}
                  onMouseLeave={() => setActiveRow(null)}
                  className={`relative p-5 sm:p-6 rounded-2xl bg-[#0c0d12] border transition-all duration-300 cursor-pointer overflow-hidden ${
                    isActive
                      ? "border-[#cba135]/60 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(203,161,53,0.15)] scale-[1.01]"
                      : "border-white/[0.08] hover:border-white/20"
                  }`}
                >
                  {/* Subtle Liquid Gold Sheen on Active */}
                  <div
                    className={`absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-[#cba135]/[0.05] to-transparent transition-opacity duration-500 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  {/* Header Row: Number + Icon + Separate Badge (Zero Overlap!) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3 relative z-10">
                    <div className="flex items-center gap-4">
                      {/* Kinetic Large Counter */}
                      <div className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                        <span className="bg-gradient-to-b from-white via-white to-[#cba135] bg-clip-text text-transparent">
                          {metric.suffix === "★" && (
                            <span className="text-[#ffd700] ml-1 inline-block">★</span>
                          )}
                          <AnimatedCounter target={metric.value} duration={1600} />
                          {metric.suffix !== "★" && (
                            <span className="text-[#cba135] mr-1">{metric.suffix}</span>
                          )}
                        </span>
                      </div>

                      {/* Icon Container */}
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
                        {metric.icon}
                      </div>
                    </div>

                    {/* Dedicated Gamified Badge with generous margin and NO text collision */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border shadow-sm ${metric.badgeClass}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      {metric.badge}
                    </span>
                  </div>

                  {/* Label & Description */}
                  <div className="mb-4 relative z-10">
                    <h4 className="text-base sm:text-lg font-bold text-white mb-1">
                      {metric.label}
                    </h4>
                    <p className="text-xs text-white/55 leading-relaxed">
                      {metric.subtext}
                    </p>
                  </div>

                  {/* Liquid Fuel/Progress Bar */}
                  <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${metric.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-[#cba135] via-[#ffd700] to-[#fae5a5] rounded-full relative"
                    >
                      <span className="absolute top-0 right-0 w-2 h-full bg-white shadow-[0_0_8px_#ffffff] rounded-full animate-pulse" />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
