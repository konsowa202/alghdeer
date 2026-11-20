"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Band, Heading, P, useL, useMedia } from "./kit";

type Shot = { src: string; cap: string; wide?: boolean };

export default function Adventures() {
  const { ar, L, n } = useL();
  const reduce = useReducedMotion();
  const desktop = useMedia("(min-width: 768px)");
  const pinned = desktop && !reduce;

  const shots: Shot[] = [
    { src: "drift-black", cap: L("صعود المنحدر", "Up the slope"), wide: true },
    { src: "divider", cap: L("دوائر الغبار على الرمل", "Dust circles on the sand"), wide: true },
    { src: "inside-jeep", cap: L("المقعد الأمامي", "Front seat") },
    { src: "pov", cap: L("يدك على المقود", "Hands on the wheel") },
    { src: "rubicon", cap: L("جاهز قبل الغروب", "Ready before sunset") },
    { src: "tracks", cap: L("قوافل ومسارات مفتوحة", "Convoys and open tracks"), wide: true },
  ];

  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);

  useEffect(() => {
    if (!pinned) return;
    const measure = () => {
      if (!track.current || !viewport.current) return;
      setDist(Math.max(0, track.current.scrollWidth - viewport.current.clientWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned, ar]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"], layoutEffect: false });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const x = useTransform(smooth, [0, 1], [0, ar ? dist : -dist]);
  const bar = useTransform(smooth, [0, 1], [0, 1]);

  const intro = (
    <div className="v2-adv-intro">
      <Heading kicker={L("المغامرات", "ADVENTURES")} a={L("اتركوا الطريق", "Leave the road")} b={L("وخذوا الكثبان", "and take the dunes")} />
      <p className="v2-body mt-5">
        {L(
          "جولات على رمال بريمان بسيارات مجهّزة للوعر، ومرافقين يختارون المسار حسب جرأة المجموعة.",
          "Rides across the Briman sands in off-road rigs, with guides who pick the route to match how brave your group feels.",
        )}
      </p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {[L("رانجر", "Ranger"), L("بقي", "Buggy"), L("دبابات", "Quad bikes"), L("جيب روبيكون", "Jeep Rubicon")].map((v) => (
          <li key={v} className="v2-chip v2-chip-sm">{v}</li>
        ))}
      </ul>
      {pinned ? (
        <p className="v2-small mt-8 flex items-center gap-2" aria-hidden>
          <span className="v2-scroll-hint" /> {L("مرّر للأسفل لتتحرك الجولة", "Keep scrolling to ride along")}
        </p>
      ) : null}
    </div>
  );

  const card = (s: Shot, i: number) => (
    <figure key={s.src} className={`v2-adv-card ${s.wide ? "is-wide" : ""}`}>
      <div className="v2-photo v2-photo-round v2-adv-photo">
        <Image
          src={`${P}/${s.src}.jpg`}
          alt={s.cap}
          fill
          quality={70}
          sizes={pinned ? "(min-width: 768px) 55vw" : "85vw"}
          className="object-cover transition-transform duration-[1.2s] ease-out hover:scale-[1.04]"
        />
      </div>
      <figcaption className="v2-cap mt-3 flex items-baseline gap-3">
        <span className="v2-ember text-sm">{n(i + 1).padStart(2, ar ? "٠" : "0")}</span>
        {s.cap}
      </figcaption>
    </figure>
  );

  const end = (
    <div className="v2-adv-end v2-card">
      <p className="v2-title-sm">{L("تبون جولة؟", "Fancy a ride?")}</p>
      <p className="v2-body mt-3">
        {L("أضيفوا جولة تطعيس لمناسبتكم، ونرتب لكم المسار والسيارات حسب عدد الضيوف.", "Add a dune drive to your event and we will plan the route and vehicles around your guest count.")}
      </p>
      <a href="#book" className="v2-btn v2-btn-ember mt-6 h-12 px-6">{L("احجز جولتك", "Book your ride")}</a>
    </div>
  );

  if (!pinned && !reduce) {
    return <MobileStrip intro={intro} end={end} shots={shots} card={card} ar={ar} />;
  }

  if (!pinned) {
    return (
      <section id="adventures" className="v2-paper v2-section">
        <div className="v2-wrap">{intro}</div>
        <div className="v2-adv-swipe mt-10" role="list">
          {shots.map((s, i) => (
            <div role="listitem" key={s.src}>{card(s, i)}</div>
          ))}
          <div role="listitem">{end}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="adventures" ref={section} className="v2-paper relative" style={{ height: `calc(100vh + ${dist}px)` }}>
      <div ref={viewport} className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div ref={track} className="v2-adv-track" style={{ x }}>
          {intro}
          {shots.map(card)}
          {end}
        </motion.div>
        <div className="v2-wrap absolute inset-x-0 bottom-10">
          <div className="v2-progress">
            <motion.span style={{ scaleX: bar, transformOrigin: ar ? "right" : "left" }} />
          </div>
        </div>
        <Band className="absolute inset-x-0 top-0" />
      </div>
    </section>
  );
}

/**
 * Phones: the photos glide on their own (CSS transform marquee, compositor-only),
 * pause while off-screen or while a finger is down. Reduced motion uses the swipe list instead.
 */
function MobileStrip({
  intro,
  end,
  shots,
  card,
  ar,
}: {
  intro: React.ReactNode;
  end: React.ReactNode;
  shots: Shot[];
  card: (s: Shot, i: number) => React.ReactNode;
  ar: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [held, setHeld] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const running = visible && !held;
  return (
    <section id="adventures" className="v2-paper v2-section">
      <div className="v2-wrap">{intro}</div>
      <div
        ref={ref}
        className="v2-adv-marquee mt-10"
        dir="ltr"
        onPointerDown={() => setHeld(true)}
        onPointerUp={() => setHeld(false)}
        onPointerCancel={() => setHeld(false)}
        onPointerLeave={() => setHeld(false)}
      >
        <div className={`v2-adv-marquee-track ${ar ? "is-rtl" : ""}`} style={{ animationPlayState: running ? "running" : "paused" }}>
          {[0, 1].map((k) => (
            <div key={k} className="v2-adv-marquee-row" aria-hidden={k === 1}>
              {shots.map((s, i) => card(s, i))}
            </div>
          ))}
        </div>
      </div>
      <div className="v2-wrap mt-10">{end}</div>
    </section>
  );
}
