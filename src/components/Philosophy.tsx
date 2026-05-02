"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function Philosophy() {
  const { lang } = useLanguage();
  const prefersNarrowTitles = useMediaQuery("(max-width: 767px)");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const titleScaleX = useTransform(scrollYProgress, [0, 1], [0.8, 1.12]);

  return (
    <section ref={ref} className="py-20 sm:py-32 md:py-40 bg-white text-black overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs tracking-[0.4em] uppercase text-black/30 mb-6 sm:mb-8">{lang === "ar" ? "فلسفتنا" : "OUR PHILOSOPHY"}</p>

          <motion.h2
            style={
              prefersNarrowTitles
                ? undefined
                : { scaleX: titleScaleX, transformOrigin: "center center" }
            }
            className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black leading-[1.2] mb-8 sm:mb-12 px-1"
          >
            {lang === "ar"
              ? "نؤمن أن الصحراء ليست مجرد مكان، بل هي تجربة تعيد تعريف معنى الهدوء والأصالة"
              : "We believe the desert is not just a place, but an experience that redefines tranquility & authenticity"}
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-16 sm:w-24 h-px bg-black/20 mx-auto"
          />
        </div>
      </div>
    </section>
  );
}
