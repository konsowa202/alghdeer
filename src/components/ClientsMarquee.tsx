"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { clientLogoPaths } from "@/data/clientLogos";
import ClientLogoKnockoutImg from "@/components/ClientLogoKnockoutImg";

const MARQUEE_CHUNK_COUNT = 6;

/** خلايا أوضح وأضيق عشان يبان أكبر عدد شعارات في نفس اللقطة (الكل موجود في الشريط ويتكرر) */
const LOGO_WRAP =
  "flex h-12 sm:h-14 md:h-16 lg:h-[4.25rem] w-[min(7.25rem,22vw)] sm:w-28 md:w-30 lg:w-32 shrink-0 grow-0 items-center justify-center px-2 sm:px-3";

function LogoChunk({
  paths,
  chunkPrefix,
  rootRef,
}: {
  paths: string[];
  chunkPrefix: string;
  rootRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={rootRef} className="flex shrink-0 flex-nowrap items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 pe-4 sm:pe-6 md:pe-8 lg:pe-10">
      {paths.map((src, i) => (
        <div key={`${chunkPrefix}-${src}-${i}`} className={LOGO_WRAP}>
          <ClientLogoKnockoutImg
            src={src}
            alt=""
            className="block h-full w-auto max-h-full max-w-full min-h-0 min-w-0 object-contain opacity-[0.94] transition-opacity duration-300 hover:opacity-100"
          />
        </div>
      ))}
    </div>
  );
}

function MarqueeTrack({ paths, paused }: { paths: string[]; paused: boolean }) {
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
  }, [measure, paths]);

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
    <div className="w-full max-w-full overflow-hidden" dir="ltr" style={{ direction: "ltr" }}>
      <div
        dir="ltr"
        className="clients-marquee-track inline-flex w-max shrink-0 flex-nowrap justify-start motion-reduce:animate-none"
        style={trackStyle}
      >
        {Array.from({ length: MARQUEE_CHUNK_COUNT }, (_, chunk) => (
          <LogoChunk key={chunk} paths={paths} chunkPrefix={`${chunk}`} rootRef={chunk === 0 ? probeRef : undefined} />
        ))}
      </div>
    </div>
  );
}

export default function ClientsMarquee() {
  const { lang } = useLanguage();
  const [holdPaused, setHoldPaused] = useState(false);
  const isAr = lang === "ar";

  return (
    <section
      id="clients"
      aria-label={isAr ? "شعارات عملائنا" : "Our clients logos"}
      className="relative z-10 border-y border-white/[0.06] bg-[#000000] py-8 sm:py-10 text-white"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-16 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-white/40">
            {isAr ? "يثقون بنا" : "TRUSTED BY"}
          </p>
          <h2 className="mt-2 text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
            {isAr ? "عملاؤنا" : "Our Clients"}
          </h2>
        </motion.div>
      </div>

      <div
        className="cursor-grab active:cursor-grabbing select-none touch-pan-y"
        role="region"
        aria-label={isAr ? "شعارات العملاء، شريط متحرك" : "Client logos marquee"}
        dir="ltr"
        style={{ direction: "ltr" }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" || e.pointerType === "pen" || e.pointerType === "touch") setHoldPaused(true);
        }}
        onPointerUp={() => setHoldPaused(false)}
        onPointerLeave={() => setHoldPaused(false)}
        onPointerCancel={() => setHoldPaused(false)}
      >
        <div className="overflow-hidden bg-[#000000] py-4 sm:py-5">
          <MarqueeTrack paths={clientLogoPaths} paused={holdPaused} />
        </div>
      </div>

      <p className="text-center text-[10px] sm:text-xs text-white/35 mt-4 sm:mt-5 px-4">
        {isAr ? "المس الشاشة واضغط باستمرار لإيقاف الحركة مؤقتًا" : "Touch and hold to pause"}
      </p>
    </section>
  );
}
