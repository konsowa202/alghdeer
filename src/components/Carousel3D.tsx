"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  AnimatePresence,
  motion,
  MotionValue,
  useAnimationFrame,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import CurvedPlane from "@/components/CurvedPlane";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export type Carousel3DItem = {
  id: string;
  image: string;
  video?: string;
  title: string;
  desc?: string;
};

type Props = {
  items: Carousel3DItem[];
  renderCaption?: (item: Carousel3DItem, index: number, controls: { play: () => void; playing: boolean }) => React.ReactNode;
  isAr: boolean;
};

/**
 * 3D Gallery Carousel — curved video cards on a free-spinning ring whose axis
 * also wobbles (right side rises, then dips). Hover slows it, click plays the
 * video right on the curved card and parks it in front.
 */
export default function Carousel3D({ items, renderCaption, isAr }: Props) {
  const n = items.length;
  const step = 360 / n;
  const ds = isAr ? -1 : 1; // RTL: following cards sit to the left
  const reduce = Boolean(useReducedMotion());
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { amount: 0.3 });

  // big portrait-ish cards — the footage is vertical reels
  const cardW = isDesktop ? 560 : 250;
  const cardH = isDesktop ? 620 : 300;
  const gap = isDesktop ? 1.12 : 1.1;
  const R = ((cardW * n) / (2 * Math.PI)) * gap;
  const cardArc = cardW / R;

  const rot = useMotionValue(0); // spin around the axis (deg)
  const tiltZ = useMotionValue(isAr ? 10 : -10); // axis wobble: right side up / down
  const tiltX = useMotionValue(-8);
  const ringTransform = useMotionTemplate`rotateZ(${tiltZ}deg) rotateX(${tiltX}deg)`;

  const [front, setFront] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);

  const drag = useRef<{ id: number; x: number; last: number; t: number; v: number; moved: boolean } | null>(null);
  const moved = useRef(false);
  const CRUISE = isDesktop ? 28 : 32; // deg / s
  const dir = useRef(-ds);
  const vel = useRef(-ds * CRUISE);
  const clock = useRef(0);

  useEffect(
    () =>
      rot.on("change", (v) => {
        const idx = ((Math.round(-v / (ds * step)) % n) + n) % n;
        setFront((f) => (f === idx ? f : idx));
      }),
    [rot, step, n, ds]
  );

  useAnimationFrame((_, dt) => {
    if (reduce || !inView) return;
    const d = Math.min(dt, 50);
    clock.current += d / 1000;
    // the axis itself sways: right side rises, then dips
    const t = clock.current;
    const wob = playing !== null ? 0.35 : 1;
    const side = isAr ? 1 : -1;
    tiltZ.set(side * (4 + 12 * Math.sin(t * 0.55)) * wob + side * 4 * (1 - wob));
    tiltX.set(-8 + 7 * Math.sin(t * 0.55 + Math.PI / 2) * wob);

    if (drag.current?.moved || playing !== null) return; // parked while a video plays
    const cruise = dir.current * CRUISE * (hovered !== null ? 0.12 : 1);
    vel.current += (cruise - vel.current) * (1 - Math.exp(-d / 900));
    rot.set(rot.get() + (vel.current * d) / 1000);
  });

  // bring a card to the front (shortest way round)
  const park = useCallback(
    (i: number) => {
      const cur = rot.get();
      let delta = (-ds * i * step - cur) % 360;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      animate(rot, cur + delta, reduce ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 16 });
    },
    [rot, ds, step, reduce]
  );

  const stop = useCallback(() => {
    setPlaying(null);
    vel.current = dir.current * CRUISE;
  }, [CRUISE]);

  const play = useCallback(
    (i: number) => {
      if (playing === i) { stop(); return; }
      rot.stop();
      setPlaying(i);
      park(i);
    },
    [playing, stop, park, rot]
  );

  // start/stop the shared <video> when the playing card changes
  useEffect(() => {
    if (!videoEl) return;
    if (playing === null) { videoEl.pause(); return; }
    videoEl.currentTime = 0;
    videoEl.muted = muted;
    videoEl.play().catch(() => {
      // playback with sound blocked → fall back to muted
      videoEl.muted = true;
      setMuted(true);
      videoEl.play().catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, videoEl]);
  useEffect(() => { if (videoEl) videoEl.muted = muted; }, [muted, videoEl]);
  useEffect(() => { if (!inView && playing !== null) stop(); }, [inView, playing, stop]);

  const kick = (d: number) => {
    if (playing !== null) stop();
    dir.current = -d * ds;
    vel.current += -d * ds * 320;
  };

  const sens = isDesktop ? 0.16 : 0.32;

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { id: e.pointerId, x: e.clientX, last: e.clientX, t: performance.now(), v: 0, moved: false };
    moved.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.abs(e.clientX - d.x) > 6) {
      d.moved = true;
      moved.current = true;
      // capture only once it's a real drag, so plain clicks still reach the card
      (e.currentTarget as HTMLElement).setPointerCapture(d.id);
      if (playing !== null) stop();
      rot.stop();
    }
    if (!d.moved) return;
    const now = performance.now();
    const delta = (e.clientX - d.last) * sens;
    const inst = (delta / Math.max(1, now - d.t)) * 1000;
    d.v = d.v * 0.6 + inst * 0.4;
    d.last = e.clientX;
    d.t = now;
    rot.set(rot.get() + delta);
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d || !d.moved) return;
    const v = Math.max(-900, Math.min(900, d.v));
    vel.current = v;
    if (Math.abs(v) > 20) dir.current = Math.sign(v);
  };

  const playingItem = playing !== null ? items[playing] : null;

  return (
    <div
      className="relative"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") kick(isAr ? -1 : 1);
        if (e.key === "ArrowLeft") kick(isAr ? 1 : -1);
        if (e.key === "Escape") stop();
      }}
    >
      {/* one shared video element, painted onto the curved card */}
      <video
        ref={setVideoEl}
        src={playingItem?.video}
        poster={playingItem?.image}
        playsInline
        loop
        preload="none"
        className="pointer-events-none absolute h-px w-px opacity-0"
        aria-hidden
      />

      <div
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative mx-auto flex h-[520px] w-full cursor-grab touch-pan-y select-none items-center justify-center active:cursor-grabbing sm:h-[860px]"
        style={{ perspective: isDesktop ? 2000 : 1000 }}
      >
        <motion.div
          className="relative [transform-style:preserve-3d]"
          style={{ width: cardW, height: cardH, transform: ringTransform }}
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
                strips={isDesktop ? 22 : 12}
                active={i === front}
                hovered={hovered === i}
                isPlaying={playing === i}
                video={playing === i ? videoEl : null}
                onEnter={() => setHovered(i)}
                onLeave={() => setHovered(null)}
                onClick={() => { if (!moved.current) play(i); }}
              />
            ))}
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {playing !== null && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? (isAr ? "تشغيل الصوت" : "Unmute") : (isAr ? "كتم الصوت" : "Mute")}
              className="absolute bottom-4 end-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-md hover:bg-white hover:text-black sm:bottom-8 sm:end-8"
            >
              {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="mx-auto mt-2 flex max-w-3xl flex-col items-center gap-6 px-4 text-center">
        <div className="min-h-[96px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={items[front].id}
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderCaption
                ? renderCaption(items[front], front, { play: () => play(front), playing: playing === front })
                : <h3 className="text-2xl font-black">{items[front].title}</h3>}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => kick(-1)} aria-label={isAr ? "السابق" : "Previous"} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-[#f1e785] hover:bg-[#f1e785] hover:text-black">
            <ChevronRight size={18} className="ltr:rotate-180" />
          </button>
          <div className="flex gap-1.5">
            {items.map((it, i) => (
              <span key={it.id} className={`h-1.5 rounded-full transition-all duration-500 ${i === front ? "w-6 bg-[#f1e785]" : "w-1.5 bg-white/25"}`} />
            ))}
          </div>
          <button type="button" onClick={() => kick(1)} aria-label={isAr ? "التالي" : "Next"} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-[#f1e785] hover:bg-[#f1e785] hover:text-black">
            <ChevronLeft size={18} className="ltr:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({
  item, angle, R, w, h, arc, strips, active, hovered, isPlaying, video, onEnter, onLeave, onClick,
}: {
  item: Carousel3DItem; angle: number; R: number; w: number; h: number; arc: number; strips: number;
  active: boolean; hovered: boolean; isPlaying: boolean; video: HTMLVideoElement | null;
  onEnter: () => void; onLeave: () => void; onClick: () => void;
}) {
  const bend = useMotionValue(arc) as MotionValue<number>; // wrap the card onto the ring (convex)
  return (
    <button
      type="button"
      aria-label={item.title}
      aria-pressed={isPlaying}
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      className="absolute left-0 top-0 [transform-style:preserve-3d] focus-visible:outline-none"
      style={{ width: w, height: h, transform: `rotateY(${angle}deg) translateZ(${R}px)` }}
    >
      <motion.div
        animate={{ scale: isPlaying ? 1.06 : hovered ? 1.04 : 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="absolute inset-0 [transform-style:preserve-3d]"
      >
        <CurvedPlane
          src={item.image}
          alt={item.title}
          bend={bend}
          axis="y"
          strips={strips}
          radius={18}
          tint={isPlaying ? 0 : active ? 0.08 : 0.35}
          shade={0.35}
          outline={hovered || isPlaying}
          video={video}
        />
        {/* play / pause badge on the card's front face */}
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 grid h-16 w-16 place-items-center rounded-full bg-white/90 text-black shadow-xl transition-all duration-300"
          style={{
            opacity: isPlaying ? (hovered ? 0.9 : 0) : hovered || active ? 1 : 0,
            transform: `translate(-50%, -50%) translateZ(2px) scale(${hovered ? 1 : 0.85})`,
            backfaceVisibility: "hidden",
          }}
        >
          {isPlaying ? <Pause size={22} className="fill-current" /> : <Play size={22} className="ms-1 fill-current" />}
        </span>
      </motion.div>
    </button>
  );
}
