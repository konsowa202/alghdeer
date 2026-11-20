"use client";

import React from "react";
import Image from "next/image";
import { Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import ClientsMarquee from "@/components/ClientsMarquee";
import ContactBookingForm from "@/components/ContactBookingForm";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { trackContactClick } from "@/lib/analytics";
import { Band, Heading, Reveal, useL } from "./kit";
import { WA } from "./Top";

export function Clients() {
  return (
    <div className="v2-clients">
      <ClientsMarquee />
    </div>
  );
}

export function Booking() {
  const { L } = useL();
  return (
    <section id="book" className="v2-night v2-book relative">
      <Band className="absolute inset-x-0 top-0 opacity-90" />
      <div className="v2-wrap v2-section">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <Heading
            tone="paper"
            kicker={L("احجز مناسبتك", "BOOK YOUR EVENT")}
            a={L("ليلتكم القادمة", "Your next night")}
            b={L("تبدأ من هنا", "starts here")}
          />
          <Reveal>
            <p className="v2-body v2-body-paper mx-auto mt-5 max-w-xl">
              {L(
                "عبّوا التذكرة ويتواصل معكم فريق الغدير لتأكيد التفاصيل، أو كلمونا مباشرة على واتساب.",
                "Fill in the ticket and the ALGHDEER team will reach out to confirm the details, or message us directly on WhatsApp.",
              )}
            </p>
          </Reveal>
        </div>
        <Reveal className="mx-auto max-w-5xl">
          <ContactBookingForm />
        </Reveal>
      </div>
    </section>
  );
}

export function Foot() {
  const { L, ar } = useL();
  const year = new Date().getFullYear();
  return (
    <footer className="v2-paper relative pt-16">
      <Band className="absolute inset-x-0 top-0" />
      <div className="v2-wrap grid gap-10 pb-10 pt-8 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Image src="/logo-black.png" alt="ALGHDEER camp" width={220} height={36} className="h-9 w-auto" />
          <p className="v2-body mt-4 max-w-sm">
            {L("مخيم متكامل في قلب صحراء جدة، يجمع الضيافة السعودية الأصيلة بالعروض الحية ومغامرات الصحراء.", "A complete camp in the heart of the Jeddah desert, bringing together Saudi hospitality, live shows and desert adventures.")}
          </p>
        </div>
        <div>
          <p className="v2-foot-h">{L("تواصل", "Contact")}</p>
          <ul className="mt-4 space-y-3">
            {[
              ["+966544493991", "0544493991"],
              ["+966594322226", "0594322226"],
            ].map(([tel, label]) => (
              <li key={tel}>
                <a href={`tel:${tel}`} onClick={() => trackContactClick("phone")} className="v2-foot-link">
                  <Phone size={16} /> <span dir="ltr">{label}</span>
                </a>
              </li>
            ))}
            <li>
              <a href={WA} target="_blank" rel="noopener noreferrer" onClick={() => trackContactClick("whatsapp")} className="v2-foot-link">
                <MessageCircle size={16} /> {L("واتساب", "WhatsApp")}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="v2-foot-h">{L("الموقع", "Location")}</p>
          <p className="v2-foot-link mt-4"><MapPin size={16} /> {L("جدة — طريق بريمان", "Jeddah — Briman Road")}</p>
          <div className="mt-5 flex gap-3">
            <a href="https://www.instagram.com/alghdeer_sa" target="_blank" rel="noopener noreferrer" className="v2-icon-btn" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="https://www.tiktok.com/@alghdeer_sa" target="_blank" rel="noopener noreferrer" className="v2-icon-btn" aria-label="TikTok"><TikTokIcon size={18} /></a>
          </div>
        </div>
      </div>
      <div className="v2-wrap flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(140,106,28,.25)] py-6 pb-16">
        <p className="v2-small">© {ar ? new Intl.NumberFormat("ar-SA-u-nu-arab", { useGrouping: false }).format(year) : year} ALGHDEER camp</p>
        <a href="/dashboard/login" className="v2-small opacity-50 hover:opacity-100">{L("دخول الفريق", "Staff")}</a>
      </div>
      <Band className="absolute inset-x-0 bottom-0" />
    </footer>
  );
}
