"use client";

import React, { useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import TikTokIcon from "@/components/icons/TikTokIcon";
import LiquidButton from "@/components/ui/LiquidButton";
import { Play, X, Volume2, VolumeX, ExternalLink } from "lucide-react";

type BentoCardItem = {
  id: string;
  image: string;
  videoUrl: string;
  permalink: string;
  titleAr: string;
  titleEn: string;
  subAr: string;
  subEn: string;
};

export default function Events() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const prefersNarrowTitles = useMediaQuery("(max-width: 767px)");
  const ref = useRef<HTMLElement>(null);

  const [activeVideo, setActiveVideo] = useState<BentoCardItem | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const openVideo = (card: BentoCardItem) => {
    setActiveVideo(card);
    setIsMuted(false);
  };

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const titleScaleX = useTransform(scrollYProgress, (p) =>
    prefersNarrowTitles ? 1 + p * 0.18 : 1 + p * 0.35,
  );

  const cards: BentoCardItem[] = [
    {
      id: "oasis",
      image: "/nano/wbk_card_majlis_gate.jpg",
      videoUrl: "/instagram/DXl3MV1Cp7o.mp4",
      permalink: "https://www.instagram.com/reel/DXl3MV1Cp7o/",
      titleAr: "واحة الغدير",
      titleEn: "ALGHDEER OASIS",
      subAr: "جولة في القاعات والمجالس",
      subEn: "Camp & Pavilions Tour",
    },
    {
      id: "safari",
      image: "/nano/wbk_card_safari.jpg",
      videoUrl: "/instagram/DXl8V0yCkwI.mp4",
      permalink: "https://www.instagram.com/reel/DXl8V0yCkwI/",
      titleAr: "مملكة السفاري والتطعيس",
      titleEn: "DESERT SAFARI & DUNES",
      subAr: "مسارات الجيوب والدبابات",
      subEn: "4x4 Convoy & Night ATVs",
    },
    {
      id: "live",
      image: "/nano/wbk_card_live_nights.jpg",
      videoUrl: "/instagram/DXl904UiqLC.mp4",
      permalink: "https://www.instagram.com/reel/DXl904UiqLC/",
      titleAr: "ليالي الطرب",
      titleEn: "TARAB NIGHTS",
      subAr: "عروض حية وألعاب نارية",
      subEn: "Live Music & Fireworks",
    },
    {
      id: "aerial",
      image: "/nano/wbk_card_aerial_camp.jpg",
      videoUrl: "/instagram/DXmC4HPiuuJ.mp4",
      permalink: "https://www.instagram.com/reel/DXmC4HPiuuJ/",
      titleAr: "أمسيات الشركات",
      titleEn: "CORPORATE GALAS",
      subAr: "ولائم فاخرة تحت النجوم",
      subEn: "Starlit Banquets",
    },
  ];

  return (
    <section ref={ref} id="events" className="py-16 sm:py-28 md:py-36 bg-black text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        {/* Clean Minimal Header */}
        <div className="mb-10 sm:mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-[#cba135] mb-3">
              {isAr ? "عالم الغدير" : "DISCOVER ALGHDEER"}
            </p>
            <motion.h2
              style={{
                scaleX: titleScaleX,
                transformOrigin: isAr ? "right center" : "left center",
              }}
              className="text-4xl sm:text-6xl md:text-7xl font-black leading-[1.1]"
            >
              {isAr ? "فعالياتنا" : "OUR EVENTS"}
            </motion.h2>
          </div>
          <p className="text-white/50 text-xs sm:text-sm">
            {isAr ? "اضغط على أي بطاقة لمشاهدة الفيديو الحي" : "Click any card to watch the live reel"}
          </p>
        </div>

        {/* Webook.com Inspired Bento Layout (4 Square Cards + 1 Large Portal Hero Card) */}
        <div
          dir="ltr"
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch"
        >
          {/* Left 2x2 Grid (6 cols) */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
            {/* Card 1: Oasis Gate (Aquarabia style) */}
            <motion.button
              type="button"
              onClick={() => openVideo(cards[0])}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative aspect-square rounded-[16px] overflow-hidden bg-[#111] text-left focus:outline-none border border-white/10 hover:border-[#cba135]/60 transition-all"
            >
              <img
                src={cards[0].image}
                alt={cards[0].titleAr}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
              <div className="absolute top-3 right-3 w-8 h-8 rounded-[10px] bg-black/55 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[#cba135] group-hover:text-black transition-all">
                <Play size={13} className="fill-current ml-0.5" />
              </div>
              <div className="absolute bottom-3.5 inset-x-3.5 text-center" dir={isAr ? "rtl" : "ltr"}>
                <span className="inline-block text-[10px] tracking-[0.2em] uppercase text-[#e6c86e] font-bold drop-shadow">
                  {isAr ? cards[0].subAr : cards[0].subEn}
                </span>
                <h3 className="text-base sm:text-xl font-black text-white drop-shadow-md">
                  {isAr ? cards[0].titleAr : cards[0].titleEn}
                </h3>
              </div>
            </motion.button>

            {/* Card 2: Safari & Dunes (MotoGP slanted poster style) */}
            <motion.button
              type="button"
              onClick={() => openVideo(cards[1])}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="group relative aspect-square rounded-[16px] overflow-hidden bg-[#111] text-left focus:outline-none border border-white/10 hover:border-[#cba135]/60 transition-all"
            >
              <img
                src={cards[1].image}
                alt={cards[1].titleAr}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-transparent to-black/75" />
              {/* Top Motorsport Header Bar */}
              <div className="absolute top-0 inset-x-0 bg-black/80 px-3 py-1.5 flex items-center justify-between text-[8px] sm:text-[9px] tracking-[0.18em] uppercase font-bold text-white/80">
                <span>4X4 SAFARI</span>
                <span className="text-[#cba135]">BURAYMAN • JED</span>
              </div>
              {/* Tilted Poster Title */}
              <div className="absolute top-8 sm:top-10 inset-x-3 text-center transform -rotate-6">
                <h3 className="text-base sm:text-2xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] leading-none">
                  {isAr ? "تطعيس وسفاري" : "DUNE SAFARI"}
                </h3>
                <span className="inline-block mt-1 px-2 py-0.5 bg-[#cba135] text-black text-[9px] sm:text-[10px] font-black tracking-widest uppercase">
                  {isAr ? "جيوب • دبابات" : "JEEPS • ATVS"}
                </span>
              </div>
              <div className="absolute bottom-3 right-3 w-8 h-8 rounded-[10px] bg-black/65 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[#cba135] group-hover:text-black transition-all">
                <Play size={13} className="fill-current ml-0.5" />
              </div>
            </motion.button>

            {/* Card 3: Live Tarab Nights (Concert Poster style) */}
            <motion.button
              type="button"
              onClick={() => openVideo(cards[2])}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.14 }}
              className="group relative aspect-square rounded-[16px] overflow-hidden bg-[#111] text-center focus:outline-none border border-white/10 hover:border-[#cba135]/60 transition-all"
            >
              <img
                src={cards[2].image}
                alt={cards[2].titleAr}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/60" />
              <div className="absolute top-3 inset-x-3 text-center">
                <span className="text-[8px] sm:text-[9px] tracking-[0.25em] uppercase text-white/75 font-semibold block">
                  ALGHDEER STAGE
                </span>
              </div>
              <div className="absolute bottom-3.5 inset-x-3 flex flex-col items-center">
                <h3 className="text-lg sm:text-2xl font-black text-white tracking-wider uppercase leading-none mb-1.5 drop-shadow">
                  {isAr ? "ليالي الطرب" : "LIVE NIGHTS"}
                </h3>
                <span className="px-2.5 py-0.5 bg-[#cba135] text-black text-[9px] sm:text-[10px] font-black tracking-widest uppercase mb-2">
                  {isAr ? "عروض حية وألعاب نارية" : "LIVE SHOWS & FIREWORKS"}
                </span>
                <img src="/logo-white.png" alt="ALGHDEER" className="h-3 sm:h-3.5 w-auto object-contain opacity-85" />
              </div>
            </motion.button>

            {/* Card 4: Aerial Camp Oasis (Qiddiya style) */}
            <motion.button
              type="button"
              onClick={() => openVideo(cards[3])}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group relative aspect-square rounded-[16px] overflow-hidden bg-[#111] text-left focus:outline-none border border-white/10 hover:border-[#cba135]/60 transition-all"
            >
              <img
                src={cards[3].image}
                alt={cards[3].titleAr}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute top-3 right-3 w-8 h-8 rounded-[10px] bg-black/55 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-[#cba135] group-hover:text-black transition-all">
                <Play size={13} className="fill-current ml-0.5" />
              </div>
              <div className="absolute bottom-3.5 inset-x-3.5 text-center" dir={isAr ? "rtl" : "ltr"}>
                <span className="inline-block text-[10px] tracking-[0.2em] uppercase text-[#e6c86e] font-bold">
                  {isAr ? cards[3].subAr : cards[3].subEn}
                </span>
                <h3 className="text-base sm:text-xl font-black text-white">
                  {isAr ? cards[3].titleAr : cards[3].titleEn}
                </h3>
              </div>
            </motion.button>
          </div>

          {/* Right Large Portal Card (6 cols — "رحلتك إلى الغدير تبدأ هنا") */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            dir={isAr ? "rtl" : "ltr"}
            className="lg:col-span-6 relative aspect-square rounded-[16px] overflow-hidden border border-white/10 group flex flex-col justify-between p-6 sm:p-10 md:p-12"
          >
            <img
              src="/nano/wbk_portal_hero.jpg"
              alt={isAr ? "رحلتك إلى الغدير تبدأ هنا" : "Your Journey to Alghdeer Starts Here"}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/25 to-black/85" />

            {/* Top Centered Headline + Subtitle + Ticket-Notched Ribbon CTA */}
            <div className="relative z-10 text-center max-w-lg mx-auto pt-2 sm:pt-4">
              <h3 className="text-2xl sm:text-4xl md:text-[2.6rem] font-black text-white leading-[1.25] mb-2 sm:mb-3 drop-shadow-lg">
                {isAr ? "رحلتك إلى الغدير تبدأ هنا" : "Your Journey to Alghdeer Starts Here"}
              </h3>
              <p className="text-white/85 text-xs sm:text-base md:text-lg font-medium leading-relaxed mb-5 sm:mb-6">
                {isAr
                  ? "احجز تجربتك وليلتك الخاصة الآن في مخيمات الغدير بجدة"
                  : "Reserve your private night or corporate retreat at Alghdeer Camp"}
              </p>

              {/* Liquid Golden CTA Button */}
              <div className="inline-block">
                <LiquidButton
                  href="#contact"
                  variant="liquid-gold"
                  size="lg"
                  breathe={true}
                  className="font-black text-sm sm:text-base tracking-wider shadow-[0_15px_35px_rgba(203,161,53,0.55)]"
                >
                  {isAr ? "ابدأ رحلتك الآن" : "Start Your Journey"}
                </LiquidButton>
              </div>
            </div>

            {/* Bottom Row: Brand Logo + Disclaimer */}
            <div className="relative z-10 flex items-end justify-between gap-4 pt-6">
              <img
                src="/logo-dark-bg.png"
                alt="ALGHDEER camp"
                className="h-6 sm:h-8 w-auto object-contain"
              />
              <p className="text-[9px] sm:text-[11px] text-white/65 text-end leading-snug max-w-[200px]">
                {isAr
                  ? "*تُطبق الشروط والأحكام • متاح لحجوزات الشركات والعائلات"
                  : "*Terms apply • Available for corporate & private bookings"}
              </p>
            </div>

            {/* Decorative Sadu Gold Bottom Strip */}
            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#8a6412] via-[#cba135] to-[#f3db8b]" />
          </motion.div>
        </div>

        {/* Social Links Bar */}
        <div className="flex flex-wrap items-center justify-between gap-6 mt-8 sm:mt-10 pt-6 border-t border-white/10">
          <div className="flex items-center gap-8">
            <a
              href="https://www.instagram.com/alghdeer_sa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-white/50 hover:text-[#cba135] transition-colors text-xs tracking-[0.2em] uppercase"
            >
              <span>Instagram @alghdeer_sa</span>
            </a>
            <a
              href="https://www.tiktok.com/@alghdeer_sa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-white/50 hover:text-[#cba135] transition-colors text-xs tracking-[0.2em] uppercase"
            >
              <TikTokIcon className="shrink-0" size={16} />
              <span>TikTok</span>
            </a>
          </div>
        </div>
      </div>

      {/* Clean Video Reel Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl sm:max-w-2xl bg-[#0b0c10] border border-white/15 rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.9)]"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#121318]">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    {isAr ? activeVideo.titleAr : activeVideo.titleEn}
                  </h4>
                  <p className="text-[11px] text-[#cba135]">
                    {isAr ? activeVideo.subAr : activeVideo.subEn}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMuted((m) => !m)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-[#cba135] hover:text-black text-white text-xs rounded-md flex items-center gap-1.5 transition-colors font-medium"
                  >
                    {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    <span>{isMuted ? (isAr ? "تشغيل الصوت" : "Unmute") : isAr ? "صوت مفعّل" : "Sound On"}</span>
                  </button>
                  <a
                    href={activeVideo.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-white/10 hover:bg-[#cba135] hover:text-black text-white rounded-md transition-colors"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <ExternalLink size={15} />
                  </a>
                  <button
                    type="button"
                    onClick={() => setActiveVideo(null)}
                    className="p-1.5 bg-white/10 hover:bg-white/25 text-white rounded-md transition-colors"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="relative bg-black flex items-center justify-center max-h-[72vh] min-h-[300px] overflow-hidden">
                <video
                  key={activeVideo.id}
                  src={activeVideo.videoUrl}
                  autoPlay
                  muted={isMuted}
                  loop
                  playsInline
                  controls
                  className="max-h-[72vh] w-auto max-w-full object-contain mx-auto"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
