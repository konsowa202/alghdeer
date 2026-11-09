"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  MotionValue,
  useInView,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { MediaItem } from "@/data/galleryMedia";

/* ── Layout slots ─────────────────────────────────────────────
   Desktop: 4 columns × 3 rows, every cell filled (no holes).
   Mobile : 2 columns × 7 rows.
   [col, colSpan, row, rowSpan] — 1-based, flows RTL automatically. */
type Slot = [number, number, number, number];
const DESKTOP_SLOTS: Slot[] = [
  [1, 2, 1, 2],
  [3, 1, 1, 1],
  [4, 1, 1, 2],
  [3, 1, 2, 1],
  [1, 1, 3, 1],
  [2, 1, 3, 1],
  [3, 1, 3, 1],
  [4, 1, 3, 1],
];
const MOBILE_SLOTS: Slot[] = [
  [1, 2, 1, 2],
  [1, 1, 3, 1],
  [2, 1, 3, 2],
  [1, 1, 4, 1],
  [1, 1, 5, 2],
  [2, 1, 5, 1],
  [2, 1, 6, 1],
  [1, 2, 7, 1],
];
const COLS = 4;
const ROWS = 3;
const SPRING = { stiffness: 160, damping: 24, mass: 0.9 };

function useTrackTemplate(values: MotionValue<number>[]) {
  return useTransform(values, (v: number[]) => v.map((n) => `${n.toFixed(4)}fr`).join(" "));
}

type Props = { items: MediaItem[]; isAr: boolean };

