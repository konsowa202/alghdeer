"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";

export default function Hero() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -55]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.82, 1], [1, 1, 0]);

  return (
    <section
      ref={ref}
      id="home"
      className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-[#071c17]"
    >
      <motion.div style={{ scale: videoScale }} className="absolute inset-0 z-0">
        <video
          src="/instagram/DXl2kAGijT4.mp4"
          poster="/instagram/frames/frame_aframe_jeeps.jpg"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#09241d]/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#071c17]/15 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(0,0,0,0.48)_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.13] mix-blend-soft-light"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 0.7px, transparent 0.7px)", backgroundSize: "5px 5px" }}
        />
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex h-full items-center justify-center px-4 pb-16 pt-32 text-center sm:px-6 sm:pb-20 sm:pt-36"
      >
        <div className="mx-auto flex w-full max-w-[1500px] flex-col items-center">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className={`mb-5 flex items-center gap-2 text-xs font-bold text-[#f4e98c] sm:mb-7 sm:text-sm md:text-base ${
              isAr ? "tracking-normal" : "uppercase tracking-[0.28em]"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#f4e98c]" />
            {isAr ? "مخيم شتوي • جدة • طريق بريمان" : "WINTER CAMP • JEDDAH • BURAYMAN"}
            <span className="h-1.5 w-1.5 rounded-full bg-[#f4e98c]" />
          </motion.p>

          <div className="w-full px-2 pb-8 pt-4 sm:pb-8 sm:pt-6 md:pb-10">
            <motion.h1
              initial={{ y: 45, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`font-black text-[#f1e785] drop-shadow-[0_8px_30px_rgba(0,0,0,0.45)] ${
                isAr
                  ? "text-[clamp(5rem,20vw,16rem)] leading-[1.08] tracking-normal"
                  : "text-[clamp(3.4rem,14.2vw,14rem)] leading-[0.9] tracking-[-0.065em]"
              }`}
            >
              {isAr ? "الغدير" : "ALGHDEER"}
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95 }}
            className={`max-w-2xl text-base font-bold leading-[1.75] text-white sm:max-w-4xl sm:text-xl md:text-2xl ${
              isAr ? "tracking-normal" : "sm:uppercase sm:tracking-[0.055em]"
            }`}
          >
            {t("heroSub")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:gap-4"
          >
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="group relative inline-flex min-h-[56px] w-full max-w-xs items-center justify-between gap-4 overflow-hidden rounded-full bg-[#f1e785] py-2 pe-2 ps-7 text-base font-black text-[#071c17] shadow-[0_18px_50px_rgba(241,231,133,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto sm:max-w-none sm:text-lg"
            >
              <span aria-hidden className="pointer-events-none absolute inset-y-0 -start-1/2 w-1/3 skew-x-[-20deg] bg-white/50 opacity-0 blur-md transition-all duration-700 group-hover:start-[120%] group-hover:opacity-100" />
              <span className="relative">{isAr ? "احجز ليلتك الآن" : "Book Your Night"}</span>
              <span className="relative grid h-10 w-10 place-items-center rounded-full bg-[#071c17] text-[#f1e785] transition-transform duration-300 group-hover:rotate-[-45deg] rtl:group-hover:rotate-45">
                <ArrowLeft size={18} className="ltr:rotate-180" />
              </span>
            </motion.a>

            <motion.a
              href="#events"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex min-h-[56px] w-full max-w-xs items-center justify-between gap-4 rounded-full border border-white/30 bg-white/10 py-2 pe-2 ps-7 text-base font-bold text-white backdrop-blur-md transition-colors duration-300 hover:border-white/60 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1e785] sm:w-auto sm:max-w-none sm:text-lg"
            >
              {isAr ? "شاهد فعالياتنا" : "Watch Our Events"}
              <span className="relative grid h-10 w-10 place-items-center rounded-full bg-white text-black">
                <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-white/40 motion-reduce:animate-none" />
                <Play size={14} className="relative fill-current" />
              </span>
            </motion.a>
          </motion.div>
        </div>
      </motion.div>

      <motion.a
        href="#events"
        aria-label={isAr ? "اسكرول للأسفل" : "Scroll down"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        style={{ opacity: contentOpacity }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] font-bold text-white/60 sm:flex"
      >
        <span className="flex h-9 w-6 justify-center rounded-full border border-white/40 pt-2">
          <motion.span
            animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-1 rounded-full bg-white"
          />
        </span>
        {isAr ? "اسكرول" : "SCROLL"}
      </motion.a>
    </section>
  );
}
