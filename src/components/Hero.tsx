"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowLeft, Play, VolumeX } from "lucide-react";
import FluidButton from "@/components/ui/FluidButton";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const VIDEO_SRC = "/hero/alghdeer-hero.mp4";
const POSTER = "/hero/alghdeer-hero-poster.jpg";
const BASE_VOLUME = 0.2; // low, background-level sound

export default function Hero() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const reduce = useReducedMotion();
  // the clip is vertical: on wide screens it sits in a tall frame over a blurred copy of itself
  const wide = useMediaQuery("(min-aspect-ratio: 1/1) and (min-width: 900px)");

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -55]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.82, 1], [1, 1, 0]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  const { setVideo, canvasRef, audible, toggleSound } = useHeroVideo(scrollYProgress);

  // gentle 3D tilt of the video frame following the mouse
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 120, damping: 18 });
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 18 });

  const videoEl = (className: string) => (
    <video
      ref={setVideo}
      src={VIDEO_SRC}
      poster={POSTER}
      muted
      loop
      playsInline
      preload="auto"
      className={className}
    />
  );

  const soundButton = (extra = "") => (
    <SoundButton audible={audible} onToggle={toggleSound} isAr={isAr} className={extra} />
  );

  const textBlock = (
    <div className={`flex w-full flex-col ${wide ? "items-start text-start" : "items-center text-center"}`}>
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        className={`mb-5 flex items-center gap-2 text-xs font-bold text-[#f4e98c] sm:mb-7 sm:text-sm md:text-base ${
          isAr ? "tracking-normal" : "uppercase tracking-[0.28em]"
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#f4e98c]" />
        {isAr ? "مخيم شتوي • جدة • طريق بريمان" : "WINTER CAMP • JEDDAH • BURAYMAN"}
        <span className="h-1.5 w-1.5 rounded-full bg-[#f4e98c]" />
      </motion.p>

      <div className="w-full px-2 pb-6 pt-2 sm:pb-8">
        <motion.h1
          initial={{ y: 45, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={`font-black text-[#f1e785] drop-shadow-[0_8px_30px_rgba(0,0,0,0.45)] ${
            wide
              ? isAr
                ? "text-[clamp(5rem,11vw,12rem)] leading-[1.05]"
                : "text-[clamp(3.6rem,8.5vw,9.5rem)] leading-[0.92] tracking-[-0.06em]"
              : isAr
                ? "text-[clamp(5rem,20vw,16rem)] leading-[1.08] tracking-normal"
                : "text-[clamp(3.4rem,14.2vw,14rem)] leading-[0.9] tracking-[-0.065em]"
          }`}
        >
          {isAr ? "الغدير" : "ALGHDEER"}
        </motion.h1>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.95 }}
        className={`max-w-2xl text-base font-bold leading-[1.75] text-white sm:text-xl md:text-2xl ${
          isAr ? "tracking-normal" : "sm:tracking-[0.02em]"
        }`}
      >
        {t("heroSub")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.15, ease: [0.16, 1, 0.3, 1] }}
        className={`mt-8 flex w-full flex-col items-center gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:gap-4 ${wide ? "justify-start" : "justify-center"}`}
      >
        <FluidButton
          href="#contact"
          icon={<ArrowLeft size={18} className="ltr:rotate-180" />}
          className="w-full max-w-xs sm:w-auto sm:max-w-none"
        >
          {isAr ? "احجز ليلتك الآن" : "Book Your Night"}
        </FluidButton>
        <FluidButton
          href="#events"
          borderOpacity={0.45}
          pulse={false}
          icon={<Play size={14} className="fill-current" />}
          className="w-full max-w-xs sm:w-auto sm:max-w-none [&>a]:bg-white/5 [&>a]:backdrop-blur-md"
        >
          {isAr ? "شاهد فعالياتنا" : "Watch Our Events"}
        </FluidButton>
      </motion.div>
    </div>
  );

  return (
    <section ref={ref} id="home" className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-[#050807]">
      {/* ── background ── */}
      <motion.div style={{ scale: bgScale }} className="absolute inset-0 z-0">
        {wide ? (
          <>
            {/* blurred, colour-rich copy of the same clip fills the screen (one decode, always in sync) */}
            <img src={POSTER} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-125 object-cover opacity-90 blur-[40px] brightness-[1.7] saturate-150" />
            <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full scale-125 blur-[42px] brightness-[1.9] saturate-[1.7]" />
            <div className="absolute inset-0 bg-black/20" />
          </>
        ) : (
          videoEl("h-full w-full object-cover object-center")
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/10 to-black/85" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.5)_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-soft-light"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 0.7px, transparent 0.7px)", backgroundSize: "5px 5px" }}
        />
      </motion.div>

      {/* ── content ── */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className={`relative z-10 flex h-full items-center px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 ${wide ? "lg:px-12" : "justify-center"}`}
      >
        {wide ? (
          <div className="mx-auto grid w-full max-w-[1240px] grid-cols-[1fr_auto] items-center gap-12 xl:gap-16">
            {textBlock}

            {/* tall video frame */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 60, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ y: cardY }}
              className="[perspective:1400px]"
            >
              <motion.div
                onMouseMove={(e) => {
                  if (reduce) return;
                  const r = e.currentTarget.getBoundingClientRect();
                  mx.set((e.clientX - r.left) / r.width - 0.5);
                  my.set((e.clientY - r.top) / r.height - 0.5);
                }}
                onMouseLeave={() => { mx.set(0); my.set(0); }}
                style={{ rotateX: rotX, rotateY: rotY }}
                className="relative aspect-[464/832] h-[min(74svh,740px)] overflow-hidden rounded-[30px] bg-black shadow-[0_50px_140px_rgba(0,0,0,0.7)] ring-1 ring-white/15"
              >
                {videoEl("absolute inset-0 h-full w-full object-cover")}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                <span className="absolute start-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f1e785] opacity-70 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f1e785]" />
                  </span>
                  {isAr ? "من ليالي الغدير" : "Alghdeer nights"}
                </span>
                {soundButton("absolute bottom-4 end-4")}
              </motion.div>
            </motion.div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-[1500px] flex-col items-center">{textBlock}</div>
        )}
      </motion.div>

      {!wide && soundButton("absolute bottom-5 end-4 z-20 sm:bottom-8 sm:end-8")}
    </section>
  );
}

/* ───────────────────────── video + sound logic ───────────────────────── */

function useHeroVideo(progress: ReturnType<typeof useScroll>["scrollYProgress"]) {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audible, setAudible] = useState(false); // sound actually on
  const userMuted = useRef(false); // the visitor turned it off — respect that
  const level = useRef(1); // 0..1 from scroll position
  const audio = useRef<{ ctx: AudioContext; gain: GainNode } | null>(null);
  const volumeWorks = useRef(true); // iOS ignores video.volume → use Web Audio gain

  const applyVolume = useCallback(() => {
    if (!video) return;
    const v = BASE_VOLUME * level.current;
    if (audio.current) {
      const { ctx, gain } = audio.current;
      gain.gain.setTargetAtTime(v, ctx.currentTime, 0.12);
    } else {
      video.volume = Math.max(0, Math.min(1, v));
    }
  }, [video]);

  // start playing: try with sound (allowed on some browsers), else muted
  useEffect(() => {
    if (!video) return;
    video.volume = 0.5;
    volumeWorks.current = Math.abs(video.volume - 0.5) < 0.01;
    video.volume = BASE_VOLUME;
    if (userMuted.current) { video.muted = true; video.play().catch(() => {}); return; }
    video.muted = false;
    video
      .play()
      .then(() => setAudible(!video.muted))
      .catch(() => {
        video.muted = true;
        setAudible(false);
        video.play().catch(() => {});
      });
  }, [video]);

  const enableSound = useCallback(async () => {
    if (!video) return;
    userMuted.current = false;
    if (!volumeWorks.current && !audio.current) {
      try {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new Ctx();
        const src = ctx.createMediaElementSource(video);
        const gain = ctx.createGain();
        gain.gain.value = 0;
        src.connect(gain).connect(ctx.destination);
        audio.current = { ctx, gain };
      } catch {
        /* fall back to element volume */
      }
    }
    await audio.current?.ctx.resume().catch(() => {});
    video.muted = false;
    applyVolume();
    try {
      await video.play();
      setAudible(true);
    } catch {
      video.muted = true;
      setAudible(false);
    }
  }, [video, applyVolume]);

  const toggleSound = useCallback(() => {
    if (!video) return;
    if (audible) {
      userMuted.current = true;
      video.muted = true;
      setAudible(false);
    } else {
      enableSound();
    }
  }, [audible, video, enableSound]);

  // first interaction anywhere on the page unlocks the (low) sound — unless they muted it
  useEffect(() => {
    if (!video) return;
    const unlock = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.("[data-sound-toggle]")) return; // the button handles itself
      if (userMuted.current || !video.muted) { remove(); return; }
      if (level.current > 0.2) { enableSound(); remove(); } // only while the hero is on screen
    };
    const evs = ["pointerdown", "keydown", "touchend"] as const;
    const remove = () => evs.forEach((ev) => window.removeEventListener(ev, unlock, true));
    evs.forEach((ev) => window.addEventListener(ev, unlock, { capture: true, passive: true }));
    return remove;
  }, [video, enableSound]);

  // scroll away → the sound fades out quickly; scroll back → it returns (if not muted). Off-screen → pause.
  useMotionValueEvent(progress, "change", (p) => {
    level.current = Math.max(0, Math.min(1, 1 - p / 0.4));
    applyVolume();
    if (!video) return;
    if (p >= 0.98 && !video.paused) video.pause();
    else if (p < 0.98 && video.paused && !document.hidden) video.play().catch(() => {});
  });

  // pause when the tab is hidden
  useEffect(() => {
    if (!video) return;
    const onVis = () => (document.hidden ? video.pause() : progressOk() && video.play().catch(() => {}));
    const progressOk = () => progress.get() < 0.98;
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [video, progress]);

  // paint a tiny copy of the video into the blurred background canvas (wide layout)
  useEffect(() => {
    const cv = canvasRef.current;
    if (!video || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    cv.width = 48;
    cv.height = 27;
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (video.readyState < 2 || video.paused) return;
      const vw = video.videoWidth, vh = video.videoHeight;
      // cover-crop the vertical clip into a landscape canvas
      const sh = (vw * cv.height) / cv.width;
      ctx.drawImage(video, 0, Math.max(0, (vh - sh) / 2), vw, Math.min(vh, sh), 0, 0, cv.width, cv.height);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  });

  return { setVideo, canvasRef, audible, toggleSound };
}

function SoundButton({ audible, onToggle, isAr, className = "" }: {
  audible: boolean; onToggle: () => void; isAr: boolean; className?: string;
}) {
  return (
    <button
      type="button"
      data-sound-toggle
      onClick={onToggle}
      aria-pressed={audible}
      aria-label={audible ? (isAr ? "كتم الصوت" : "Mute") : (isAr ? "تشغيل الصوت" : "Turn sound on")}
      className={`z-20 inline-flex h-11 items-center gap-2.5 rounded-full border border-white/25 bg-black/45 px-4 text-xs font-bold text-white backdrop-blur-md transition-colors hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {audible ? (
          <motion.span key="on" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} className="flex h-4 items-end gap-[3px]">
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full bg-current"
                animate={{ height: ["30%", "100%", "45%", "80%", "30%"] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
              />
            ))}
          </motion.span>
        ) : (
          <motion.span key="off" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}>
            <VolumeX size={16} />
          </motion.span>
        )}
      </AnimatePresence>
      <span>{audible ? (isAr ? "كتم الصوت" : "Mute") : (isAr ? "تشغيل الصوت" : "Sound on")}</span>
    </button>
  );
}
