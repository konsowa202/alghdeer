"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Instagram } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer id="contact" className="bg-[#0B0C10] pt-20 sm:pt-32 pb-8 sm:pb-12 border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-20 mb-16 sm:mb-20">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs tracking-[0.4em] uppercase text-white/30 mb-3 sm:mb-4">
              {lang === "ar" ? "تواصل معنا" : "GET IN TOUCH"}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-8 sm:mb-10">{t("contactTitle")}</h2>

            <form className="space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div>
                  <label className="block text-white/40 text-xs tracking-widest uppercase mb-2 sm:mb-3">{t("nameLabel")}</label>
                  <input type="text" className="w-full bg-transparent border-b border-white/10 pb-3 text-white text-sm focus:outline-none focus:border-white/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-white/40 text-xs tracking-widest uppercase mb-2 sm:mb-3">{t("companyLabel")}</label>
                  <input type="text" className="w-full bg-transparent border-b border-white/10 pb-3 text-white text-sm focus:outline-none focus:border-white/50 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div>
                  <label className="block text-white/40 text-xs tracking-widest uppercase mb-2 sm:mb-3">{t("groupSizeLabel")}</label>
                  <input type="number" className="w-full bg-transparent border-b border-white/10 pb-3 text-white text-sm focus:outline-none focus:border-white/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-white/40 text-[10px] sm:text-xs tracking-widest uppercase mb-2 sm:mb-3">{t("dateLabel")}</label>
                  <input type="date" className="w-full bg-transparent border-b border-white/10 pb-3 text-white text-sm focus:outline-none focus:border-white/50 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-white/40 text-[10px] sm:text-xs tracking-widest uppercase mb-2 sm:mb-3">{t("requestsLabel")}</label>
                <textarea rows={3} className="w-full bg-transparent border-b border-white/10 pb-3 text-white text-sm focus:outline-none focus:border-white/50 transition-colors resize-none" />
              </div>
              <button type="button" className="mt-4 px-8 sm:px-10 py-3.5 sm:py-4 bg-white text-black font-bold tracking-widest uppercase hover:bg-white/90 transition-all text-xs sm:text-sm w-full sm:w-auto">
                {t("submitBtn")}
              </button>
            </form>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border border-white/20">
                  <Image src="/logo.jpg" alt="الغدير" fill className="object-cover" />
                </div>
                <span className="text-xl sm:text-2xl font-black text-white">
                  {lang === "ar" ? "الغدير" : "ALGHDEER"}
                </span>
              </div>

              <p className="text-white/40 text-sm sm:text-base leading-relaxed max-w-md mb-8 sm:mb-12">{t("heroSub")}</p>

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 sm:gap-4 text-white/60 hover:text-white transition-colors group">
                  <Phone size={18} className="text-white/30 group-hover:text-white transition-colors shrink-0" />
                  <span dir="ltr" className="text-sm">+966 50 123 4567</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 text-white/60 hover:text-white transition-colors group">
                  <Mail size={18} className="text-white/30 group-hover:text-white transition-colors shrink-0" />
                  <span className="text-sm">info@alghdeercamp.com</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 text-white/60 hover:text-white transition-colors group">
                  <MapPin size={18} className="text-white/30 group-hover:text-white transition-colors shrink-0" />
                  <span className="text-sm">{lang === "ar" ? "جدة، المملكة العربية السعودية" : "Jeddah, Saudi Arabia"}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8 sm:mt-12">
              <a href="https://www.instagram.com/alghdeer_sa" target="_blank" rel="noopener noreferrer" className="w-11 h-11 sm:w-12 sm:h-12 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all">
                <Instagram size={18} />
              </a>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-white/5 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-white/30 text-[10px] sm:text-xs tracking-widest gap-3">
          <p>&copy; {new Date().getFullYear()} {lang === "ar" ? "مخيمات الغدير" : "ALGHDEER CAMPS"}</p>
          <p>{lang === "ar" ? "جميع الحقوق محفوظة" : "ALL RIGHTS RESERVED"}</p>
        </div>
      </div>
    </footer>
  );
}
