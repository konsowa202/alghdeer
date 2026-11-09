"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform, AnimatePresence, useReducedMotion } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import TikTokIcon from "@/components/icons/TikTokIcon";
import AngledGallery from "@/components/AngledGallery";
import { Play, X, Volume2, VolumeX, ExternalLink, ArrowUpLeft } from "lucide-react";

type EventItem = {
  id: string;
  image: string;
  videoUrl: string;
  permalink: string;
  titleAr: string;
  titleEn: string;
  subAr: string;
  subEn: string;
};

const cards: EventItem[] = [
  { id: "camp", image: "/instagram/frames/glass_lounge.jpg", videoUrl: "/instagram/DXl3MV1Cp7o.mp4", permalink: "https://www.instagram.com/reel/DXl3MV1Cp7o/", titleAr: "مخيم الغدير", titleEn: "ALGHDEER CAMP", subAr: "جولة في القاعات والمجالس", subEn: "Camp & Pavilions Tour" },
  { id: "safari", image: "/instagram/frames/desert_safari.jpg", videoUrl: "/instagram/DXl8V0yCkwI.mp4", permalink: "https://www.instagram.com/reel/DXl8V0yCkwI/", titleAr: "مملكة السفاري والتطعيس", titleEn: "DESERT SAFARI & DUNES", subAr: "مسارات الجيوب والدبابات", subEn: "4x4 Convoy & Night ATVs" },
  { id: "live", image: "/instagram/frames/live_music.jpg", videoUrl: "/instagram/DXl904UiqLC.mp4", permalink: "https://www.instagram.com/reel/DXl904UiqLC/", titleAr: "ليالي الطرب", titleEn: "TARAB NIGHTS", subAr: "عروض حية وألعاب نارية", subEn: "Live Music & Fireworks" },
  { id: "aerial", image: "/instagram/frames/fireworks.jpg", videoUrl: "/instagram/DXmC4HPiuuJ.mp4", permalink: "https://www.instagram.com/reel/DXmC4HPiuuJ/", titleAr: "أمسيات الشركات", titleEn: "CORPORATE GALAS", subAr: "ولائم فاخرة تحت النجوم", subEn: "Starlit Banquets" },
];

