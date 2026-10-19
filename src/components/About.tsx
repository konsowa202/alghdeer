"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";

export default function About() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const titleScaleX = useTransform(scrollYProgress, [0, 1], [0.92, 1.04]);

  return (
    <section ref={ref} id="concept" className="py-20 sm:py-32 md:py-40 bg-white text-black overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9 }}
          >
            <p className="text-xs tracking-[0.35em] uppercase text-[#a67c1e] font-bold mb-4 sm:mb-5">
              {isAr ? "المفهوم" : "THE CONCEPT"}
            </p>

            <motion.h2
              style={{ scaleX: titleScaleX, transformOrigin: isAr ? "right center" : "left center" }}
              className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.4] mb-6 sm:mb-8"
            >
              {t("aboutTitle")}
            </motion.h2>

            <div className="w-14 sm:w-20 h-0.5 bg-[#cba135] mb-6 sm:mb-8" />
            <p className="text-base sm:text-lg text-black/70 leading-[1.9] mb-4 sm:mb-5">{t("aboutText1")}</p>
            <p className="text-base sm:text-lg text-black/60 leading-[1.9] mb-8">{t("aboutText2")}</p>

            <img
              src="/logo-light-bg.png"
              alt="ALGHDEER camp"
              className="h-6 sm:h-7 w-auto object-contain opacity-90"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative aspect-[4/5] sm:aspect-[4/4] overflow-hidden rounded-2xl shadow-2xl group">
              <img
                src="/nano/nb_about_gate.jpg"
                alt={isAr ? "بوابة مخيم الغدير" : "Alghdeer Camp Gate"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
