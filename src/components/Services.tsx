"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { Pause, Play } from "lucide-react";
import Carousel3D from "@/components/Carousel3D";
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
      image: "/instagram/frames/bohemian_majlis.jpg",
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
      image: "/instagram/frames/banquet_styling.jpg",
      video: "/instagram/DXmAUzWitsj.mp4",
    },
  ];

  // 8 cards around the ring (services shown twice) so the cylinder feels full
  const ring = [...services, ...services].map((sv, i) => ({ id: `${sv.id}-${i}`, image: sv.image, video: sv.video, title: sv.title, desc: sv.desc }));


  return (
    <section ref={ref} className="py-20 sm:py-32 md:py-40 bg-black text-white overflow-hidden">
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

      <Carousel3D
        isAr={isAr}
        items={ring}
        renderCaption={(_, i, ctl) => {
          const sv = services[i % services.length];
          return (
            <div dir={isAr ? "rtl" : "ltr"}>
              <span className="text-sm font-black text-[#f1e785]">{sv.id}</span>
              <h3 className="mt-1 text-2xl font-black text-white sm:text-4xl">{sv.title}</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">{sv.desc}</p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={ctl.play}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 text-sm font-bold text-white backdrop-blur-md transition-colors hover:border-white/60 hover:bg-white/20"
                >
                  {ctl.playing ? <Pause size={13} className="fill-current" /> : <Play size={13} className="fill-current" />}
                  {ctl.playing ? (isAr ? "إيقاف الفيديو" : "Stop video") : isAr ? "شاهد الفيديو" : "Watch video"}
                </button>
                <a
                  href="#contact"
                  className="inline-flex min-h-11 items-center rounded-full bg-[#f1e785] px-6 text-sm font-black text-[#071c17] transition-transform hover:scale-[1.04]"
                >
                  {isAr ? "احجز هذه التجربة" : "Book this experience"}
                </a>
              </div>
            </div>
          );
        }}
      />

    </section>
  );
}
