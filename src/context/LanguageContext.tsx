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
  events: "Events",
  concept: "Concept",
  experiences: "Experiences",
  facilities: "Facilities",
  gallery: "Gallery",
  contact: "Contact",
  bookBtn: "Book Now",

  // Hero
  heroSub: "An exclusive desert retreat in Jeddah, blending modern elegance with the timeless beauty of Arabian heritage.",
  exploreBtn: "Explore",
  inquireBtn: "Inquire Now",

  // About
  aboutTitle: "Where Heritage Meets Modern Luxury",
  aboutText1: "Alghdeer is more than a camp — it is a curated escape into the heart of the Arabian desert. Designed for corporate retreats, VIP gatherings, and private celebrations.",
  aboutText2: "Every detail is crafted to evoke a sense of wonder: from the scent of oud to the warmth of a campfire under an infinite sky.",

  // Experiences
  expTitle: "Experiences",
  exp1Title: "Corporate Retreats",
  exp1Desc: "Tailored team-building experiences and executive offsites designed to inspire and connect.",
  exp2Title: "VIP Private Events",
  exp2Desc: "Exclusive gatherings with full privacy, luxury amenities, and bespoke Arabian hospitality.",
  exp3Title: "Desert Celebrations",
  exp3Desc: "Unforgettable celebrations under the stars — weddings, anniversaries, and milestone events.",

  // Facilities
  facTitle: "Amenities",
  fac1: "Arabic Coffee Corner",
  fac2: "Luxury Desert Tents",
  fac3: "Campfire Lounge",
  fac4: "Private Restrooms",
  fac5: "Entertainment Zone",

  // Gallery
  galleryTitle: "Visual Journey",

  // Contact
  contactTitle: "Plan Your Experience",
  nameLabel: "Full Name",
  companyLabel: "Company",
  groupSizeLabel: "Group Size",
  dateLabel: "Preferred Date",
  requestsLabel: "Special Requests",
  submitBtn: "Send Inquiry",
};

const ar: Translation = {
  // Nav
  home: "الرئيسية",
  events: "فعالياتنا",
  concept: "المفهوم",
  experiences: "تجاربنا",
  facilities: "المرافق",
  gallery: "المعرض",
  contact: "تواصل معنا",
  bookBtn: "احجز الآن",

  // Hero
  heroSub: "ملاذ حصري في صحراء جدة، يجمع بين الأناقة الحديثة وجمال التراث العربي الأصيل.",
  exploreBtn: "استكشف",
  inquireBtn: "استفسر الآن",

  // About
  aboutTitle: "حيث يلتقي التراث بالفخامة العصرية",
  aboutText1: "الغدير ليس مجرد مخيم — إنه رحلة مصممة بعناية إلى قلب الصحراء العربية. مخصص للخلوات المؤسسية وتجمعات كبار الشخصيات والاحتفالات الخاصة.",
  aboutText2: "كل تفصيل مصنوع لإثارة الدهشة: من عبق العود إلى دفء نار المخيم تحت سماء لا نهائية.",

  // Experiences
  expTitle: "تجاربنا",
  exp1Title: "خلوات الشركات",
  exp1Desc: "تجارب بناء فِرق مصممة خصيصاً وخلوات تنفيذية لإلهام وتوحيد فريقكم.",
  exp2Title: "فعاليات VIP خاصة",
  exp2Desc: "تجمعات حصرية بخصوصية تامة ومرافق فاخرة وضيافة عربية مخصصة.",
  exp3Title: "احتفالات صحراوية",
  exp3Desc: "احتفالات لا تُنسى تحت النجوم — أعراس، ذكرى سنوية، ومناسبات استثنائية.",

  // Facilities
  facTitle: "المرافق والخدمات",
  fac1: "ركن القهوة العربية",
  fac2: "خيام صحراوية فاخرة",
  fac3: "صالة المدفأة",
  fac4: "دورات مياه خاصة",
  fac5: "منطقة الترفيه",

  // Gallery
  galleryTitle: "رحلة بصرية",

  // Contact
  contactTitle: "خطّط لتجربتك",
  nameLabel: "الاسم الكامل",
  companyLabel: "الشركة",
  groupSizeLabel: "عدد الأشخاص",
  dateLabel: "التاريخ المفضل",
  requestsLabel: "طلبات خاصة",
  submitBtn: "أرسل استفسارك",
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
