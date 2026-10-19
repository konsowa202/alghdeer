"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Tent,
  Utensils,
  Coffee,
  Sparkles,
  Gamepad2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

export default function Facilities() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const facilities = [
    {
      name: "fac1",
      icon: <Building2 size={24} />,
      subAr: "واجهات بانورامية مكيفة لاستضافة كبار الشخصيات والشركات",
      subEn: "Climate-controlled panoramic glass lounge for VIPs & corporate galas",
    },
    {
      name: "fac2",
      icon: <Tent size={24} />,
      subAr: "خيام بيضاء ومجالس أرضية ومرتفعة حول منقل النار",
      subEn: "White desert tents and heritage majlis seating around the firepit",
    },
    {
      name: "fac3",
      icon: <Utensils size={24} />,
      subAr: "طاولات ولائم مستديرة وسخانات بوفيه ذهبية ومحطات شواء",
      subEn: "Round banquet tables, golden chafing buffets & live grill stations",
    },
    {
      name: "fac4",
      icon: <Coffee size={24} />,
      subAr: "تعاون مع أرقى الكافيهات المختصة (مثل 95° CELSIUS) والقهوة السعودية",
      subEn: "Specialty coffee pop-ups (95° Celsius) & traditional Saudi coffee",
    },
    {
      name: "fac5",
      icon: <Sparkles size={24} />,
      subAr: "مسرح مفتوح للفرق التراثية والعروض المضيئة والألعاب النارية",
      subEn: "Open-air stage for cultural bands, LED shows & night-sky fireworks",
    },
    {
      name: "fac6",
      icon: <Gamepad2 size={24} />,
      subAr: "طاولات فرفيرة وتحديات شبابية وعروض شخصيات ومهرجين للأطفال",
      subEn: "Foosball tables, youth games, giant mascots & camel rides for kids",
    },
  ];

  // Auto-advance mobile carousel every 3.5 seconds when not hovered/touched
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % facilities.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused, facilities.length]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % facilities.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + facilities.length) % facilities.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // swipe right
        isAr ? handleNext() : handlePrev();
      } else {
        // swipe left
        isAr ? handlePrev() : handleNext();
      }
    }
    touchStartXRef.current = null;
  };

  const current = facilities[activeIndex];

  return (
    <section id="facilities" className="py-16 sm:py-32 bg-gradient-to-b from-[#0b0c10] to-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="text-center mb-8 sm:mb-14">
          <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#cba135]/80 mb-3">
            {isAr ? "تجهيزات مخيمات الغدير • بريمان" : "CAMP SPACES & AMENITIES • BURAYMAN"}
          </p>
          <h2 className="text-2xl sm:text-4xl md:text-6xl font-black mb-3 sm:mb-6">{t("facTitle")}</h2>
          <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-[#cba135] to-transparent mx-auto" />
        </div>

        {/* ============================================================ */}
        {/* MOBILE VIEW (< sm): Sleek, Automated Horizontal Carousel     */}
        {/* Saves mobile users from scrolling 6 stacked tall boxes        */}
        {/* ============================================================ */}
        <div
          className="block sm:hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Quick Icon Selector Tabs (Swipeable/Clickable) */}
          <div className="flex items-center justify-center gap-2 mb-4 overflow-x-auto py-1">
            {facilities.map((fac, idx) => (
              <button
                key={fac.name}
                onClick={() => setActiveIndex(idx)}
                aria-label={t(fac.name)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  idx === activeIndex
                    ? "bg-[#cba135] text-black shadow-[0_0_15px_rgba(203,161,53,0.55)] scale-110"
                    : "bg-white/[0.04] text-white/50 border border-white/10 hover:text-white"
                }`}
              >
                {React.cloneElement(fac.icon, { size: 18 })}
              </button>
            ))}
          </div>

          {/* Active Facility Card with Framer Motion slide */}
          <div className="relative border border-[#cba135]/35 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 text-center rounded-sm overflow-hidden min-h-[210px] flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            {/* Top gold counter badge */}
            <div className="flex items-center justify-between w-full mb-3 text-[11px] font-mono tracking-widest text-[#cba135]/80">
              <span className="bg-[#cba135]/15 border border-[#cba135]/30 px-2.5 py-0.5 rounded-full text-[#e6c86e]">
                0{activeIndex + 1} / 0{facilities.length}
              </span>
              <span className="text-white/40 text-[10px] uppercase tracking-wider">
                {isAr ? "تحريك تلقائي • اسحب لليمين/اليسار" : "AUTO-SLIDE • SWIPE"}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: isAr ? -25 : 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAr ? 25 : -25 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                <div className="mb-3 w-14 h-14 rounded-full border border-[#cba135] bg-[#cba135]/10 flex items-center justify-center text-[#cba135] shadow-[0_0_20px_rgba(203,161,53,0.3)]">
                  {React.cloneElement(current.icon, { size: 26 })}
                </div>
                <h3 className="text-base font-bold tracking-wider uppercase text-white mb-2">
                  {t(current.name)}
                </h3>
                <p className="text-xs text-white/70 leading-relaxed max-w-xs">
                  {isAr ? current.subAr : current.subEn}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Left & Right Prev/Next buttons */}
            <button
              onClick={handlePrev}
              aria-label="Previous"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/10 text-white/70 flex items-center justify-center active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/10 text-white/70 flex items-center justify-center active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Dots Indicator with auto-progress indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {facilities.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? "w-7 bg-[#cba135]"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* DESKTOP / TABLET VIEW (sm: and above): Full 6-Card Grid       */}
        {/* ============================================================ */}
        <div className="hidden sm:grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {facilities.map((fac, i) => (
            <motion.div
              key={fac.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="flex flex-col items-center text-center relative overflow-hidden min-h-0 border border-white/10 bg-white/[0.02] hover:border-[#cba135]/55 hover:bg-white/[0.04] px-5 py-7 sm:px-7 sm:py-9 transition-all duration-500 group"
            >
              <div className="mb-4 sm:mb-5 w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-[#cba135]/40 flex items-center justify-center text-[#cba135] group-hover:bg-[#cba135] group-hover:text-black transition-all duration-500">
                {fac.icon}
              </div>
              <h3 className="text-sm sm:text-base font-bold tracking-wider uppercase text-white mb-2">
                {t(fac.name)}
              </h3>
              <p className="text-xs sm:text-sm text-white/55 leading-relaxed max-w-xs">
                {isAr ? fac.subAr : fac.subEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
