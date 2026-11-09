"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  MotionValue,
  useInView,
  useMotionValue,
  useReducedMotion,
  useAnimationFrame,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CurvedPlane from "@/components/CurvedPlane";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export type Carousel3DItem = {
  id: string;
  image: string;
  title: string;
  desc?: string;
};

type Props = {
  items: Carousel3DItem[];
  onSelect?: (index: number) => void; // click on the front card
  renderCaption?: (item: Carousel3DItem, index: number) => React.ReactNode;
  isAr: boolean;
};


/**
 * 3D Gallery Carousel — curved cards on a tilted cylinder.
 * Drag / swipe with inertia, arrows, keyboard, autoplay while in view.
 */
export default function Carousel3D({ items, onSelect, renderCaption, isAr }: Props) {
  const n = items.length;
  const step = 360 / n;
  const ds = isArSign(isAr); // RTL: following cards sit to the left
  const reduce = Boolean(useReducedMotion());
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { amount: 0.4 });

  // bigger ring
  const cardW = isDesktop ? 640 : 290;
  const cardH = isDesktop ? 410 : 190;
  const gap = isDesktop ? 1.1 : 1.08;
  const R = ((cardW * n) / (2 * Math.PI)) * gap;
  const cardArc = cardW / R; // radians each card wraps

  const rot = useMotionValue(0); // degrees
  const [front, setFront] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const drag = useRef<{ x: number; last: number; t: number; v: number; moved: boolean } | null>(null);
  const moved = useRef(false);

  /* Free-spinning axis: a constant cruise speed + momentum.
     Flicks add velocity that glides back to cruise; the cruise direction follows your last flick. */
  const CRUISE = isDesktop ? 26 : 30; // deg / s
  const dir = useRef(-ds); // which way it cruises
  const vel = useRef(-ds * CRUISE);

  useEffect(
    () =>
      rot.on("change", (v) => {
        const idx = ((Math.round(-v / (ds * step)) % n) + n) % n;
        setFront((f) => (f === idx ? f : idx));
      }),
    [rot, step, n, ds]
  );

  useAnimationFrame((_, dt) => {
    if (reduce || !inView || drag.current) return;
    const d = Math.min(dt, 50);
    const cruise = dir.current * CRUISE * (hovered !== null ? 0.12 : 1);
    vel.current += (cruise - vel.current) * (1 - Math.exp(-d / 900)); // momentum decays to cruise
    rot.set(rot.get() + (vel.current * d) / 1000);
  });

  const kick = useCallback((d: number) => {
    // arrows / keys: give the axis a push in that direction
    dir.current = -d * ds;
    vel.current += -d * ds * 320;
  }, [ds]);
  const next = kick;

  const sens = isDesktop ? 0.16 : 0.32; // deg per px

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, last: e.clientX, t: performance.now(), v: 0, moved: false };
    moved.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.x) > 5) { d.moved = true; moved.current = true; }
    const now = performance.now();
    const delta = (e.clientX - d.last) * sens; // cards follow the finger
    const inst = (delta / Math.max(1, now - d.t)) * 1000;
    d.v = d.v * 0.6 + inst * 0.4; // smoothed velocity
    d.last = e.clientX;
    d.t = now;
    rot.set(rot.get() + delta);
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const v = Math.max(-900, Math.min(900, d.v));
    vel.current = v;
    if (Math.abs(v) > 20) dir.current = Math.sign(v);
  };

  const handleCardClick = (i: number) => {
    if (moved.current) return;
    onSelect?.(i);
  };

  return (
    <div
      className="relative"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") next(isAr ? -1 : 1);
        if (e.key === "ArrowLeft") next(isAr ? 1 : -1);
      }}
    >
      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative mx-auto flex h-[440px] w-full cursor-grab touch-pan-y select-none items-center justify-center active:cursor-grabbing sm:h-[720px]"
        style={{ perspective: isDesktop ? 1900 : 1000 }}
      >
        {/* tilted ring */}
        <div
          className="relative [transform-style:preserve-3d]"
          style={{ width: cardW, height: cardH, transform: `rotateZ(${isAr ? 9 : -9}deg) rotateX(-8deg)` }}
        >
          <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={{ rotateY: rot, z: -R }}>
            {items.map((item, i) => (
              <Card
                key={item.id}
                item={item}
                angle={ds * i * step}
                R={R}
                w={cardW}
                h={cardH}
                arc={cardArc}
                strips={isDesktop ? 20 : 12}
                active={i === front}
                hovered={hovered === i}
                onEnter={() => setHovered(i)}
                onLeave={() => setHovered(null)}
                onClick={() => handleCardClick(i)}
              />
            ))}
          </motion.div>
        </div>
      </div>

      {/* caption + controls */}
      <div className="mx-auto mt-2 flex max-w-3xl flex-col items-center gap-6 px-4 text-center sm:mt-4">
        <div className="min-h-[96px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={items[front].id}
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderCaption ? renderCaption(items[front], front) : <h3 className="text-2xl font-black">{items[front].title}</h3>}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => next(-1)} aria-label={isAr ? "السابق" : "Previous"} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-[#f1e785] hover:bg-[#f1e785] hover:text-black">
            <ChevronRight size={18} className="ltr:rotate-180" />
          </button>
          <div className="flex gap-1.5">
            {items.map((it, i) => (
              <span key={it.id} className={`h-1.5 rounded-full transition-all duration-500 ${i === front ? "w-6 bg-[#f1e785]" : "w-1.5 bg-white/25"}`} />
            ))}
          </div>
          <button type="button" onClick={() => next(1)} aria-label={isAr ? "التالي" : "Next"} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-[#f1e785] hover:bg-[#f1e785] hover:text-black">
            <ChevronLeft size={18} className="ltr:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({
  item, angle, R, w, h, arc, strips, active, hovered, onEnter, onLeave, onClick,
}: {
  item: Carousel3DItem; angle: number; R: number; w: number; h: number; arc: number; strips: number;
  active: boolean; hovered: boolean; onEnter: () => void; onLeave: () => void; onClick: () => void;
}) {
  const bend = useMotionValue(arc) as MotionValue<number>; // wrap the card onto the ring (convex)
  return (
    <button
      type="button"
      aria-label={item.title}
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      className="absolute left-0 top-0 [transform-style:preserve-3d] focus-visible:outline-none"
      style={{ width: w, height: h, transform: `rotateY(${angle}deg) translateZ(${R}px)` }}
    >
      <motion.div
        animate={{ scale: hovered ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="absolute inset-0 [transform-style:preserve-3d]"
      >
      <CurvedPlane
        src={item.image}
        alt={item.title}
        bend={bend}
        axis="y"
        strips={strips}
        radius={14}
        tint={active ? 0.05 : 0.35}
        shade={0.35}
        outline={hovered}
      />
      </motion.div>
    </button>
  );
}

function isArSign(isAr: boolean) {
  return isAr ? -1 : 1;
}
