"use client";

import React, { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useInView } from "framer-motion";
import { Trophy, Users, ShieldCheck, Award } from "lucide-react";

function AnimatedCounter({ target, duration = 1600 }: { target: number; duration?: number }) {
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

export default function Stats() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const metrics = [
    {
      id: 1,
      value: 60,
      suffix: "+",
      tier: isAr ? "بطولة الفعاليات • LEVEL 60" : "CHAMPION TIER • LVL 60",
      label: isAr ? "فعالية شركات وموسم ناجح" : "Corporate & Seasonal Events",
      subtext: isAr
        ? "تنظيم متكامل لحفلات الشركات الكبرى والمناسبات الفاخرة بأعلى المعايير."
        : "Turnkey execution for major corporate galas and private VIP gatherings.",
      icon: <Trophy size={22} className="text-[#ffd700]" />,
      progress: 92,
    },
    {
      id: 2,
      value: 1500,
      suffix: "+",
      tier: isAr ? "مجتمع الغدير • 1.5K+ GUESTS" : "COMMUNITY • 1.5K+ GUESTS",
      label: isAr ? "ضيف في أمسياتنا الكبرى" : "Guests Hosted Per Season",
      subtext: isAr
        ? "عائلات ووفود استمتعوا بليالٍ شتوية ساحرة حول نار السمر وقهوة المساء."
        : "Families & delegations immersed in enchanting winter campfire evenings.",
      icon: <Users size={22} className="text-[#cba135]" />,
      progress: 96,
    },
    {
      id: 3,
      value: 100,
      suffix: "%",
      tier: isAr ? "تنفيذ متكامل • TURNKEY 100%" : "TURNKEY READY • 100%",
      label: isAr ? "تجهيز متكامل من الضيافة للترفيه" : "Turnkey Event Execution",
      subtext: isAr
        ? "بوفيهات ملكية، مسارح مضيئة، خيام مكيفة، وألعاب تفاعلية جاهزة للتشغيل."
        : "Royal banquets, illuminated stages, AC lounges & games fully operational.",
      icon: <ShieldCheck size={22} className="text-emerald-400" />,
      progress: 100,
    },
    {
      id: 4,
      value: 5,
      suffix: "★",
      tier: isAr ? "المرتبة الأولى • TOP RANK" : "PREMIER RANK • BURAYMAN",
      label: isAr ? "الوجهة الأولى في بريمان جدة" : "Premier Camp in Burayman",
      subtext: isAr
        ? "التقييم الأعلى في مخيمات جدة الشتوية بطابع بوهيمي عصري لا يُضاهى."
        : "Highest-rated winter bohemian retreat in Jeddah with distinct luxury.",
      icon: <Award size={22} className="text-[#ffd700]" />,
      progress: 99,
    },
  ];

  return (
    <section className="relative py-20 sm:py-28 bg-[#06070a] text-white overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-[#cba135]/[0.03] blur-[160px] pointer-events-none -z-0" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-16">
        {/* Section Header: Minimal, Architectural, Luxury (NO PULSING DOTS) */}
        <div className="text-center mb-12 sm:mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[#cba135] text-xs font-mono font-bold tracking-widest uppercase mb-4 shadow-sm">
            <span>{isAr ? "إحصائيات وإنجازات الغدير" : "VERIFIED CAMP ACHIEVEMENTS"}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-white via-[#fae5a5] to-[#cba135] bg-clip-text text-transparent">
              {isAr ? "الثقة بالأرقام" : "Trust in Numbers"}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-white/60 max-w-xl mx-auto leading-relaxed">
            {isAr
              ? "أرقام موثقة تعكس حجم الإقبال والتميز في استضافة كبرى الفعاليات ومواسم الشتاء بجدة"
              : "Documented metrics reflecting our benchmark standards in luxury desert hospitality."}
          </p>

          <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-[#cba135] to-transparent mx-auto mt-5" />
        </div>

        {/* ============================================================ */}
        {/* UNIFIED LUXURY METRIC HORIZON (NO SMALL BOXES!)              */}
        {/* ============================================================ */}
        <div className="rounded-3xl bg-[#0c0d12] border border-white/10 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-white/[0.08]">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className="p-6 sm:p-8 flex flex-col justify-between hover:bg-white/[0.02] transition-colors duration-300 relative group"
              >
                <div>
                  {/* Tier Label (Properly placed at top, NO overlapping pills) */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[11px] font-mono font-bold text-[#cba135]/80 uppercase tracking-wider">
                      {metric.tier}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center">
                      {metric.icon}
                    </div>
                  </div>

                  {/* Large High-Contrast Number */}
                  <div className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 tracking-tight">
                    <span className="bg-gradient-to-b from-white via-white to-[#cba135] bg-clip-text text-transparent">
                      {metric.suffix === "★" && (
                        <span className="text-[#ffd700] ml-1 inline-block">★</span>
                      )}
                      <AnimatedCounter target={metric.value} duration={1500} />
                      {metric.suffix !== "★" && (
                        <span className="text-[#cba135] mr-1">{metric.suffix}</span>
                      )}
                    </span>
                  </div>

                  {/* Metric Label */}
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                    {metric.label}
                  </h3>

                  {/* Subtext */}
                  <p className="text-xs text-white/50 leading-relaxed mb-6">
                    {metric.subtext}
                  </p>
                </div>

                {/* Smooth Progress Line at bottom */}
                <div className="pt-4 border-t border-white/[0.06] mt-auto">
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#cba135] to-[#ffd700] rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${metric.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
