"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t("home"), href: "#home" },
    { name: t("events"), href: "#events" },
    { name: t("concept"), href: "#concept" },
    { name: t("experiences"), href: "#experiences" },
    { name: t("facilities"), href: "#facilities" },
    { name: t("gallery"), href: "#gallery" },
    { name: t("contact"), href: "#contact" },
  ];

  return (
    <nav
      className={`fixed inset-x-0 w-full max-w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-black/90 backdrop-blur-xl border-b border-white/5 py-3 sm:py-4"
          : "bg-transparent py-4 sm:py-6"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="flex items-center justify-between">
          {/* Logo - using YOUR logo.jpg */}
          <a href="#home" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-[#cba135]/50 group-hover:border-[#d4b458] transition-colors">
              <Image src="/logo.jpg" alt="الغدير" fill className="object-cover" />
            </div>
            <span className="text-lg sm:text-xl md:text-xl font-black text-white leading-none pt-0.5">
              {lang === "ar" ? "الغدير" : "ALGHDEER"}
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center gap-6 2xl:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-white/50 hover:text-white transition-colors text-xs tracking-[0.15em] uppercase relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 right-0 rtl:right-0 ltr:left-0 w-0 h-px bg-white group-hover:w-full transition-all duration-500" />
              </a>
            ))}
          </div>

          {/* Right Controls */}
          <div className="hidden xl:flex items-center gap-4">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="text-white/50 hover:text-white transition-colors text-xs tracking-[0.15em] border border-white/10 px-3 py-1.5 hover:border-white/30"
            >
              {lang === "en" ? "عربي" : "EN"}
            </button>
            <a
              href="#contact"
              className="px-5 py-2.5 bg-[#cba135] text-black text-xs font-bold tracking-[0.15em] uppercase hover:bg-[#d4b458] transition-all"
            >
              {t("bookBtn")}
            </a>
          </div>

          {/* Mobile controls */}
          <div className="xl:hidden flex items-center gap-3">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="text-white/50 text-xs border border-white/10 px-2 py-1"
            >
              {lang === "en" ? "ع" : "EN"}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-1">
              <div className="w-6 flex flex-col gap-1.5">
                <motion.div animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 7 : 0 }} className="w-full h-px bg-white" />
                <motion.div animate={{ opacity: isOpen ? 0 : 1 }} className="w-full h-px bg-white" />
                <motion.div animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -7 : 0 }} className="w-full h-px bg-white" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden overflow-hidden bg-black fixed inset-0 top-[56px] z-40"
          >
            <div className="flex flex-col px-6 py-10 gap-6">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  initial={{ opacity: 0, x: lang === "ar" ? 30 : -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-white/70 hover:text-white text-2xl font-bold tracking-wider uppercase"
                >
                  {link.name}
                </motion.a>
              ))}
              <a
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="mt-6 py-4 bg-white text-black text-center font-bold tracking-widest uppercase text-sm"
              >
                {t("bookBtn")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
