"use client";

import React, { useRef, useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useInView } from "framer-motion";

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

  const stats = [
    { value: 45, suffix: "+", label: lang === "ar" ? "فعالية منظمة" : "Events Organized" },
    { value: 500, suffix: "+", label: lang === "ar" ? "ضيف مميز" : "VIP Guests" },
    { value: 100, suffix: "%", label: lang === "ar" ? "رضا العملاء" : "Client Satisfaction" },
    { value: 5, suffix: "★", label: lang === "ar" ? "تقييم" : "Star Rating" },
  ];

  return (
    <section className="py-20 sm:py-32 bg-gradient-to-b from-[#0b0c10] to-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#cba135]/70 mb-3">
            {lang === "ar" ? "أرقامنا" : "OUR NUMBERS"}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6">
            {lang === "ar" ? "الثقة بالأرقام" : "Trust in Numbers"}
          </h2>
          <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-[#cba135] to-transparent mx-auto" />
        </div>
        <div className="flex md:grid md:grid-cols-4 gap-8 sm:gap-12 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="flex flex-col items-center text-center relative overflow-hidden min-w-[62%] sm:min-w-[36%] md:min-w-0 snap-start border border-white/10 bg-white/[0.02] hover:border-[#cba135]/55 hover:bg-white/[0.04] px-5 py-7 sm:px-6 sm:py-8 transition-all duration-500 group"
            >
              <div className="mb-4 sm:mb-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-[#cba135]/40 flex items-center justify-center text-[#cba135] group-hover:bg-[#cba135] group-hover:text-black transition-all duration-500">
                <span className="text-lg sm:text-xl leading-none">#</span>
              </div>
              <div className="text-4xl sm:text-5xl md:text-6xl font-black mb-2 sm:mb-4">
                <span className="text-white">
                  <AnimatedCounter target={stat.value} />
                </span>
                <span className="text-[#cba135]">{stat.suffix}</span>
              </div>
              <p className="text-[11px] sm:text-sm font-semibold tracking-wider sm:tracking-[0.12em] uppercase text-white/90">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
