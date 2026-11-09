"use client";

import React, { useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Play } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import CurvedPlane from "@/components/CurvedPlane";

export type AngledGalleryItem = {
  id: string;
  image: string;
  previewVideo?: string;
  titleAr: string;
  titleEn: string;
  subAr: string;
  subEn: string;
};

type Props = {
  items: AngledGalleryItem[];
  isAr: boolean;
  onOpen: (index: number) => void;
  intro?: React.ReactNode;
  outro?: React.ReactNode;
};

/**
 * Angled Gallery — full-bleed cards that enter tilted in 3D, flatten while
 * centred, then tilt the opposite way as they leave (scroll-linked, Framer Motion).
 */
export default function AngledGallery({ items, isAr, onOpen, intro, outro }: Props) {
  return (
    <div className="relative">
      {intro && <Intro>{intro}</Intro>}
      <div className="flex flex-col items-center gap-[7svh] sm:gap-[9svh]">
        {items.map((item, index) => (
          <AngledCard key={item.id} item={item} index={index} isAr={isAr} onOpen={() => onOpen(index)} />
        ))}
      </div>
      {outro && <Outro>{outro}</Outro>}
    </div>
  );
}

function Intro({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -140]);
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 0.86]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  return (
    <div ref={ref} className="flex h-[70svh] min-h-[460px] items-center justify-center px-4 sm:h-[86svh]">
      <motion.div style={{ y, scale, opacity }} className="text-center">
        {children}
      </motion.div>
    </div>
  );
}

function Outro({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex min-h-[80svh] items-center justify-center px-4 py-24">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 60, filter: "blur(14px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        {children}
      </motion.div>
    </div>
  );
}

function AngledCard({ item, index, isAr, onOpen }: {
  item: AngledGalleryItem;
  index: number;
  isAr: boolean;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = Boolean(useReducedMotion());
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const centred = useInView(ref, { amount: 0.6 });
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });

  // alternate the tilt direction per card; softer on phones
  const s = index % 2 === 0 ? 1 : -1;
  const k = reduce ? 0 : isDesktop ? 1 : 0.7;
  const F = [0, 0.4, 0.6, 1]; // flat zone while centred

  // the page *bends* (warp) as it enters and leaves — this is the key look
  // always convex (edges curl away) so the strips never cover the title
  const bend = useTransform(p, F, [1.35 * k, 0, 0, 1.35 * k]);
  const rotateX = useTransform(p, F, [16 * k, 0, 0, -16 * k]);
  const rotateY = useTransform(p, F, [-22 * s * k, 0, 0, 22 * s * k]);
  const rotateZ = useTransform(p, F, [-5 * s * k, 0, 0, 5 * s * k]);
  const scale = useTransform(p, F, [1 - 0.12 * k, 1, 1, 1 - 0.12 * k]);
  const imgY = useTransform(p, [0, 1], reduce ? ["0%", "0%"] : ["-7%", "7%"]);
  const imgScale = useTransform(p, F, reduce ? [1, 1, 1, 1] : [1.18, 1.02, 1.02, 1.18]);
  const textOpacity = useTransform(p, [0.28, 0.42, 0.58, 0.72], [0, 1, 1, 0]);
  const textBlur = useTransform(p, [0.28, 0.42, 0.58, 0.72], reduce ? [0, 0, 0, 0] : [12, 0, 0, 12]);
  const textFilter = useTransform(textBlur, (b) => `blur(${b}px)`);
  const textY = useTransform(p, [0.28, 0.5, 0.72], reduce ? [0, 0, 0] : [50, 0, -50]);
  const textSpacing = useTransform(p, [0.28, 0.45], isAr || reduce ? ["0em", "0em"] : ["0.18em", "-0.01em"]);

  // the flat video layer is only visible while the card is flat (no bend)
  const videoOpacity = useTransform(p, [0.39, 0.43, 0.57, 0.61], [0, 1, 1, 0]);

  // play the muted preview only while the card is centred (and flat)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (centred && !reduce) v.play().catch(() => {});
    else v.pause();
  }, [centred, reduce]);

  const title = isAr ? item.titleAr : item.titleEn;
  const sub = isAr ? item.subAr : item.subEn;

  return (
    <div ref={ref} className="w-full [perspective:1100px] sm:[perspective:1400px]">
      <motion.div
        style={{ rotateX, rotateY, rotate: rotateZ, scale, transformStyle: "preserve-3d" }}
        className="relative mx-auto h-[72svh] min-h-[420px] w-[94vw] max-w-[1500px] will-change-transform sm:h-[88svh] sm:min-h-[560px]"
      >
        <CurvedPlane
          src={item.image}
          alt={title}
          bend={bend}
          axis="x"
          strips={isDesktop ? 22 : 14}
          radius={isDesktop ? 26 : 18}
          imgY={imgY}
          imgScale={imgScale}
          tint={0.3}
          shade={0.6}
        />

        {item.previewVideo && isDesktop && (
          <motion.div
            style={{ z: 1, opacity: videoOpacity }}
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[26px]"
          >
            <video ref={videoRef} src={item.previewVideo} muted loop playsInline preload="none" className="h-full w-full object-cover brightness-[0.7]" />
          </motion.div>
        )}

        <motion.div
          style={{ opacity: textOpacity, filter: textFilter, y: textY, z: 2 }}
          dir={isAr ? "rtl" : "ltr"}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <motion.h3
            style={{ letterSpacing: textSpacing }}
            className={`max-w-[14ch] font-black leading-[1.05] text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.45)] ${
              isAr ? "text-[clamp(3rem,10vw,9rem)]" : "text-[clamp(2.6rem,8.5vw,8rem)] uppercase"
            }`}
          >
            {title}
          </motion.h3>
          <p className="mt-3 text-xs font-bold text-white/85 sm:mt-4 sm:text-base">
            {sub} <span className="text-[#f1e785]">• {String(index + 1).padStart(2, "0")}</span>
          </p>
          <button
            type="button"
            onClick={onOpen}
            className="group/btn mt-6 inline-flex min-h-11 items-center gap-2.5 rounded-full border border-white/40 bg-white/10 py-1.5 pe-1.5 ps-5 text-xs font-bold text-white backdrop-blur-md transition-all duration-300 hover:border-[#f1e785] hover:bg-[#f1e785] hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1e785] sm:mt-8 sm:text-sm"
          >
            {isAr ? "شاهد التجربة" : "Watch the experience"}
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-black transition-transform duration-300 group-hover/btn:scale-110">
              <Play size={12} className="fill-current" />
            </span>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
