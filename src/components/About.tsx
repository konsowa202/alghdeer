"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";

export default function About() {
  const { t, lang } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const titleScaleX = useTransform(scrollYProgress, [0, 1], [0.85, 1.08]);

  return (
    <section ref={ref} id="concept" className="py-20 sm:py-32 md:py-40 bg-white text-black overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
          >
            <p className="text-xs tracking-[0.4em] uppercase text-black/30 mb-4 sm:mb-6">{lang === "ar" ? "المفهوم" : "THE CONCEPT"}</p>

            <motion.h2
              style={{ scaleX: titleScaleX, transformOrigin: lang === "ar" ? "right center" : "left center" }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] mb-8 sm:mb-10"
            >
              {t("aboutTitle")}
            </motion.h2>

            <div className="w-12 sm:w-16 h-px bg-black/15 mb-8 sm:mb-10" />
            <p className="text-base sm:text-lg text-black/60 leading-[1.8] mb-4 sm:mb-6">{t("aboutText1")}</p>
            <p className="text-base sm:text-lg text-black/60 leading-[1.8]">{t("aboutText2")}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden group">
              <motion.div
                className="absolute inset-0 bg-white z-10 origin-top"
                initial={{ scaleY: 1 }}
                whileInView={{ scaleY: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              />
              <img src="/coffee.png" alt="Arabic Coffee Ceremony" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
