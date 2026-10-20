"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import LiquidButton from "@/components/ui/LiquidButton";
import FloatingEmbers from "@/components/ui/FloatingEmbers";
import { Sparkles, Compass } from "lucide-react";

export default function Hero() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const narrow = useMediaQuery("(max-width: 767px)");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const extendWidthWide = useTransform(scrollYProgress, [0, 1], ["42%", "100%"]);
  const extendWidthNarrow = useTransform(scrollYProgress, [0, 1], ["48%", "96%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.92, 1], [1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const titleScaleXWide = useTransform(scrollYProgress, [0, 0.22, 1], [1, 1.36, 1.58]);
  const titleScaleXNarrow = useTransform(scrollYProgress, [0, 0.22, 1], [1, 1.14, 1.26]);
  const titleLetterWide = useTransform(scrollYProgress, [0, 0.22, 1], ["0em", "0.12em", "0.18em"]);
  const titleLetterNarrow = useTransform(scrollYProgress, [0, 0.22, 1], ["0em", "0.07em", "0.11em"]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -8]);

  const titleScaleX = narrow ? titleScaleXNarrow : titleScaleXWide;
  const titleLetterSpacing = narrow ? titleLetterNarrow : titleLetterWide;
  const extendWidth = narrow ? extendWidthNarrow : extendWidthWide;

  return (
    <section ref={ref} id="home" className="relative h-[125vh] w-full overflow-hidden">
      {/* Video Background Layer with Ambient Overlays */}
      <motion.div style={{ scale: imgScale }} className="absolute inset-0 z-0">
        <video
          src="/instagram/DXl2kAGijT4.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 mix-blend-overlay opacity-25">
          <img
            src="/instagram/frames/frame_aframe_jeeps.jpg"
            alt="مخيمات الغدير"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent rtl:bg-gradient-to-l" />
      </motion.div>

      {/* Floating Campfire Embers & Desert Stars for Living Breathing Feel */}
      <FloatingEmbers count={24} />

      <motion.div
        style={{ opacity, y }}
        className="sticky top-0 h-screen flex items-center z-10"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 text-center">
          {/* Gamified Live Beacon Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full backdrop-blur-xl bg-white/[0.07] border border-white/20 text-[#f5df9a] text-[11px] sm:text-xs font-bold tracking-wider mb-5 shadow-[0_0_25px_rgba(203,161,53,0.3)] select-none"
          >
            <span className="w-2 h-2 rounded-full bg-[#cba135] animate-ping" />
            <Sparkles size={13} className="text-[#f3da8c] animate-pulse" />
            <span>{isAr ? "واحة شتوية فاخرة • بريمان، جدة" : "LUXURY WINTER OASIS • JEDDAH"}</span>
          </motion.div>

          <div className="overflow-visible mb-4 sm:mb-6">
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
                className="hero-kashida text-[clamp(4.1rem,18vw,5.85rem)] sm:text-[5.4rem] md:text-[7rem] lg:text-[9.5rem] xl:text-[11rem] font-black text-white leading-[0.95] drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
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
            className="text-white/80 text-base sm:text-lg md:text-xl max-w-md sm:max-w-2xl mb-8 sm:mb-10 leading-relaxed mx-auto font-light drop-shadow-md"
          >
            {t("heroSub")}
          </motion.p>

          {/* Liquid Interactive Buttons with Spring Physics & Gamified Touch */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-5 justify-center items-center"
          >
            {/* Primary Liquid Gold Button */}
            <LiquidButton
              href="#contact"
              variant="liquid-gold"
              size="lg"
              breathe={true}
              icon={<Sparkles size={16} />}
              iconPosition="left"
            >
              {t("inquireBtn")}
            </LiquidButton>

            {/* Secondary Frosted Liquid Glass Button */}
            <LiquidButton
              href="#events"
              variant="liquid-glass"
              size="lg"
              icon={<Compass size={16} />}
              iconPosition="right"
            >
              {t("exploreBtn")}
            </LiquidButton>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
