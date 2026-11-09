"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";

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

          <div className="w-full px-2 pb-8 pt-4 sm:pb-12 sm:pt-6 md:pb-20">
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
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.15 }}
            className="mt-6 sm:mt-8"
          >
            <a
              href="#contact"
              className="group inline-flex min-h-12 items-center gap-4 rounded-full border border-white/35 bg-black/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:border-[#f1e785] hover:bg-[#f1e785] hover:text-[#071c17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1e785] sm:text-base"
            >
              {isAr ? "احجز تجربتك" : "Book Your Experience"}
              <span aria-hidden="true" className="text-xl leading-none transition-transform duration-300 group-hover:-translate-y-0.5 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1">↗</span>
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
