"use client";

import React, { useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function Experiences() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const prefersNarrowTitles = useMediaQuery("(max-width: 767px)");
  const ref = useRef<HTMLElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const titleScaleX = useTransform(scrollYProgress, (p) =>
    prefersNarrowTitles ? 0.94 + p * 0.14 : 0.88 + p * 0.24,
  );

  // 3 100% unique images: Glass Pavilion, Real Jeep Convoy at Sunset, and the Boy with the Bear in front of the Glass Lounge
  const experiences = [
    {
      id: "01",
      title: "exp1Title",
      desc: "exp1Desc",
      image: "/nano/nb_glass_pavilion.jpg",
      video: "/instagram/DXl3MV1Cp7o.mp4",
      objectPos: "object-center",
    },
    {
      id: "02",
      title: "exp2Title",
      desc: "exp2Desc",
      image: "/instagram/frames/frame_jeeps_convoy.jpg",
      video: "/instagram/DXl8V0yCkwI.mp4",
      objectPos: "object-center",
    },
    {
      id: "03",
      title: "exp3Title",
      desc: "exp3Desc",
      image: "/instagram/DXmFWyVCm1S.jpg",
      video: "/instagram/DXmFuKLCq9x.mp4",
      objectPos: "object-[center_28%]",
    },
  ];

  return (
    <section ref={ref} id="experiences" className="py-20 sm:py-32 md:py-40 bg-black text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="mb-12 sm:mb-16 border-b border-white/10 pb-8">
          <p className="text-xs tracking-[0.35em] uppercase text-[#cba135] mb-3">
            {isAr ? "ما نقدمه" : "WHAT WE OFFER"}
          </p>
          <motion.h2
            style={{
              scaleX: titleScaleX,
              transformOrigin: isAr ? "right center" : "left center",
            }}
            className="text-3xl sm:text-5xl md:text-6xl font-black leading-[1.2]"
          >
            {t("expTitle")}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 md:auto-rows-[260px] gap-3 sm:gap-4">
          {experiences.map((exp, i) => {
            const placement =
              i === 0
                ? "md:col-span-2 md:row-span-2 min-h-[260px] sm:min-h-[360px]"
                : i === 1
                  ? "min-h-[240px] md:col-start-3 md:row-start-1"
                  : "min-h-[260px] md:col-start-3 md:row-start-2";
            const isHovered = hoveredIdx === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setHoveredIdx(isHovered ? null : i)}
                className={`group cursor-pointer overflow-hidden relative rounded-2xl border border-white/10 hover:border-[#cba135]/60 transition-colors ${placement}`}
              >
                {/* Top Specular Glass Edge Highlight */}
                <span className="pointer-events-none absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent z-10" />

                <img
                  src={exp.image}
                  alt={t(exp.title)}
                  className={`absolute inset-0 w-full h-full object-cover ${exp.objectPos} opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000`}
                />
                {isHovered && (
                  <video
                    src={exp.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-[1]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-[2]" />
                <div className="absolute bottom-0 right-0 left-0 p-5 sm:p-6 z-[3]">
                  <span className="text-[#cba135]/40 text-3xl sm:text-5xl font-black block mb-1">
                    {exp.id}
                  </span>
                  <h3 className="text-base sm:text-xl font-bold text-white">{t(exp.title)}</h3>
                  <p className="text-white/70 text-xs sm:text-sm mt-1 leading-relaxed">{t(exp.desc)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
