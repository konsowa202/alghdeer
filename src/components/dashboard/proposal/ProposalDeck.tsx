"use client";
/* eslint-disable @next/next/no-img-element -- plain <img> keeps print/PDF export reliable */

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, SlidersHorizontal, X } from "lucide-react";
import type { InvoiceRecord } from "@/lib/invoices-types";
import {
  CAMP_FACILITIES,
  CAMP_STATS,
  EXPERIENCES,
  EXPERIENCE_EXTRAS,
  HOSPITALITY,
  HOSPITALITY_PHOTOS,
  NEXT_STEPS,
  PROPOSAL_BANK,
  PROPOSAL_CONTACT,
} from "@/data/proposal-content";

/* ── canvas: every slide is drawn at exactly 1920×1080 and exported 1:1 ── */
const W = 1920;
const ITEMS_PER_SLIDE = 7;

type Settings = {
  recipient: string;
  title: string;
  welcome: string;
  validDays: number;
  showPerPerson: boolean;
  showItemPrices: boolean;
  camp: boolean;
  experiences: boolean;
  hospitality: boolean;
  payment: boolean;
};

const num = (v: number) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v);

function formatDate(iso: string | null | Date) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Riyadh",
  }).format(d);
}

function formatTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Riyadh" }).format(d);
  if (parts === "00:00") return "";
  return new Intl.DateTimeFormat("ar-SA-u-nu-latn", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Riyadh" }).format(d);
}

const chunk = <T,>(arr: T[], size: number) =>
  arr.length ? Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size)) : [[]];

