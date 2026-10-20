"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import FloatingEmbers from "@/components/ui/FloatingEmbers";
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
      icon: <Building2 size={26} />,
      badge: "VIP",
      badgeColor: "gold" as const,
      subAr: "واجهات بانورامية مكيفة لاستضافة كبار الشخصيات والشركات",
      subEn: "Climate-controlled panoramic glass lounge for VIPs & corporate galas",
    },
    {
      name: "fac2",
      icon: <Tent size={26} />,
      badge: isAr ? "تراثي" : "HERITAGE",
      badgeColor: "amber" as const,
      subAr: "خيام بيضاء ومجالس أرضية ومرتفعة حول منقل النار",
      subEn: "White desert tents and heritage majlis seating around the firepit",
    },
    {
      name: "fac3",
      icon: <Utensils size={26} />,
      badge: isAr ? "ملكي" : "ROYAL",
      badgeColor: "gold" as const,
      subAr: "طاولات ولائم مستديرة وسخانات بوفيه ذهبية ومحطات شواء",
      subEn: "Round banquet tables, golden chafing buffets & live grill stations",
    },
    {
      name: "fac4",
      icon: <Coffee size={26} />,
      badge: "95° CELSIUS",
      badgeColor: "amber" as const,
      subAr: "تعاون مع أرقى الكافيهات المختصة (مثل 95° CELSIUS) والقهوة السعودية",
      subEn: "Specialty coffee pop-ups (95° Celsius) & traditional Saudi coffee",
    },
    {
      name: "fac5",
      icon: <Sparkles size={26} />,
      badge: isAr ? "عروض حية" : "LIVE SHOWS",
      badgeColor: "gold" as const,
      subAr: "مسرح مفتوح للفرق التراثية والعروض المضيئة والألعاب النارية",
      subEn: "Open-air stage for cultural bands, LED shows & night-sky fireworks",
    },
    {
      name: "fac6",
      icon: <Gamepad2 size={26} />,
      badge: isAr ? "ترفيه وسفاري" : "ACTIVITIES",
      badgeColor: "emerald" as const,
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
    <section id="facilities" className="relative py-20 sm:py-36 bg-gradient-to-b from-[#0b0c10] via-black to-[#0b0c10] text-white overflow-hidden">
      {/* Campfire Floating Embers */}
      <FloatingEmbers count={20} />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-16">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full backdrop-blur-md bg-white/[0.05] border border-white/10 text-[#f3da8c] text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
            <Sparkles size={12} className="text-[#cba135] animate-pulse" />
            <span>{isAr ? "تجهيزات مخيمات الغدير • بريمان" : "CAMP SPACES & AMENITIES • BURAYMAN"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-3 sm:mb-6">{t("facTitle")}</h2>
          <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-[#cba135] to-transparent mx-auto" />
        </div>

        {/* ============================================================ */}
        {/* MOBILE VIEW (< sm): Frosted Glass Horizontal Carousel         */}
        {/* ============================================================ */}
        <div
          className="block sm:hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Quick Icon Selector Tabs (Swipeable/Clickable Pill Strip) */}
          <div className="flex items-center justify-center gap-2 mb-4 overflow-x-auto py-1.5 px-1">
            {facilities.map((fac, idx) => (
              <button
                key={fac.name}
                onClick={() => setActiveIndex(idx)}
                aria-label={t(fac.name)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  idx === activeIndex
                    ? "bg-gradient-to-r from-[#d4a73b] to-[#f3da8c] text-black shadow-[0_0_15px_rgba(203,161,53,0.6)] scale-110"
                    : "bg-white/[0.05] text-white/50 border border-white/10 hover:text-white"
                }`}
              >
                {React.cloneElement(fac.icon, { size: 18 })}
              </button>
            ))}
          </div>

          {/* Active Facility Card with Frosted Glassmorphism */}
          <div className="relative rounded-2xl p-6 text-center backdrop-blur-2xl bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.015] border border-[#cba135]/40 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_1.5px_rgba(255,255,255,0.2)] overflow-hidden min-h-[230px] flex flex-col items-center justify-center">
            {/* Top Specular Edge Highlight */}
            <span className="pointer-events-none absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

            {/* Top gold counter badge */}
            <div className="flex items-center justify-between w-full mb-3 text-[11px] font-mono tracking-widest text-[#cba135]/90">
              <span className="bg-[#cba135]/15 border border-[#cba135]/30 px-2.5 py-0.5 rounded-full text-[#f5df9a] font-bold">
                0{activeIndex + 1} / 0{facilities.length}
              </span>
              <span className="text-[#f3da8c] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10">
                {current.badge}
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
                <div className="mb-3 w-14 h-14 rounded-2xl border border-[#cba135] bg-gradient-to-br from-[#cba135]/25 via-[#cba135]/10 to-transparent flex items-center justify-center text-[#f3da8c] shadow-[0_0_20px_rgba(203,161,53,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)]">
                  {React.cloneElement(current.icon, { size: 26 })}
                </div>
                <h3 className="text-base font-bold tracking-wider uppercase text-white mb-2">
                  {t(current.name)}
                </h3>
                <p className="text-xs text-white/75 leading-relaxed max-w-xs">
                  {isAr ? current.subAr : current.subEn}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Left & Right Prev/Next buttons */}
            <button
              onClick={handlePrev}
              aria-label="Previous"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/15 text-white/80 hover:text-white flex items-center justify-center active:scale-95 transition-all shadow-md"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/15 text-white/80 hover:text-white flex items-center justify-center active:scale-95 transition-all shadow-md"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {facilities.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex
                    ? "w-7 bg-gradient-to-r from-[#d4a73b] to-[#f3da8c]"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* DESKTOP / TABLET VIEW (sm: and above): Full Frosted Glass Grid*/}
        {/* ============================================================ */}
        <div className="hidden sm:grid sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {facilities.map((fac, i) => (
            <motion.div
              key={fac.name}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="h-full"
            >
              <GlassCard
                badge={fac.badge}
                badgeColor={fac.badgeColor}
                ambientBlob={true}
                enableTilt={true}
                className="items-center text-center justify-between min-h-[270px]"
              >
                <div className="mb-5 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-[#cba135]/50 bg-gradient-to-br from-[#cba135]/20 via-[#cba135]/5 to-transparent flex items-center justify-center text-[#f3da8c] shadow-[0_0_20px_rgba(203,161,53,0.25),inset_0_1px_1px_rgba(255,255,255,0.4)] group-hover/glass:scale-110 group-hover/glass:bg-[#cba135] group-hover/glass:text-black transition-all duration-500">
                  {fac.icon}
                </div>
                <h3 className="text-base sm:text-lg font-bold tracking-wider uppercase text-white mb-2">
                  {t(fac.name)}
                </h3>
                <p className="text-xs sm:text-sm text-white/65 leading-relaxed max-w-xs">
                  {isAr ? fac.subAr : fac.subEn}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
