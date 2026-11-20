"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export const P = "/proposal";
export const EASE = [0.16, 1, 0.3, 1] as const;

/** Language helpers: `L(ar, en)`, digits in the right script. */
export function useL() {
  const { lang, setLang } = useLanguage();
  const ar = lang === "ar";
  const nf = new Intl.NumberFormat(ar ? "ar-SA-u-nu-arab" : "en-US", { useGrouping: !ar });
  return {
    lang,
    setLang,
    ar,
    L: (a: string, e: string) => (ar ? a : e),
    n: (v: number) => nf.format(v),
  };
}

export function useMedia(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

/** Fade + rise when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  y = 36,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "p";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: reduce ? 0.3 : 0.9, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

/** Kicker + two-line display title; each line rises out of its own mask. */
export function Heading({
  kicker,
  a,
  b,
  className = "",
  size = "lg",
  tone = "ink",
}: {
  kicker: string;
  a: string;
  b: string;
  className?: string;
  size?: "lg" | "xl";
  tone?: "ink" | "paper";
}) {
  const reduce = useReducedMotion();
  const line = (txt: string, i: number, gold: boolean) => (
    <span className="v2-line-mask" key={i}>
      <motion.span
        className={`block ${gold ? "v2-gold" : ""}`}
        initial={{ y: reduce ? 0 : "105%", opacity: reduce ? 0 : 1 }}
        whileInView={{ y: "0%", opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 1, delay: 0.08 + i * 0.12, ease: EASE }}
      >
        {txt}
      </motion.span>
    </span>
  );
  return (
    <div className={className}>
      <Reveal y={14}>
        <p className={`v2-kicker ${tone === "paper" ? "v2-kicker-paper" : ""}`}>{kicker}</p>
      </Reveal>
      <h2 className={`${size === "xl" ? "v2-title-xl" : "v2-title"} ${tone === "paper" ? "v2-title-paper" : ""}`}>
        {line(a, 0, false)}
        {line(b, 1, true)}
      </h2>
    </div>
  );
}

/**
 * Photo revealed by a paper curtain that lifts away, then drifting slower than the page.
 * Only transform/opacity animate (compositor-friendly). Text never sits on it.
 */
export function Photo({
  src,
  alt = "",
  className = "",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  strength = 7,
  round = true,
  position = "center",
}: {
  src: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  strength?: number;
  round?: boolean;
  position?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);
  return (
    <div ref={ref} className={`v2-photo ${round ? "v2-photo-round" : ""} ${className}`}>
      <motion.div className="v2-par" style={{ top: `-${strength + 3}%`, bottom: `-${strength + 3}%`, y: reduce ? 0 : y }}>
        <motion.div
          className="absolute inset-0"
          initial={reduce || priority ? false : { scale: 1.14 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
          transition={{ duration: 1.6, ease: EASE }}
        >
          <Image
            src={src.startsWith("/") ? src : `${P}/${src}.jpg`}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            quality={72}
            className="object-cover"
            style={{ objectPosition: position }}
          />
        </motion.div>
      </motion.div>
      {reduce || priority ? null : (
        <motion.span
          aria-hidden
          className="v2-curtain"
          initial={{ scaleY: 1 }}
          whileInView={{ scaleY: 0 }}
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
          transition={{ duration: 1.1, ease: EASE }}
        />
      )}
    </div>
  );
}

/** True on Save-Data or 2G connections: we then keep posters and skip video downloads. */
function lowData() {
  if (typeof navigator === "undefined") return false;
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return Boolean(c?.saveData || (c?.effectiveType && /(^|-)2g$/.test(c.effectiveType)));
}

/**
 * Muted looping clip that only downloads when it gets near the screen and pauses when it leaves.
 * Falls back to its poster for reduced motion or slow connections.
 */
export function Video({
  name,
  mobile,
  className = "",
  eager = false,
  position = "center",
  label,
}: {
  name: string;
  mobile?: string;
  className?: string;
  eager?: boolean;
  position?: string;
  label?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [file, setFile] = useState(name);

  useEffect(() => {
    if (mobile && window.matchMedia("(max-width: 767px)").matches) setFile(mobile);
  }, [mobile]);

  useEffect(() => {
    const v = ref.current;
    if (!v || reduce || lowData()) return;
    let loaded = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!loaded) {
            const f = mobile && window.matchMedia("(max-width: 767px)").matches ? mobile : name;
            v.src = `/v2/video/${f}.mp4`;
            loaded = true;
          }
          v.play().catch(() => {});
        } else if (loaded) {
          v.pause();
        }
      },
      { rootMargin: eager ? "0px" : "300px 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [name, mobile, reduce, eager]);

  return (
    <video
      ref={ref}
      className={`v2-video ${className}`}
      poster={`/v2/video/${file}.jpg`}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ objectPosition: position }}
    />
  );
}

/** Photo + caption under it (captions never overlap the image). */
export function Tile({
  src,
  cap,
  className = "",
  photoClass = "aspect-[16/10]",
  sizes,
  strength,
  delay = 0,
}: {
  src: string;
  cap: string;
  className?: string;
  photoClass?: string;
  sizes?: string;
  strength?: number;
  delay?: number;
}) {
  return (
    <figure className={`v2-tile ${className}`}>
      <Photo src={src} alt={cap} className={photoClass} sizes={sizes} strength={strength} />
      <Reveal y={12} delay={0.15 + delay}>
        <figcaption className="v2-cap">{cap}</figcaption>
      </Reveal>
    </figure>
  );
}

/** Number that counts up the first time it scrolls into view. */
export function CountUp({ value, format }: { value: number; format: (v: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const [v, setV] = useState(value);
  const armed = useRef(false);

  useEffect(() => {
    if (reduce) return;
    if (!inView && !armed.current) {
      armed.current = true;
      setV(0);
    }
  }, [inView, reduce]);

  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, value, { duration: 2, ease: EASE, onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, reduce, value]);

  return <span ref={ref}>{format(v)}</span>;
}

export function Band({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`v2-band ${className}`} />;
}
