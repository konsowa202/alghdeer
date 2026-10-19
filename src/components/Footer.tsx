"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { Phone, MapPin, Instagram, MessageCircle } from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import ContactBookingForm from "@/components/ContactBookingForm";

export default function Footer() {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <footer id="contact" className="bg-[#0B0C10] pt-20 sm:pt-28 pb-10 border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        {/* Ticket Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10 sm:mb-12"
        >
          <p className="text-xs tracking-[0.35em] uppercase text-[#cba135] mb-3">
            {isAr ? "تذكرة الدخول والحجز" : "VIP EVENT TICKET"}
          </p>
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-[1.2]">
            {t("contactTitle")}
          </h2>
        </motion.div>

        {/* Full-Width Centered Perforated Ticket Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto mb-16 sm:mb-20"
        >
          <ContactBookingForm />
        </motion.div>

        {/* Clean Bottom Brand & Contact Strip */}
        <div className="border-t border-white/10 pt-10 pb-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div>
            <img
              src="/logo-dark-bg.png"
              alt="ALGHDEER camp"
              className="h-7 sm:h-9 w-auto object-contain mb-3"
            />
            <p className="text-white/45 text-xs sm:text-sm leading-relaxed max-w-sm">
              {t("heroSub")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 md:justify-center">
            <a
              href="tel:+966544493991"
              className="flex items-center gap-2.5 text-white/75 hover:text-[#cba135] transition-colors text-sm font-bold"
            >
              <Phone size={16} className="text-[#cba135]" />
              <span dir="ltr">054 449 3991</span>
            </a>
            <a
              href="tel:+966594322226"
              className="flex items-center gap-2.5 text-white/75 hover:text-[#cba135] transition-colors text-sm font-bold"
            >
              <Phone size={16} className="text-[#cba135]" />
              <span dir="ltr">059 432 2226</span>
            </a>
            <div className="flex items-center gap-2 text-white/60 text-xs sm:text-sm">
              <MapPin size={16} className="text-[#cba135]" />
              <span>{isAr ? "جدة — طريق بريمان" : "Jeddah — Burayman"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:justify-end">
            <a
              href="https://www.instagram.com/alghdeer_sa"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-white/15 flex items-center justify-center text-white/60 hover:text-black hover:bg-[#cba135] hover:border-[#cba135] transition-all"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
            <a
              href="https://www.tiktok.com/@alghdeer_sa"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-white/15 flex items-center justify-center text-white/60 hover:text-black hover:bg-[#cba135] hover:border-[#cba135] transition-all"
              aria-label="TikTok"
            >
              <TikTokIcon size={16} />
            </a>
            <a
              href="https://wa.me/966544493991"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 h-10 border border-[#cba135]/40 flex items-center gap-2 text-[#cba135] hover:text-black hover:bg-[#cba135] text-xs font-bold tracking-wider uppercase transition-all"
            >
              <MessageCircle size={14} />
              <span>{isAr ? "واتساب" : "WhatsApp"}</span>
            </a>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-white/30 text-[10px] sm:text-xs tracking-widest gap-3">
          <p>
            &copy; {new Date().getFullYear()} {isAr ? "مخيمات الغدير" : "ALGHDEER CAMP"}
          </p>
          <div className="flex items-center gap-6">
            <a href="/dashboard/login" className="hover:text-white/50 transition-colors">
              {isAr ? "دخول الموظفين" : "Staff login"}
            </a>
            <p>{isAr ? "جميع الحقوق محفوظة" : "ALL RIGHTS RESERVED"}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
