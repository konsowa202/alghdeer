"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

const CARD =
  "w-[min(21rem,88vw)] sm:w-[24rem] shrink-0 grow-0 p-6 sm:p-8 border border-black/10 bg-white hover:border-[#cba135] transition-colors duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-sm box-border flex flex-col justify-between";

const MARQUEE_CHUNK_COUNT = 6;

function TestimonialCards({
  testimonials,
  lang,
  chunkPrefix,
  rootRef,
}: {
  testimonials: { quote: string; name: string; role: string; tag: string }[];
  lang: "ar" | "en";
  chunkPrefix: string;
  rootRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={rootRef} className="flex shrink-0 flex-nowrap gap-6 sm:gap-8 pe-6 sm:pe-8">
      {testimonials.map((item, i) => (
        <article key={`${chunkPrefix}-${item.name}-${i}`} lang={lang} className={CARD}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-[0.16em] uppercase px-2.5 py-1 bg-[#cba135]/15 text-[#8a6412] font-bold">
                {item.tag}
              </span>
              <span className="text-3xl font-black text-[#cba135]/35 leading-none">&ldquo;</span>
            </div>
            <p className="text-sm sm:text-base text-black/80 leading-relaxed mb-6">{item.quote}</p>
          </div>
          <div className="border-t border-black/10 pt-4">
            <p className="font-bold text-sm sm:text-base text-black">{item.name}</p>
            <p className="text-xs text-black/55 mt-0.5">{item.role}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function MarqueeTrack({
  testimonials,
  lang,
  paused,
}: {
  testimonials: { quote: string; name: string; role: string; tag: string }[];
  lang: "ar" | "en";
  paused: boolean;
}) {
  const probeRef = useRef<HTMLDivElement>(null);
  const [chunkPx, setChunkPx] = useState<number | null>(null);

  const measure = useCallback(() => {
    const el = probeRef.current;
    if (!el) return;
    const w = el.offsetWidth;
    if (w > 0) setChunkPx(w);
  }, []);

  useLayoutEffect(() => {
    measure();
    const el = probeRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, testimonials, lang]);

  const ready = chunkPx != null && chunkPx > 0;

  const trackStyle = {
    ...(ready
      ? ({
          "--marquee-dx": `-${chunkPx}px`,
          animationPlayState: paused ? "paused" : "running",
        } as React.CSSProperties)
      : ({
          animation: "none",
        } as React.CSSProperties)),
  };

  return (
    <div className="w-full max-w-full min-h-[13rem] overflow-hidden" dir="ltr" style={{ direction: "ltr" }}>
      <div
        dir="ltr"
        className="testimonial-marquee-track inline-flex w-max shrink-0 flex-nowrap justify-start motion-reduce:animate-none"
        style={trackStyle}
      >
        {Array.from({ length: MARQUEE_CHUNK_COUNT }, (_, chunk) => (
          <TestimonialCards
            key={chunk}
            testimonials={testimonials}
            lang={lang}
            chunkPrefix={`${chunk}`}
            rootRef={chunk === 0 ? probeRef : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export default function Testimonials() {
  const { lang } = useLanguage();
  const [holdPaused, setHoldPaused] = useState(false);
  const isAr = lang === "ar";

  const testimonials = [
    {
      tag: isAr ? "حفل شركات شتوي" : "Corporate Winter Retreat",
      quote: isAr
        ? "استضافة استثنائية لمنسوبي عيادات ماي كلينك؛ القاعات الزجاجية والجلسات المفتوحة في بريمان جمعت بين الفخامة والدفء والتنظيم المتقن."
        : "An exceptional winter gathering for My Clinic; the glass lounges and open-air seating in Burayman combined luxury, warmth, and flawless organization.",
      name: isAr ? "عيادات ماي كلينك (My Clinic)" : "My Clinic",
      role: isAr ? "فعالية منسوبي الشركة • مخيم الغدير" : "Annual Staff Gathering • Alghdeer Camp",
    },
    {
      tag: isAr ? "ولائم وضيافة" : "Corporate Gala & Dining",
      quote: isAr
        ? "في فعالية شركة ساحل الغربية لخدمة الموانئ، كانت جودة البوفيه المفتوح والمشاوي الحية وحسن الاستقبال تفوق كل التوقعات."
        : "At Sahil Al-Gharbia Port Services' corporate night, the open-air buffet, live grill stations, and warm hospitality exceeded every expectation.",
      name: isAr ? "شركة ساحل الغربية لخدمة الموانئ" : "Sahil Al-Gharbia Port Services",
      role: isAr ? "حفل الشركة السنوي • جدة" : "Corporate Gala • Jeddah",
    },
    {
      tag: isAr ? "مهرجان الموظفين" : "Employee Festival",
      quote: isAr
        ? "ليلة لا تُنسى لموظفي شركة نابكو؛ المساحة الرحبة والعروض الاستعراضية الحية صنعت أجواءً حماسية أبهرت جميع الحضور."
        : "An unforgettable night for NAPCO employees; the expansive grounds and live stage performances created an electric atmosphere for everyone.",
      name: isAr ? "شركة نابكو (NAPCO)" : "NAPCO",
      role: isAr ? "تجمع الموظفين السنوي" : "Employee Annual Event",
    },
    {
      tag: isAr ? "أجواء رمضانية" : "Ramadan Ghabga",
      quote: isAr
        ? "أمسية رمضانية ساحرة لشركة برو ديكور على أنغام الفرقة التراثية الأصيلة وسط إضاءة الفوانيس وروحانية المكان."
        : "An enchanting Ramadan evening for Pro Décor accompanied by live traditional ensemble music and warm lantern light.",
      name: isAr ? "شركة برو ديكور (Pro Décor)" : "Pro Décor",
      role: isAr ? "غبقة وسحور رمضان • الغدير كامب" : "Ramadan Corporate Gathering",
    },
    {
      tag: isAr ? "مناسبات عائلية" : "Private Celebration",
      quote: isAr
        ? "تنسيق الكوشة والطاولات بالزهور الطبيعية والشموع في حفل عقيقة ابن الشيف ميساء كان لوحة فنية متكاملة أسعدت كل الضيوف."
        : "The floral table styling, candlelight, and custom stage arch for Chef Maysaa's family Aqeeqah celebration was a work of art.",
      name: isAr ? "الشيف ميساء" : "Chef Maysaa",
      role: isAr ? "مناسبة عائلية خاصة • ليالي رمضان" : "Private Family Milestone",
    },
    {
      tag: isAr ? "شركاء النجاح" : "Brand Activation",
      quote: isAr
        ? "تواجد كافيه 95° داخل القاعة الزجاجية بمخيم الغدير منح الضيوف تجربة قهوة مختصة فاخرة وسط أجواء شتوية لا مثيل لها في جدة."
        : "Bringing 95° Celsius specialty coffee inside Alghdeer's glass lounge gave guests a premier winter cafe experience in Jeddah.",
      name: isAr ? "كافيه 95° (95° CELSIUS)" : "95° CELSIUS Specialty Coffee",
      role: isAr ? "شريك الضيافة والقهوة المختصة" : "Specialty Coffee Partner",
    },
  ];

  return (
    <section className="py-20 sm:py-32 bg-white text-black overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-10 sm:mb-16"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-[#a67c1e] font-bold mb-3 sm:mb-4">
            {isAr ? "قصص نجاح من فعالياتنا الحقيقية" : "REAL STORIES FROM OUR EVENTS"}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black">
            {isAr ? "شركاء الليالي الاستثنائية" : "Trusted by Leading Brands"}
          </h2>
        </motion.div>
      </div>

      <div
        className="cursor-grab active:cursor-grabbing select-none touch-pan-y"
        role="region"
        aria-label={isAr ? "قصص عملائنا، شريط متحرك مستمر" : "Client stories marquee"}
        dir="ltr"
        style={{ direction: "ltr" }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" || e.pointerType === "pen" || e.pointerType === "touch") setHoldPaused(true);
        }}
        onPointerUp={() => setHoldPaused(false)}
        onPointerLeave={() => setHoldPaused(false)}
        onPointerCancel={() => setHoldPaused(false)}
      >
        <div className="overflow-hidden border-y border-black/[0.06] bg-black/[0.02] py-8 sm:py-10 px-4 sm:px-6 lg:px-16">
          <MarqueeTrack testimonials={testimonials} lang={lang} paused={holdPaused} />
        </div>
      </div>

      <p className="text-center text-[11px] sm:text-xs text-black/40 mt-5 sm:mt-6 px-4">
        {isAr ? "المس الشاشة واضغط باستمرار لإيقاف الحركة مؤقتًا" : "Touch and hold to pause the carousel"}
      </p>
    </section>
  );
}
