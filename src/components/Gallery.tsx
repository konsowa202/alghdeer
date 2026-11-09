"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, Pause, Play, X } from "lucide-react";

type GalleryItem = {
  src: string;
  poster?: string;
  type: "image" | "video";
  titleAr: string;
  titleEn: string;
};

const items: GalleryItem[] = [
  { src: "/instagram/DXmF3R1ikL_.jpg", type: "image", titleAr: "ليلة على أرض الغدير", titleEn: "A Night at Alghdeer" },
  { src: "/instagram/DXmFkHbCtDS.jpg", type: "image", titleAr: "تفاصيل الضيافة", titleEn: "Hospitality Details" },
  { src: "/instagram/DXmEhiqCpK7.mp4", poster: "/instagram/DXmEhiqCpK7.jpg", type: "video", titleAr: "أجواء حية", titleEn: "Live Atmosphere" },
  { src: "/instagram/DXmF-HYikuS.jpg", type: "image", titleAr: "الممر البوهيمي", titleEn: "Bohemian Walkway" },
  { src: "/instagram/DXmAUzWitsj.jpg", type: "image", titleAr: "مناسبات على مقاسك", titleEn: "Bespoke Occasions" },
  { src: "/instagram/frames/frame_quad_bikes.jpg", type: "image", titleAr: "مغامرات الدبابات", titleEn: "Quad Adventures" },
  { src: "/instagram/DXmDKJiigK4.mp4", poster: "/instagram/DXmDKJiigK4.jpg", type: "video", titleAr: "من قلب التجربة", titleEn: "Inside the Experience" },
  { src: "/instagram/DXmC4HPiuuJ.jpg", type: "image", titleAr: "سهرة وألعاب نارية", titleEn: "Fireworks Nights" },
];

export default function Gallery() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const ref = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [playing, setPlaying] = useState(!reduceMotion);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const wordSpacing = useTransform(scrollYProgress, [0, 1], ["0em", isAr ? "0em" : "0.12em"]);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback((direction: number) => {
    setActive((current) => current === null ? null : (current + direction + items.length) % items.length);
  }, []);

  useEffect(() => {
    if (active === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [active, close, step]);

  const cardClass = (index: number) => {
    if (index === 0) return "col-span-2 row-span-2 min-h-[330px] md:col-span-2 md:row-span-2 md:min-h-0";
    if (index === 3) return "row-span-2 min-h-[300px] md:row-span-1 md:min-h-0";
    return "min-h-[155px] md:min-h-0";
  };

  return (
    <section ref={ref} id="gallery" className="overflow-hidden bg-black py-20 text-white sm:py-32 md:py-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:mb-14 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[#cba135]">{isAr ? "المعرض" : "GALLERY"}</p>
            <motion.h2 style={{ wordSpacing }} className="text-3xl font-black leading-[1.2] sm:text-5xl md:text-6xl">
              {isAr ? "لقطات حية من الغدير" : "Glimpses of Alghdeer"}
            </motion.h2>
          </div>
          <p className="max-w-xs text-sm leading-7 text-white/50">
            {isAr ? "مرّر بين البطاقات، واضغط لتعيش اللقطة." : "Explore the cards, then open a moment to make it full-screen."}
          </p>
        </div>

        <motion.div
          layout
          onMouseLeave={() => setHovered(null)}
          className="grid auto-rows-[155px] grid-cols-2 gap-2 rounded-[24px] border border-white/15 bg-white/[0.035] p-2 sm:auto-rows-[190px] sm:gap-3 sm:p-3 md:grid-cols-4 md:auto-rows-[240px] lg:auto-rows-[270px]"
        >
          {items.map((item, index) => (
            <motion.button
              layout
              key={item.src}
              type="button"
              aria-label={`${isAr ? "فتح" : "Open"} ${isAr ? item.titleAr : item.titleEn}`}
              onClick={() => setActive(index)}
              onMouseEnter={() => setHovered(index)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
              initial={reduceMotion ? false : { opacity: 0, y: 34, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }, duration: 0.6, delay: index * 0.045 }}
              className={`group relative overflow-hidden rounded-[17px] bg-[#111] text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1e785] ${cardClass(index)}`}
              style={{ flexGrow: hovered === index ? 1.5 : 1 }}
            >
              <motion.div layout className="absolute inset-0">
                {item.type === "video" ? (
                  <video
                    src={item.src}
                    poster={item.poster}
                    autoPlay={!reduceMotion}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <img src={item.src} alt={isAr ? item.titleAr : item.titleEn} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                )}
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-black/10 transition-opacity group-hover:opacity-70" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                <div>
                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#f1e785]">
                    {String(index + 1).padStart(2, "0")} / {item.type === "video" ? (isAr ? "فيديو" : "FILM") : (isAr ? "صورة" : "STILL")}
                  </span>
                  <h3 className="text-sm font-black sm:text-lg">{isAr ? item.titleAr : item.titleEn}</h3>
                </div>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 bg-black/25 backdrop-blur-md transition-colors group-hover:border-[#f1e785] group-hover:bg-[#f1e785] group-hover:text-black">
                  {item.type === "video" ? <Play size={14} className="fill-current" /> : <Maximize2 size={14} />}
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {active !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={isAr ? items[active].titleAr : items[active].titleEn}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-xl sm:p-8"
          >
            <button ref={closeRef} type="button" onClick={close} aria-label={isAr ? "إغلاق" : "Close"} className="absolute end-4 top-4 z-20 grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/50 transition-colors hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1e785] sm:end-8 sm:top-8">
              <X size={20} />
            </button>
            <button type="button" onClick={(event) => { event.stopPropagation(); step(-1); }} aria-label={isAr ? "السابق" : "Previous"} className="absolute start-2 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/50 transition-colors hover:bg-white hover:text-black sm:start-8">
              <ChevronLeft className="rtl:rotate-180" />
            </button>
            <button type="button" onClick={(event) => { event.stopPropagation(); step(1); }} aria-label={isAr ? "التالي" : "Next"} className="absolute end-2 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/50 transition-colors hover:bg-white hover:text-black sm:end-8">
              <ChevronRight className="rtl:rotate-180" />
            </button>
            <motion.figure
              key={items[active].src}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
              className="flex max-h-[88vh] w-full max-w-5xl flex-col items-center justify-center px-8 sm:px-16"
            >
              {items[active].type === "video" ? (
                <div className="relative max-h-[76vh]">
                  <video src={items[active].src} poster={items[active].poster} autoPlay={playing} muted loop playsInline controls className="max-h-[76vh] max-w-full rounded-2xl object-contain" />
                  <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? (isAr ? "إيقاف مؤقت" : "Pause") : (isAr ? "تشغيل" : "Play")} className="absolute end-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur-md">
                    {playing ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>
              ) : (
                <img src={items[active].src} alt={isAr ? items[active].titleAr : items[active].titleEn} className="max-h-[76vh] max-w-full rounded-2xl object-contain" />
              )}
              <figcaption className="mt-4 text-center text-sm font-bold text-white/80 sm:text-base">{isAr ? items[active].titleAr : items[active].titleEn}</figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
