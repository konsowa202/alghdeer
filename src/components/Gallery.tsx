"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Gallery() {
  const { lang } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const wordSpacing = useTransform(scrollYProgress, [0, 1], ["0em", "0.3em"]);

  const images = [
    { src: "/hero.png", span: "col-span-2 row-span-2" },
    { src: "/coffee.png", span: "" },
    { src: "/corporate.png", span: "" },
    { src: "/vip.png", span: "row-span-2" },
    { src: "/campfire.png", span: "" },
    { src: "/desert.png", span: "" },
  ];

  return (
    <section ref={ref} id="gallery" className="py-20 sm:py-32 md:py-40 bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="text-center mb-12 sm:mb-20">
          <p className="text-xs tracking-[0.4em] uppercase text-white/30 mb-3 sm:mb-4">{lang === "ar" ? "المعرض" : "GALLERY"}</p>
          <motion.h2
            style={{ wordSpacing }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black"
          >
            {lang === "ar" ? "لقطات من الغدير" : "Glimpses of Alghdeer"}
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[minmax(158px,1fr)] sm:auto-rows-[188px] md:auto-rows-[250px] gap-1.5 sm:gap-2">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className={`${img.span} overflow-hidden group cursor-pointer relative`}
            >
              <img src={img.src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-out" />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
