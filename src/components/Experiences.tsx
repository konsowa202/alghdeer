"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Experiences() {
  const { t, lang } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const titleScaleX = useTransform(scrollYProgress, [0, 1], [0.85, 1.08]);

  const experiences = [
    { id: "01", title: "exp1Title", desc: "exp1Desc", image: "/corporate.png" },
    { id: "02", title: "exp2Title", desc: "exp2Desc", image: "/vip.png" },
    { id: "03", title: "exp3Title", desc: "exp3Desc", image: "/campfire.png" },
  ];

  return (
    <section ref={ref} id="experiences" className="py-20 sm:py-32 md:py-40 bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="mb-12 sm:mb-20 border-b border-white/10 pb-8 sm:pb-10">
          <p className="text-xs tracking-[0.4em] uppercase text-white/30 mb-3 sm:mb-4">{lang === "ar" ? "ما نقدمه" : "WHAT WE OFFER"}</p>
          <motion.h2
            style={{ scaleX: titleScaleX, transformOrigin: lang === "ar" ? "right center" : "left center" }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black"
          >
            {t("expTitle")}
          </motion.h2>
        </div>

        <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2">
          {experiences.map((exp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className="group cursor-pointer min-w-[82%] sm:min-w-[52%] md:min-w-0 snap-start"
            >
              <div className="relative aspect-[3/4] overflow-hidden mb-4 sm:mb-6">
                <img src={exp.image} alt={t(exp.title)} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s] ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-0 right-0 left-0 p-4 sm:p-6">
                  <span className="text-white/15 text-4xl sm:text-6xl font-black block mb-2">{exp.id}</span>
                  <h3 className="text-lg sm:text-xl font-bold tracking-wider">{t(exp.title)}</h3>
                  <p className="text-white/40 text-xs sm:text-sm mt-2 leading-relaxed">{t(exp.desc)}</p>
                </div>
              </div>
              <div className="w-0 h-px bg-white group-hover:w-full transition-all duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
