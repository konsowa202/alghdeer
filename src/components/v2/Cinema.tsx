"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Heading, Reveal, useL, Video } from "./kit";

/** The camp reel: a small mounted film that grows to fill the screen while the section is pinned. */
export default function Cinema() {
  const { L } = useL();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"], layoutEffect: false });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.35 });
  const scale = useTransform(p, [0, 0.55], [0.46, 1]);
  const inner = useTransform(p, [0, 1], [1.18, 1]);

  return (
    <section className="v2-paper" aria-label={L("فيلم المخيم", "Camp film")}>
      <div className="v2-wrap v2-section pb-0 sm:pb-0">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <Heading kicker={L("من عدسة المخيم", "FROM OUR LENS")} a={L("ليلة كاملة", "A whole night")} b={L("في ثلاثين ثانية", "in thirty seconds")} />
          <Reveal>
            <p className="v2-body max-w-md">
              {L("لقطات حقيقية صُوّرت في الغدير: من لافتة المدخل حتى آخر شعلة في السهرة.", "Real footage shot at ALGHDEER: from the sign at the gate to the last flame of the night.")}
            </p>
          </Reveal>
        </div>
      </div>
      {reduce ? (
        <div className="v2-wrap py-12">
          <div className="v2-photo v2-photo-round aspect-video">
            <Video name="reel" label={L("فيلم قصير عن مخيم الغدير", "A short film of ALGHDEER camp")} />
          </div>
        </div>
      ) : (
        <div ref={ref} className="relative h-[230vh]">
          <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
            <motion.div className="v2-cinema" style={{ scale }}>
              <motion.div className="v2-par inset-0" style={{ scale: inner }}>
                <Video name="reel" label={L("فيلم قصير عن مخيم الغدير", "A short film of ALGHDEER camp")} />
              </motion.div>
              <span className="v2-film-grain" aria-hidden />
            </motion.div>
          </div>
        </div>
      )}
    </section>
  );
}
