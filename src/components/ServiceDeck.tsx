"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  MotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import CurvedPlane from "@/components/CurvedPlane";
import FluidButton from "@/components/ui/FluidButton";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export type DeckItem = {
  id: string;
  title: string;
  desc: string;
  image: string;
  video?: string;
  /** phone overrides — portrait, sharp media for the tall mobile card (video: null = none) */
  mobile?: { image?: string; video?: string | null };
};

type Props = { items: DeckItem[]; isAr: boolean };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * Stacked Deck — the section pins while you scroll; each card rises from below
 * bent in 3D, flattens and starts its video, while the card underneath sinks
 * back and dims. A side index tracks progress and jumps to any card.
 */
export default function ServiceDeck({ items, isAr }: Props) {
  const n = items.length;
  const ref = useRef<HTMLDivElement>(null);
  const reduce = Boolean(useReducedMotion());
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // 0 … n-1 : how many cards have fully arrived
  const pos = useTransform(scrollYProgress, (p) => p * (n - 1));

  const [active, setActive] = useState(0);
  const [sound, setSound] = useState(false);
  useMotionValueEvent(pos, "change", (v) => {
    const i = Math.min(n - 1, Math.max(0, Math.round(v)));
    setActive((a) => (a === i ? a : i));
  });

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (range * i) / (n - 1) + 2, behavior: reduce ? "auto" : "smooth" });
  };

  const barScale = useTransform(scrollYProgress, [0, 1], [1 / n, 1]);

  return (
    <div ref={ref} className="relative" style={{ height: `${n * 100}svh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto flex w-full max-w-[1500px] items-center gap-10 px-3 sm:px-6 lg:px-10">
          {/* side index (desktop) */}
          {isDesktop && (
            <nav aria-label={isAr ? "الخدمات" : "Services"} className="w-56 shrink-0 space-y-1">
              {items.map((it, i) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => jump(i)}
                  className="group flex w-full items-center gap-3 py-2 text-start"
                >
                  <span className={`text-xs font-black tabular-nums transition-colors ${i === active ? "text-[#f1e785]" : "text-white/30"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <motion.span
                    animate={{ width: i === active ? 28 : 10, opacity: i === active ? 1 : 0.3 }}
                    className="h-px bg-white"
                  />
                  <span className={`text-sm font-bold transition-colors ${i === active ? "text-white" : "text-white/35 group-hover:text-white/70"}`}>
                    {it.title}
                  </span>
                </button>
              ))}
              <div className="mt-6 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                <motion.div style={{ scaleX: barScale, transformOrigin: isAr ? "right" : "left" }} className="h-full bg-[#f1e785]" />
              </div>
            </nav>
          )}

          {/* the deck */}
          <div className="relative h-[74svh] flex-1 [perspective:1500px] sm:h-[80svh]">
            {items.map((it, i) => (
              <DeckCard
                key={it.id}
                item={it}
                index={i}
                total={n}
                pos={pos}
                isActive={i === active}
                isAr={isAr}
                isDesktop={isDesktop}
                reduce={reduce}
                sound={sound}
                onToggleSound={() => setSound((s) => !s)}
              />
            ))}
          </div>
        </div>

        {/* mobile progress */}
        {!isDesktop && (
          <div className="absolute inset-x-6 bottom-4 h-[2px] overflow-hidden rounded-full bg-white/10">
            <motion.div style={{ scaleX: barScale, transformOrigin: isAr ? "right" : "left" }} className="h-full bg-[#f1e785]" />
          </div>
        )}
      </div>
    </div>
  );
}

