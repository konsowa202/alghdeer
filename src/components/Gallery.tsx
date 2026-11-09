"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import MediaBento from "@/components/MediaBento";
import { galleryMedia } from "@/data/galleryMedia";

export default function Gallery() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.25"] });
  const headY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [60, 0]);
  const headOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  return (
    <section ref={ref} id="gallery" className="overflow-hidden bg-black py-20 text-white sm:py-28 md:py-36">
      <div className="mx-auto w-full max-w-[1600px] px-3 sm:px-6 lg:px-10">
        <motion.div
          style={{ y: headY, opacity: headOpacity }}
          className="mb-8 flex flex-col justify-between gap-4 px-1 sm:mb-12 sm:flex-row sm:items-end"
        >
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[#cba135]">{isAr ? "المعرض" : "GALLERY"}</p>
            <h2 className="text-3xl font-black leading-[1.2] sm:text-5xl md:text-6xl">
              {isAr ? "لقطات حية من الغدير" : "Glimpses of Alghdeer"}
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-7 text-white/50">
            {isAr ? "مرّر على اللقطات لتكبر، واضغط لتعيشها بملء الشاشة." : "Hover a moment to expand it, click to go full-screen."}
          </p>
        </motion.div>

        <MediaBento items={galleryMedia} isAr={isAr} />
      </div>
    </section>
  );
}
