"use client";

import React, { useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import FloatingEmbers from "@/components/ui/FloatingEmbers";

export default function Services() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const prefersNarrowTitles = useMediaQuery("(max-width: 767px)");
  const ref = useRef<HTMLElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const titleScaleX = useTransform(scrollYProgress, (p) =>
    prefersNarrowTitles ? 0.94 + p * 0.14 : 0.88 + p * 0.24,
  );

  // 4 100% unique images: Real Golden Buffet at Sunset (DXmFce6CkDG.jpg), Campfire Majlis (nb_campfire_majlis.jpg), Real Traditional Band (DXl904UiqLC.jpg), and Starlit Royal Banquet (nb_royal_banquet.jpg)
  const services = [
    {
      id: "01",
      title: isAr ? "البوفيه الملكي المفتوح" : "Open-Air Royal Buffet",
      desc: isAr
        ? "صفوف السخانات النحاسية والذهبية الفاخرة ومحطات الشواء الحية"
        : "Rows of golden-domed chafing dishes and live grill stations",
      image: "/instagram/DXmFce6CkDG.jpg",
      video: "/instagram/DXmEhiqCpK7.mp4",
    },
    {
      id: "02",
      title: isAr ? "المجلس العربي والسمر" : "Arabian Majlis & Firepit",
      desc: isAr
        ? "جلسات تراثية حول منقل النار والقهوة السعودية الأصيلة"
        : "Sunken desert majlis around a glowing firepit with Saudi coffee",
      image: "/nano/nb_campfire_majlis.jpg",
      video: "/instagram/DdFggAcKq19.mp4",
    },
    {
      id: "03",
      title: isAr ? "الفرق التراثية والطرب الحي" : "Live Heritage Ensembles",
      desc: isAr
        ? "فقرات إنشاد وطرب أصيل وعروض التنورة المضيئة في الساحة المفتوحة"
        : "Authentic musical ensembles and LED Tanoura shows under the stars",
      image: "/instagram/DXl904UiqLC.jpg",
      video: "/instagram/DXl904UiqLC.mp4",
    },
    {
      id: "04",
      title: isAr ? "تنسيق الولائم والمناسبات" : "Bespoke Gala Styling",
      desc: isAr
        ? "طاولات ضيافة ملكية مزينة بالزهور والشموع ودلال القهوة الفاخرة"
        : "Luxury dining tables styled with florals, candlelight, and brass Dallahs",
      image: "/nano/nb_royal_banquet.jpg",
      video: "/instagram/DXmAUzWitsj.mp4",
    },
  ];

  return (
    <section ref={ref} className="relative py-20 sm:py-32 md:py-40 bg-black text-white overflow-hidden">
      {/* Campfire Embers Floating Atmosphere */}
      <FloatingEmbers count={18} />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-16">
        <div className="mb-12 sm:mb-16 border-b border-white/10 pb-8">
          <p className="text-xs tracking-[0.35em] uppercase text-[#cba135] mb-3">
            {isAr ? "خدماتنا" : "OUR SERVICES"}
          </p>
          <motion.h2
            style={{
              scaleX: titleScaleX,
              transformOrigin: isAr ? "right center" : "left center",
            }}
            className="text-3xl sm:text-5xl md:text-6xl font-black leading-[1.2]"
          >
            {isAr ? "نصنع لكم التجربة" : "We Craft Your Experience"}
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {services.map((s, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setHoveredIdx(isHovered ? null : i)}
                className="group cursor-pointer overflow-hidden relative aspect-[16/10] rounded-2xl border border-white/10 hover:border-[#cba135]/60 transition-colors"
              >
                {/* Top Specular Glass Edge Highlight */}
                <span className="pointer-events-none absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent z-10" />

                {/* Live Reel Playing Beacon */}
                {isHovered && (
                  <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-[#cba135]/60 text-[#f5df9a] text-[10px] font-bold shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#cba135] animate-ping" />
                    <span>{isAr ? "فيديو حي" : "LIVE REEL"}</span>
                  </div>
                )}

                <img
                  src={s.image}
                  alt={s.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                />
                {isHovered && (
                  <video
                    src={s.video}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-[1]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent z-[2]" />
                <div className="absolute bottom-0 right-0 left-0 p-5 sm:p-6 z-[3]">
                  <span className="text-[#cba135]/35 text-3xl sm:text-4xl font-black block mb-1">
                    {s.id}
                  </span>
                  <h3 className="text-base sm:text-xl font-bold text-white">{s.title}</h3>
                  <p className="text-white/65 text-xs sm:text-sm mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
