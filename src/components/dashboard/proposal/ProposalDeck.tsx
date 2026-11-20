"use client";
/* eslint-disable @next/next/no-img-element -- plain <img> keeps print/PDF export reliable */

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, SlidersHorizontal, X } from "lucide-react";
import type { InvoiceRecord } from "@/lib/invoices-types";
import {
  ADDON_GROUPS,
  CAMP_FACILITIES,
  CAMP_STATS,
  GAMES,
  HOSPITALITY,
  MAP_POINTS,
  NEXT_STEPS,
  PROPOSAL_BANK,
  PROPOSAL_CONTACT,
  type Bi,
  type Lang,
} from "@/data/proposal-content";

/* Every slide is drawn on a fixed 1920×1080 canvas and printed 1:1 (one PDF page per slide). */
const W = 1920;
const ITEMS_PER_SLIDE = 7;
const P = "/proposal";

type Settings = {
  lang: Lang;
  recipient: string;
  title: string;
  welcome: string;
  validDays: number;
  showPerPerson: boolean;
  showItemPrices: boolean;
  camp: boolean;
  adventures: boolean;
  shows: boolean;
  games: boolean;
  hospitality: boolean;
  addons: boolean;
  payment: boolean;
};

const DEFAULT_TITLE: Bi = { ar: "ليلةٌ تليق|بضيوفكم", en: "A night worthy|of your guests" };
const DEFAULT_WELCOME: Bi = {
  ar: "في قلب صحراء جدة على طريق بريمان، نستضيف مناسبتكم بمخيم متكامل يجمع الضيافة السعودية الأصيلة بالعروض الحية ومغامرات الصحراء. صممنا هذا العرض خصيصًا لكم، ويسعد فريقنا بتفصيله على مقاس مناسبتكم.",
  en: "In the heart of the Jeddah desert on Briman Road, we host your event at a complete camp that brings together authentic Saudi hospitality, live shows and desert adventures. This proposal was prepared for you, and our team is happy to tailor it to your occasion.",
};

const chunk = <T,>(arr: T[], size: number) =>
  arr.length ? Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size)) : [[]];

