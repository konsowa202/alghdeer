"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { EASE, Heading, P, Reveal, useL } from "./kit";

/** Photo prints pinned to the paper: they drop in tilted and settle. */
export function Prints() {
  const { L } = useL();
  const reduce = useReducedMotion();
  const prints: { src: string; cap: string; aspect: string; tilt: number }[] = [
    { src: "volley-night", cap: L("طائرة تحت الأنوار", "Volleyball under the lights"), aspect: "aspect-[16/10]", tilt: -2 },
    { src: "ensemble", cap: L("إنشاد وطرب", "Inshad night"), aspect: "aspect-[4/5]", tilt: 1.5 },
    { src: "kunafa", cap: L("كنافة طازجة", "Fresh kunafa"), aspect: "aspect-[4/5]", tilt: -1 },
    { src: "dj-hands", cap: L("دي جي في الهواء الطلق", "Open-air DJ"), aspect: "aspect-[16/10]", tilt: 2 },
    { src: "hall-sunset", cap: L("القاعة وقت الغروب", "The hall at sunset"), aspect: "aspect-[16/10]", tilt: -1.5 },
    { src: "carrom", cap: L("جولة كيرم", "A round of carrom"), aspect: "aspect-[4/3]", tilt: 1 },
    { src: "fruit", cap: L("أبراج الفواكه", "Fruit towers"), aspect: "aspect-[4/5]", tilt: -2 },
    { src: "dj-booth", cap: L("الساحة تشتعل", "The yard comes alive"), aspect: "aspect-[4/3]", tilt: 1.5 },
  ];
  return (
    <section className="v2-paper v2-section" aria-label={L("من ليالينا", "From our nights")}>
      <div className="v2-wrap">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <Heading kicker={L("من ليالينا", "FROM OUR NIGHTS")} a={L("لقطات حقيقية", "Real moments,")} b={L("من ضيوف حقيقيين", "real guests")} />
          <Reveal>
            <p className="v2-body max-w-md">{L("كل الصور من فعاليات أقيمت في المخيم.", "Every photo here was taken at events held at the camp.")}</p>
          </Reveal>
        </div>
        <div className="v2-prints mt-12">
          {prints.map((p, i) => (
            <motion.figure
              key={p.src}
              className="v2-print"
              initial={reduce ? false : { opacity: 0, y: 60, rotate: p.tilt * 4 }}
              whileInView={{ opacity: 1, y: 0, rotate: p.tilt }}
              whileHover={reduce ? undefined : { rotate: 0, y: -6, scale: 1.02 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.9, delay: (i % 3) * 0.08, ease: EASE }}
            >
              <div className={`v2-photo ${p.aspect}`}>
                <Image src={`${P}/${p.src}.jpg`} alt={p.cap} fill quality={68} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" className="object-cover" />
              </div>
              <figcaption className="v2-print-cap">{p.cap}</figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/** What people book us for. */
export function Occasions() {
  const { L, n, ar } = useL();
  const items = [
    { t: L("فعاليات الشركات", "Corporate events"), d: L("لقاءات فرق، حفلات نهاية العام، وإطلاق منتجات بمساحة تتسع للجميع.", "Team days, year-end parties and launches, with room for everyone."), tags: [L("قاعة مكيّفة", "Cooled hall"), L("تحديات فرق", "Team challenges")] },
    { t: L("الغبقات الرمضانية", "Ramadan ghabqas"), d: L("سحور وسهرة رمضانية بجلسات عربية وضيافة أصيلة.", "Suhoor gatherings with Arabic majlis seating and classic hospitality."), tags: [L("جلسات عربية", "Majlis seating"), L("إنشاد", "Inshad")] },
    { t: L("المناسبات الخاصة", "Private occasions"), d: L("أعياد ميلاد، تخرّج، ولمّات عائلية بتجهيز كامل.", "Birthdays, graduations and family gatherings, fully arranged."), tags: [L("ديكور حسب الطلب", "Custom setup"), L("بوثات أطعمة", "Food booths")] },
    { t: L("الرحلات والمغامرات", "Trips & adventures"), d: L("يوم صحراوي للمجموعات بالتطعيس والدبابات والخيل.", "A desert day for groups: dune drives, quads and horses."), tags: [L("رانجر وبقي", "Ranger & buggy"), L("خيول", "Horses")] },
  ];
  return (
    <section id="occasions" className="v2-kraft v2-section">
      <div className="v2-wrap">
        <Heading kicker={L("المناسبات", "OCCASIONS")} a={L("وش المناسبة؟", "What's the occasion?")} b={L("عندنا لها مكان", "We have a place for it")} />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <a href="#book" className="v2-occ">
                <span className="v2-occ-n">{n(i + 1).padStart(2, ar ? "٠" : "0")}</span>
                <p className="v2-title-sm mt-6">{it.t}</p>
                <p className="v2-body mt-3">{it.d}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {it.tags.map((g) => <li key={g} className="v2-chip v2-chip-sm">{g}</li>)}
                </ul>
                <span className="v2-occ-go">{L("احجز ←", "Book →")}</span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
