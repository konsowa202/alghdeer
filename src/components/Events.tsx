"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import TikTokIcon from "@/components/icons/TikTokIcon";
import AngledGallery from "@/components/AngledGallery";
import { X, Volume2, VolumeX, ExternalLink, ArrowUpLeft } from "lucide-react";

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
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [activeVideo, setActiveVideo] = useState<EventItem | null>(null);
  const [isMuted, setIsMuted] = useState(false);
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

  const items = cards.map((c) => ({ ...c, previewVideo: c.videoUrl }));

  return (
    <section ref={ref} id="events" className="overflow-hidden bg-black text-white">
      <AngledGallery
        items={items}
        isAr={isAr}
        onOpen={(index) => openVideo(cards[index])}
        intro={
          <>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.35em] text-[#cba135] sm:text-sm">
              {isAr ? "عالم الغدير" : "DISCOVER ALGHDEER"}
            </p>
            <h2 className={`font-black leading-[1] text-white ${isAr ? "text-[clamp(4.5rem,17vw,13rem)]" : "text-[clamp(3.5rem,12vw,11rem)] uppercase tracking-[-0.03em]"}`}>
              {isAr ? "فعالياتنا" : "Our Events"}
            </h2>
            <p className="mt-6 inline-flex items-center gap-3 text-sm text-white/60 sm:text-base">
              <span className="relative flex h-8 w-5 justify-center rounded-full border border-white/40 pt-1.5" aria-hidden>
                <motion.span
                  animate={reduceMotion ? undefined : { y: [0, 8, 0], opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className="h-1.5 w-1 rounded-full bg-white"
                />
              </span>
              {isAr ? "اسكرول واستكشف" : "Scroll to explore"}
            </p>
          </>
        }
        outro={
          <>
            <h3 className={`font-black leading-[1] text-white ${isAr ? "text-[clamp(4rem,14vw,11rem)]" : "text-[clamp(3.5rem,12vw,10rem)] uppercase"}`}>
              {isAr ? "احجز ليلتك" : "Book Your Night"}
            </h3>
            <p className="mt-4 text-sm font-bold uppercase tracking-[0.2em] text-white/60 sm:text-base">
              {isAr ? "رحلتك إلى الغدير تبدأ من هنا" : "Your journey to Alghdeer starts here"}
            </p>
            <a
              href="#contact"
              className="group/cta mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#f1e785] py-1.5 pe-1.5 ps-6 text-sm font-black text-[#071c17] transition-transform duration-300 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-base"
            >
              {isAr ? "ابدأ رحلتك الآن" : "Start Your Journey"}
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#071c17] text-[#f1e785]">
                <ArrowUpLeft className="h-5 w-5 transition-transform duration-300 group-hover/cta:-translate-y-0.5 ltr:rotate-90" />
              </span>
            </a>
            <div className="mt-12 flex items-center justify-center gap-8">
              <a href="https://www.instagram.com/alghdeer_sa" target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-[#cba135]">Instagram @alghdeer_sa</a>
              <a href="https://www.tiktok.com/@alghdeer_sa" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-[#cba135]"><TikTokIcon className="shrink-0" size={16} /><span>TikTok</span></a>
            </div>
          </>
        }
      />

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
