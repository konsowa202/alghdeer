"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Gallery() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const wordSpacing = useTransform(scrollYProgress, [0, 1], ["0em", "0.2em"]);

  // 6 100% unique real photos from @alghdeer_sa not used anywhere else on the page
  const images = [
    {
      src: "/instagram/DXmF3R1ikL_.jpg",
      span: "col-span-2 row-span-2",
      pos: "object-[center_65%]",
      titleAr: "أجواء المساء وكرنفال ستيتش",
      titleEn: "Evening Lounge & Stitch Carnival",
    },
    {
      src: "/instagram/DXmFkHbCtDS.jpg",
      span: "",
      pos: "object-center",
      titleAr: "تفاصيل الضيافة الملكية",
      titleEn: "Royal Brass Fruit Tiers",
    },
    {
      src: "/instagram/frames/frame_quad_bikes.jpg",
      span: "",
      pos: "object-center",
      titleAr: "مسارات الدبابات الليلية",
      titleEn: "Night Quad Bike Trails",
    },
    {
      src: "/instagram/DXmF-HYikuS.jpg",
      span: "row-span-2",
      pos: "object-center",
      titleAr: "الممر البوهيمي وتجربة الهجن",
      titleEn: "Bohemian Sails & Camels",
    },
    {
      src: "/instagram/DXmAUzWitsj.jpg",
      span: "",
      pos: "object-center",
      titleAr: "تنسيق الحفلات الخاصة",
      titleEn: "Bespoke Event Styling",
    },
    {
      src: "/instagram/DXmC4HPiuuJ.jpg",
      span: "",
      pos: "object-bottom",
      titleAr: "عروض الألعاب النارية",
      titleEn: "Burayman Fireworks",
    },
  ];

  return (
    <section ref={ref} id="gallery" className="py-20 sm:py-32 md:py-40 bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs tracking-[0.35em] uppercase text-[#cba135] mb-3">
            {isAr ? "المعرض" : "GALLERY"}
          </p>
          <motion.h2
            style={{ wordSpacing }}
            className="text-3xl sm:text-5xl md:text-6xl font-black leading-[1.2]"
          >
            {isAr ? "لقطات حية من الغدير" : "Glimpses of Alghdeer"}
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[160px] sm:auto-rows-[200px] md:auto-rows-[260px] gap-2 sm:gap-3">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.07 }}
              className={`${img.span} overflow-hidden rounded-2xl group relative border border-white/10 hover:border-[#cba135]/60 transition-colors`}
            >
              <img
                src={img.src}
                alt={isAr ? img.titleAr : img.titleEn}
                className={`w-full h-full object-cover ${img.pos} group-hover:scale-110 transition-transform duration-[1.8s] ease-out`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-85 group-hover:opacity-45 transition-opacity duration-500" />
              <div className="absolute bottom-3.5 inset-x-4">
                <span className="text-xs sm:text-sm font-bold text-white drop-shadow">
                  {isAr ? img.titleAr : img.titleEn}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
