"use client";

import React, { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CountUp, EASE, Heading, P, Photo, Reveal, useL, Video } from "./kit";

/* Pin centres in % of the aerial camp photo (1600×686). */
type Spot = { x: number; y: number; name: [string, string]; text: [string, string]; src: string };
const SPOTS: Spot[] = [
  { x: 47.2, y: 39.9, src: "hall", name: ["القاعة الزجاجية", "Glass hall"], text: ["قاعة مكيّفة لحتى ٢٥٠ ضيف، بواجهات زجاج تطل على الصحراء.", "Air-conditioned, up to 250 guests, glass walls facing the desert."] },
  { x: 25, y: 46.9, src: "camp-dusk", name: ["الجلسات الخارجية", "Outdoor seating"], text: ["جلسات وطاولات مفتوحة على الرمل، تحلو مع نسمة المساء.", "Open-air lounges and tables on the sand, best in the evening breeze."] },
  { x: 8, y: 55.2, src: "ensemble", name: ["مسرح العروض", "Performance stage"], text: ["مسرح للعروض الحية والإنشاد والدي جي.", "A stage for live shows, inshad and DJ sets."] },
  { x: 63.6, y: 35, src: "event-aerial", name: ["ساحة الفعاليات", "Events yard"], text: ["ساحة واسعة تتسع للفعاليات الكبيرة حتى ١٢٠٠ ضيف.", "A wide yard for large events of up to 1,200 guests."] },
  { x: 47.2, y: 87.9, src: "numbers", name: ["المدخل الرئيسي", "Main entrance"], text: ["مدخلان ومسار استقبال واضح لضيوفكم.", "Two entrances and a clear welcome route for your guests."] },
  { x: 15, y: 86, src: "rubicon", name: ["المواقف", "Parking"], text: ["مواقف خارجية واسعة بجانب المخيم مباشرة.", "Ample parking right next to the camp."] },
];

export function MapExplorer() {
  const { L, n, ar } = useL();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [night, setNight] = useState(false);
  const spot = SPOTS[active];
  const t = (b: [string, string]) => (ar ? b[0] : b[1]);

  return (
    <section id="camp" className="v2-kraft v2-section">
      <div className="v2-wrap">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <Heading kicker={L("جولة في المخيم", "WALK THE CAMP")} a={L("اضغطوا على أي ركن", "Tap any corner")} b={L("وشوفوه عن قرب", "and see it up close")} />
          <Reveal>
            <p className="v2-body max-w-md">{L("صورة من الأعلى لمخيم الغدير. اختاروا نقطة لتعرفوا وش ينتظركم فيها.", "An aerial view of ALGHDEER. Pick a point to see what is waiting there.")}</p>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.7fr_1fr] lg:items-start">
          <div>
          <div className="relative">
            <Photo src="map" alt={L("صورة جوية للمخيم", "Aerial photo of the camp")} className="aspect-[1600/686]" sizes="(min-width: 1024px) 62vw, 100vw" strength={4} />
            <AnimatePresence>
              {night ? (
                <motion.div
                  key="night"
                  className="v2-photo v2-photo-round z-[3]"
                  style={{ position: "absolute", inset: 0 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: EASE }}
                >
                  <Video name="aerial-night" eager label={L("المخيم من الأعلى ليلًا", "The camp from above at night")} />
                </motion.div>
              ) : null}
            </AnimatePresence>
            {SPOTS.map((p, i) => (
              <motion.button
                key={i}
                type="button"
                aria-label={t(p.name)}
                aria-pressed={active === i}
                className={`v2-pin ${active === i ? "is-on" : ""}`}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                initial={reduce ? false : { scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.5 + i * 0.1 }}
                onClick={() => { setActive(i); setNight(false); }}
                onMouseEnter={() => setActive(i)}
              >
                {n(i + 1)}
              </motion.button>
            ))}
          </div>
          <div className="v2-toggle mt-4" role="group" aria-label={L("وقت اللقطة", "Time of day")}>
            <button type="button" aria-pressed={!night} onClick={() => setNight(false)}>{L("نهارًا", "By day")}</button>
            <button type="button" aria-pressed={night} onClick={() => setNight(true)}>{L("ليلًا", "By night")}</button>
          </div>
          </div>

          <div className="v2-spot">
            <div className="v2-photo v2-photo-round aspect-[16/10]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={spot.src}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: reduce ? 1 : 1.08, zIndex: 2 }}
                  animate={{ opacity: 1, scale: 1, zIndex: 2 }}
                  exit={{ opacity: 0, zIndex: 1, transition: { duration: 0.4, delay: 0.4 } }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  <Image src={`${P}/${spot.src}.jpg`} alt={t(spot.name)} fill quality={70} sizes="(min-width: 1024px) 34vw, 100vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduce ? 0 : -6 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="mt-5"
              >
                <p className="v2-step-when"><span className="v2-step-n">{n(active + 1)}</span>{t(spot.name)}</p>
                <p className="v2-body mt-2">{t(spot.text)}</p>
              </motion.div>
            </AnimatePresence>
            <div className="mt-6 flex flex-wrap gap-2">
              {SPOTS.map((p, i) => (
                <button key={i} type="button" onClick={() => setActive(i)} className={`v2-chip v2-chip-sm v2-chip-btn ${active === i ? "is-on" : ""}`}>
                  {t(p.name)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Dark band of big numbers that count up. */
export function NumbersBand() {
  const { L, n } = useL();
  const stats = [
    { v: 1200, l: L("ضيف كحد أقصى", "guests at most") },
    { v: 250, l: L("ضيف داخل القاعة", "guests in the hall") },
    { v: 240, l: L("م² قاعة مكيّفة", "m² cooled hall") },
    { v: 2, l: L("مدخلان ومواقف", "entrances & parking") },
  ];
  return (
    <section className="v2-night relative" aria-label={L("المخيم بالأرقام", "The camp in numbers")}>
      <div className="v2-wrap grid grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={i} delay={i * 0.08} className="v2-band-stat">
            <p className="v2-band-n"><CountUp value={s.v} format={n} /></p>
            <p className="v2-band-l">{s.l}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
