"use client";

import React from "react";
import { MotionConfig } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Hero, Manifesto, Nav, Ticker } from "./Top";
import Cinema from "./Cinema";
import Finale from "./Finale";
import Evening from "./Evening";
import { MapExplorer, NumbersBand } from "./Camp";
import Adventures from "./Adventures";
import { Occasions, Prints } from "./Life";
import { Booking, Clients, Foot } from "./Bottom";
import { V2_CSS } from "./styles";

export default function V2Landing() {
  const { lang } = useLanguage();
  return (
    <MotionConfig reducedMotion="user">
      <style dangerouslySetInnerHTML={{ __html: V2_CSS }} />
      <div className="v2" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
        <Nav />
        <main>
          <Hero />
          <Manifesto />
          <Ticker />
          <Evening />
          <Cinema />
          <Adventures />
          <MapExplorer />
          <NumbersBand />
          <Prints />
          <Occasions />
          <Clients />
          <Finale />
          <Booking />
        </main>
        <Foot />
      </div>
    </MotionConfig>
  );
}
