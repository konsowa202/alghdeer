"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Heading, Reveal, useL, useMedia, Video } from "./kit";

/* Fixed spark positions (percent of the section) so server and client markup match. */
const SPARKS = [
  [6, 14, 0], [14, 62, 1.2], [22, 30, 2.1], [31, 8, 0.6], [38, 78, 1.8], [47, 20, 2.6],
  [55, 70, 0.3], [63, 12, 1.5], [71, 48, 2.3], [79, 24, 0.9], [86, 66, 1.9], [93, 10, 2.8],
  [10, 88, 1.1], [90, 86, 0.4],
];

/** Highlight showcase: fireworks over the lit camp in an arch window, flanked symmetrically by the crowd and the sky. */
export default function Finale() {
  const { L } = useL();
  const reduce = useReducedMotion();
  const wide = useMedia("(min-width: 1024px)");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const archScale = useTransform(scrollYProgress, [0.05, 0.45], [0.94, 1]);
  const archY = useTransform(scrollYProgress, [0, 1], [18, -18]);
  const sideY = useTransform(scrollYProgress, [0, 1], [32, -32]);
  const glow = useTransform(scrollYProgress, [0.15, 0.5], [0.35, 1]);

  return (
    <section ref={ref} className="v2-night v2-finale relative overflow-hidden" aria-label={L("ليالي الغدير", "Nights at ALGHDEER")}>
      <div className="v2-sparks" aria-hidden>
        {SPARKS.map(([x, y, d], i) => (
          <span key={i} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }}>✦</span>
        ))}
      </div>

      <div className="v2-wrap v2-section relative">
        <div className="mx-auto max-w-3xl text-center">
          <Heading tone="paper" kicker={L("ليالي الغدير", "NIGHTS AT ALGHDEER")} a={L("في ليالي الغدير", "When night falls,")} b={L("تتكلّم السماء", "the sky takes over")} size="xl" />
          <Reveal>
            <p className="v2-body v2-body-paper mx-auto mt-5 max-w-xl">
              {L(
                "ألعاب نارية فوق المخيم المضاء، واحتفالات الضيوف تحت سماء مفتوحة — لقطات حقيقية من سهرات الغدير.",
                "Fireworks over the lit camp while guests celebrate under the open sky — real moments from ALGHDEER nights.",
              )}
            </p>
          </Reveal>
        </div>

        <div className="v2-finale-grid mt-10 lg:mt-14">
          <motion.figure className="v2-finale-side" style={reduce || !wide ? undefined : { y: sideY }}>
            <div className="v2-photo v2-photo-round aspect-[3/4]">
              <Video name="fireworks-2" label={L("ألعاب نارية فوق الخيام", "Fireworks above the tents")} />
            </div>
            <figcaption className="v2-cap v2-cap-paper text-center">{L("السماء فوق الخيام", "The sky above the tents")}</figcaption>
          </motion.figure>

          <motion.figure className="v2-finale-main" style={reduce ? undefined : wide ? { scale: archScale, y: archY } : { scale: archScale }}>
            <motion.span className="v2-arch-glow" aria-hidden style={reduce ? undefined : { opacity: glow }} />
            <div className="v2-arch">
              <Video name="fireworks" label={L("ألعاب نارية فوق مخيم الغدير المضاء", "Fireworks over the lit ALGHDEER camp")} />
              <span className="v2-film-grain" aria-hidden />
            </div>
            <figcaption className="v2-cap v2-cap-paper text-center">{L("فوق المخيم المضاء", "Over the lit camp")}</figcaption>
          </motion.figure>

          <motion.figure className="v2-finale-side" style={reduce || !wide ? undefined : { y: sideY }}>
            <div className="v2-photo v2-photo-round aspect-[3/4]">
              <Video name="crowd" label={L("الضيوف يحتفلون في ساحة المخيم", "Guests celebrating in the camp yard")} />
            </div>
            <figcaption className="v2-cap v2-cap-paper text-center">{L("الضيوف في الساحة", "Guests in the yard")}</figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
