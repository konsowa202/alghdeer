"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function Experiences() {
  const { t, lang } = useLanguage();
  const prefersNarrowTitles = useMediaQuery("(max-width: 767px)");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const titleScaleX = useTransform(scrollYProgress, (p) =>
    prefersNarrowTitles ? 0.9 + p * 0.22 : 0.8 + p * 0.34,
  );
  const titleStretchLetter = useTransform(scrollYProgress, (p) => {
    if (lang !== "ar") return "0em";
    const em = prefersNarrowTitles ? 0.02 + p * 0.04 : p * 0.1;
    return `${em}em`;
  });

  const experiences = [
    { id: "01", title: "exp1Title", desc: "exp1Desc", image: "/corporate.png" },
    { id: "02", title: "exp2Title", desc: "exp2Desc", image: "/vip.png" },
    { id: "03", title: "exp3Title", desc: "exp3Desc", image: "/campfire.png" },
  ];

  return (
    <section ref={ref} id="experiences" className="py-20 sm:py-32 md:py-40 bg-black text-white overflow-visible">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="mb-12 sm:mb-20 border-b border-white/10 pb-8 sm:pb-10">
          <p className="text-xs tracking-[0.4em] uppercase text-white/30 mb-3 sm:mb-4">{lang === "ar" ? "ما نقدمه" : "WHAT WE OFFER"}</p>
          <motion.h2
            style={{
              scaleX: titleScaleX,
              letterSpacing: titleStretchLetter,
              transformOrigin: lang === "ar" ? "right center" : "left center",
            }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black"
          >
            {t("expTitle")}
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[minmax(140px,1fr)] sm:auto-rows-[minmax(165px,1fr)] md:auto-rows-[minmax(230px,1fr)] gap-1.5 sm:gap-2">
          {experiences.map((exp, i) => {
            const placement =
              i === 0
                ? "col-span-2 row-span-2 md:col-span-2 md:row-span-2 min-h-[220px] sm:min-h-[280px]"
                : i === 1
                  ? "col-span-1 md:col-start-3 md:row-start-1"
                  : "col-span-1 md:col-start-3 md:row-start-2 md:row-span-2";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className={`group cursor-pointer overflow-hidden relative border border-white/10 ${placement}`}
              >
                <img
                  src={exp.image}
                  alt={t(exp.title)}
                  className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-transparent" />
                <div className="absolute bottom-0 right-0 left-0 p-3 sm:p-5 md:p-6">
                  <span className="text-white/12 text-3xl sm:text-5xl md:text-6xl font-black block mb-1 sm:mb-2">{exp.id}</span>
                  <h3 className="text-sm sm:text-lg md:text-xl font-bold tracking-wider">{t(exp.title)}</h3>
                  <p className="text-white/45 text-[11px] sm:text-sm mt-1 sm:mt-2 leading-relaxed line-clamp-3">{t(exp.desc)}</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px w-0 bg-white group-hover:w-full transition-all duration-700" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