export default function MediaBento({ items, isAr }: Props) {
  const reduce = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { amount: 0.15 });
  const [hovered, setHovered] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [dir, setDir] = useState(1);

  const slots = items.slice(0, DESKTOP_SLOTS.length);

  /* Track springs — always 4 cols / 3 rows so hook count stays stable */
  const c0 = useSpring(1, SPRING), c1 = useSpring(1, SPRING), c2 = useSpring(1, SPRING), c3 = useSpring(1, SPRING);
  const r0 = useSpring(1, SPRING), r1 = useSpring(1, SPRING), r2 = useSpring(1, SPRING);
  const cols = [c0, c1, c2, c3];
  const rows = [r0, r1, r2];
  const colTemplate = useTrackTemplate(cols);
  const rowTemplate = useTrackTemplate(rows);

  useEffect(() => {
    const colW = Array(COLS).fill(1);
    const rowW = Array(ROWS).fill(1);
    if (hovered !== null && isDesktop && !reduce) {
      const [c, cs, r, rs] = DESKTOP_SLOTS[hovered];
      const cg = cs > 1 ? 1.4 : 1.85;
      const rg = rs > 1 ? 1.3 : 1.65;
      for (let i = c - 1; i < c - 1 + cs; i++) colW[i] = cg;
      for (let i = r - 1; i < r - 1 + rs; i++) rowW[i] = rg;
    }
    cols.forEach((s, i) => s.set(colW[i]));
    rows.forEach((s, i) => s.set(rowW[i]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hovered, isDesktop, reduce]);

  /* Pause tile videos when the grid is off-screen or a lightbox is open */
  useEffect(() => {
    gridRef.current?.querySelectorAll("video").forEach((v) => {
      if (inView && active === null && !reduce) v.play().catch(() => {});
      else v.pause();
    });
  }, [inView, active, reduce]);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (d: number) => {
      setDir(d);
      setActive((cur) => (cur === null ? null : (cur + d + slots.length) % slots.length));
    },
    [slots.length]
  );

  useEffect(() => {
    if (active === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      // visual direction follows reading direction
      if (e.key === "ArrowRight") step(isAr ? -1 : 1);
      if (e.key === "ArrowLeft") step(isAr ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, step, isAr]);

  return (
    <>
      <motion.div
        animate={{ scale: active !== null ? 0.97 : 1, filter: active !== null ? "blur(6px)" : "blur(0px)" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[22px] border border-white/10 bg-white/[0.03] p-1.5 sm:rounded-[26px] sm:p-2"
      >
        <motion.div
          ref={gridRef}
          onMouseLeave={() => setHovered(null)}
          style={
            isDesktop
              ? { gridTemplateColumns: colTemplate, gridTemplateRows: rowTemplate }
              : { gridTemplateColumns: "1fr 1fr", gridAutoRows: "44vw" }
          }
          className="grid gap-1.5 md:h-[clamp(560px,84vh,880px)] sm:gap-2"
        >
          {slots.map((item, i) => {
            const [c, cs, r, rs] = (isDesktop ? DESKTOP_SLOTS : MOBILE_SLOTS)[i];
            const isHot = hovered === i;
            const dimmed = hovered !== null && !isHot;
            const title = isAr ? item.titleAr : item.titleEn;
            return (
              <motion.button
                key={item.id}
                type="button"
                aria-label={`${isAr ? "فتح" : "Open"} ${title}`}
                onClick={() => { setDir(0); setActive(i); }}
                onMouseEnter={() => setHovered(i)}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered(null)}
                initial={reduce ? false : { opacity: 0, scale: 0.92, y: 24 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                whileTap={{ scale: 0.985 }}
                style={{ gridColumn: `${c} / span ${cs}`, gridRow: `${r} / span ${rs}` }}
                className="group relative min-h-0 min-w-0 overflow-hidden rounded-[14px] bg-[#111] text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1e785] sm:rounded-[16px]"
              >
                {item.type === "video" ? (
                  <video
                    src={item.src}
                    poster={item.poster}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={title}
                    loading="lazy"
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}

                {/* dim the rest while one tile is focused */}
                <motion.div
                  aria-hidden
                  animate={{ opacity: dimmed ? 0.38 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="pointer-events-none absolute inset-0 bg-black"
                />

                {item.type === "video" && (
                  <span className="absolute end-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full bg-black/45 text-white/90 backdrop-blur-md">
                    <Play size={10} className="fill-current" />
                  </span>
                )}

                {/* hover label — desktop; always-on on touch */}
                <motion.span
                  initial={false}
                  animate={isDesktop ? { opacity: isHot ? 1 : 0, y: isHot ? 0 : 8 } : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-none absolute bottom-2.5 start-2.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md sm:bottom-3 sm:start-3 sm:text-xs"
                >
                  {title}
                </motion.span>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {active !== null && (
          <Lightbox
            key="lightbox"
            item={slots[active]}
            index={active}
            total={slots.length}
            dir={dir}
            isAr={isAr}
            reduce={Boolean(reduce)}
            onClose={close}
            onStep={step}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function Lightbox({
  item, index, total, dir, isAr, reduce, onClose, onStep,
}: {
  item: MediaItem; index: number; total: number; dir: number; isAr: boolean; reduce: boolean;
  onClose: () => void; onStep: (d: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, []);
  const title = isAr ? item.titleAr : item.titleEn;
  const sign = isAr ? -1 : 1; // slide direction mirrors in RTL

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={isAr ? "إغلاق" : "Close"}
        className="absolute end-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f1e785] sm:end-6 sm:top-6"
      >
        <X size={18} />
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onStep(-1); }}
        aria-label={isAr ? "السابق" : "Previous"}
        className="absolute start-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-black sm:grid sm:start-6"
      >
        <ChevronLeft size={18} className="rtl:rotate-180" />
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onStep(1); }}
        aria-label={isAr ? "التالي" : "Next"}
        className="absolute end-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-black sm:grid sm:end-6"
      >
        <ChevronRight size={18} className="rtl:rotate-180" />
      </button>

      <AnimatePresence mode="popLayout" custom={dir}>
        <motion.figure
          key={item.id}
          custom={dir}
          variants={{
            enter: (d: number) =>
              reduce ? { opacity: 0 } : d === 0 ? { opacity: 0, scale: 0.88, y: 30 } : { opacity: 0, x: 80 * d * sign, scale: 0.94 },
            center: { opacity: 1, x: 0, y: 0, scale: 1 },
            exit: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, x: -80 * d * sign, scale: 0.94 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          drag={reduce ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.5}
          onDragEnd={(_, info) => {
            if (Math.abs(info.offset.x) > 80) onStep(info.offset.x < 0 ? sign : -sign);
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[90svh] w-full max-w-5xl cursor-grab flex-col items-center px-4 active:cursor-grabbing sm:px-20"
        >
          {item.type === "video" ? (
            <video
              src={item.src}
              poster={item.poster}
              autoPlay={!reduce}
              muted
              loop
              playsInline
              controls
              className="max-h-[78svh] max-w-full rounded-[18px] object-contain shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
            />
          ) : (
            <img
              src={item.src}
              alt={title}
              draggable={false}
              className="max-h-[78svh] max-w-full select-none rounded-[18px] object-contain shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
            />
          )}
          <figcaption className="mt-4 flex items-center gap-3 text-sm font-bold text-white/85">
            <span className="tabular-nums text-[#f1e785]">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
            <span className="h-3 w-px bg-white/25" />
            {title}
          </figcaption>
        </motion.figure>
      </AnimatePresence>
    </motion.div>
  );
}
