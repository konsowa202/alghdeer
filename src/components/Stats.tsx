"use client";

import React, { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useInView } from "framer-motion";
import LiquidGlassCard from "@/components/ui/LiquidGlassCard";
import { Trophy, Users, ShieldCheck, Award } from "lucide-react";

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

export default function Stats() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const stats = [
    {
      value: 60,
      suffix: "+",
      tier: isAr ? "بطولة الفعاليات • LEVEL 60" : "CHAMPION TIER • LVL 60",
      label: isAr ? "فعالية شركات وموسم ناجح" : "Corporate & Seasonal Events",
      subtext: isAr
        ? "تنظيم متكامل لحفلات الشركات الكبرى والمناسبات الفاخرة بأعلى المعايير."
        : "Turnkey execution for major corporate galas and private VIP gatherings.",
      badge: isAr ? "مستوى 60 ★" : "LVL 60 ★",
      badgeTone: "gold" as const,
      icon: <Trophy size={24} className="text-[#ffd700]" />,
      progress: 92,
    },
    {
      value: 1500,
      suffix: "+",
      tier: isAr ? "مجتمع الغدير • COMMUNITY" : "COMMUNITY • 1.5K+ GUESTS",
      label: isAr ? "ضيف في أمسياتنا الكبرى" : "Guests Hosted Per Season",
      subtext: isAr
        ? "عائلات ووفود استمتعوا بليالٍ شتوية ساحرة حول نار السمر وقهوة المساء."
        : "Families & delegations immersed in enchanting winter campfire evenings.",
      badge: isAr ? "+1500 ضيف" : "1.5K+ GUESTS",
      badgeTone: "amber" as const,
      icon: <Users size={24} className="text-[#cba135]" />,
      progress: 96,
    },
    {
      value: 100,
      suffix: "%",
      tier: isAr ? "تنفيذ متكامل • FLAWLESS" : "TURNKEY READY • 100%",
      label: isAr ? "تجهيز متكامل من الضيافة للترفيه" : "Turnkey Event Execution",
      subtext: isAr
        ? "بوفيهات ملكية، مسارح مضيئة، خيام مكيفة، وألعاب تفاعلية جاهزة للتشغيل."
        : "Royal banquets, illuminated stages, AC lounges & games fully operational.",
      badge: isAr ? "جاهزية 100%" : "100% READY",
      badgeTone: "emerald" as const,
      icon: <ShieldCheck size={24} className="text-emerald-400" />,
      progress: 100,
    },
    {
      value: 5,
      suffix: "★",
      tier: isAr ? "بريمان، جدة • TOP RANK" : "PREMIER RANK • BURAYMAN",
      label: isAr ? "الوجهة الأولى في بريمان جدة" : "Premier Camp in Burayman",
      subtext: isAr
        ? "التقييم الأعلى في مخيمات جدة الشتوية بطابع بوهيمي عصري لا يُضاهى."
        : "Highest-rated winter bohemian retreat in Jeddah with distinct luxury.",
      badge: isAr ? "المرتبة الأولى 👑" : "RANK #1 👑",
      badgeTone: "gold" as const,
      icon: <Award size={24} className="text-[#ffd700]" />,
      progress: 99,
    },
  ];

  return (
    <section className="relative py-24 sm:py-36 bg-[#06070a] text-white overflow-hidden">
      {/* Subtle luxury ambient backlight - strictly controlled gold, never blinding */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#cba135]/[0.04] blur-[160px] pointer-events-none -z-0" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-16">
        {/* Section Header: Clean, Architectural, Luxury */}
        <div className="text-center mb-16 sm:mb-20 flex flex-col items-center">
          {/* Subtle Gamified Tag */}
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

        {/* 4 Gamified Liquid Glass Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="h-full"
            >
              <LiquidGlassCard
                badgeText={stat.badge}
                badgeTone={stat.badgeTone}
                className="h-full"
              >
                <div className="p-6 sm:p-7 flex flex-col justify-between h-full text-center relative z-10">
                  {/* Top Level / Tier Bar */}
                  <div className="text-start mb-5">
                    <span className="inline-block text-[10px] font-mono font-bold tracking-wider text-[#cba135]/80 uppercase">
                      {stat.tier}
                    </span>
                  </div>

                  {/* Sleek Minimalist Circular Progress Gauge */}
                  <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-white/10"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-[#cba135] transition-all duration-1000 ease-out"
                        strokeWidth="4"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (264 * stat.progress) / 100}
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>

                    {/* Center Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {stat.icon}
                      </div>
                    </div>
                  </div>

                  {/* Kinetic Animated Counter */}
                  <div className="text-4xl sm:text-5xl font-black mb-2 tracking-tight">
                    <span className="bg-gradient-to-b from-white via-white to-[#cba135] bg-clip-text text-transparent">
                      {stat.suffix === "★" && (
                        <span className="text-[#ffd700] ml-1 inline-block">★</span>
                      )}
                      <AnimatedCounter target={stat.value} duration={1600} />
                      {stat.suffix !== "★" && (
                        <span className="text-[#cba135] mr-1">{stat.suffix}</span>
                      )}
                    </span>
                  </div>

                  {/* Label */}
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                    {stat.label}
                  </h3>

                  {/* Subtext */}
                  <p className="text-xs text-white/50 leading-relaxed mt-auto pt-3 border-t border-white/[0.06]">
                    {stat.subtext}
                  </p>

                  {/* Subtle Liquid Bottom Wave Ambient SVG */}
                  <div className="absolute -bottom-2 left-0 right-0 h-8 overflow-hidden pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                    <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-full">
                      <path
                        d="M0.00,49.98 C150.00,150.00 349.81,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
                        fill="#cba135"
                      />
                    </svg>
                  </div>
                </div>
              </LiquidGlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
