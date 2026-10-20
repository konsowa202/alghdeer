"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useInView } from "framer-motion";
import LiquidFlameCard from "@/components/ui/LiquidFlameCard";
import { Trophy, Users, ShieldCheck, Award, Flame, Zap, Star } from "lucide-react";

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
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
      badge: isAr ? "نجاح 100%" : "100% Success",
      icon: <Trophy size={26} className="text-[#ffd700]" />,
      progress: 92,
      glowColor: "gold" as const,
    },
    {
      value: 1500,
      suffix: "+",
      tier: isAr ? "قبيلة الغدير • COMMUNITY" : "LEGENDARY TRIBE • 1.5K+",
      label: isAr ? "ضيف في أمسياتنا الكبرى" : "Guests Hosted Per Season",
      subtext: isAr
        ? "عائلات ووفود استمتعوا بليالٍ شتوية ساحرة حول نار السمر وقهوة المساء."
        : "Families & delegations immersed in enchanting winter campfire evenings.",
      badge: isAr ? "سمر ليلي 🔥" : "Campfire Nights 🔥",
      icon: <Users size={26} className="text-[#ff9500]" />,
      progress: 96,
      glowColor: "fire" as const,
    },
    {
      value: 100,
      suffix: "%",
      tier: isAr ? "تنفيذ متكامل • FLAWLESS" : "TURNKEY READY • 100%",
      label: isAr ? "تجهيز متكامل من الضيافة للترفيه" : "Turnkey Event Execution",
      subtext: isAr
        ? "بوفيهات ملكية، مسارح مضيئة، خيام مكيفة، وألعاب تفاعلية جاهزة للتشغيل."
        : "Royal banquets, illuminated stages, AC lounges & games fully operational.",
      badge: isAr ? "جاهزية فورية" : "Full Execution",
      icon: <ShieldCheck size={26} className="text-emerald-400" />,
      progress: 100,
      glowColor: "gold" as const,
    },
    {
      value: 5,
      suffix: "★",
      tier: isAr ? "بريمان، جدة • TOP RANK" : "PREMIER RANK • BURAYMAN",
      label: isAr ? "الوجهة الأولى في بريمان جدة" : "Premier Camp in Burayman",
      subtext: isAr
        ? "التقييم الأعلى في مخيمات جدة الشتوية بطابع بوهيمي عصري لا يُضاهى."
        : "Highest-rated winter bohemian retreat in Jeddah with distinct luxury.",
      badge: isAr ? "المرتبة الأولى 👑" : "Rank #1 👑",
      icon: <Award size={26} className="text-[#ffd700]" />,
      progress: 99,
      glowColor: "crimson" as const,
    },
  ];

  return (
    <section className="relative py-24 sm:py-36 bg-gradient-to-b from-[#06070a] via-[#0b0c10] to-[#06070a] text-white overflow-hidden">
      {/* Dynamic Molten Lava Ambient Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[900px] h-[450px] bg-gradient-to-tr from-[#ff3b00]/10 via-[#cba135]/12 to-transparent blur-[140px] pointer-events-none -z-0" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-16">
        {/* Section Header with Animated Campfire Flame GIF */}
        <div className="text-center mb-16 sm:mb-20 flex flex-col items-center">
          {/* Flame Mascot / Campfire Energy */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative mb-3 flex items-center justify-center"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 relative filter drop-shadow-[0_0_20px_rgba(255,100,0,0.6)]">
              <Image
                src="/campfire_flame.gif"
                alt="Campfire Flame"
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* Gamified Section Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff5500]/10 border border-[#ff5500]/30 text-[#ff8c00] text-xs font-mono font-bold tracking-widest uppercase mb-4 shadow-[0_0_20px_rgba(255,85,0,0.2)]">
            <Flame size={14} className="animate-pulse" />
            <span>{isAr ? "إنجازات وإحصائيات الغدير" : "VERIFIED CAMP ACHIEVEMENTS"}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-white via-[#ffe6a3] to-[#cba135] bg-clip-text text-transparent">
              {isAr ? "الثقة بالأرقام" : "Trust in Numbers"}
            </span>
          </h2>
          <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto leading-relaxed">
            {isAr
              ? "أرقام موثقة تعكس حجم الإقبال والتميز في استضافة كبرى الفعاليات ومواسم الشتاء بجدة"
              : "Documented metrics reflecting our benchmark standards in luxury desert hospitality."}
          </p>

          <div className="w-24 sm:w-32 h-[2px] bg-gradient-to-r from-transparent via-[#ff8c00] to-transparent mx-auto mt-6" />
        </div>

        {/* 4 Gamified Liquid Flame Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="h-full"
            >
              <LiquidFlameCard
                glowColor={stat.glowColor}
                badgeText={stat.badge}
                badgeTone={stat.glowColor === "gold" ? "gold" : "fire"}
                className="h-full"
              >
                <div className="p-6 sm:p-7 flex flex-col justify-between h-full text-center relative z-10">
                  {/* Top Level / Tier Bar */}
                  <div className="text-start mb-6">
                    <span className="inline-block text-[10px] font-mono font-bold tracking-wider text-[#ffd700]/70 uppercase">
                      {stat.tier}
                    </span>
                  </div>

                  {/* Center Gamified Circular Progress Gauge with Icon */}
                  <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    {/* Circular SVG Gauge */}
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-white/10"
                        strokeWidth="6"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-[url(#flame-grad)] transition-all duration-1000 ease-out"
                        strokeWidth="6"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (264 * stat.progress) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                      <defs>
                        <linearGradient id="flame-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ff2a00" />
                          <stop offset="50%" stopColor="#ff8c00" />
                          <stop offset="100%" stopColor="#ffd700" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Center Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-13 h-13 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center shadow-[inset_0_0_15px_rgba(255,100,0,0.3)]">
                        {stat.icon}
                      </div>
                    </div>
                  </div>

                  {/* Large Kinetic Number */}
                  <div className="text-4xl sm:text-5xl font-black mb-2 tracking-tight">
                    <span className="bg-gradient-to-b from-white via-[#fff0c7] to-[#e5b33d] bg-clip-text text-transparent">
                      {stat.suffix === "★" && (
                        <span className="text-amber-400 ml-1 inline-block">★</span>
                      )}
                      <AnimatedCounter target={stat.value} duration={1800} />
                      {stat.suffix !== "★" && (
                        <span className="text-[#ff8c00] mr-1">{stat.suffix}</span>
                      )}
                    </span>
                  </div>

                  {/* Label */}
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                    {stat.label}
                  </h3>

                  {/* Subtext */}
                  <p className="text-xs text-white/55 leading-relaxed mt-auto pt-2 border-t border-white/[0.06]">
                    {stat.subtext}
                  </p>
                </div>
              </LiquidFlameCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
