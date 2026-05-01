"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

export default function Testimonials() {
  const { lang } = useLanguage();

  const testimonials = [
    {
      quote: lang === "ar"
        ? "تجربة لا تُنسى، أعادت لنا الارتباط بالتراث بطريقة عصرية وراقية. خدمة استثنائية من الألف إلى الياء."
        : "An unforgettable experience that reconnected us with heritage in a modern, refined way. Exceptional service from start to finish.",
      name: lang === "ar" ? "أحمد الفيصل" : "Ahmed Al-Faisal",
      role: lang === "ar" ? "الرئيس التنفيذي، مجموعة الخليج" : "CEO, Gulf Group",
    },
    {
      quote: lang === "ar"
        ? "أفضل تجربة فريق عمل قمنا بها على الإطلاق. المكان ساحر والتنظيم احترافي بكل المقاييس."
        : "The best team-building experience we have ever had. The place is enchanting and the organization is professional in every way.",
      name: lang === "ar" ? "سارة العتيبي" : "Sarah Al-Otaibi",
      role: lang === "ar" ? "مديرة الموارد البشرية" : "HR Director",
    },
    {
      quote: lang === "ar"
        ? "مخيم الغدير حقق لنا كل ما كنا نطمح إليه من خصوصية وفخامة وأصالة عربية."
        : "Alghdeer Camp delivered everything we aspired for: privacy, luxury, and authentic Arabian hospitality.",
      name: lang === "ar" ? "محمد القحطاني" : "Mohammed Al-Qahtani",
      role: lang === "ar" ? "رجل أعمال" : "Entrepreneur",
    },
  ];

  return (
    <section className="py-20 sm:py-32 bg-white text-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-12 sm:mb-20"
        >
          <p className="text-xs tracking-[0.4em] uppercase text-black/30 mb-3 sm:mb-4">
            {lang === "ar" ? "آراء عملائنا" : "TESTIMONIALS"}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black">
            {lang === "ar" ? "يقولون عنّا" : "What They Say"}
          </h2>
        </motion.div>

        <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-2">
          {testimonials.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="p-5 sm:p-8 border border-black/10 hover:border-black/30 transition-colors duration-500 min-w-[88%] sm:min-w-[58%] md:min-w-0 snap-start"
            >
              <p className="text-4xl sm:text-6xl font-black text-black/10 leading-none mb-3 sm:mb-4">&ldquo;</p>
              <p className="text-sm sm:text-lg text-black/70 leading-relaxed mb-6 sm:mb-8">{item.quote}</p>
              <div className="border-t border-black/10 pt-4 sm:pt-6">
                <p className="font-bold text-sm sm:text-base">{item.name}</p>
                <p className="text-xs sm:text-sm text-black/50">{item.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
