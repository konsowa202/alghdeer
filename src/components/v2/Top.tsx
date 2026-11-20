"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, MessageCircle } from "lucide-react";
import { trackContactClick } from "@/lib/analytics";
import { EASE, useL, Video } from "./kit";

export const WA = "https://wa.me/966544493991";

export function Nav() {
  const { ar, L, lang, setLang } = useL();
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);
  useMotionValueEvent(scrollY, "change", (y) => {
    const s = y > 24;
    if (s !== solid) setSolid(s);
    const h = y > 560 && y > last.current;
    if (Math.abs(y - last.current) > 6 && h !== hidden) setHidden(h);
    last.current = y;
  });

  const links: [string, string][] = [
    [L("ليلتكم", "Your night"), "#evening"],
    [L("المغامرات", "Adventures"), "#adventures"],
    [L("المخيم", "The camp"), "#camp"],
    [L("المناسبات", "Occasions"), "#occasions"],
  ];

  return (
    <motion.header
      className={`v2-nav ${solid ? "v2-nav-solid" : ""}`}
      initial={false}
      animate={{ y: hidden ? "-105%" : "0%" }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <div className="v2-wrap flex h-16 items-center gap-4 sm:h-[76px]">
        <a href="#top" className="shrink-0" aria-label="ALGHDEER camp">
          <Image src="/logo-black.png" alt="ALGHDEER camp" width={190} height={30} className="h-6 w-auto sm:h-7" priority />
        </a>
        <nav className="hidden flex-1 items-center justify-center gap-9 lg:flex" aria-label={L("أقسام الصفحة", "Page sections")}>
          {links.map(([label, href]) => (
            <a key={href} href={href} className="v2-navlink">{label}</a>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-2 lg:ms-0">
          <button
            type="button"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="v2-btn v2-btn-ghost h-10 px-3.5 text-sm"
            aria-label={ar ? "Switch to English" : "التبديل إلى العربية"}
          >
            {ar ? "EN" : "عربي"}
          </button>
          <a href="#book" className="v2-btn v2-btn-ink h-10 px-5 text-sm">{L("احجز", "Book")}</a>
        </div>
      </div>
    </motion.header>
  );
}

/**
 * Hero: editorial headline on paper, then a mounted film window (real drift footage)
 * that grows to full width as you scroll. Only transforms animate.
 */
export function Hero() {
  const { L, n } = useL();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const frameScale = useTransform(scrollYProgress, [0, 0.55], [1, 1.09]);
  const vidScale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);
  const headY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const headFade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  /* Entrance runs in CSS so the headline paints before JavaScript arrives on slow connections. */
  const rise = (i: number) => ({ className: "v2-rise", style: { animationDelay: `${0.2 + i * 0.14}s` } });
  const fade = (d: number) => ({ className: "v2-fade", style: { animationDelay: `${d}s` } });

  return (
    <section id="top" ref={ref} className="v2-hero v2-paper-photo relative">
      <motion.div className="v2-wrap" style={reduce ? undefined : { y: headY, opacity: headFade }}>
        <div className={`v2-meta ${fade(0.05).className}`} style={fade(0.05).style}>
          <span>{L("جدة — طريق بريمان", "Jeddah — Briman Road")}</span>
          <span className="v2-meta-rule" aria-hidden />
          <span>{L(`حتى ${n(1200)} ضيف`, "Up to 1,200 guests")}</span>
        </div>
        <div className="v2-hero-head">
          <h1 className="v2-title-hero">
            <span className="v2-line-mask"><span className="block v2-rise" style={rise(0).style}>{L("نهارٌ على الكثبان،", "Days on the dunes,")}</span></span>
            <span className="v2-line-mask"><span className="block v2-gold v2-rise" style={rise(1).style}>{L("وليلةٌ تحت النجوم", "nights under the stars")}</span></span>
          </h1>
          <div className="v2-hero-side v2-fade" style={fade(0.6).style}>
            <p className="v2-lead">
              {L(
                "مخيم خاص على أطراف جدة لفعاليات الشركات والمناسبات الكبيرة: مغامرات على الرمل، سهرات حيّة، وضيافة سعودية تُقدَّم كما يجب.",
                "A private desert camp outside Jeddah for corporate events and grand occasions: adventures on the sand, live nights and Saudi hospitality served the way it should be.",
              )}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#book" className="v2-btn v2-btn-ember h-12 px-7 text-base">{L("احجز مناسبتك", "Book your event")}</a>
              <a href={WA} target="_blank" rel="noopener noreferrer" onClick={() => trackContactClick("whatsapp")} className="v2-btn v2-btn-ghost h-12 px-5 text-base">
                <MessageCircle size={18} /> {L("واتساب", "WhatsApp")}
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="v2-hero-stage v2-stage-in">
        <motion.div
          className="v2-hero-frame"
          style={reduce ? undefined : { scale: frameScale }}
        >
          <motion.div className="v2-par inset-0" style={reduce ? undefined : { scale: vidScale }}>
            <Video name="hero" mobile="hero-sq" eager position="50% 70%" label={L("جيب يطعّس على كثبان بريمان", "A Jeep drifting on the Briman dunes")} />
          </motion.div>
          <span className="v2-film-grain" aria-hidden />
        </motion.div>
        <a href="#manifesto" className="v2-scroll-cue v2-fade" style={fade(1.2).style} aria-label={L("انزل", "Scroll down")}>
          <ArrowDown size={16} />
        </a>
      </div>
    </section>
  );
}

/** Statement set in large type with small live-footage capsules between the words. */
export function Manifesto() {
  const { L } = useL();
  const reduce = useReducedMotion();
  type Seg = { t: string } | { v: string; label: string };
  const segs: Seg[] = [
    { t: L("نستقبلكم بالقهوة على الباب،", "We greet you with coffee at the door,") },
    { v: "convoy", label: L("قافلة سيارات على الرمل", "A convoy on the sand") },
    { t: L("نأخذكم إلى الكثبان قبل الغروب،", "take you to the dunes before sunset,") },
    { v: "hero-sq", label: L("جيب على كثيب", "A Jeep on a dune") },
    { t: L("ثم نُشعل الليل", "then light up the night") },
    { v: "fire", label: L("عرض ناري", "A fire show") },
    { t: L("حتى آخر أغنية.", "until the very last song.") },
  ];
  let k = 0;
  return (
    <section id="manifesto" className="v2-paper v2-section-lg">
      <div className="v2-wrap">
        <motion.p
          className="v2-kicker text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {L("مخيم الغدير", "ALGHDEER CAMP")}
        </motion.p>
        <p className="v2-manifesto">
          {segs.map((s, i) => {
            if ("v" in s) {
              const d = 0.05 * k++;
              return (
                <motion.span
                  key={i}
                  className="v2-pill"
                  initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{ type: "spring", stiffness: 160, damping: 20, delay: d }}
                >
                  <Video name={s.v} label={s.label} />
                </motion.span>
              );
            }
            return s.t.split(" ").map((w, j) => {
              const d = 0.05 * k++;
              return (
                <motion.span
                  key={`${i}-${j}`}
                  className="v2-word"
                  initial={reduce ? false : { opacity: 0, y: "0.4em" }}
                  whileInView={{ opacity: 1, y: "0em" }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{ duration: 0.8, delay: d, ease: EASE }}
                >
                  {w}
                </motion.span>
              );
            });
          })}
        </p>
      </div>
    </section>
  );
}

/** Running tape of real facts, star-separated like the band. */
export function Ticker() {
  const { L, n } = useL();
  const items = [
    L("جدة — طريق بريمان", "Jeddah — Briman Road"),
    `${L("حتى", "Up to")} ${n(1200)} ${L("ضيف", "guests")}`,
    L("قاعة زجاجية مكيّفة", "Air-conditioned glass hall"),
    L("تطعيس بالرانجر والبقي", "Ranger & buggy dune drives"),
    L("عروض نارية ودي جي", "Fire shows & DJ"),
    L("قهوة سعودية ومشويات", "Saudi coffee & charcoal grill"),
    L("فعاليات شركات ومناسبات خاصة", "Corporate & private events"),
  ];
  const row = (k: string) => (
    <div className="v2-tick-row" aria-hidden={k === "b"} key={k}>
      {items.map((t, i) => (
        <span key={i} className="v2-tick-item">
          {t}
          <span className="v2-tick-star">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="v2-ticker" dir="ltr">
      <div className="v2-tick-track">{row("a")}{row("b")}</div>
    </div>
  );
}
