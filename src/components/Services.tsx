"use client";

import React, { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function Services() {
  const { lang } = useLanguage();
  const prefersNarrowTitles = useMediaQuery("(max-width: 767px)");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const titleScaleX = useTransform(scrollYProgress, [0, 1], [0.85, 1.08]);
  const isAr = lang === "ar";

  const services = [
    {
      id: "01",
      title: isAr ? "تنظيم الفعاليات" : "Event Planning",
      desc: isAr
        ? "فريق متخصص في تنظيم وإدارة الفعاليات الخاصة بكل تفاصيلها"
        : "A dedicated team for organizing and managing private events down to every detail",
      image: "/corporate.png",
    },
    {
      id: "02",
      title: isAr ? "الضيافة العربية" : "Arabian Hospitality",
      desc: isAr
        ? "قهوة عربية أصيلة، تمور فاخرة، وأطباق تقليدية مُعدّة بعناية"
        : "Authentic Arabic coffee, premium dates, and carefully prepared traditional dishes",
      image: "/coffee.png",
    },
    {
      id: "03",
      title: isAr ? "التصوير الاحترافي" : "Pro Photography",
      desc: isAr ? "توثيق احترافي لكل لحظة من تجربتكم بأعلى جودة" : "Professional documentation of every moment of your experience",
      image: "/vip.png",
    },
    {
      id: "04",
      title: isAr ? "الترفيه والأنشطة" : "Entertainment",
      desc: isAr ? "أنشطة صحراوية، رصد النجوم، موسيقى تراثية حية" : "Desert activities, stargazing, live traditional music",
      image: "/campfire.png",
    },
  ];

  return (
    <section ref={ref} className="py-20 sm:py-32 md:py-40 bg-black text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="mb-12 sm:mb-20 border-b border-white/10 pb-8 sm:pb-10">
          <p className="text-xs tracking-[0.4em] uppercase text-white/30 mb-3 sm:mb-4">
            {isAr ? "خدماتنا" : "OUR SERVICES"}
          </p>
          <motion.h2
            style={
              prefersNarrowTitles
                ? undefined
                : { scaleX: titleScaleX, transformOrigin: isAr ? "right center" : "left center" }
            }
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black"
          >
            {isAr ? "نصنع لكم التجربة" : "We Craft Your Experience"}
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[minmax(140px,1fr)] sm:auto-rows-[minmax(165px,1fr)] md:auto-rows-[minmax(230px,1fr)] gap-1.5 sm:gap-2">
          {services.map((s, i) => {
            const placement =
              i === 0
                ? "col-span-2 row-span-2 md:col-span-2 md:row-span-2 min-h-[220px] sm:min-h-[280px]"
                : i === 1
                  ? "col-span-1 md:col-start-3 md:row-start-1"
                  : i === 2
                    ? "col-span-1 md:col-start-3 md:row-start-2 md:row-span-2"
                    : "col-span-2 md:col-span-2 md:col-start-1 md:row-start-3";
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className={`group cursor-pointer overflow-hidden relative border border-white/10 ${placement}`}
              >
                <img
                  src={s.image}
                  alt={s.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[1.5s] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-transparent" />
                <div className="absolute bottom-0 right-0 left-0 p-3 sm:p-5 md:p-6">
                  <span className="text-white/12 text-3xl sm:text-5xl md:text-6xl font-black block mb-1 sm:mb-2">{s.id}</span>
                  <h3 className="text-sm sm:text-lg md:text-xl font-bold tracking-wider">{s.title}</h3>
                  <p className="text-white/45 text-[11px] sm:text-sm mt-1 sm:mt-2 leading-relaxed line-clamp-3">{s.desc}</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px w-0 bg-white group-hover:w-full transition-all duration-700" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