export default function Events() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const prefersNarrowTitles = useMediaQuery("(max-width: 767px)");
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [activeVideo, setActiveVideo] = useState<EventItem | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const titleScaleX = useTransform(scrollYProgress, (p) => reduceMotion ? 1 : prefersNarrowTitles ? 1 + p * 0.12 : 1 + p * 0.25);
  const openVideo = (card: EventItem) => { setActiveVideo(card); setIsMuted(false); };

  useEffect(() => {
    if (!activeVideo) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setActiveVideo(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [activeVideo]);

  return (
    <section ref={ref} id="events" className="overflow-hidden bg-black py-16 text-white sm:py-28 md:py-36">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:mb-14 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[#cba135]">{isAr ? "عالم الغدير" : "DISCOVER ALGHDEER"}</p>
            <motion.h2 style={{ scaleX: titleScaleX, transformOrigin: isAr ? "right center" : "left center" }} className="text-4xl font-black leading-[1.1] sm:text-6xl md:text-7xl">
              {isAr ? "فعالياتنا" : "OUR EVENTS"}
            </motion.h2>
          </div>
          <p className="text-xs text-white/50 sm:text-sm">{isAr ? "اسكرول واستكشف، واضغط لمشاهدة التجربة" : "Scroll to explore, then open an experience"}</p>
        </div>

        <AngledGallery items={cards} isAr={isAr} progress={scrollYProgress} onOpen={(index) => openVideo(cards[index])} />

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          dir={isAr ? "rtl" : "ltr"}
          className="group relative mt-16 flex min-h-[430px] flex-col justify-between overflow-hidden rounded-[22px] border border-white/10 p-6 sm:mt-24 sm:min-h-[520px] sm:p-10 md:p-12"
        >
          <img src="/instagram/frames/camp_portal.jpg" alt={isAr ? "رحلتك إلى الغدير تبدأ هنا" : "Your Journey to Alghdeer Starts Here"} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/25 to-black/85" />
          <div className="relative z-10 mx-auto max-w-lg pt-2 text-center sm:pt-4">
            <h3 className="mb-2 text-2xl font-black leading-[1.25] text-white drop-shadow-lg sm:mb-3 sm:text-4xl md:text-[2.6rem]">{isAr ? "رحلتك إلى الغدير تبدأ هنا" : "Your Journey to Alghdeer Starts Here"}</h3>
            <p className="mb-5 text-xs font-medium leading-relaxed text-white/85 sm:mb-6 sm:text-base md:text-lg">{isAr ? "احجز تجربتك وليلتك الخاصة الآن في مخيمات الغدير بجدة" : "Reserve your private night or corporate retreat at Alghdeer Camp"}</p>
            <a href="#contact" className="group/cta inline-flex min-h-12 items-center gap-4 rounded-full border border-white/30 bg-black/20 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:border-[#f1e785] hover:bg-[#f1e785] hover:text-[#071c17] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1e785] sm:text-base">
              {isAr ? "ابدأ رحلتك الآن" : "Start Your Journey"}
              <ArrowUpLeft className="h-5 w-5 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5 rtl:rotate-[-90deg]" />
            </a>
          </div>
          <div className="relative z-10 flex items-end justify-between gap-4 pt-6">
            <img src="/logo-dark-bg.png" alt="ALGHDEER camp" className="h-6 w-auto object-contain sm:h-8" />
            <p className="max-w-[200px] text-end text-[9px] leading-snug text-white/65 sm:text-[11px]">{isAr ? "*تُطبق الشروط والأحكام • متاح لحجوزات الشركات والعائلات" : "*Terms apply • Available for corporate & private bookings"}</p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-[#8a6412] via-[#cba135] to-[#f3db8b]" />
        </motion.div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-6 sm:mt-10">
          <div className="flex items-center gap-8">
            <a href="https://www.instagram.com/alghdeer_sa" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-[#cba135]"><span>Instagram @alghdeer_sa</span></a>
            <a href="https://www.tiktok.com/@alghdeer_sa" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-[#cba135]"><TikTokIcon className="shrink-0" size={16} /><span>TikTok</span></a>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeVideo && (
          <motion.div role="dialog" aria-modal="true" aria-label={isAr ? activeVideo.titleAr : activeVideo.titleEn} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveVideo(null)} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 backdrop-blur-xl sm:p-6">
            <motion.div initial={reduceMotion ? { opacity: 0 } : { scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }} onClick={(event) => event.stopPropagation()} className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-[#0b0c10] shadow-[0_25px_60px_rgba(0,0,0,0.9)] sm:max-w-2xl">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#121318] px-4 py-3">
                <div><h4 className="text-sm font-bold text-white sm:text-base">{isAr ? activeVideo.titleAr : activeVideo.titleEn}</h4><p className="text-[11px] text-[#cba135]">{isAr ? activeVideo.subAr : activeVideo.subEn}</p></div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setIsMuted((muted) => !muted)} className="flex min-h-10 items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#cba135] hover:text-black">{isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}<span className="hidden sm:inline">{isMuted ? (isAr ? "تشغيل الصوت" : "Unmute") : isAr ? "صوت مفعّل" : "Sound On"}</span></button>
                  <a href={activeVideo.permalink} target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center rounded-md bg-white/10 text-white transition-colors hover:bg-[#cba135] hover:text-black" aria-label="Instagram"><ExternalLink size={15} /></a>
                  <button ref={closeRef} type="button" onClick={() => setActiveVideo(null)} className="grid h-10 w-10 place-items-center rounded-md bg-white/10 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1e785]" aria-label={isAr ? "إغلاق" : "Close"}><X size={16} /></button>
                </div>
              </div>
              <div className="relative flex max-h-[72vh] min-h-[300px] items-center justify-center overflow-hidden bg-black"><video key={activeVideo.id} src={activeVideo.videoUrl} autoPlay={!reduceMotion} muted={isMuted} loop playsInline controls className="mx-auto max-h-[72vh] w-auto max-w-full object-contain" /></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
