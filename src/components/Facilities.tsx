"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import LiquidGlassCard from "@/components/ui/LiquidGlassCard";
import {
  Building2,
  Tent,
  Utensils,
  Coffee,
  Music,
  Gamepad2,
  ChevronRight,
  ChevronLeft,
  ArrowUpLeft,
} from "lucide-react";

type FacilityCategory = "all" | "hospitality" | "tents" | "adventure";

export default function Facilities() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [activeCategory, setActiveCategory] = useState<FacilityCategory>("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const facilities = [
    {
      id: "fac1",
      category: "hospitality" as const,
      title: isAr ? "القاعة الزجاجية (VIP)" : "VIP Panoramic Glass Lounge",
      sub: isAr
        ? "واجهات بانورامية مكيفة ومجهزة بالكامل لاستضافة كبار الشخصيات والشركات باجتماعات استراتيجية وخصوصية تامة."
        : "Climate-controlled panoramic glass lounge for VIPs, board meetings & corporate galas.",
      image: "/nano/nb_glass_pavilion.jpg",
      tag: isAr ? "كبار الشخصيات • VIP" : "VIP PANORAMA",
      badgeTone: "gold" as const,
      icon: <Building2 size={24} className="text-[#ffd700]" />,
      features: isAr
        ? ["مكيفة بالكامل", "شاشات عرض", "صالون VIP", "خصوصية تامة"]
        : ["Full AC", "AV Screens", "VIP Salon", "Full Privacy"],
    },
    {
      id: "fac2",
      category: "tents" as const,
      title: isAr ? "المجالس والخيام البوهيمية" : "Bohemian Tents & Firepit Majlis",
      sub: isAr
        ? "خيام بيضاء فسيحة ومجالس أرضية ومرتفعة بنقوش السدو حول منقل نار السمر تحت مظلات بوهيمية ساحرة."
        : "Spacious white canvas canopies and heritage majlis seating centered around a crackling campfire.",
      image: "/nano/nb_campfire_majlis.jpg",
      tag: isAr ? "نار السمر • MAJLIS" : "CAMPFIRE MAJLIS",
      badgeTone: "amber" as const,
      icon: <Tent size={24} className="text-[#cba135]" />,
      features: isAr
        ? ["منقل نار حي", "نقوش سدو", "وسائد وثيرية", "إضاءة دافئة"]
        : ["Live Firepit", "Sadu Accents", "Plush Seating", "Warm Lighting"],
    },
    {
      id: "fac3",
      category: "hospitality" as const,
      title: isAr ? "البوفيه الملكي والمشاوي" : "Royal Gala Buffet & Live Grills",
      sub: isAr
        ? "طاولات ولائم مستديرة، سخانات بوفيه ذهبية، ومحطات شواء حية مع أشهى الأطباق الحجازية والشرقية."
        : "Round banquet tables, hammered gold chafing buffets & live open-fire grill stations.",
      image: "/nano/nb_royal_banquet.jpg",
      tag: isAr ? "ولائم فاخرة • GOURMET" : "ROYAL GOURMET",
      badgeTone: "gold" as const,
      icon: <Utensils size={24} className="text-[#ffd700]" />,
      features: isAr
        ? ["شواء مباشر", "سخانات ذهبية", "ولائم ملكية", "خدمة ضيافة 5★"]
        : ["Live Grills", "Gold Chafers", "Royal Feast", "5★ Hospitality"],
    },
    {
      id: "fac4",
      category: "hospitality" as const,
      title: isAr ? "ركن القهوة المختصة" : "Specialty Coffee Bar & Saudi Dallah",
      sub: isAr
        ? "تعاون مع أرقى الكافيهات المختصة (مثل 95° CELSIUS) ودلال القهوة السعودية الأصيلة مع أجود التمور."
        : "Partnered with premier specialty coffee roasters (95° Celsius) alongside authentic Saudi coffee.",
      image: "/coffee.png",
      tag: isAr ? "قهوة مختصة • 95°" : "SPECIALTY COFFEE",
      badgeTone: "gold" as const,
      icon: <Coffee size={24} className="text-[#e5b33d]" />,
      features: isAr
        ? ["V60 وإسبريسو", "دلال نحاسية", "تمر فاخر", "مشروبات شتوية"]
        : ["V60 & Espresso", "Brass Dallah", "Premium Dates", "Winter Drinks"],
    },
    {
      id: "fac5",
      category: "adventure" as const,
      title: isAr ? "مسرح العروض والألعاب النارية" : "Live Festival Stage & Fireworks",
      sub: isAr
        ? "مسرح مفتوح مهيأ للفرق التراثية، استعراضات التنورة المضيئة، وأنظمة صوت وإضاءة سينمائية متطورة."
        : "Open-air stage designed for folklore bands, glowing LED performances, and night-sky fireworks.",
      image: "/nano/wbk_card_live_nights.jpg",
      tag: isAr ? "عروض حية • STAGE" : "LIVE SHOWS",
      badgeTone: "amber" as const,
      icon: <Music size={24} className="text-[#ffd700]" />,
      features: isAr
        ? ["أنظمة صوت متقدمة", "إضاءة ليزر", "عروض تراثية", "ألعاب نارية"]
        : ["Pro Audio", "Laser Lighting", "Folk Shows", "Fireworks Sky"],
    },
    {
      id: "fac6",
      category: "adventure" as const,
      title: isAr ? "حلبة السفاري والألعاب" : "Desert Safari, Quad Bikes & Youth Arena",
      sub: isAr
        ? "دبابات صحراوية 4x4، طاولات فرفيرة، ركوب خيل وجمال، وتحديات شبابية وعروض شخصيات للأطفال."
        : "Desert quad bikes, foosball tables, camel rides, youth challenges & mascots for kids.",
      image: "/nano/wbk_card_safari.jpg",
      tag: isAr ? "مغامرة وسفاري • SAFARI" : "DESERT SAFARI",
      badgeTone: "gold" as const,
      icon: <Gamepad2 size={24} className="text-[#cba135]" />,
      features: isAr
        ? ["دبابات رملية", "طاولات فرفيرة", "ركوب جمال وخيل", "أنشطة عائلية"]
        : ["Quad ATVs", "Foosball Tables", "Camel Riding", "Family Games"],
    },
  ];

  const filteredFacilities =
    activeCategory === "all"
      ? facilities
      : facilities.filter((f) => f.category === activeCategory);

  // Auto-advance mobile carousel every 4 seconds when not interacted
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % facilities.length);
    }, 4000);
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
        isAr ? handleNext() : handlePrev();
      } else {
        isAr ? handlePrev() : handleNext();
      }
    }
    touchStartXRef.current = null;
  };

  const currentMobile = facilities[activeIndex];

  return (
    <section id="facilities" className="relative py-24 sm:py-36 bg-[#06070a] text-white overflow-hidden">
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#cba135]/[0.03] rounded-full blur-[160px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-16">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 flex flex-col items-center">
          {/* Subtle Gamified Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[#cba135] text-xs font-mono font-bold tracking-widest uppercase mb-4 shadow-sm">
            <span>{isAr ? "مرافق وتجهيزات متكاملة" : "CAMP FACILITIES & RETREATS"}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-white via-[#fae5a5] to-[#cba135] bg-clip-text text-transparent">
              {isAr ? "مرافق المخيم" : "Camp Facilities"}
            </span>
          </h2>
          <p className="text-sm sm:text-base text-white/60 max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? "مرافق متكاملة تجمع بين الفخامة العصرية وروح البادية، مجهزة بأحدث التقنيات لاستضافة كافة أنواع الفعاليات والمناسبات."
              : "State-of-the-art facilities blending modern luxury with Arabian desert warmth."}
          </p>

          <div className="w-20 sm:w-28 h-px bg-gradient-to-r from-transparent via-[#cba135] to-transparent mx-auto mt-6" />

          {/* Interactive Gamified Filter Tabs (Desktop Only) */}
          <div className="hidden sm:flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8 p-1.5 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-xl">
            {[
              { id: "all", label: isAr ? "جميع المرافق (6)" : "All (6)" },
              { id: "hospitality", label: isAr ? "الضيافة والولائم" : "Hospitality & VIP" },
              { id: "tents", label: isAr ? "الخيام والسمر" : "Tents & Majlis" },
              { id: "adventure", label: isAr ? "العروض والمغامرة" : "Shows & Safari" },
            ].map((tab) => {
              const active = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as FacilityCategory)}
                  className={`relative px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                    active
                      ? "text-black shadow-[0_0_20px_rgba(203,161,53,0.4)]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeFacilityTab"
                      className="absolute inset-0 bg-gradient-to-r from-[#ffd700] via-[#fae5a5] to-[#cba135] rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* MOBILE CAROUSEL VIEW (< sm)                                   */}
        {/* ============================================================ */}
        <div
          className="sm:hidden relative"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMobile.id}
              initial={{ opacity: 0, x: isAr ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isAr ? 30 : -30 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <LiquidGlassCard
                badgeText={currentMobile.tag}
                badgeTone={currentMobile.badgeTone}
                className="overflow-hidden min-h-[460px]"
              >
                {/* Background Image Container */}
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={currentMobile.image}
                    alt={currentMobile.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d12] via-[#0c0d12]/60 to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                        {currentMobile.icon}
                      </div>
                      <h3 className="text-lg font-black text-white">
                        {currentMobile.title}
                      </h3>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed mb-4">
                      {currentMobile.sub}
                    </p>
                  </div>

                  {/* Feature chips */}
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/10">
                    {currentMobile.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-white/[0.06] text-white/80 border border-white/10"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </LiquidGlassCard>
            </motion.div>
          </AnimatePresence>

          {/* Mobile Prev / Next Controls */}
          <div className="flex items-center justify-between mt-5 px-2">
            <button
              onClick={handlePrev}
              aria-label="Previous facility"
              className="w-10 h-10 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {facilities.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? "w-7 bg-gradient-to-r from-[#ffd700] to-[#cba135]"
                      : "w-2 bg-white/20"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              aria-label="Next facility"
              className="w-10 h-10 rounded-full bg-white/10 border border-white/15 text-white flex items-center justify-center active:scale-95"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* DESKTOP GRID VIEW (sm: and above) - Liquid Glass Holographic */}
        {/* ============================================================ */}
        <motion.div
          layout
          className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          <AnimatePresence>
            {filteredFacilities.map((fac, i) => (
              <motion.div
                layout
                key={fac.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="h-full"
              >
                <LiquidGlassCard
                  badgeText={fac.tag}
                  badgeTone={fac.badgeTone}
                  className="h-full min-h-[460px] cursor-pointer"
                >
                  {/* Visual Background with Zoom on Hover */}
                  <div className="relative h-60 w-full overflow-hidden">
                    <Image
                      src={fac.image}
                      alt={fac.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    {/* Deep Cinematic Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d12] via-[#0c0d12]/50 to-black/30 group-hover:via-[#0c0d12]/35 transition-colors duration-500" />

                    {/* Floating Corner Icon */}
                    <div className="absolute bottom-3 right-4 z-10 w-12 h-12 rounded-2xl bg-black/70 backdrop-blur-md border border-white/15 flex items-center justify-center shadow-lg group-hover:border-[#cba135]/50 group-hover:scale-105 transition-all duration-300">
                      {fac.icon}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex flex-col justify-between flex-grow relative z-10">
                    <div>
                      <h3 className="text-xl font-black text-white mb-2.5 group-hover:text-[#ffd700] transition-colors duration-300">
                        {fac.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/65 leading-relaxed line-clamp-3 mb-5">
                        {fac.sub}
                      </p>
                    </div>

                    {/* Amenity Feature Chips */}
                    <div className="pt-4 border-t border-white/[0.08] mt-auto">
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {fac.features.map((feat, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/[0.05] text-white/75 border border-white/[0.08] group-hover:border-white/20 transition-colors"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>

                      {/* Action Explore Link */}
                      <div className="flex items-center justify-between text-xs font-bold text-[#cba135] group-hover:text-[#ffd700] transition-colors">
                        <span>{isAr ? "استكشف التجهيزات المتاحة" : "Explore amenities"}</span>
                        <ArrowUpLeft
                          size={16}
                          className="group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </LiquidGlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
