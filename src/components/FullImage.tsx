"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";

export default function FullImage() {
  const { lang } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.5]);
  const titleScaleX = useTransform(scrollYProgress, [0.1, 0.5], [0.8, 1.15]);

  return (
    <section ref={ref} className="relative h-[60vh] sm:h-[80vh] overflow-hidden">
      <motion.div style={{ scale }} className="absolute inset-0">
        <img src="/desert.png" alt="Desert Landscape" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50" />
      </motion.div>
      <motion.div style={{ opacity }} className="relative z-10 h-full flex items-center justify-center text-center px-4 sm:px-6">
        <div>
          <p className="text-white/50 text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-4 sm:mb-6">
            {lang === "ar" ? "📍 جدة ، المملكة العربية السعودية" : "📍 JEDDAH, SAUDI ARABIA"}
          </p>
          <motion.h2
            style={{ scaleX: titleScaleX, transformOrigin: "center center" }}
            className="text-2xl sm:text-4xl md:text-6xl lg:text-8xl font-black text-white leading-tight max-w-4xl"
          >
            {lang === "ar"
              ? "مخيم شتوي بطابع بوهيمي عصري"
              : "A Modern Bohemian Winter Camp"
            }
          </motion.h2>
        </div>
      </motion.div>
    </section>
  );
}
