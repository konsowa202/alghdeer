"use client";

import React, { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useInView } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { Trophy, Users, ShieldCheck, Award } from "lucide-react";

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
      icon: <Trophy size={24} />,
    },
    {
      value: 1500,
      suffix: "+",
      label: isAr ? "ضيف في أمسياتنا الكبرى" : "Guests Hosted Per Season",
      icon: <Users size={24} />,
    },
    {
      value: 100,
      suffix: "%",
      label: isAr ? "تجهيز متكامل من الضيافة للترفيه" : "Turnkey Event Execution",
      icon: <ShieldCheck size={24} />,
    },
    {
      value: 5,
      suffix: "★",
      label: isAr ? "الوجهة الأولى في بريمان جدة" : "Premier Camp in Burayman",
      icon: <Award size={24} />,
    },
  ];

  return (
    <section className="relative py-20 sm:py-32 bg-gradient-to-b from-[#0b0c10] via-black to-[#0b0c10] text-white overflow-hidden">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-16">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#cba135]/80 mb-3 font-semibold">
            {isAr ? "أرقامنا في الغدير" : "OUR IMPACT"}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6">
            {isAr ? "الثقة بالأرقام" : "Trust in Numbers"}
          </h2>
          <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-[#cba135] to-transparent mx-auto" />
        </div>

        {/* Clean Luxury Glass Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="h-full"
            >
              <GlassCard
                ambientBlob={true}
                enableTilt={true}
                className="items-center text-center justify-between min-h-[250px] sm:min-h-[280px]"
              >
                {/* Elegant Minimalist Icon Circle */}
                <div className="mb-4 sm:mb-6 w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-[#cba135]/40 bg-white/[0.02] flex items-center justify-center text-[#cba135] group-hover/glass:border-[#cba135] group-hover/glass:bg-[#cba135] group-hover/glass:text-black transition-all duration-500">
                  {stat.icon}
                </div>

                {/* Animated Number Counter */}
                <div className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 tracking-tight">
                  <span className="text-white">
                    <AnimatedCounter target={stat.value} />
                  </span>
                  <span className="text-[#cba135]">
                    {stat.suffix}
                  </span>
                </div>

                {/* Label */}
                <p className="text-xs sm:text-sm font-medium tracking-wide uppercase text-white/70 leading-relaxed max-w-[210px]">
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
