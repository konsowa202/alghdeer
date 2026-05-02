"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Hero() {
  const { t, lang } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const extendWidth = useTransform(scrollYProgress, [0, 1], ["42%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.92, 1], [1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  // Strong, direct stretch that grows fast then completes at section end.
  const titleScaleX = useTransform(scrollYProgress, [0, 0.22, 1], [1, 1.36, 1.58]);
  const titleLetterSpacing = useTransform(scrollYProgress, [0, 0.22, 1], ["0em", "0.12em", "0.18em"]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -8]);

  return (
    <section ref={ref} id="home" className="relative h-[125vh] w-full overflow-hidden">
      <motion.div style={{ scale: imgScale }} className="absolute inset-0 z-0">
        <video
          src="/instagram/DXl2kAGijT4.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 mix-blend-overlay opacity-35">
          <img src="/hero.png" alt="مخيمات الغدير" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-transparent rtl:bg-gradient-to-l" />
      </motion.div>

      <motion.div
        style={{ opacity, y }}
        className="sticky top-0 h-screen flex items-center z-10"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 text-center">
          <div className="overflow-visible mb-5 sm:mb-7">
            <motion.div
              initial={{ y: "80%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.h1
                style={{
                  scaleX: lang === "ar" ? titleScaleX : 1,
                  letterSpacing: lang === "ar" ? titleLetterSpacing : "0em",
                  y: titleY,
                }}
                className="hero-kashida text-[clamp(4.1rem,18vw,5.85rem)] sm:text-[5.4rem] md:text-[7rem] lg:text-[9.5rem] xl:text-[11rem] font-black text-white leading-[0.95]"
              >
                {lang === "ar" ? "الغدير" : "ALGHDEER"}
              </motion.h1>
              <motion.div
                style={{
                  width: extendWidth,
                }}
                className="hero-extend-line mt-3 sm:mt-4 mx-auto"
              />
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="text-white/70 text-base sm:text-lg md:text-xl max-w-md sm:max-w-2xl mb-8 sm:mb-10 leading-relaxed mx-auto"
          >
            {t("heroSub")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.8 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
          >
            <a href="#events" className="group relative px-5 sm:px-8 py-3 sm:py-4 border border-[#cba135]/55 text-white text-[11px] sm:text-sm tracking-[0.2em] uppercase overflow-hidden text-center">
              <span className="relative z-10 group-hover:text-black transition-colors duration-500">{t("exploreBtn")}</span>
              <div className="absolute inset-0 bg-[#cba135] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rtl:origin-right" />
            </a>
            <a href="#contact" className="px-5 sm:px-8 py-3 sm:py-4 bg-[#cba135] text-black text-[11px] sm:text-sm tracking-[0.2em] uppercase font-bold hover:bg-[#d4b458] transition-all text-center">
              {t("inquireBtn")}
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
