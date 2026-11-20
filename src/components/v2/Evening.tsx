"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { EASE, Heading, P, Reveal, useL, Video } from "./kit";

type Step = { when: string; title: string; text: string; src: string; alt: string; video?: string };

/** One step of the evening; reports itself as active when it reaches the middle of the screen. */
function StepBlock({ step, i, onActive, active }: { step: Step; i: number; onActive: (i: number) => void; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (inView) onActive(i);
  }, [inView, i, onActive]);
  const { n, ar } = useL();
  return (
    <div ref={ref} className={`v2-step ${active ? "is-on" : ""}`}>
      <div className="v2-photo v2-photo-round mb-6 aspect-[4/3] lg:hidden">
        {step.video ? <Video name={step.video} label={step.alt} /> : <Image src={`${P}/${step.src}.jpg`} alt={step.alt} fill quality={70} sizes="100vw" className="object-cover" />}
      </div>
      <p className="v2-step-when">
        <span className="v2-step-n">{n(i + 1).padStart(2, ar ? "٠" : "0")}</span>
        {step.when}
      </p>
      <h3 className="v2-step-title">{step.title}</h3>
      <p className="v2-body mt-3 max-w-md">{step.text}</p>
    </div>
  );
}

export default function Evening() {
  const { L } = useL();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 60%", "end 60%"] });
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const steps: Step[] = [
    {
      when: L("الوصول", "Arrival"),
      title: L("فناجين على الباب", "Coffee at the door"),
      text: L("يستقبل فريقنا ضيوفكم بالقهوة السعودية والتمر، ثم جلسات مفتوحة على الرمل قبل أن تبدأ الحركة.", "Our team greets your guests with Saudi coffee and dates, then open-air seating on the sand before things get moving."),
      src: "coffee",
      alt: L("قهوة سعودية تُصب لضيف", "Saudi coffee being poured"),
    },
    {
      when: L("قبل الغروب", "Before sunset"),
      title: L("الكثبان تنادي", "The dunes are calling"),
      text: L("رانجر وبقي ودبابات على مسارات بريمان المفتوحة، مع مرافقين يعرفون كل منحدر.", "Rangers, buggies and quad bikes across the open Briman tracks, with guides who know every slope."),
      src: "tracks",
      video: "convoy",
      alt: L("سيارات تشق مسارات على الرمل", "Vehicles cutting tracks across the sand"),
    },
    {
      when: L("مع الغروب", "At sunset"),
      title: L("مباراة على الضوء الأخير", "A match in the last light"),
      text: L("طائرة وتحديات بين الفرق، وكيرم وبلوت لمن يفضّل الطاولة.", "Volleyball and team challenges, with carrom and baloot for those who prefer the table."),
      src: "volley-dusk",
      alt: L("مباراة كرة طائرة وقت الغروب", "Volleyball at sunset"),
    },
    {
      when: L("العشاء", "Dinner"),
      title: L("الفحم يشتغل", "The coals are lit"),
      text: L("مشويات على الفحم وبوثات أطعمة حية، وكنافة وفواكه تختم السفرة.", "Charcoal grills and live food booths, with kunafa and fruit to finish the table."),
      src: "skewers",
      alt: L("أسياخ مشويات على الفحم", "Skewers on the charcoal grill"),
    },
    {
      when: L("السهرة", "Late night"),
      title: L("النار والإيقاع", "Fire and rhythm"),
      text: L("عروض نارية وإنشاد ودي جي تحت سماء مفتوحة، حتى آخر أغنية.", "Fire shows, inshad and a DJ under an open sky, right up to the last song."),
      src: "fireshow",
      video: "fire",
      alt: L("عرض ناري في ساحة المخيم", "A fire show in the camp yard"),
    },
  ];
  const cur = steps[active];

  return (
    <section id="evening" className="v2-paper v2-section">
      <div className="v2-wrap">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <Heading kicker={L("ليلة في الغدير", "A NIGHT AT ALGHDEER")} a={L("من العصر", "From late afternoon")} b={L("حتى آخر أغنية", "to the last song")} />
          <Reveal>
            <p className="v2-body max-w-md">
              {L("هكذا تمشي ليلة نموذجية عندنا. نرتّب التفاصيل والتوقيت على مقاس مناسبتكم.", "This is how a typical night runs here. We shape the timing and details around your occasion.")}
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-20 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div ref={listRef} className="v2-steps relative">
            <div className="v2-steps-line" aria-hidden>
              <motion.span style={{ scaleY: reduce ? 1 : line }} />
            </div>
            {steps.map((s, i) => (
              <StepBlock key={s.src} step={s} i={i} active={active === i} onActive={setActive} />
            ))}
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-[14vh]">
              <div className="v2-photo v2-photo-round h-[72vh]">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={cur.src}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: reduce ? 1 : 1.1, zIndex: 2 }}
                    animate={{ opacity: 1, scale: 1, zIndex: 2 }}
                    exit={{ opacity: 0, zIndex: 1, transition: { duration: 0.6, delay: 0.5 } }}
                    transition={{ duration: 1, ease: EASE }}
                  >
                    {cur.video ? (
                      <Video name={cur.video} label={cur.alt} eager />
                    ) : (
                      <Image src={`${P}/${cur.src}.jpg`} alt={cur.alt} fill quality={72} sizes="45vw" className="object-cover" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="v2-cap m-0">{cur.when}</p>
                <div className="flex gap-1.5" aria-hidden>
                  {steps.map((s, i) => (
                    <span key={s.src} className={`v2-dot ${i === active ? "is-on" : ""}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
