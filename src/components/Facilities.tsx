"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { Coffee, Tent, Flame, Bath, MonitorPlay } from "lucide-react";

export default function Facilities() {
  const { t, lang } = useLanguage();

  const facilities = [
    { name: "fac1", icon: <Coffee size={24} /> },
    { name: "fac2", icon: <Tent size={24} /> },
    { name: "fac3", icon: <Flame size={24} /> },
    { name: "fac4", icon: <Bath size={24} /> },
    { name: "fac5", icon: <MonitorPlay size={24} /> },
  ];

  return (
    <section id="facilities" className="py-20 sm:py-32 bg-gradient-to-b from-[#0b0c10] to-black text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-[10px] sm:text-xs tracking-[0.35em] uppercase text-[#cba135]/70 mb-3">
            {lang === "ar" ? "تجهيزات المخيم" : "CAMP AMENITIES"}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 sm:mb-6">{t("facTitle")}</h2>
          <div className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-[#cba135] to-transparent mx-auto" />
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-8 md:gap-10">
          {facilities.map((fac, i) => (
            <motion.div
              key={fac.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`flex flex-col items-center text-center relative overflow-hidden min-h-0 border border-white/10 bg-white/[0.02] hover:border-[#cba135]/55 hover:bg-white/[0.04] px-4 py-6 sm:px-6 sm:py-8 transition-all duration-500 group ${
                i === 4 ? "col-span-2 xl:col-span-2 xl:col-start-2" : ""
              }`}
            >
              <div className="mb-4 sm:mb-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-[#cba135]/40 flex items-center justify-center text-[#cba135] group-hover:bg-[#cba135] group-hover:text-black transition-all duration-500">
                {fac.icon}
              </div>
              <h3 className="text-[11px] sm:text-sm font-semibold tracking-wider sm:tracking-[0.12em] uppercase text-white/90">{t(fac.name)}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