export default function ProposalDeck({ invoice }: { invoice: InvoiceRecord }) {
  const storageKey = `alghdeer-proposal:${invoice.id}`;
  const defaults: Settings = {
    recipient: invoice.company || invoice.customerName || "ضيوفنا الكرام",
    title: "ليلةٌ تليق بضيوفكم",
    welcome:
      "في قلب صحراء جدة على طريق بريمان، نستضيف مناسبتكم بمخيم متكامل يجمع الضيافة السعودية الأصيلة بالعروض الحية والتجارب التي تبقى في الذاكرة. صممنا هذا العرض خصيصًا لكم، ويسعد فريقنا بتفصيله على مقاس مناسبتكم.",
    validDays: 14,
    showPerPerson: invoice.guestCount > 1,
    showItemPrices: false,
    camp: true,
    experiences: true,
    hospitality: true,
    payment: true,
  };

  const [s, setS] = useState<Settings>(defaults);
  const [panel, setPanel] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setS((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {}
    loaded.current = true;
  }, [storageKey]);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {}
  }, [s, storageKey]);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));

  /* fit the 1920px canvas to the preview width */
  const deckRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const el = deckRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, e.contentRect.width / W)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const validUntil = useMemo(() => {
    const d = new Date(invoice.updatedAt);
    d.setDate(d.getDate() + Math.max(1, s.validDays || 1));
    return d;
  }, [invoice.updatedAt, s.validDays]);

  const ref = invoice.invoiceNumber;
  const perPerson = invoice.guestCount > 0 ? invoice.total / invoice.guestCount : 0;
  const itemPages = chunk(invoice.items, ITEMS_PER_SLIDE);
  const time = formatTime(invoice.eventAt);

  /* build the slide list, then number it */
  type SlideDef = { key: string; section: string; render: (meta: Meta) => React.ReactNode };
  const slides: SlideDef[] = [];
  slides.push({ key: "cover", section: "", render: (m) => Cover({ m }) });
  if (s.camp) slides.push({ key: "camp", section: "المخيم", render: (m) => Camp({ m }) });
  if (s.experiences) slides.push({ key: "exp", section: "التجارب", render: (m) => Experiences({ m }) });
  if (s.hospitality) slides.push({ key: "hosp", section: "الضيافة", render: (m) => Hospitality({ m }) });
  itemPages.forEach((items, i) =>
    slides.push({ key: `pkg-${i}`, section: "الباقة", render: (m) => Package({ m, items, offset: i * ITEMS_PER_SLIDE, cont: i > 0 }) }),
  );
  slides.push({ key: "invest", section: "الاستثمار", render: (m) => Investment({ m }) });
  if (s.payment) slides.push({ key: "pay", section: "تأكيد الحجز", render: (m) => Payment({ m }) });
  slides.push({ key: "close", section: "", render: (m) => Closing({ m }) });

  type Meta = { n: number; total: number; section: string };

  /* ── slide pieces (closures over invoice + settings) ── */
  const Chrome = ({ m, light }: { m: Meta; light?: boolean }) => (
    <>
      <div className="pp-top">
        <div className="pp-eyebrow">
          <span className="pp-eyebrow-n">{String(m.n).padStart(2, "0")}</span>
          <span className="pp-eyebrow-line" />
          <span>{m.section}</span>
        </div>
        <img src="/logo-dark-bg.png" alt="ALGHDEER camp" className="pp-logo" />
      </div>
      <div className={`pp-foot ${light ? "pp-foot-light" : ""}`}>
        <span>مخيمات الغدير — {PROPOSAL_CONTACT.location}</span>
        <span dir="ltr">
          {ref} · {String(m.n).padStart(2, "0")} / {String(m.total).padStart(2, "0")}
        </span>
      </div>
    </>
  );

  const Cover = ({ m }: { m: Meta }) => (
    <div className="pp-slide">
      <img src="/proposal/cover-shaded.jpg" alt="" className="pp-bg" />
      <div className="pp-top">
        <div className="pp-eyebrow">
          <span className="pp-en">PRIVATE EVENT PROPOSAL</span>
        </div>
        <img src="/logo-dark-bg.png" alt="ALGHDEER camp" className="pp-logo pp-logo-lg" />
      </div>
      <div className="pp-cover-body">
        <p className="pp-kicker">عرض استضافة خاص</p>
        <h1 className="pp-cover-title">{s.title}</h1>
        <div className="pp-cover-to">
          <span>مقدَّم إلى</span>
          <strong>{s.recipient}</strong>
        </div>
      </div>
      <div className="pp-cover-meta">
        <div><small>تاريخ المناسبة</small><b>{formatDate(invoice.eventAt)}</b></div>
        <div><small>عدد الضيوف</small><b><span className="pp-num">{num(invoice.guestCount)}</span> ضيف</b></div>
        <div><small>رقم العرض</small><b dir="ltr" className="pp-num">{ref}</b></div>
        <div><small>صالح حتى</small><b>{formatDate(validUntil)}</b></div>
      </div>
      <span className="pp-sr">{m.n}</span>
    </div>
  );

  const Camp = ({ m }: { m: Meta }) => (
    <div className="pp-slide">
      <div className="pp-photo-side">
        <img src="/proposal/hall.jpg" alt="" />
        <div className="pp-photo-side-fade" />
      </div>
      {Chrome({ m })}
      <div className="pp-camp">
        <p className="pp-en pp-gold">THE CAMP</p>
        <h2 className="pp-h2 pp-h2-sm">مخيمٌ واحد <em>يتسع لكل مناسباتكم</em></h2>
        <p className="pp-lead">{s.welcome}</p>
        <div className="pp-stats">
          {CAMP_STATS.map((st) => (
            <div key={st.value}>
              <span className="pp-stat-n pp-num">{st.value}</span>
              <b>{st.label}</b>
              <small>{st.note}</small>
            </div>
          ))}
        </div>
        <div className="pp-chips">
          {CAMP_FACILITIES.map((f) => <span key={f}>{f}</span>)}
        </div>
      </div>
    </div>
  );

  const Experiences = ({ m }: { m: Meta }) => (
    <div className="pp-slide">
      {Chrome({ m })}
      <div className="pp-exp-head">
        <div>
          <p className="pp-en pp-gold">EXPERIENCES</p>
          <h2 className="pp-h2">تجارب تُروى <em>بعد المناسبة</em></h2>
        </div>
        <p className="pp-exp-extras">
          {EXPERIENCE_EXTRAS.map((x, i) => (
            <React.Fragment key={x}>{i > 0 ? <i>·</i> : null}{x}</React.Fragment>
          ))}
        </p>
      </div>
      <div className="pp-mosaic">
        {EXPERIENCES.map((e, i) => (
          <figure key={e.title} className={i === 0 ? "pp-tile pp-tile-big" : i === 3 ? "pp-tile pp-tile-tall" : "pp-tile"}>
            <img src={e.image} alt="" />
            <figcaption>
              <b>{e.title}</b>
              <span className="pp-en">{e.en}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );

  const Hospitality = ({ m }: { m: Meta }) => (
    <div className="pp-slide">
      <div className="pp-photo-side pp-photo-wide">
        <img src="/proposal/dome.jpg" alt="" />
        <div className="pp-photo-side-fade" />
      </div>
      {Chrome({ m })}
      <div className="pp-hosp">
        <p className="pp-en pp-gold">HOSPITALITY</p>
        <h2 className="pp-h2">ضيافةٌ <em>على أصولها</em></h2>
        <ol className="pp-hosp-list">
          {HOSPITALITY.map((h, i) => (
            <li key={h}><span className="pp-num">{String(i + 1).padStart(2, "0")}</span>{h}</li>
          ))}
        </ol>
        <div className="pp-hosp-photos">
          {HOSPITALITY_PHOTOS.map((p) => (
            <figure key={p.title}>
              <img src={p.image} alt="" />
              <figcaption>{p.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );

  const Package = ({ m, items, offset, cont }: { m: Meta; items: InvoiceRecord["items"]; offset: number; cont: boolean }) => (
    <div className="pp-slide">
      {Chrome({ m })}
      <aside className="pp-pkg-side">
        <p className="pp-en pp-gold">YOUR PACKAGE</p>
        <h2 className="pp-h2">باقتكم<br /><em>المقترحة</em>{cont ? <span className="pp-cont">تابع</span> : null}</h2>
        <dl className="pp-facts">
          <div><dt>مقدَّم إلى</dt><dd>{s.recipient}</dd></div>
          <div><dt>تاريخ المناسبة</dt><dd>{formatDate(invoice.eventAt)}{time ? <> — <span className="pp-num">{time}</span></> : null}</dd></div>
          <div><dt>عدد الضيوف</dt><dd><span className="pp-num">{num(invoice.guestCount)}</span> ضيف</dd></div>
          <div><dt>الموقع</dt><dd>مخيمات الغدير — {PROPOSAL_CONTACT.location}</dd></div>
        </dl>
      </aside>
      <div className="pp-items">
        {items.length === 0 ? (
          <p className="pp-empty">أضف بنود الباقة في عرض السعر لتظهر هنا تلقائيًا.</p>
        ) : (
          items.map((it, i) => (
            <div key={it.id} className="pp-item">
              <span className="pp-item-n pp-num">{String(offset + i + 1).padStart(2, "0")}</span>
              <div className="pp-item-txt">
                <b>{it.descriptionAr || it.descriptionEn}</b>
                {it.descriptionAr && it.descriptionEn ? <span dir="ltr">{it.descriptionEn}</span> : null}
              </div>
              <div className="pp-item-qty">
                <span><span className="pp-num">{num(it.quantity)}</span> {it.unitAr}</span>
                {s.showItemPrices ? <small className="pp-num">{num(it.quantity * it.unitPrice)} ر.س</small> : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const Investment = ({ m }: { m: Meta }) => {
    const rows: [string, string, boolean?][] = [["إجمالي الباقة", `${num(invoice.subtotal)} ر.س`]];
    if (invoice.discount > 0) rows.push(["الخصم", `− ${num(invoice.discount)} ر.س`, true]);
    if (invoice.showCommission && invoice.commissionAmount > 0)
      rows.push([`رسوم الخدمة${invoice.commissionType === "percent" ? ` (${invoice.commissionValue}%)` : ""}`, `${num(invoice.commissionAmount)} ر.س`]);
    if (invoice.taxRate > 0) rows.push([`ضريبة القيمة المضافة (${invoice.taxRate}%)`, `${num(invoice.taxAmount)} ر.س`]);
    return (
      <div className="pp-slide">
        <div className="pp-photo-side">
          <img src="/proposal/tables.jpg" alt="" />
          <div className="pp-photo-side-fade" />
        </div>
        {Chrome({ m })}
        <div className="pp-invest">
          <p className="pp-en pp-gold">INVESTMENT</p>
          <h2 className="pp-h2">قيمة <em>التجربة</em></h2>
          <div className="pp-total">
            <span className="pp-total-n pp-num">{num(invoice.total)}</span>
            <span className="pp-total-c">ريال سعودي</span>
          </div>
          {s.showPerPerson && invoice.guestCount > 1 ? (
            <div className="pp-pp">
              <span className="pp-num">{num(Math.round(perPerson * 100) / 100)}</span> ر.س للشخص
              <i />
              <span className="pp-num">{num(invoice.guestCount)}</span> ضيف
            </div>
          ) : null}
          <div className="pp-break">
            {rows.map(([label, value, neg]) => (
              <div key={label}><span>{label}</span><b className={`pp-num ${neg ? "pp-neg" : ""}`}>{value}</b></div>
            ))}
            <div className="pp-break-total"><span>الإجمالي النهائي</span><b className="pp-num">{num(invoice.total)} ر.س</b></div>
          </div>
          <p className="pp-valid">هذا العرض ساري حتى {formatDate(validUntil)}</p>
        </div>
      </div>
    );
  };

  const Payment = ({ m }: { m: Meta }) => (
    <div className="pp-slide">
      {Chrome({ m })}
      <div className="pp-pay">
        <div className="pp-pay-steps">
          <p className="pp-en pp-gold">NEXT STEPS</p>
          <h2 className="pp-h2">خطوات <em>تأكيد الحجز</em></h2>
          <ol>
            {NEXT_STEPS.map((st, i) => (
              <li key={st.title}>
                <span className="pp-step-n pp-num">{String(i + 1).padStart(2, "0")}</span>
                <div><b>{st.title}</b><p>{st.text}</p></div>
              </li>
            ))}
          </ol>
          {invoice.notes ? <p className="pp-notes">{invoice.notes}</p> : null}
        </div>
        <div className="pp-bank">
          <p className="pp-en pp-gold">BANK DETAILS</p>
          <div className="pp-bank-row"><small>اسم البنك</small><b>{PROPOSAL_BANK.bank}</b></div>
          <div className="pp-bank-row"><small>اسم المستفيد</small><b>{PROPOSAL_BANK.beneficiary}</b></div>
          <div className="pp-bank-row"><small>رقم الحساب</small><b dir="ltr" className="pp-mono">{PROPOSAL_BANK.account}</b></div>
          <div className="pp-bank-row pp-bank-iban"><small>رقم الآيبان IBAN</small><b dir="ltr" className="pp-mono">{PROPOSAL_BANK.iban}</b></div>
        </div>
      </div>
    </div>
  );

  const Closing = ({ m }: { m: Meta }) => (
    <div className="pp-slide">
      <img src="/proposal/closing-shaded.jpg" alt="" className="pp-bg" />
      <div className="pp-close">
        <img src="/logo-dark-bg.png" alt="ALGHDEER camp" className="pp-close-logo" />
        <h2 className="pp-close-title">بانتظار <em>استضافتكم</em></h2>
        <p className="pp-close-sub">فريق الغدير جاهز للإجابة عن أي تفاصيل وتخصيص العرض لمناسبتكم.</p>
        <div className="pp-close-contacts" dir="ltr">
          {PROPOSAL_CONTACT.phones.map((p) => <span key={p}>{p}</span>)}
          <span>{PROPOSAL_CONTACT.website}</span>
          <span>{PROPOSAL_CONTACT.social}</span>
        </div>
      </div>
      <span className="pp-sr">{m.n}</span>
    </div>
  );

  return (
    <div className="pp-root" dir="rtl">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="pp-toolbar">
        <Link href={`/dashboard/invoices?invoice=${invoice.id}`} className="pp-btn pp-btn-ghost">
          <ArrowRight size={16} /> عرض السعر
        </Link>
        <div className="pp-toolbar-title">
          <b>بروبوزل العميل</b>
          <span>{s.recipient} · {slides.length} شريحة · 1920×1080</span>
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
          <label>عنوان الغلاف<input value={s.title} onChange={(e) => set("title", e.target.value)} /></label>
          <label>رسالة الترحيب<textarea rows={4} value={s.welcome} onChange={(e) => set("welcome", e.target.value)} /></label>
          <label>مدة صلاحية العرض (أيام)<input type="number" min={1} value={s.validDays} onChange={(e) => set("validDays", Number(e.target.value))} /></label>
          <div className="pp-checks">
            <label><input type="checkbox" checked={s.showPerPerson} onChange={(e) => set("showPerPerson", e.target.checked)} /> سعر الشخص</label>
            <label><input type="checkbox" checked={s.showItemPrices} onChange={(e) => set("showItemPrices", e.target.checked)} /> أسعار البنود</label>
            <label><input type="checkbox" checked={s.camp} onChange={(e) => set("camp", e.target.checked)} /> شريحة المخيم</label>
            <label><input type="checkbox" checked={s.experiences} onChange={(e) => set("experiences", e.target.checked)} /> شريحة التجارب</label>
            <label><input type="checkbox" checked={s.hospitality} onChange={(e) => set("hospitality", e.target.checked)} /> شريحة الضيافة</label>
            <label><input type="checkbox" checked={s.payment} onChange={(e) => set("payment", e.target.checked)} /> الحساب البنكي</label>
          </div>
          <button type="button" className="pp-reset" onClick={() => setS(defaults)}>استرجاع الافتراضي</button>
        </div>
      ) : null}

      <div ref={deckRef} className="pp-deck" style={{ ["--s" as string]: scale }}>
        {slides.map((sl, i) => (
          <section key={sl.key} className="pp-frame" dir="ltr">
            <div className="pp-canvas">{sl.render({ n: i + 1, total: slides.length, section: sl.section })}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

const CSS = `
.pp-root{--ink:#09090b;--paper:#f4efe3;--muted:rgba(244,239,227,.58);--dim:rgba(244,239,227,.34);--gold:#d6b25e;--gold2:#f3dc93;--gold3:#a9802a;--line:rgba(214,178,94,.22);
  --serif:'ThmanyahDisplay',serif;--sans:'ThmanyahSans',var(--font-ibm),sans-serif;--en:var(--font-ibm),'Helvetica Neue',Arial,sans-serif;max-width:1500px;margin:0 auto}
.pp-toolbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:10px;padding:12px 14px;margin-bottom:18px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(16,17,21,.92);backdrop-filter:blur(14px)}
.pp-toolbar-title{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.pp-toolbar-title b{color:#fff;font-size:14px}.pp-toolbar-title span{color:rgba(255,255,255,.4);font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pp-btn{display:inline-flex;align-items:center;gap:7px;border-radius:11px;padding:10px 15px;font-size:12px;font-weight:700;white-space:nowrap;cursor:pointer;border:1px solid rgba(255,255,255,.14);color:rgba(255,255,255,.75);background:transparent}
.pp-btn-gold{background:#cba135;border-color:#cba135;color:#111}.pp-btn-gold:hover{background:#d8b553}.pp-btn-ghost:hover{background:rgba(255,255,255,.05)}
.pp-panel{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px;margin-bottom:18px;padding:18px;border:1px solid rgba(203,161,53,.25);border-radius:16px;background:#101115}
.pp-panel-head{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;color:#e5c979;font-size:13px}.pp-panel-head button{color:rgba(255,255,255,.5)}
.pp-panel label{display:flex;flex-direction:column;gap:6px;color:rgba(255,255,255,.45);font-size:11px;font-weight:700}
.pp-panel input:not([type=checkbox]),.pp-panel textarea{width:100%;border:1px solid rgba(255,255,255,.1);background:rgba(0,0,0,.3);border-radius:10px;padding:10px 12px;color:#fff;font-size:13px;outline:none;font-family:inherit;resize:vertical}
.pp-panel input:focus,.pp-panel textarea:focus{border-color:rgba(203,161,53,.6)}
.pp-panel label:has(textarea){grid-column:1/-1}
.pp-checks{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:8px}.pp-checks label{flex-direction:row;align-items:center;gap:7px;padding:8px 12px;border:1px solid rgba(255,255,255,.1);border-radius:999px;color:rgba(255,255,255,.7);cursor:pointer}
.pp-checks input{accent-color:#cba135}
.pp-reset{justify-self:start;color:rgba(255,255,255,.45);font-size:11px;text-decoration:underline}
@media(max-width:700px){.pp-panel{grid-template-columns:1fr}.pp-toolbar{flex-wrap:wrap}.pp-toolbar-title{order:-1;flex-basis:100%}}

.pp-deck{display:flex;flex-direction:column;gap:22px}
.pp-frame{position:relative;width:100%;height:calc(1080px * var(--s));overflow:hidden;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.45);background:var(--ink)}
.pp-canvas{position:absolute;top:0;left:0;width:1920px;height:1080px;transform:scale(var(--s));transform-origin:top left}

/* ── slide system ── */
.pp-slide{position:relative;width:1920px;height:1080px;overflow:hidden;background:radial-gradient(120% 90% at 85% 0%,#17140d 0%,var(--ink) 55%);color:var(--paper);font-family:var(--sans);direction:rtl;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pp-slide *{box-sizing:border-box}
.pp-slide::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(60% 50% at 50% 120%,rgba(214,178,94,.07),transparent 70%);z-index:1}
.pp-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.pp-num{font-family:var(--en);font-feature-settings:"tnum";letter-spacing:-.01em}
.pp-mono{font-family:var(--en);letter-spacing:.08em}
.pp-en{font-family:var(--en);letter-spacing:.42em;font-size:17px;font-weight:600;text-transform:uppercase;direction:ltr;unicode-bidi:isolate}
.pp-gold{color:var(--gold)}
.pp-sr{position:absolute;opacity:0}
.pp-h2{font-family:var(--serif);font-weight:700;font-size:92px;line-height:1.08;margin:22px 0 0;color:var(--paper)}
.pp-h2-sm{font-size:72px}
.pp-cont{display:inline-block;vertical-align:middle;margin-right:18px;border:1px solid var(--line);border-radius:999px;padding:6px 18px;font-family:var(--sans);font-size:22px;font-weight:700;color:var(--gold)}
.pp-h2 em,.pp-cover-title em,.pp-close-title em{font-style:normal;background:linear-gradient(100deg,var(--gold2),var(--gold) 45%,var(--gold3));-webkit-background-clip:text;background-clip:text;color:transparent}
.pp-top{position:absolute;z-index:5;top:64px;inset-inline:96px;display:flex;align-items:center;justify-content:space-between}
.pp-eyebrow{display:flex;align-items:center;gap:16px;color:var(--gold);font-size:20px;font-weight:700}
.pp-eyebrow-n{font-family:var(--en);font-weight:600;letter-spacing:.1em}
.pp-eyebrow-line{width:56px;height:1px;background:var(--gold);opacity:.6}
.pp-logo{height:30px;width:auto;opacity:.95}.pp-logo-lg{height:44px}
.pp-foot{position:absolute;z-index:5;bottom:52px;inset-inline:96px;display:flex;justify-content:space-between;color:var(--dim);font-size:17px}
.pp-foot span[dir=ltr]{font-family:var(--en);letter-spacing:.12em;font-size:15px}

/* cover */
.pp-shade-cover{position:absolute;inset:0;z-index:1;background:linear-gradient(0deg,#09090b 6%,rgba(9,9,11,.72) 38%,rgba(9,9,11,.18) 72%,rgba(9,9,11,.55) 100%),linear-gradient(270deg,rgba(9,9,11,.75),transparent 60%)}
.pp-cover-body{position:absolute;z-index:3;right:96px;bottom:300px;max-width:1300px}
.pp-kicker{color:var(--gold);font-size:30px;font-weight:700;margin:0 0 18px;display:flex;align-items:center;gap:18px}.pp-kicker::before{content:"";width:72px;height:1px;background:var(--gold)}
.pp-cover-title{font-family:var(--serif);font-weight:900;font-size:150px;line-height:1.02;margin:0;color:#fff;text-shadow:0 10px 60px rgba(0,0,0,.4)}
.pp-cover-to{display:flex;align-items:baseline;gap:22px;margin-top:34px}.pp-cover-to span{color:var(--muted);font-size:30px}
.pp-cover-to strong{font-family:var(--serif);font-size:64px;font-weight:700;color:var(--gold2)}
.pp-cover-meta{position:absolute;z-index:3;bottom:84px;inset-inline:96px;display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--line)}
.pp-cover-meta>div{padding:30px 32px 0 0;border-left:1px solid var(--line);display:flex;flex-direction:column;gap:12px}.pp-cover-meta>div:first-child{padding-right:0}.pp-cover-meta>div:last-child{border-left:0}
.pp-cover-meta small{color:var(--dim);font-size:19px}.pp-cover-meta b{font-size:28px;font-weight:700;color:var(--paper)}

/* side photo (left in RTL) */
.pp-photo-side{position:absolute;top:0;bottom:0;left:0;width:820px;z-index:0;-webkit-mask-image:linear-gradient(270deg,transparent 0%,#000 55%);mask-image:linear-gradient(270deg,transparent 0%,#000 55%)}.pp-photo-wide{width:980px}
.pp-photo-side img{width:100%;height:100%;object-fit:cover}
.pp-photo-side-fade{position:absolute;inset:0;background:linear-gradient(0deg,rgba(9,9,11,.55),transparent 40%),linear-gradient(180deg,rgba(9,9,11,.45),transparent 25%)}

/* camp */
.pp-camp{position:absolute;z-index:3;top:150px;right:96px;width:1000px}
.pp-lead{margin:22px 0 0;font-size:24px;line-height:1.7;color:var(--muted);max-width:940px}
.pp-stats{display:grid;grid-template-columns:repeat(3,1fr);margin-top:34px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.pp-stats>div{padding:20px 0 20px 28px;display:flex;flex-direction:column;gap:6px;border-left:1px solid var(--line)}.pp-stats>div:not(:first-child){padding-right:32px}.pp-stats>div:last-child{border-left:0}
.pp-stat-n{font-size:96px;font-weight:300;line-height:1;background:linear-gradient(180deg,var(--gold2),var(--gold3));-webkit-background-clip:text;background-clip:text;color:transparent;margin-bottom:10px}
.pp-stats b{font-size:24px;font-weight:700}.pp-stats small{font-size:18px;color:var(--dim)}
.pp-chips{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}
.pp-chips span{border:1px solid var(--line);border-radius:999px;padding:9px 18px;font-size:18px;color:var(--paper);background:rgba(214,178,94,.05);display:inline-flex;align-items:center;gap:10px}
.pp-chips span::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--gold)}

/* experiences */
.pp-exp-head{position:absolute;z-index:3;top:150px;inset-inline:96px;display:flex;justify-content:space-between;align-items:flex-end;gap:60px}
.pp-exp-extras{margin:0 0 14px;max-width:640px;text-align:left;color:var(--muted);font-size:22px;line-height:1.7}.pp-exp-extras i{font-style:normal;color:var(--gold);margin:0 12px}
.pp-mosaic{position:absolute;z-index:3;top:400px;bottom:120px;inset-inline:96px;display:grid;grid-template-columns:1.5fr 1fr 1fr .8fr;grid-template-rows:1fr 1fr;gap:18px}
.pp-tile{position:relative;margin:0;border-radius:22px;overflow:hidden;background:#15130f}
.pp-tile-big{grid-row:span 2}.pp-tile-tall{grid-row:span 2;grid-column:4}
.pp-tile img{width:100%;height:100%;object-fit:cover}
.pp-tile figcaption{position:absolute;inset:auto 0 0 0;padding:60px 26px 22px;background:linear-gradient(0deg,rgba(9,9,11,.92),transparent);display:flex;flex-direction:column;gap:6px}
.pp-tile figcaption b{font-size:28px;font-weight:700}.pp-tile figcaption .pp-en{font-size:12px;letter-spacing:.3em;color:var(--gold);text-align:right}
.pp-tile-big figcaption b{font-size:40px}

/* hospitality */
.pp-hosp{position:absolute;z-index:3;top:170px;right:96px;width:900px}
.pp-hosp-list{list-style:none;margin:40px 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;column-gap:56px}
.pp-hosp-list li{display:flex;align-items:center;gap:20px;padding:17px 0;border-bottom:1px solid var(--line);font-size:26px;font-weight:500}
.pp-hosp-list li span{color:var(--gold);font-size:17px;width:30px}
.pp-hosp-photos{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:44px}
.pp-hosp-photos figure{margin:0;position:relative;height:210px;border-radius:18px;overflow:hidden}
.pp-hosp-photos img{width:100%;height:100%;object-fit:cover}
.pp-hosp-photos figcaption{position:absolute;inset:auto 0 0 0;padding:40px 18px 14px;background:linear-gradient(0deg,rgba(9,9,11,.9),transparent);font-size:21px;font-weight:700}

/* package */
.pp-pkg-side{position:absolute;z-index:3;top:170px;bottom:120px;right:96px;width:560px;padding-left:56px;border-left:1px solid var(--line)}
.pp-facts{margin:48px 0 0;display:flex;flex-direction:column;gap:26px}
.pp-facts dt{color:var(--dim);font-size:19px;margin-bottom:6px}.pp-facts dd{margin:0;font-size:27px;font-weight:700;line-height:1.4}
.pp-items{position:absolute;z-index:3;top:170px;bottom:120px;left:96px;right:752px;display:flex;flex-direction:column;justify-content:flex-start}
.pp-item{display:grid;grid-template-columns:72px 1fr auto;align-items:center;gap:20px;min-height:108px;padding:14px 0;border-bottom:1px solid var(--line)}
.pp-item:first-child{border-top:1px solid var(--line)}
.pp-item-n{color:var(--gold);font-size:30px;font-weight:300}
.pp-item-txt{display:flex;flex-direction:column;gap:6px;min-width:0}.pp-item-txt b{font-size:31px;font-weight:700;line-height:1.3}
.pp-item-txt span{font-family:var(--en);font-size:17px;color:var(--dim);text-align:right}
.pp-item-qty{display:flex;flex-direction:column;align-items:flex-end;gap:6px;text-align:left}
.pp-item-qty>span{border:1px solid var(--line);border-radius:999px;padding:9px 20px;font-size:21px;white-space:nowrap;color:var(--gold2)}
.pp-item-qty small{font-size:18px;color:var(--muted)}
.pp-empty{color:var(--dim);font-size:28px;margin:auto}

/* investment */
.pp-invest{position:absolute;z-index:3;top:170px;right:96px;width:1000px}
.pp-total{display:flex;align-items:baseline;gap:26px;margin-top:40px}
.pp-total-n{font-size:200px;font-weight:200;line-height:.95;background:linear-gradient(180deg,var(--gold2),var(--gold) 50%,var(--gold3));-webkit-background-clip:text;background-clip:text;color:transparent}
.pp-total-c{font-size:36px;color:var(--muted);font-weight:700}
.pp-pp{display:inline-flex;align-items:center;gap:18px;margin-top:26px;padding:16px 28px;border:1px solid var(--line);border-radius:999px;font-size:26px;color:var(--paper);background:rgba(214,178,94,.06)}
.pp-pp .pp-num{color:var(--gold2);font-weight:600}.pp-pp i{width:1px;height:26px;background:var(--line)}
.pp-break{margin-top:46px;max-width:820px}
.pp-break>div{display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid rgba(244,239,227,.08);font-size:24px;color:var(--muted)}
.pp-break b{color:var(--paper);font-weight:500}.pp-break .pp-neg{color:#9fd9a8}
.pp-break .pp-break-total{border-bottom:0;border-top:1px solid var(--gold);margin-top:6px;padding-top:22px;color:var(--paper);font-size:28px;font-weight:700}
.pp-break .pp-break-total b{color:var(--gold2);font-weight:700}
.pp-valid{margin-top:26px;color:var(--dim);font-size:20px}

/* payment */
.pp-pay{position:absolute;z-index:3;top:170px;bottom:120px;inset-inline:96px;display:grid;grid-template-columns:1fr 720px;gap:96px}
.pp-pay-steps ol{list-style:none;margin:48px 0 0;padding:0;display:flex;flex-direction:column}
.pp-pay-steps li{display:flex;gap:30px;padding:26px 0;border-bottom:1px solid var(--line)}.pp-pay-steps li:first-child{border-top:1px solid var(--line)}
.pp-step-n{font-size:56px;font-weight:200;color:var(--gold);line-height:1;width:84px}
.pp-pay-steps li b{font-size:32px}.pp-pay-steps li p{margin:8px 0 0;font-size:23px;color:var(--muted);line-height:1.6}
.pp-notes{margin-top:26px;font-size:19px;line-height:1.8;color:var(--dim);white-space:pre-wrap;max-height:150px;overflow:hidden}
.pp-bank{align-self:center;border:1px solid rgba(214,178,94,.45);border-radius:28px;padding:52px 56px;background:linear-gradient(160deg,rgba(214,178,94,.12),rgba(214,178,94,.02) 60%);box-shadow:inset 0 1px 0 rgba(255,255,255,.06)}
.pp-bank .pp-en{margin:0 0 18px}
.pp-bank-row{padding:22px 0;border-bottom:1px solid rgba(244,239,227,.09);display:flex;flex-direction:column;gap:8px}.pp-bank-row:last-child{border-bottom:0}
.pp-bank-row small{color:var(--dim);font-size:18px}.pp-bank-row b{font-size:30px;font-weight:700;text-align:right}
.pp-bank-iban b{color:var(--gold2);font-size:29px;letter-spacing:.03em;white-space:nowrap}

/* closing */
.pp-shade-close{position:absolute;inset:0;z-index:1;background:radial-gradient(70% 70% at 50% 55%,rgba(9,9,11,.55),rgba(9,9,11,.92)),linear-gradient(0deg,#09090b,transparent 50%)}
.pp-close{position:absolute;z-index:3;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.pp-close-logo{height:66px;width:auto;margin-bottom:56px}
.pp-close-title{font-family:var(--serif);font-weight:900;font-size:140px;line-height:1.05;margin:0;color:#fff}
.pp-close-sub{margin:26px 0 0;font-size:28px;color:var(--muted)}
.pp-close-contacts{display:flex;gap:0;margin-top:64px;border:1px solid var(--line);border-radius:999px;overflow:hidden;background:rgba(9,9,11,.5)}
.pp-close-contacts span{padding:20px 40px;font-family:var(--en);font-size:23px;letter-spacing:.06em;color:var(--paper);border-left:1px solid var(--line)}.pp-close-contacts span:first-child{border-left:0}

/* ── print: one slide per 1920×1080 page, no dashboard chrome ── */
@page{size:1920px 1080px;margin:0}
@media print{
  html,body{background:#09090b!important;margin:0!important;padding:0!important}
  .pp-root,.pp-root *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
  .pp-deck{width:1920px;margin:0}
  aside,header,nav,.pp-toolbar,.pp-panel{display:none!important}
  main{padding:0!important;background:none!important}
  .dashboard-shell,.dashboard-shell>div{display:block!important;background:none!important;min-height:0!important}
  .pp-root{max-width:none;margin:0}
  .pp-deck{display:block;--s:1!important}
  .pp-frame{width:1920px;height:1080px;border-radius:0;box-shadow:none;break-after:page;page-break-after:always}
  .pp-frame:last-child{break-after:auto;page-break-after:auto}
  .pp-canvas{transform:none}
}
`;
