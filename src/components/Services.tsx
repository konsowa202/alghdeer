"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";
import ServiceDeck, { type DeckItem } from "@/components/ServiceDeck";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function Services() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const prefersNarrowTitles = useMediaQuery("(max-width: 767px)");
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const titleScaleX = useTransform(scrollYProgress, (p) =>
    prefersNarrowTitles ? 0.94 + p * 0.14 : 0.88 + p * 0.24,
  );

  // Real stills extracted from the camp's own video footage.
  const services: DeckItem[] = [
    {
      id: "01",
      title: isAr ? "البوفيه الملكي المفتوح" : "Open-Air Royal Buffet",
      desc: isAr
        ? "أبراج الفواكه الموسمية وصفوف السخانات الذهبية ومحطات الشواء الحية"
        : "Seasonal fruit towers, golden chafing dishes and live grill stations",
      image: "/instagram/DXmFkHbCtDS.jpg",
    },
    {
      id: "02",
      title: isAr ? "المجلس العربي والسمر" : "Arabian Majlis & Firepit",
      desc: isAr
        ? "جلسات تراثية حول منقل النار والقهوة السعودية الأصيلة"
        : "Sunken desert majlis around a glowing firepit with Saudi coffee",
      image: "/instagram/frames/bohemian_majlis.jpg",
      video: "/instagram/DdFggAcKq19.mp4",
      // landscape clip turns blurry in the tall phone card — use a sharp portrait still
      mobile: { image: "/instagram/C0_ANXSMVj2.jpg", video: null },
    },
    {
      id: "03",
      title: isAr ? "الفرق التراثية والطرب الحي" : "Live Heritage Ensembles",
      desc: isAr
        ? "فقرات إنشاد وطرب أصيل وعروض التنورة المضيئة في الساحة المفتوحة"
        : "Authentic musical ensembles and LED Tanoura shows under the stars",
      image: "/instagram/DXl904UiqLC.jpg",
      video: "/instagram/DXl904UiqLC.mp4",
      // portrait LED-show clip fits the phone card
      mobile: { image: "/instagram/DXmCMTdih8s.jpg", video: "/instagram/DXmCMTdih8s.mp4" },
    },
    {
      id: "04",
      title: isAr ? "تنسيق الولائم والمناسبات" : "Bespoke Gala Styling",
      desc: isAr
        ? "طاولات ضيافة ملكية مزينة بالزهور والشموع ودلال القهوة الفاخرة"
        : "Luxury dining tables styled with florals, candlelight, and brass Dallahs",
      image: "/instagram/frames/banquet_styling.jpg",
      video: "/instagram/DXmAUzWitsj.mp4",
      // the clip wanders to unrelated shots — show the sharp banquet-tables photo on phones
      mobile: { image: "/instagram/DXmI-0gikCg.jpg", video: null },
    },
  ];

  const deck = services;

  return (
    <section ref={ref} className="bg-black pt-20 text-white [overflow-x:clip] sm:pt-32 md:pt-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="mb-4 sm:mb-6 border-b border-white/10 pb-8">
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

      </div>

      <ServiceDeck items={deck} isAr={isAr} />

    </section>
  );
}
