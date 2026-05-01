"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Services() {
  const { lang } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const titleScaleX = useTransform(scrollYProgress, [0, 1], [0.85, 1.08]);

  const services = [
    {
      title: lang === "ar" ? "تنظيم الفعاليات" : "Event Planning",
      desc: lang === "ar" ? "فريق متخصص في تنظيم وإدارة الفعاليات الخاصة بكل تفاصيلها" : "A dedicated team for organizing and managing private events down to every detail",
    },
    {
      title: lang === "ar" ? "الضيافة العربية" : "Arabian Hospitality",
      desc: lang === "ar" ? "قهوة عربية أصيلة، تمور فاخرة، وأطباق تقليدية مُعدّة بعناية" : "Authentic Arabic coffee, premium dates, and carefully prepared traditional dishes",
    },
    {
      title: lang === "ar" ? "التصوير الاحترافي" : "Pro Photography",
      desc: lang === "ar" ? "توثيق احترافي لكل لحظة من تجربتكم بأعلى جودة" : "Professional documentation of every moment of your experience",
    },
    {
      title: lang === "ar" ? "الترفيه والأنشطة" : "Entertainment",
      desc: lang === "ar" ? "أنشطة صحراوية، رصد النجوم، موسيقى تراثية حية" : "Desert activities, stargazing, live traditional music",
    },
  ];

  return (
    <section ref={ref} className="py-20 sm:py-32 md:py-40 bg-white text-black overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="text-center mb-12 sm:mb-20">
          <p className="text-xs tracking-[0.4em] uppercase text-black/30 mb-3 sm:mb-4">{lang === "ar" ? "خدماتنا" : "OUR SERVICES"}</p>
          <motion.h2
            style={{ scaleX: titleScaleX, transformOrigin: "center center" }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black"
          >
            {lang === "ar" ? "نصنع لكم التجربة" : "We Craft Your Experience"}
          </motion.h2>
        </div>

        <div className="flex sm:grid sm:grid-cols-2 gap-px bg-black/5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-2">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="p-6 sm:p-10 md:p-14 bg-white group hover:bg-black hover:text-white transition-all duration-700 cursor-pointer min-w-[85%] sm:min-w-0 snap-start"
            >
              <span className="text-4xl sm:text-5xl font-black text-black/5 group-hover:text-white/10 transition-colors block mb-3 sm:mb-4">0{i + 1}</span>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{s.title}</h3>
              <p className="text-sm sm:text-base text-black/50 group-hover:text-white/50 transition-colors leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
