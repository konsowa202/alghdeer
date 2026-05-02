"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Instagram } from "lucide-react";
import Image from "next/image";
import ContactBookingForm from "@/components/ContactBookingForm";

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

            <ContactBookingForm />
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
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <a href="/dashboard/login" className="hover:text-white/50 transition-colors">
              {lang === "ar" ? "دخول الموظفين" : "Staff login"}
            </a>
            <p>{lang === "ar" ? "جميع الحقوق محفوظة" : "ALL RIGHTS RESERVED"}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
