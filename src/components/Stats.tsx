"use client";

import React, { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useInView } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import FloatingEmbers from "@/components/ui/FloatingEmbers";
import { Trophy, Users, ShieldCheck, Crown, Sparkles } from "lucide-react";

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
      label: isAr ? "فعالية شركات وموسم ناجح" : "Corporate & Seasonal Events",
      icon: <Trophy size={26} />,
      badge: isAr ? "إنجاز سنوي" : "MILESTONE",
      badgeColor: "gold" as const,
    },
    {
      value: 1500,
      suffix: "+",
      label: isAr ? "ضيف في أمسياتنا الكبرى" : "Guests Hosted Per Season",
      icon: <Users size={26} />,
      badge: isAr ? "إقبال قياسي" : "POPULAR",
      badgeColor: "amber" as const,
    },
    {
      value: 100,
      suffix: "%",
      label: isAr ? "تجهيز متكامل من الضيافة للترفيه" : "Turnkey Event Execution",
      icon: <ShieldCheck size={26} />,
      badge: isAr ? "معيار ذهبي" : "VERIFIED",
      badgeColor: "emerald" as const,
    },
    {
      value: 5,
      suffix: "★",
      label: isAr ? "الوجهة الأولى في بريمان جدة" : "Premier Camp in Burayman",
      icon: <Crown size={26} />,
      badge: isAr ? "تصنيف VIP" : "TOP RATED",
      badgeColor: "gold" as const,
    },
  ];

  return (
    <section className="relative py-24 sm:py-36 bg-gradient-to-b from-[#0b0c10] via-black to-[#0b0c10] text-white overflow-hidden">
      {/* Campfire Floating Embers Background */}
      <FloatingEmbers count={18} />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-16">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full backdrop-blur-md bg-white/[0.05] border border-white/10 text-[#f3da8c] text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
            <Sparkles size={12} className="text-[#cba135] animate-pulse" />
            <span>{isAr ? "أرقامنا في الغدير • مؤشرات الثقة" : "OUR TRACK RECORD • PROVEN EXCELLENCE"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6">
            {isAr ? "الثقة بالأرقام" : "Trust in Numbers"}
          </h2>
          <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-[#cba135] to-transparent mx-auto" />
        </div>

        {/* 4 Frosted Glassmorphism Cards with 3D Tilt & Cursor Spotlight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="h-full"
            >
              <GlassCard
                badge={stat.badge}
                badgeColor={stat.badgeColor}
                ambientBlob={true}
                enableTilt={true}
                className="items-center text-center justify-between min-h-[260px] sm:min-h-[290px]"
              >
                {/* Glowing Luxury Icon Orb */}
                <div className="mb-4 sm:mb-6 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-[#cba135]/50 bg-gradient-to-br from-[#cba135]/20 via-[#cba135]/5 to-transparent flex items-center justify-center text-[#f3da8c] shadow-[0_0_25px_rgba(203,161,53,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] group-hover/glass:scale-110 group-hover/glass:bg-[#cba135] group-hover/glass:text-black transition-all duration-500">
                  {stat.icon}
                </div>

                {/* Animated Liquid Number Counter */}
                <div className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 tracking-tight">
                  <span className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
                    <AnimatedCounter target={stat.value} />
                  </span>
                  <span className="text-[#f3da8c] drop-shadow-[0_0_15px_rgba(203,161,53,0.5)]">
                    {stat.suffix}
                  </span>
                </div>

                {/* Label */}
                <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-white/80 leading-relaxed max-w-[200px]">
                  {stat.label}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