function DeckCard({
  item, index, total, pos, isActive, isAr, isDesktop, reduce, sound, onToggleSound,
}: {
  item: DeckItem; index: number; total: number; pos: MotionValue<number>; isActive: boolean;
  isAr: boolean; isDesktop: boolean; reduce: boolean; sound: boolean; onToggleSound: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const k = reduce ? 0 : 1;
  // softer tilt on phones so the rising card stays inside the screen edges
  const tilt = isDesktop ? 1 : 0.45;
  const image = isDesktop ? item.image : item.mobile?.image ?? item.image;
  const video = isDesktop ? item.video : item.mobile?.video === null ? undefined : item.mobile?.video ?? item.video;

  // e: 0 → 1 as this card arrives ; c: 0 → 1 as the next card covers it
  const e = useTransform(pos, (v) => (index === 0 ? 1 : clamp(v - (index - 1))));
  const c = useTransform(pos, (v) => clamp(v - index));

  const y = useTransform(e, (t) => `${(1 - t) * 112 * k}%`);
  const rotateX = useTransform(e, (t) => -(1 - t) * 32 * k * tilt);
  const bend = useTransform(e, (t) => (1 - t) * 1.3 * k * tilt);
  const scale = useTransform(c, (t) => 1 - t * 0.1 * k);
  const lift = useTransform(c, (t) => -t * 5 * k);
  const yy = useTransform([y, lift] as MotionValue[], ([a, b]) => `calc(${a} + ${b}%)`);
  const dim = useTransform(c, (t) => t * 0.65);
  const videoOpacity = useTransform([e, c] as MotionValue[], ([a, b]) => clamp(((a as number) - 0.9) / 0.1) * (1 - (b as number) * 0.4));
  const textOpacity = useTransform(e, [0.55, 0.95], [0, 1]);
  const textY = useTransform(e, [0.55, 1], [40 * k, 0]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive && !reduce) v.play().catch(() => {});
    else v.pause();
  }, [isActive, reduce, video]);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !(sound && isActive);
    v.volume = 0.35;
  }, [sound, isActive, video]);

  const r = isDesktop ? 28 : 20;

  return (
    <motion.article
      style={{ y: yy, rotateX, scale, zIndex: index + 1, transformStyle: "preserve-3d", transformOrigin: "50% 100%" }}
      className="absolute inset-0 will-change-transform"
      aria-hidden={!isActive}
    >
      <CurvedPlane
        src={image}
        alt={item.title}
        bend={bend}
        axis="x"
        strips={isDesktop ? 22 : 12}
        radius={r}
        tint={0.25}
        shade={0.6}
      />

      {video && (
        <motion.div style={{ opacity: videoOpacity, z: 1, borderRadius: r }} className="pointer-events-none absolute inset-0 overflow-hidden">
          <video key={video} ref={videoRef} src={video} poster={image} muted loop playsInline preload="metadata" className="h-full w-full object-cover" />
        </motion.div>
      )}

      {/* readable gradient + content (flat, above the strips) */}
      <motion.div
        style={{ z: 2, borderRadius: r }}
        className="absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          dir={isAr ? "rtl" : "ltr"}
          className="absolute inset-0 flex flex-col justify-between p-5 sm:p-8 lg:p-12"
        >
          <div className="flex items-start justify-between">
            <span className="text-[clamp(4rem,10vw,9rem)] font-black leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(241,231,133,0.75)]">
              {item.id}
            </span>
            <span dir="ltr" className="rounded-full bg-black/40 px-3 py-1.5 text-xs font-bold tabular-nums text-white/80 backdrop-blur-md">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>

          <div className="max-w-2xl">
            <h3 className="text-[clamp(2.2rem,5.5vw,5rem)] font-black leading-[1.1] text-white">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-lg">{item.desc}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
              <FluidButton href="#contact" pulse={false} icon={<ArrowLeft size={18} className="ltr:rotate-180" />}>
                {isAr ? "احجز هذه التجربة" : "Book this experience"}
              </FluidButton>
              {video && (
                <button
                  type="button"
                  onClick={onToggleSound}
                  aria-pressed={sound}
                  aria-label={sound ? (isAr ? "كتم الصوت" : "Mute") : isAr ? "شغّل الصوت" : "Sound on"}
                  className="inline-flex h-[60px] w-[60px] items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black sm:h-[69px] sm:w-auto sm:px-5"
                >
                  {sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
                  <span className="hidden sm:inline">
                    {sound ? (isAr ? "كتم الصوت" : "Mute") : isAr ? "شغّل الصوت" : "Sound on"}
                  </span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* dims as the next card covers it */}
      <motion.div style={{ opacity: dim, z: 3, borderRadius: r }} className="pointer-events-none absolute inset-0 bg-black" />
    </motion.article>
  );
}
