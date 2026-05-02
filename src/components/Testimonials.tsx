"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

/** عرض كل بطاقة نسبياً لمشهد العرض؛ تجنّب ‎calc(…100vw…)‎ المتكررة مع شريط أراء يوسّع الـRTL أفقياً */
const CARD =
  "w-[min(20rem,88vw)] sm:w-[22.5rem] shrink-0 grow-0 p-6 sm:p-8 border border-black/10 bg-white hover:border-black/25 transition-colors duration-300 shadow-[0_1px_0_rgba(0,0,0,0.03)] rounded-sm box-border";

const MARQUEE_CHUNK_COUNT = 8;

function TestimonialCards({
  testimonials,
  lang,
  chunkPrefix,
  rootRef,
}: {
  testimonials: { quote: string; name: string; role: string }[];
  lang: "ar" | "en";
  chunkPrefix: string;
  rootRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={rootRef} className="flex shrink-0 flex-nowrap gap-6 sm:gap-10 pe-6 sm:pe-10">
      {testimonials.map((item, i) => (
        <article key={`${chunkPrefix}-${item.name}-${i}`} lang={lang} className={CARD}>
          <p className="text-4xl sm:text-5xl font-black text-black/10 leading-none mb-3 sm:mb-4">&ldquo;</p>
          <p className="text-sm sm:text-base text-black/75 leading-relaxed mb-6 sm:mb-8">{item.quote}</p>
          <div className="border-t border-black/10 pt-4 sm:pt-5">
            <p className="font-bold text-sm sm:text-base">{item.name}</p>
            <p className="text-xs sm:text-sm text-black/50">{item.role}</p>
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
  testimonials: { quote: string; name: string; role: string }[];
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
    /* عزل اتجاه LTR لتفادي تمركز الشريط على يمين الصفحة في RTL */
    <div className="w-full max-w-full min-h-[12rem] overflow-hidden" dir="ltr" style={{ direction: "ltr" }}>
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

  const testimonials = [
    {
      quote:
        lang === "ar"
          ? "تجربة لا تُنسى، أعادت لنا الارتباط بالتراث بطريقة عصرية وراقية. خدمة استثنائية من الألف إلى الياء."
          : "An unforgettable experience that reconnected us with heritage in a modern, refined way. Exceptional service from start to finish.",
      name: lang === "ar" ? "أحمد الفيصل" : "Ahmed Al-Faisal",
      role: lang === "ar" ? "الرئيس التنفيذي، مجموعة الخليج" : "CEO, Gulf Group",
    },
    {
      quote:
        lang === "ar"
          ? "أفضل تجربة فريق عمل قمنا بها على الإطلاق. المكان ساحر والتنظيم احترافي بكل المقاييس."
          : "The best team-building experience we have ever had. The place is enchanting and the organization is professional in every way.",
      name: lang === "ar" ? "سارة العتيبي" : "Sarah Al-Otaibi",
      role: lang === "ar" ? "مديرة الموارد البشرية" : "HR Director",
    },
    {
      quote:
        lang === "ar"
          ? "مخيم الغدير حقق لنا كل ما كنا نطمح إليه من خصوصية وفخامة وأصالة عربية."
          : "Alghdeer Camp delivered everything we aspired for: privacy, luxury, and authentic Arabian hospitality.",
      name: lang === "ar" ? "محمد القحطاني" : "Mohammed Al-Qahtani",
      role: lang === "ar" ? "رجل أعمال" : "Entrepreneur",
    },
  ];

  const isAr = lang === "ar";

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
          <p className="text-xs tracking-[0.4em] uppercase text-black/30 mb-3 sm:mb-4">
            {isAr ? "آراء عملائنا" : "TESTIMONIALS"}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black">{isAr ? "يقولون عنّا" : "What They Say"}</h2>
        </motion.div>
      </div>

      <div
        className="cursor-grab active:cursor-grabbing select-none touch-pan-y"
        role="region"
        aria-label={isAr ? "آراء العملاء، شريط متحرك مستمر" : "Client testimonials marquee"}
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