export default function ProposalDeck({ invoice, initialLang }: { invoice: InvoiceRecord; initialLang?: Lang }) {
  const storageKey = `alghdeer-proposal:v3:${invoice.id}`;
  const defaults: Settings = {
    lang: initialLang ?? "ar",
    recipient: invoice.company && invoice.company !== "—" ? invoice.company : invoice.customerName || "",
    title: "",
    welcome: "",
    validDays: 14,
    showPerPerson: invoice.guestCount > 1,
    showItemPrices: false,
    camp: true,
    adventures: true,
    shows: true,
    games: true,
    hospitality: true,
    addons: true,
    payment: true,
  };

  const [s, setS] = useState<Settings>(defaults);
  const [panel, setPanel] = useState(false);
  const loaded = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setS((prev) => ({ ...prev, ...JSON.parse(raw), ...(initialLang ? { lang: initialLang } : {}) }));
    } catch {}
    loaded.current = true;
  }, [storageKey, initialLang]);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {}
  }, [s, storageKey]);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));

  const deckRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const lang = s.lang;
  const ar = lang === "ar";
  const t = (b: Bi) => b[lang];
  const L = (a: string, e: string) => (ar ? a : e);

  const nf = useMemo(
    () => new Intl.NumberFormat(ar ? "ar-SA-u-nu-arab" : "en-US", { maximumFractionDigits: 2 }),
    [ar],
  );
  const n = (v: number) => nf.format(v);
  const sar = (v: number) => (ar ? `${n(v)} ر.س` : `${n(v)} SAR`);
  const fmtDate = (d: string | Date | null, withDay = false) => {
    if (!d) return "—";
    const x = new Date(d);
    if (!Number.isFinite(x.getTime())) return "—";
    return new Intl.DateTimeFormat(ar ? "ar-SA-u-ca-gregory-nu-arab" : "en-GB", {
      ...(withDay ? { weekday: "long" as const } : {}),
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Riyadh",
    }).format(x);
  };

  const validUntil = useMemo(() => {
    const d = new Date(invoice.updatedAt);
    d.setDate(d.getDate() + Math.max(1, s.validDays || 1));
    return d;
  }, [invoice.updatedAt, s.validDays]);

  const recipient = s.recipient || L("ضيوفنا الكرام", "Our valued guests");
  const [titleA, titleB] = (s.title || t(DEFAULT_TITLE)).split("|");
  const welcome = s.welcome || t(DEFAULT_WELCOME);
  const perPerson = invoice.guestCount > 0 ? Math.round((invoice.total / invoice.guestCount) * 100) / 100 : 0;
  const itemPages = chunk(invoice.items, ITEMS_PER_SLIDE);
  const gb = invoice.guestBreakdown;
  const guestParts = gb
    ? [
        gb.adults ? `${n(gb.adults)} ${L("بالغ", "adults")}` : "",
        gb.children ? `${n(gb.children)} ${L("طفل", "children")}` : "",
        gb.extras ? `${n(gb.extras)} ${L("مرافق", "staff")}` : "",
      ].filter(Boolean).join(" · ")
    : "";
  const qty = (it: InvoiceRecord["items"][number]) => `${n(it.quantity)} ${ar ? it.unitAr : it.unitEn}`;
  const metaLine = `${invoice.guestCount > 0 ? `${n(invoice.guestCount)} ${L("ضيف", "guests")} — ` : ""}${fmtDate(invoice.eventAt)}`;

  /* ── building blocks ── */
  const band = (pos: "top" | "bot", style?: React.CSSProperties) => (
    <img src={`${P}/band.png`} alt="" className={`pp-band pp-band-${pos}`} style={style} />
  );
  const paper = (kind: "paper" | "kraft") => <img src={`${P}/${kind}.jpg`} alt="" className="pp-bg" />;
  const head = (kicker: string, a: string, b: string, size?: number) => (
    <>
      <p className="pp-kicker">{kicker}</p>
      <h2 className="pp-title" style={{ fontSize: size, marginTop: 16 }}>
        {a}
        <br />
        <span className="pp-gold">{b}</span>
      </h2>
    </>
  );
  const tile = (src: string, cap: string, h: number) => (
    <div className="pp-tile">
      <img src={`${P}/${src}.jpg`} alt="" style={{ height: h }} />
      <p className="pp-tile-cap">{cap}</p>
    </div>
  );
  const tracks = (top: number) => (
    <svg width="1920" height="200" viewBox="0 0 1920 200" className="pp-tracks" style={{ top }} aria-hidden>
      <path d="M-20 130 C 380 30, 780 180, 1160 90 S 1720 40, 1940 110" />
      <path d="M-20 164 C 380 64, 780 214, 1160 124 S 1720 74, 1940 144" />
    </svg>
  );

  type Slide = { key: string; node: (folio: string) => React.ReactNode };
  const slides: Slide[] = [];

  slides.push({
    key: "cover",
    node: () => (
      <>
        {paper("paper")}
        <img src={`${P}/cover.jpg`} alt="" className="pp-photo" style={{ insetInlineEnd: 0, top: 0, width: 1060, height: 1080 }} />
        <img src="/logo-light-bg.png" alt="ALGHDEER camp" className="pp-abs" style={{ insetInlineStart: 128, top: 110, width: 300, height: 48, objectFit: "contain", objectPosition: ar ? "right" : "left" }} />
        <div className="pp-abs" style={{ insetInlineStart: 128, top: 250, width: 652 }}>
          <p className="pp-kicker">{L("عرض استضافة خاص", "PRIVATE EVENT PROPOSAL")} — {n(new Date(invoice.updatedAt).getFullYear()).replace(/[,٬]/g, "")}</p>
          <h1 className="pp-title-xl" style={{ fontSize: ar ? 108 : 80, marginTop: 40 }}>
            {titleA}
            {titleB ? (
              <>
                <br />
                <span className="pp-gold">{titleB}</span>
              </>
            ) : null}
          </h1>
          <p className="pp-small" style={{ marginTop: 30 }}>{L("مقدَّم إلى", "Prepared for")}</p>
          <p className="pp-recipient">{recipient}</p>
        </div>
        <div className="pp-abs pp-meta" style={{ insetInlineStart: 128, top: 790, width: 652 }}>
          <div className="pp-meta-pill"><p className="pp-meta-k">{L("تاريخ المناسبة", "Event date")}</p><p className="pp-meta-v">{fmtDate(invoice.eventAt)}</p></div>
          <div className="pp-meta-pill"><p className="pp-meta-k">{L("عدد الضيوف", "Guests")}</p><p className="pp-meta-v">{n(invoice.guestCount)} {L("ضيف", "guests")}</p>{guestParts ? <p className="pp-meta-k" style={{ fontSize: 20, marginTop: 2 }}>{guestParts}</p> : null}</div>
          <div className="pp-meta-pill"><p className="pp-meta-k">{L("الموقع", "Location")}</p><p className="pp-meta-v">{L("جدة — بريمان", "Jeddah — Briman")}</p></div>
          <div className="pp-meta-pill"><p className="pp-meta-k">{L("رقم العرض", "Proposal no.")}</p><p className="pp-meta-v" dir="ltr">{invoice.invoiceNumber}</p></div>
        </div>
        {band("bot")}
      </>
    ),
  });

  slides.push({
    key: "intro",
    node: () => (
      <>
        {paper("paper")}
        {band("top")}
        <div className="pp-abs" style={{ insetInlineStart: 128, top: 110, width: 912 }}>
          <p className="pp-kicker">{L("تجربة الغدير", "THE ALGHDEER EXPERIENCE")}</p>
          <h2 className="pp-giant" style={{ fontSize: ar ? 280 : 160 }}>{L("مغامرة", "Adventure")}</h2>
        </div>
        <div className="pp-abs" style={{ insetInlineEnd: 128, top: 250, width: 700 }}>
          <div className="pp-rule" />
          <p className="pp-lead" style={{ marginTop: 24, fontSize: 36, color: "var(--ink)" }}>
            {L("على رمال بريمان تبدأ الحكاية: انطلاقة، وكثبان، ولحظات تبقى في الذاكرة.", "On the Briman sands the story begins: the take-off, the dunes, and moments that stay with you.")}
          </p>
        </div>
        <img src={`${P}/intro.jpg`} alt="" className="pp-photo" style={{ insetInlineStart: 0, top: 520, width: 1920, height: 496 }} />
        {band("bot")}
      </>
    ),
  });

  slides.push({
    key: "welcome",
    node: (f) => (
      <>
        {paper("paper")}
        <img src={`${P}/welcome.jpg`} alt="" className="pp-photo" style={{ insetInlineEnd: 0, top: 0, width: 820, height: 1080 }} />
        {band("top", { insetInlineStart: 0, width: 1100 })}
        <div className="pp-abs" style={{ insetInlineStart: 128, top: 200, width: 872 }}>
          {head(L("أهلًا بكم في الغدير", "WELCOME TO ALGHDEER"), L("حين يهدأ", "When the desert"), L("صمت الصحراء", "falls quiet"), 96)}
          <p className="pp-lead" style={{ marginTop: 40, color: "var(--ink)" }}>
            {L("«مجرد ماءٍ وسط الرمال، صار عنوانًا لليالٍ لا تُنسى تحت النجوم.»", "“Just water in the sand, now the address for unforgettable nights under the stars.”")}
          </p>
          <p className="pp-body" style={{ marginTop: 28 }}>{welcome}</p>
        </div>
        <p className="pp-folio">{f}</p>
      </>
    ),
  });

  if (s.camp) {
    slides.push({
      key: "numbers",
      node: (f) => (
        <>
          {paper("kraft")}
          <img src={`${P}/numbers.jpg`} alt="" className="pp-photo" style={{ insetInlineEnd: 0, top: 0, width: 860, height: 1080 }} />
          {band("top", { insetInlineStart: 0, width: 1060 })}
          <div className="pp-abs" style={{ insetInlineStart: 128, top: 170, width: 832 }}>
            {head(L("المخيم بالأرقام", "THE CAMP IN NUMBERS"), L("مخيمٌ واحد", "One camp,"), L("يتسع لكل مناسباتكم", "every occasion"), ar ? 84 : 76)}
          </div>
          <div className="pp-abs pp-stats" style={{ insetInlineStart: 128, top: 520, width: 832 }}>
            {CAMP_STATS.map((st) => (
              <div key={st.value}>
                <p className="pp-stat-n">{n(st.value).replace(/[,٬]/g, "")}</p>
                <p className="pp-stat-l">{t(st.label)}</p>
                <p className="pp-stat-s">{t(st.note)}</p>
              </div>
            ))}
          </div>
          <p className="pp-abs pp-body" style={{ insetInlineStart: 128, top: 850, width: 832 }}>
            {L("جدة — طريق بريمان. قاعة مكيّفة بمساحة ٢٤٠ م²، وساحات مفتوحة لكل الفعاليات.", "Jeddah — Briman Road. A 240 m² air-conditioned hall and open yards for every kind of event.")}
          </p>
          <p className="pp-folio">{f}</p>
        </>
      ),
    });
    slides.push({
      key: "map",
      node: (f) => (
        <>
          {paper("paper")}
          {band("top")}
          <div className="pp-abs" style={{ insetInlineEnd: 128, top: 250, width: 1100, height: 471 }}>
            <img src={`${P}/map.jpg`} alt="" className="pp-map-img" />
            {MAP_POINTS.map((p, i) => (
              <p key={i} className="pp-pin" style={{ left: p.x, top: p.y }}>{n(i + 1)}</p>
            ))}
          </div>
          <div className="pp-abs" style={{ insetInlineStart: 128, top: 150, width: 492 }}>
            {head(L("خريطة المخيم", "CAMP MAP"), L("كل شيء", "Everything"), L("في مكانه", "in its place"), 80)}
          </div>
          <div className="pp-abs" style={{ insetInlineStart: 128, top: 430, width: 492 }}>
            {MAP_POINTS.map((p, i) => (
              <p key={i} className="pp-legend"><b>{n(i + 1)}</b>{t(p.label)}</p>
            ))}
          </div>
          <div className="pp-abs pp-chips" style={{ insetInlineStart: 128, top: 790, width: 1664 }}>
            {CAMP_FACILITIES.map((c) => <p key={c.en} className="pp-chip">{t(c)}</p>)}
          </div>
          <p className="pp-folio">{f}</p>
        </>
      ),
    });
    slides.push({
      key: "spaces",
      node: (f) => (
        <>
          {paper("kraft")}
          {band("top")}
          <div className="pp-abs" style={{ insetInlineStart: 128, top: 150, width: 462 }}>
            {head(L("مساحاتنا", "OUR SPACES"), L("لكل مناسبة", "A space for"), L("مساحتها", "every occasion"), 80)}
            <p className="pp-body" style={{ marginTop: 28 }}>
              {L("قاعة زجاجية مكيّفة لحتى ٢٥٠ ضيف تطل على الصحراء، وساحات مفتوحة تتسع لأكبر الفعاليات.", "An air-conditioned glass hall for up to 250 guests overlooking the desert, and open yards for the largest events.")}
            </p>
          </div>
          <div className="pp-abs pp-grid2" style={{ insetInlineEnd: 128, top: 150, width: 1140 }}>
            {tile("hall", L("القاعة الزجاجية — ٢٥٠ ضيف", "Glass hall — 250 guests"), 300)}
            {tile("hall-sunset", L("داخل القاعة وقت الغروب", "Inside the hall at sunset"), 300)}
            {tile("camp-dusk", L("المخيم وقت الغروب", "The camp at dusk"), 300)}
            {tile("event-aerial", L("يوم فعالية من الأعلى", "An event day from above"), 300)}
          </div>
          <p className="pp-folio">{f}</p>
        </>
      ),
    });
  }

  if (s.adventures) {
    slides.push({
      key: "divider",
      node: () => (
        <>
          {paper("kraft")}
          <img src={`${P}/divider.jpg`} alt="" className="pp-photo" style={{ insetInlineStart: 0, top: 0, width: 1920, height: 700 }} />
          <div className="pp-abs" style={{ insetInlineStart: 128, top: 740, width: 912 }}>
            <p className="pp-kicker">{L("التجارب", "EXPERIENCES")}</p>
            <h2 className="pp-title-xl" style={{ fontSize: ar ? 120 : 96, marginTop: 8 }}>
              {L("مغامرات ", "Desert ")}<span className="pp-gold">{L("الصحراء", "adventures")}</span>
            </h2>
          </div>
          <p className="pp-abs pp-lead" style={{ insetInlineEnd: 128, top: 800, width: 680 }}>
            {L("رانجر وبقي ودبابات على رمال بريمان، والغبار يكتب اسمكم خلفكم.", "Rangers, buggies and quad bikes on the Briman sands, with your trail of dust behind you.")}
          </p>
          {band("bot")}
        </>
      ),
    });
    slides.push({
      key: "adventures",
      node: (f) => (
        <>
          {paper("paper")}
          {band("top")}
          <div className="pp-abs" style={{ insetInlineStart: 128, top: 150, width: 452 }}>
            {head(L("التطعيس", "DUNE DRIVING"), L("الرمال", "The sand is"), L("ملعبكم", "your playground"), 80)}
            <p className="pp-body" style={{ marginTop: 24 }}>
              {L("منحدرات وكثبان ومسارات مفتوحة، بسيارات مجهّزة للطرق الوعرة.", "Slopes, dunes and open tracks, in vehicles built for off-road.")}
            </p>
          </div>
          <div className="pp-abs pp-card" style={{ insetInlineStart: 128, top: 620, width: 452 }}>
            <div className="pp-price-row"><p className="pp-stat-l">{L("الرانجر", "Ranger")}</p><p className="pp-price-tag">{sar(350)}</p></div>
            <p className="pp-small" style={{ marginTop: 6 }}>{L("٣ أشخاص، والشخص الإضافي ١٥٠ ر.س", "3 people, extra person 150 SAR")}</p>
            <hr className="pp-hr" />
            <div className="pp-price-row"><p className="pp-stat-l">{L("البقي", "Buggy")}</p><p className="pp-price-tag">{sar(1500)}</p></div>
            <p className="pp-small" style={{ marginTop: 6 }}>{L("للساعة", "per hour")}</p>
          </div>
          <div className="pp-abs" style={{ insetInlineEnd: 128, top: 150, width: 1160 }}>
            {tile("drift-black", L("تطعيس على المنحدرات", "Climbing the slopes"), 440)}
            <div className="pp-grid2" style={{ marginTop: 22 }}>
              {tile("inside-jeep", L("من داخل الجيب", "From inside the Jeep"), 220)}
              {tile("rubicon", L("روبيكون جاهز للانطلاق", "Rubicon ready to roll"), 220)}
            </div>
          </div>
          <p className="pp-folio">{f}</p>
        </>
      ),
    });
    slides.push({
      key: "pov",
      node: (f) => (
        <>
          {paper("kraft")}
          <img src={`${P}/pov.jpg`} alt="" className="pp-photo" style={{ insetInlineEnd: 0, top: 0, width: 1100, height: 1080 }} />
          {band("top", { insetInlineStart: 0, width: 820 })}
          <div className="pp-abs" style={{ insetInlineStart: 128, top: 260, width: 612 }}>
            {head(L("من خلف المقود", "BEHIND THE WHEEL"), L("اربط حزامك", "Buckle up"), L("واستعد", "and get ready"), 96)}
            <p className="pp-lead" style={{ marginTop: 36 }}>
              {L("كثبان بريمان بانتظاركم، والرانجر والبقي جاهزة. لحظات تتكلمون عنها بعد سنين.", "The Briman dunes are waiting and the rangers and buggies are ready. Moments you will talk about for years.")}
            </p>
          </div>
          <p className="pp-folio">{f}</p>
        </>
      ),
    });
    slides.push({
      key: "tracks",
      node: () => (
        <>
          {paper("paper")}
          <img src={`${P}/tracks.jpg`} alt="" className="pp-photo" style={{ insetInlineStart: 0, top: 0, width: 1920, height: 620 }} />
          <div className="pp-abs" style={{ insetInlineStart: 128, top: 690, width: 832 }}>
            <p className="pp-kicker">{L("مسارات مفتوحة", "OPEN TRACKS")}</p>
            <h2 className="pp-title" style={{ marginTop: 12 }}>{L("آثاركم ", "Your tracks ")}<span className="pp-gold">{L("على الرمل", "on the sand")}</span></h2>
          </div>
          <p className="pp-abs pp-lead" style={{ insetInlineEnd: 128, top: 720, width: 740 }}>
            {L("قوافل وتحديات بين الفرق على امتداد الصحراء، من الغروب حتى أول نجمة.", "Convoys and team challenges across the desert, from sunset to the first star.")}
          </p>
          {band("bot")}
        </>
      ),
    });
  }

  if (s.shows) {
    slides.push({
      key: "shows",
      node: (f) => (
        <>
          {paper("kraft")}
          {band("top")}
          <div className="pp-abs" style={{ insetInlineStart: 128, top: 150, width: 452 }}>
            {head(L("العروض الحية", "LIVE SHOWS"), L("ليلٌ", "Nights that"), L("لا يهدأ", "never settle"), 80)}
            <p className="pp-body" style={{ marginTop: 24 }}>
              {L("عروض نارية، إنشاد وطرب أصيل، ودي جي يشعل الساحة حتى آخر الليل.", "Fire shows, traditional inshad and music, and a DJ who keeps the yard alive all night.")}
            </p>
          </div>
          <div className="pp-abs pp-grid2" style={{ insetInlineEnd: 128, top: 150, width: 1160 }}>
            {tile("fireshow", L("العروض النارية", "Fire shows"), 300)}
            {tile("ensemble", L("فرق الإنشاد والطرب", "Inshad ensembles"), 300)}
            {tile("dj-booth", L("دي جي في الهواء الطلق", "Open-air DJ"), 300)}
            {tile("dj-hands", L("أنغام تناسب ليلتكم", "A soundtrack for your night"), 300)}
          </div>
          <p className="pp-folio">{f}</p>
        </>
      ),
    });
  }

  if (s.games) {
    slides.push({
      key: "games",
      node: (f) => (
        <>
          {paper("paper")}
          {band("top")}
          <div className="pp-abs" style={{ insetInlineStart: 128, top: 150, width: 452 }}>
            {head(L("ألعاب وتحديات", "GAMES & CHALLENGES"), L("تحدٍّ", "Challenge"), L("وضحك", "and laughter"), 80)}
            <p className="pp-body" style={{ marginTop: 24 }}>
              {L("ملعب طائرة من الغروب حتى الليل، وألعاب طاولة للجميع. فعاليات تكسر الجليد بين الفرق.", "Volleyball from sunset into the night and table games for everyone. Activities that break the ice between teams.")}
            </p>
          </div>
          <div className="pp-abs pp-chips" style={{ insetInlineStart: 128, top: ar ? 620 : 700, width: 452 }}>
            {GAMES.map((g) => <p key={g.en} className="pp-chip">{t(g)}</p>)}
          </div>
          <div className="pp-abs" style={{ insetInlineEnd: 128, top: 150, width: 1160 }}>
            {tile("volley-night", L("الطائرة تحت الأنوار", "Volleyball under the lights"), 420)}
            <div className="pp-grid2" style={{ marginTop: 22 }}>
              {tile("carrom", L("كيرم وألعاب طاولة", "Carrom and table games"), 230)}
              {tile("volley-dusk", L("مباراة وقت الغروب", "A match at sunset"), 230)}
            </div>
          </div>
          <p className="pp-folio">{f}</p>
        </>
      ),
    });
  }

  if (s.hospitality) {
    slides.push({
      key: "hospitality",
      node: (f) => (
        <>
          {paper("kraft")}
          {band("top")}
          <div className="pp-abs" style={{ insetInlineStart: 128, top: 150, width: 532 }}>
            {head(L("الضيافة", "HOSPITALITY"), L("ضيافةٌ", "Hospitality,"), L("على أصولها", "done properly"), ar ? 80 : 68)}
          </div>
          <div className="pp-abs pp-hosp" style={{ insetInlineStart: 128, top: ar ? 430 : 400, width: 532 }}>
            {HOSPITALITY.map((h) => <p key={h.en}>{t(h)}</p>)}
          </div>
          <div className="pp-abs" style={{ insetInlineEnd: 128, top: 150, width: 1060 }}>
            {tile("coffee", L("القهوة السعودية تُصب لضيوفكم", "Saudi coffee poured for your guests"), 380)}
            <div className="pp-grid3" style={{ marginTop: 22 }}>
              {tile("fruit", L("أبراج الفواكه", "Fruit towers"), 240)}
              {tile("kunafa", L("الكنافة النابلسية", "Nabulsi kunafa"), 240)}
              {tile("kebab", L("مشويات على الفحم", "Charcoal grill"), 240)}
            </div>
          </div>
          <p className="pp-folio">{f}</p>
        </>
      ),
    });
  }

  itemPages.forEach((items, page) => {
    slides.push({
      key: `package-${page}`,
      node: (f) => (
        <>
          {paper("paper")}
          {band("top")}
          <div className="pp-abs pp-pkg-head" style={{ insetInlineStart: 128, top: 140, width: 1664 }}>
            <div>
              <p className="pp-kicker">
                {L("باقتكم المقترحة", "YOUR PACKAGE")}
                {itemPages.length > 1 ? ` — ${n(page + 1)} ${L("من", "of")} ${n(itemPages.length)}` : ""}
              </p>
              <h2 className="pp-title" style={{ fontSize: ar ? 84 : 68, marginTop: 16, whiteSpace: "nowrap" }}>{L("ما تشمله ", "What your night ")}<span className="pp-gold">{L("ليلتكم", "includes")}</span></h2>
            </div>
            <p className="pp-pill"><bdi>{recipient}</bdi> — {metaLine}</p>
          </div>
          <div className="pp-abs pp-card" style={{ insetInlineStart: 128, top: 340, width: 1664, padding: "20px 40px" }}>
            {items.length === 0 ? (
              <p className="pp-body" style={{ padding: "40px 0" }}>{L("أضف بنود الباقة في عرض السعر لتظهر هنا تلقائيًا.", "Add package items to the quote and they appear here automatically.")}</p>
            ) : (
              <table className="pp-table">
                <thead>
                  <tr>
                    <th style={{ width: "8%" }}>#</th>
                    <th>{L("البند", "Item")}</th>
                    <th className="pp-end" style={{ width: "20%" }}>{L("الكمية", "Quantity")}</th>
                    {s.showItemPrices ? <th className="pp-end" style={{ width: "18%" }}>{L("القيمة", "Amount")}</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={it.id}>
                      <td className="pp-ember">{n(page * ITEMS_PER_SLIDE + i + 1).padStart(2, ar ? "٠" : "0")}</td>
                      <td>{ar ? it.descriptionAr || it.descriptionEn : it.descriptionEn || it.descriptionAr}</td>
                      <td className="pp-end">{qty(it)}</td>
                      {s.showItemPrices ? <td className="pp-end">{sar(it.quantity * it.unitPrice)}</td> : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {items.length < 5 ? tracks(820) : null}
          <p className="pp-folio">{f}</p>
        </>
      ),
    });
  });

  slides.push({
    key: "price",
    node: (f) => {
      const rows: [string, string, boolean?][] = [[L("إجمالي الباقة", "Package subtotal"), sar(invoice.subtotal)]];
      if (invoice.discount > 0) rows.push([L("الخصم", "Discount"), `− ${sar(invoice.discount)}`, true]);
      if (invoice.showCommission && invoice.commissionAmount > 0)
        rows.push([`${L("رسوم الخدمة", "Service fee")}${invoice.commissionType === "percent" ? ` (${n(invoice.commissionValue)}%)` : ""}`, sar(invoice.commissionAmount)]);
      if (invoice.taxRate > 0) rows.push([`${L("ضريبة القيمة المضافة", "VAT")} (${n(invoice.taxRate)}%)`, sar(invoice.taxAmount)]);
      return (
        <>
          {paper("kraft")}
          {band("top")}
          <div className="pp-abs" style={{ insetInlineStart: 128, top: 150, width: 912 }}>
            <p className="pp-kicker">{L("قيمة العرض", "YOUR INVESTMENT")}</p>
            <h2 className="pp-title" style={{ fontSize: ar ? 84 : 72, marginTop: 16, whiteSpace: "nowrap" }}>{L("استثمار ", "The value of ")}<span className="pp-gold">{L("ليلتكم", "your night")}</span></h2>
            <p className="pp-total">{n(invoice.total)} <span>{L("ر.س", "SAR")}</span></p>
            {s.showPerPerson && invoice.guestCount > 1 ? (
              <p className="pp-lead pp-bold" style={{ marginTop: 8, color: "var(--ink)" }}>
                {sar(perPerson)} {L("للشخص", "per guest")} — {n(invoice.guestCount)} {L("ضيف", "guests")}
              </p>
            ) : null}
          </div>
          <div className="pp-abs pp-card" style={{ insetInlineEnd: 128, top: 340, width: 660 }}>
            <p className="pp-stat-l" style={{ margin: "0 0 18px" }}>{L("التفاصيل", "Breakdown")}</p>
            {rows.map(([k, v, neg]) => (
              <div key={k} className="pp-break"><p className="pp-body">{k}</p><p className="pp-body" style={{ color: neg ? "var(--teal)" : "var(--ink)" }}>{v}</p></div>
            ))}
            <div className="pp-break pp-break-total"><p className="pp-stat-l">{L("الإجمالي النهائي", "Total")}</p><p className="pp-stat-l pp-gold">{sar(invoice.total)}</p></div>
          </div>
          <p className="pp-abs pp-small" style={{ insetInlineEnd: 128, top: 760, width: 660 }}>
            {L(`العرض ساري حتى ${fmtDate(validUntil)}.`, `Valid until ${fmtDate(validUntil)}.`)}
            {invoice.notes ? ` ${invoice.notes}` : ""}
          </p>
          {tracks(880)}
          <p className="pp-folio">{f}</p>
        </>
      );
    },
  });

  if (s.addons) {
    slides.push({
      key: "addons",
      node: (f) => (
        <>
          {paper("paper")}
          {band("top")}
          <div className="pp-abs" style={{ insetInlineStart: 128, top: 140, width: 1664 }}>
            <p className="pp-kicker">{L("إضافات اختيارية", "OPTIONAL ADD-ONS")}</p>
            <h2 className="pp-title" style={{ fontSize: 84, marginTop: 16 }}>{L("زيدوا ليلتكم ", "Add a little ")}<span className="pp-gold">{L("لمسة", "extra")}</span></h2>
          </div>
          <div className="pp-abs pp-grid3" style={{ insetInlineStart: 128, top: 360, width: 1664, gap: 28 }}>
            {ADDON_GROUPS.map((g) => (
              <div key={g.title.en} className="pp-card">
                <p className={`pp-stat-l pp-tone-${g.tone}`} style={{ margin: "0 0 14px" }}>{t(g.title)}</p>
                {g.items.map((it, i) => (
                  <div key={it.name.en} className="pp-addon" style={{ borderBottom: i < g.items.length - 1 ? undefined : "none" }}>
                    <p className="pp-small">{t(it.name)}</p>
                    <p className="pp-small" style={{ color: "var(--ink)" }}>{it.price ? t(it.price) : L("حسب الطلب", "On request")}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="pp-abs pp-small" style={{ insetInlineStart: 128, top: 880, width: 1664 }}>
            {L("أسعار الإضافات غير مشمولة في قيمة الباقة، وتُضاف عند الطلب.", "Add-ons are not included in the package value and are priced on request.")}
          </p>
          <p className="pp-folio">{f}</p>
        </>
      ),
    });
  }

  if (s.payment) {
    slides.push({
      key: "booking",
      node: (f) => (
        <>
          {paper("kraft")}
          {band("top")}
          <div className="pp-abs" style={{ insetInlineStart: 128, top: 150, width: 792 }}>
            <p className="pp-kicker">{L("تأكيد الحجز", "CONFIRMING YOUR BOOKING")}</p>
            <h2 className="pp-title" style={{ fontSize: ar ? 84 : 64, marginTop: 16, whiteSpace: "nowrap" }}>{L("ثلاث خطوات ", "Three steps ")}<span className="pp-gold">{L("وتبدأ الليلة", "to your night")}</span></h2>
          </div>
          <div className="pp-abs" style={{ insetInlineStart: 128, top: 400, width: 792 }}>
            {NEXT_STEPS.map((st, i) => (
              <div key={st.title.en} className="pp-step" style={{ borderBottom: i < NEXT_STEPS.length - 1 ? undefined : "none" }}>
                <p className="pp-step-n">{n(i + 1)}</p>
                <div>
                  <p className="pp-stat-l" style={{ margin: 0 }}>{t(st.title)}</p>
                  <p className="pp-small">{t(st.text)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="pp-abs pp-bank" style={{ insetInlineEnd: 128, top: 300, width: 760 }}>
            <p className="pp-bank-h">{L("بيانات التحويل", "Bank details")}</p>
            <p className="pp-bank-k">{L("اسم البنك", "Bank")}</p>
            <p className="pp-bank-v">{t(PROPOSAL_BANK.bank)}</p>
            <p className="pp-bank-k">{L("اسم المستفيد", "Beneficiary")}</p>
            <p className="pp-bank-v">{t(PROPOSAL_BANK.beneficiary)}</p>
            <p className="pp-bank-k">{L("رقم الحساب", "Account no.")}</p>
            <p className="pp-bank-v pp-ltr">{PROPOSAL_BANK.account}</p>
            <p className="pp-bank-k">IBAN</p>
            <p className="pp-bank-v pp-ltr" style={{ color: "#F4E3B0", whiteSpace: "nowrap", marginBottom: 0 }}>{PROPOSAL_BANK.iban}</p>
          </div>
          <p className="pp-folio">{f}</p>
        </>
      ),
    });
  }

  slides.push({
    key: "closing",
    node: () => (
      <>
        {paper("paper")}
        <div className="pp-abs pp-collage" style={{ insetInlineEnd: 0, top: 0, width: 960, height: 1036 }}>
          {["fireshow", "skewers", "volley-dusk", "dj-hands"].map((k) => <img key={k} src={`${P}/${k}.jpg`} alt="" />)}
        </div>
        <img src="/logo-light-bg.png" alt="ALGHDEER camp" className="pp-abs" style={{ insetInlineStart: 128, top: 150, width: 360, height: 56, objectFit: "contain", objectPosition: ar ? "right" : "left" }} />
        <div className="pp-abs" style={{ insetInlineStart: 128, top: 300, width: 752 }}>
          <h2 className="pp-title-xl" style={{ fontSize: ar ? 120 : 96 }}>
            {L("بانتظار", "We look forward")}<br /><span className="pp-gold">{L("استضافتكم", "to hosting you")}</span>
          </h2>
          <p className="pp-lead" style={{ marginTop: 28 }}>
            {L("فريق الغدير جاهز لأي تفاصيل، ولتفصيل العرض على مقاس مناسبتكم.", "Our team is ready for any detail, and to tailor this proposal to your occasion.")}
          </p>
        </div>
        <div className="pp-abs pp-contacts" style={{ insetInlineStart: 128, top: 770, width: 752 }}>
          {[...PROPOSAL_CONTACT.phones, PROPOSAL_CONTACT.website, PROPOSAL_CONTACT.social].map((c) => (
            <p key={c} className="pp-chip pp-bold">{c}</p>
          ))}
        </div>
        {band("bot")}
      </>
    ),
  });

  const total = slides.length;
  const folio = (i: number) => (ar ? n(i + 1).padStart(2, "٠") : String(i + 1).padStart(2, "0"));

  return (
    <div className="pp-root" dir="rtl">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="pp-toolbar">
        <Link href={`/dashboard/invoices?invoice=${invoice.id}`} className="pp-btn pp-btn-ghost">
          <ArrowRight size={16} /> عرض السعر
        </Link>
        <div className="pp-toolbar-title">
          <b>بروبوزل العميل</b>
          <span>{recipient} · {total} شريحة · 1920×1080</span>
        </div>
        <div className="pp-seg" role="group" aria-label="لغة البروبوزل">
          <button type="button" aria-pressed={ar} onClick={() => set("lang", "ar")}>عربي</button>
          <button type="button" aria-pressed={!ar} onClick={() => set("lang", "en")}>English</button>
        </div>
        <button type="button" className="pp-btn pp-btn-ghost" onClick={() => setPanel((v) => !v)}>
          <SlidersHorizontal size={16} /> تخصيص
        </button>
        <button type="button" className="pp-btn pp-btn-gold" onClick={() => window.print()}>
          <Download size={16} /> تصدير PDF
        </button>
      </div>

      {panel ? (
        <div className="pp-panel">
          <div className="pp-panel-head">
            <b>تخصيص البروبوزل</b>
            <button type="button" onClick={() => setPanel(false)} aria-label="إغلاق"><X size={16} /></button>
          </div>
          <label>مقدَّم إلى<input value={s.recipient} onChange={(e) => set("recipient", e.target.value)} /></label>
          <label>مدة صلاحية العرض (أيام)<input type="number" min={1} value={s.validDays} onChange={(e) => set("validDays", Number(e.target.value))} /></label>
          <label>عنوان الغلاف (اتركه فاضي للافتراضي، و | لسطر جديد)<input value={s.title} placeholder={t(DEFAULT_TITLE)} onChange={(e) => set("title", e.target.value)} /></label>
          <label>رسالة الترحيب (اتركها فاضية للافتراضي)<textarea rows={3} value={s.welcome} placeholder={t(DEFAULT_WELCOME)} onChange={(e) => set("welcome", e.target.value)} /></label>
          <div className="pp-checks">
            {(
              [
                ["showPerPerson", "سعر الشخص"],
                ["showItemPrices", "أسعار البنود"],
                ["camp", "المخيم والخريطة والمساحات"],
                ["adventures", "مغامرات الصحراء"],
                ["shows", "العروض الحية"],
                ["games", "الألعاب"],
                ["hospitality", "الضيافة"],
                ["addons", "الإضافات"],
                ["payment", "خطوات الحجز والبنك"],
              ] as [keyof Settings, string][]
            ).map(([k, label]) => (
              <label key={k}>
                <input type="checkbox" checked={Boolean(s[k])} onChange={(e) => set(k, e.target.checked as never)} /> {label}
              </label>
            ))}
          </div>
          <button type="button" className="pp-reset" onClick={() => setS(defaults)}>استرجاع الافتراضي</button>
        </div>
      ) : null}

      <div ref={deckRef} className="pp-deck" style={{ ["--s" as string]: scale }}>
        {slides.map((sl, i) => (
          <section key={sl.key} className="pp-frame" dir="ltr">
            <div className="pp-canvas">
              <div className="pp-slide" dir={ar ? "rtl" : "ltr"} lang={lang}>
                {sl.node(folio(i))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

const CSS = `
.pp-root{--ink:#2B2118;--ink-soft:#5C4A36;--sand:#F4EAD2;--paper-hi:#FBF5E6;--gold:#CBA135;--gold-deep:#8C6A1C;--teal:#2A7F78;--ember:#B5382A;
  --display:'ThmanyahDisplay',Georgia,serif;--sans:'ThmanyahSans',var(--font-ibm),Tahoma,sans-serif;max-width:1500px;margin:0 auto}
.pp-toolbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:10px;padding:12px 14px;margin-bottom:18px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(16,17,21,.92);backdrop-filter:blur(14px)}
.pp-toolbar-title{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.pp-toolbar-title b{color:#fff;font-size:14px}.pp-toolbar-title span{color:rgba(255,255,255,.4);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pp-btn{display:inline-flex;align-items:center;gap:7px;border-radius:11px;padding:10px 15px;font-size:12px;font-weight:700;white-space:nowrap;cursor:pointer;border:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.75);background:transparent}
.pp-btn-gold{background:#cba135;border-color:#cba135;color:#111}.pp-btn-gold:hover{background:#d8b553}.pp-btn-ghost:hover{background:rgba(255,255,255,.05)}
.pp-seg{display:inline-flex;border:1px solid rgba(255,255,255,.14);border-radius:11px;overflow:hidden}
.pp-seg button{padding:9px 14px;font-size:12px;font-weight:700;color:rgba(255,255,255,.55)}.pp-seg button[aria-pressed=true]{background:rgba(203,161,53,.18);color:#f1d17c}
.pp-panel{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px;margin-bottom:18px;padding:18px;border:1px solid rgba(203,161,53,.25);border-radius:16px;background:#101115}
.pp-panel-head{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;color:#e5c979;font-size:13px}.pp-panel-head button{color:rgba(255,255,255,.5)}
.pp-panel label{display:flex;flex-direction:column;gap:6px;color:rgba(255,255,255,.45);font-size:11px;font-weight:700}
.pp-panel input:not([type=checkbox]),.pp-panel textarea{width:100%;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.3);border-radius:10px;padding:10px 12px;color:#fff;font-size:13px;outline:none;font-family:inherit;resize:vertical}
.pp-panel input:focus,.pp-panel textarea:focus{border-color:rgba(203,161,53,.6)}
.pp-panel label:has(textarea){grid-column:1/-1}
.pp-checks{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px}.pp-checks label{flex-direction:row;align-items:center;gap:7px;padding:8px 12px;border:1px solid rgba(255,255,255,.1);border-radius:999px;color:rgba(255,255,255,.7);cursor:pointer}
.pp-checks input{accent-color:#cba135}.pp-reset{justify-self:start;color:rgba(255,255,255,.45);font-size:11px;text-decoration:underline}
@media(max-width:760px){.pp-panel{grid-template-columns:1fr}.pp-toolbar{flex-wrap:wrap}.pp-toolbar-title{order:-1;flex-basis:100%}}

.pp-deck{display:flex;flex-direction:column;gap:22px}
.pp-frame{position:relative;width:100%;height:calc(1080px * var(--s));overflow:hidden;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.45);background:var(--sand)}
.pp-canvas{position:absolute;top:0;left:0;width:1920px;height:1080px;transform:scale(var(--s));transform-origin:top left}

/* ── slide system ── */
.pp-slide{position:relative;width:1920px;height:1080px;overflow:hidden;background:var(--sand);color:var(--ink);font-family:var(--sans);-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pp-slide *{box-sizing:border-box;margin:0}
.pp-slide p,.pp-slide h1,.pp-slide h2{margin:0}
.pp-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.pp-abs{position:absolute}
.pp-photo{position:absolute;display:block;object-fit:cover}
.pp-band{position:absolute;height:44px;width:1920px;inset-inline-start:0}.pp-band-top{top:0}.pp-band-bot{top:1036px}
.pp-kicker{font-family:var(--sans);font-weight:700;font-size:28px;color:var(--ember)}
.pp-slide:lang(en) .pp-kicker{letter-spacing:3px}
.pp-title{font-family:var(--display);font-weight:900;font-size:96px;line-height:1.32;color:var(--ink)}
.pp-title-xl{font-family:var(--display);font-weight:900;font-size:132px;line-height:1.3;color:var(--ink)}
.pp-slide:lang(en) .pp-title,.pp-slide:lang(en) .pp-title-xl{line-height:1.12}
.pp-giant{font-family:var(--display);font-weight:900;line-height:1.15;color:var(--ink)}
.pp-gold{color:var(--gold-deep)}
.pp-ember{color:var(--ember)}
.pp-bold{font-weight:700}
.pp-lead{font-size:32px;line-height:1.65;color:var(--ink-soft)}
.pp-body{font-size:28px;line-height:1.6;color:var(--ink-soft)}
.pp-small{font-size:24px;line-height:1.5;color:var(--ink-soft)}
.pp-recipient{font-family:var(--display);font-weight:700;font-size:44px;color:var(--ink);margin-top:4px!important}
.pp-rule{height:4px;width:120px;background:var(--ember);border-radius:2px}
.pp-folio{position:absolute;inset-inline-start:128px;top:978px;width:500px;font-size:24px;color:var(--ink-soft)}
.pp-ltr{direction:ltr;unicode-bidi:isolate}.pp-slide:lang(ar) .pp-ltr{text-align:right}
.pp-meta{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.pp-meta-pill{background:var(--paper-hi);border:2px solid rgba(140,106,28,.3);border-radius:16px;padding:14px 24px}
.pp-meta-k{font-size:24px;color:var(--ink-soft)}.pp-meta-v{font-weight:700;font-size:30px;color:var(--ink);margin-top:4px!important;white-space:nowrap}
.pp-stats{display:grid;grid-template-columns:1fr 1fr 1fr}
.pp-stats>div{padding:0 28px;border-inline-start:2px solid rgba(140,106,28,.35)}.pp-stats>div:first-child{padding-inline-start:0;border-inline-start:0}
.pp-stat-n{font-family:var(--display);font-weight:900;font-size:120px;line-height:1.1;color:var(--teal)}
.pp-stat-l{font-weight:700;font-size:32px;color:var(--ink);margin-top:8px!important}
.pp-stat-s{font-size:24px;color:var(--ink-soft);margin-top:4px!important}
.pp-map-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:18px;box-shadow:0 16px 34px rgba(60,40,15,.2)}
.pp-pin{position:absolute;width:52px;height:52px;border-radius:26px;background:var(--ember);color:var(--paper-hi);font-weight:700;font-size:28px;line-height:44px;text-align:center;border:4px solid var(--paper-hi);box-shadow:0 6px 14px rgba(60,40,15,.35)}
.pp-legend{font-size:30px;line-height:2;color:var(--ink-soft)}.pp-legend b{color:var(--ember);display:inline-block;width:42px}
.pp-chips{display:flex;flex-wrap:wrap;gap:14px}
.pp-chip{font-size:26px;color:var(--ink);background:rgba(251,245,230,.85);border:2px solid rgba(140,106,28,.35);border-radius:999px;padding:10px 24px}
.pp-grid2{display:grid;grid-template-columns:1fr 1fr;gap:24px}.pp-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px}
.pp-tile{display:flex;flex-direction:column;gap:12px}
.pp-tile img{width:100%;display:block;object-fit:cover;border-radius:18px;box-shadow:0 16px 34px rgba(60,40,15,.18)}
.pp-tile-cap{font-weight:700;font-size:26px;color:var(--ink)}
.pp-card{background:rgba(251,245,230,.92);border:2px solid rgba(140,106,28,.25);border-radius:22px;padding:36px 40px;box-shadow:0 14px 34px rgba(60,40,15,.12)}
.pp-price-row{display:flex;justify-content:space-between;align-items:center}.pp-price-row .pp-stat-l{margin:0!important}
.pp-price-tag{font-weight:700;font-size:26px;color:var(--paper-hi);background:var(--ember);border-radius:999px;padding:8px 22px}
.pp-hr{border:none;border-top:2px solid rgba(140,106,28,.25);margin:18px 0!important}
.pp-hosp{display:grid;grid-template-columns:1fr 1fr;gap:4px 32px}
.pp-hosp p{font-size:24px;color:var(--ink);padding:10px 0;border-bottom:2px solid rgba(140,106,28,.22)}
.pp-hosp p:nth-last-child(-n+2){border-bottom:none}
.pp-pkg-head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px}
.pp-pill{font-size:24px;color:var(--ink-soft);background:var(--paper-hi);border:2px solid rgba(140,106,28,.3);border-radius:999px;padding:10px 26px;white-space:nowrap}
.pp-table{width:100%;border-collapse:collapse;font-size:30px;color:var(--ink)}
.pp-table th{font-weight:700;color:var(--gold-deep);text-align:start;padding:14px 12px}
.pp-table td{padding:13px 12px;border-top:2px solid rgba(140,106,28,.14);text-align:start}
.pp-table .pp-end{text-align:end;white-space:nowrap}
.pp-tracks{position:absolute;left:0;width:1920px;height:200px}
.pp-tracks path{fill:none;stroke:#8C6A1C;stroke-opacity:.22;stroke-width:12;stroke-dasharray:6 14}
.pp-total{font-family:var(--display);font-weight:900;font-size:200px;line-height:1.1;color:var(--teal);margin-top:36px!important;white-space:nowrap}
.pp-total span{font-size:88px;color:var(--gold-deep)}
.pp-break{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:2px solid rgba(140,106,28,.2)}
.pp-break-total{border-bottom:none;padding-top:20px}.pp-break-total .pp-stat-l{margin:0!important}
.pp-tone-teal{color:var(--teal)!important}.pp-tone-ember{color:var(--ember)!important}.pp-tone-gold{color:var(--gold-deep)!important}
.pp-addon{display:flex;justify-content:space-between;gap:16px;padding:8px 0;border-bottom:2px solid rgba(140,106,28,.18)}
.pp-step{display:flex;gap:28px;padding:22px 0;border-bottom:2px solid rgba(140,106,28,.25)}
.pp-step-n{font-family:var(--display);font-weight:900;font-size:72px;line-height:1;width:90px;color:var(--ember)}
.pp-bank{background:var(--teal);border-radius:26px;padding:44px 48px;box-shadow:0 18px 40px rgba(20,60,56,.28);color:var(--paper-hi)}
.pp-bank-h{font-weight:700;font-size:28px;color:#F4E3B0;margin-bottom:20px!important}
.pp-bank-k{font-size:24px;color:#CDE6E2}
.pp-bank-v{font-weight:700;font-size:32px;color:var(--paper-hi);margin:4px 0 20px!important}
.pp-collage{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:10px}
.pp-collage img{width:100%;height:100%;object-fit:cover;display:block}
.pp-contacts{display:grid;grid-template-columns:1fr 1fr;gap:14px}.pp-contacts .pp-chip{text-align:center;direction:ltr;unicode-bidi:isolate}

/* ── print: one slide per 1920×1080 page, no dashboard chrome ── */
@page{size:1920px 1080px;margin:0}
@media print{
  html,body{background:#F4EAD2!important;margin:0!important;padding:0!important}
  .pp-root,.pp-root *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  aside,header,nav,.pp-toolbar,.pp-panel{display:none!important}
  main{padding:0!important;background:none!important}
  .dashboard-shell,.dashboard-shell>div{display:block!important;background:none!important;min-height:0!important}
  .pp-root{max-width:none;margin:0}
  .pp-deck{display:block;width:1920px;margin:0;--s:1!important}
  .pp-frame{width:1920px;height:1080px;border-radius:0;box-shadow:none;break-after:page;page-break-after:always}
  .pp-frame:last-child{break-after:auto;page-break-after:auto}
  .pp-canvas{transform:none}
}
`;
