"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";

export default function FullImage() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.1, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.6]);

  return (
    <section ref={ref} className="relative h-[55vh] sm:h-[75vh] overflow-hidden bg-black">
      <motion.div style={{ scale }} className="absolute inset-0">
        <img
          src="/nano/nb_bohemian_walkway_cinematic.jpg"
          alt="الممشى البوهيمي في مخيمات الغدير"
          className="w-full h-full object-cover object-center"
        />
        {/* Cinematic contrast overlays to keep text ultra-legible and preserve rich colors */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/60" />
      </motion.div>
      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex items-center justify-center text-center px-4 sm:px-6"
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-[#e6c86e] text-xs sm:text-sm tracking-[0.35em] uppercase mb-4 font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {isAr ? "📍 جدة — طريق بريمان" : "📍 JEDDAH — BURAYMAN ROAD"}
          </p>
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.3] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            {isAr ? "مخيم شتوي بطابع بوهيمي عصري" : "A Modern Bohemian Winter Camp"}
          </h2>
          <div className="w-20 sm:w-28 h-px bg-gradient-to-r from-transparent via-[#cba135] to-transparent mx-auto mt-6" />
        </div>
      </motion.div>
    </section>
  );
}
