"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { instagramContent } from "@/data/instagramContent";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function Events() {
  const { lang } = useLanguage();
  const prefersNarrowTitles = useMediaQuery("(max-width: 767px)");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const titleScaleX = useTransform(scrollYProgress, [0, 1], [1, 1.35]);

  const featured = instagramContent[0];
  const cards = instagramContent.slice(1, 7);

  return (
    <section ref={ref} id="events" className="py-20 sm:py-32 md:py-40 bg-black text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="mb-12 sm:mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs tracking-[0.4em] uppercase text-white/30 mb-4 sm:mb-6"
          >
            {lang === "ar" ? "من أعمالنا" : "FROM OUR WORK"}
          </motion.p>
          <div className="overflow-visible">
            <motion.h2
              style={
                prefersNarrowTitles
                  ? undefined
                  : { scaleX: titleScaleX, transformOrigin: lang === "ar" ? "right center" : "left center" }
              }
              className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black leading-[0.85] hero-kashida"
            >
              {lang === "ar" ? "فعالياتنا" : "OUR EVENTS"}
            </motion.h2>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-px bg-white/10 mt-8 sm:mt-12 origin-right rtl:origin-right ltr:origin-left"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative xl:col-span-3 aspect-video max-h-[min(56vh,560px)] sm:max-h-none sm:aspect-[16/9] xl:aspect-auto overflow-hidden border border-white/10 bg-black"
          >
            <video
              src={featured.mediaUrl}
              poster={featured.thumbnailUrl}
              autoPlay
              muted
              loop
              playsInline
              controls
              className="absolute inset-0 w-full h-full object-contain sm:object-cover"
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-black/10 to-transparent" />
            <div className="absolute bottom-0 right-0 left-0 p-5 sm:p-8">
              <span className="inline-flex text-[10px] tracking-[0.18em] uppercase px-3 py-1 bg-[#cba135] text-black font-bold mb-3">
                {lang === "ar" ? "فيديو مميز" : "Featured Reel"}
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">
                {lang === "ar" ? featured.titleAr : featured.titleEn}
              </h3>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-md">
                {lang === "ar" ? featured.captionAr : featured.captionEn}
              </p>
            </div>
          </motion.div>

          <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 sm:gap-6">
            {cards.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (i + 1) * 0.15 }}
                className="group flex flex-col sm:flex-row gap-4 sm:gap-6 items-start border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] p-3 sm:p-4 transition-colors duration-500"
              >
                <div className="relative w-full sm:w-40 md:w-48 aspect-video sm:aspect-square overflow-hidden shrink-0">
                  <img
                    src={event.mediaUrl}
                    alt={lang === "ar" ? event.titleAr : event.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold mb-2">{lang === "ar" ? event.titleAr : event.titleEn}</h3>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed line-clamp-2">
                    {lang === "ar" ? event.captionAr : event.captionEn}
                  </p>
                  <a
                    href={event.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-[10px] tracking-[0.14em] uppercase text-[#cba135] hover:text-[#d4b458]"
                  >
                    {lang === "ar" ? "شاهد على إنستجرام" : "View on Instagram"}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.a
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          href="https://www.instagram.com/alghdeer_sa"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 text-white/40 hover:text-white transition-colors text-xs sm:text-sm tracking-[0.2em] uppercase group"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
          </svg>
          @alghdeer_sa
          <span className="w-0 group-hover:w-8 h-px bg-white transition-all duration-500" />
        </motion.a>
      </div>
    </section>
  );
}
