"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Translation {
  [key: string]: string;
}

interface LanguageContextType {
  lang: "en" | "ar";
  setLang: (lang: "en" | "ar") => void;
  t: (key: string) => string;
}

const en: Translation = {
  // Nav
  home: "Home",
  events: "Discover",
  concept: "Concept",
  experiences: "Experiences",
  facilities: "Amenities",
  gallery: "Gallery",
  contact: "Book Ticket",
  bookBtn: "Book Now",

  // Hero
  heroSub:
    "An exclusive desert sanctuary in Jeddah blending glass VIP pavilions, bohemian white sails, and authentic Arabian nights.",
  exploreBtn: "Explore Experiences",
  inquireBtn: "Get Your Ticket",

  // About
  aboutTitle: "Desert Authenticity, Modern Luxury",
  aboutText1:
    "Designed in the heart of Jeddah's Burayman desert, Alghdeer Camp brings together climate-controlled glass lounges, flowing white canvas canopies, and timeless Arabian hospitality.",
  aboutText2:
    "From executive corporate retreats to starlit gala dinners and desert safari adventures, every evening is crafted to perfection.",

  // Experiences
  expTitle: "Signature Experiences",
  exp1Title: "Corporate Galas & VIP Lounges",
  exp1Desc: "Climate-controlled glass pavilions, executive seating, and turnkey corporate hospitality.",
  exp2Title: "4x4 Safari & Dune Convoys",
  exp2Desc: "Jeep Wrangler desert convoys, night ATV trails, horseback riding, and group challenges.",
  exp3Title: "Family & Kids Carnival",
  exp3Desc: "Interactive mascot shows, family lounges, camel rides, and joyful celebrations for all ages.",

  // Facilities
  facTitle: "Camp Spaces",
  fac1: "Glass VIP Pavilion",
  fac2: "Bohemian Sails & Majlis",
  fac3: "Royal Open-Air Buffet",
  fac4: "Specialty Coffee Bar",
  fac5: "Live Stage & Fireworks",
  fac6: "Safari & Sports Arena",

  // Gallery
  galleryTitle: "Visual Journey",

  // Contact
  contactTitle: "Issue Your Event Ticket",
  nameLabel: "Guest Name",
  companyLabel: "Company / Occasion",
  groupSizeLabel: "Guests Count",
  dateLabel: "Event Date & Time",
  requestsLabel: "Special Notes",
  submitBtn: "Issue VIP Ticket",
};

const ar: Translation = {
  // Nav
  home: "الرئيسية",
  events: "اكتشف الغدير",
  concept: "المفهوم",
  experiences: "تجاربنا",
  facilities: "المرافق",
  gallery: "المعرض",
  contact: "تذكرة الحجز",
  bookBtn: "احجز الآن",

  // Hero
  heroSub:
    "واحة صحراوية فاخرة في جدة، تجمع فخامة القاعات الزجاجية وسحر الخيام البوهيمية تحت النجوم.",
  exploreBtn: "استكشف التجارب",
  inquireBtn: "احصل على تذكرتك",

  // About
  aboutTitle: "أصالة الصحراء، فخامة التفاصيل",
  aboutText1:
    "صُمم مخيم الغدير ليكون الوجهة الأرقى في صحراء جدة، حيث تلتقي القاعات الزجاجية المكيفة والممرات المظللة بالكانفاس الأبيض مع كرم الضيافة العربية الأصيلة.",
  aboutText2:
    "من حفلات الشركات الكبرى والولائم الفاخرة إلى مغامرات السفاري وليالي الطرب والألعاب النارية، نصنع لك ليلة استثنائية.",

  // Experiences
  expTitle: "تجارب الغدير",
  exp1Title: "مخيمات الشركات والقاعات الزجاجية",
  exp1Desc: "قاعات زجاجية مكيفة بإطلالة بانورامية وتجهيز متكامل لفعاليات الشركات وكبار الشخصيات.",
  exp2Title: "قوافل السفاري وتطعيس الجيوب",
  exp2Desc: "مسارات صحراوية لجيوب الرانجلر والدبابات، ركوب الخيل، وتحديات حماسية عند الغروب.",
  exp3Title: "كرنفال العائلات والأطفال",
  exp3Desc: "عروض الشخصيات التفاعلية العملاقة، جلسات العائلات المريحة، وأجواء بهجة آمنة للصغار والكبار.",

  // Facilities
  facTitle: "مرافق المخيم",
  fac1: "القاعة الزجاجية (VIP)",
  fac2: "المجالس والخيام البوهيمية",
  fac3: "البوفيه الملكي والمشاوي",
  fac4: "ركن القهوة المختصة",
  fac5: "مسرح العروض والألعاب النارية",
  fac6: "حلبة السفاري والألعاب",

  // Gallery
  galleryTitle: "رحلة بصرية",

  // Contact
  contactTitle: "إصدار تذكرة الحجز",
  nameLabel: "اسم الضيف",
  companyLabel: "الجهة / المناسبة",
  groupSizeLabel: "عدد الضيوف",
  dateLabel: "تاريخ ووقت المناسبة",
  requestsLabel: "ملاحظات خاصة",
  submitBtn: "إصدار تذكرة الحجز",
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "ar",
  setLang: () => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<"en" | "ar">("ar");

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    html.setAttribute("lang", lang);
  }, [lang]);

  const t = (key: string) => {
    const dict = lang === "en" ? en : ar;
    return dict[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
