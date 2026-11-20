/* Scoped styles for the /v2 landing — the "desert paper" identity of the client proposal deck. */
const grid = (c: string) =>
  `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`;
const grain =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .25 0 0 0 0 .1 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export const V2_CSS = `
html:has(.v2){scroll-behavior:smooth;background:#F4EAD2;overflow-anchor:none}
.v2,.v2 *{overflow-anchor:none}
@media (prefers-reduced-motion: reduce){html:has(.v2){scroll-behavior:auto}}
.v2{--ink:#1F1812;--ink-soft:#5C4A36;--sand:#F4EAD2;--kraft:#EBDDBD;--paper-hi:#FBF5E6;--gold:#CBA135;--gold-deep:#8C6A1C;--teal:#2A7F78;--ember:#B5382A;--night:#241B13;
  --display:'ThmanyahDisplay',Georgia,serif;--sans:'ThmanyahSans',var(--font-ibm),Tahoma,sans-serif;
  font-family:var(--sans);color:var(--ink);background:var(--sand);overflow-x:clip;min-height:100vh;-webkit-font-smoothing:antialiased}
.v2 *{box-sizing:border-box}
.v2 section[id],.v2 footer{scroll-margin-top:64px}
.v2-wrap{width:100%;max-width:1320px;margin-inline:auto;padding-inline:1.25rem}
@media(min-width:768px){.v2-wrap{padding-inline:2.25rem}}
@media(min-width:1280px){.v2-wrap{padding-inline:3rem}}
.v2-section{padding-block:clamp(5rem,11vw,9.5rem)}
.v2-section-lg{padding-block:clamp(6rem,15vw,13rem)}

/* surfaces */
.v2-paper{background-color:var(--sand);background-image:${grain},${grid("rgba(140,106,28,.065)")};background-size:160px 160px,38px 38px,38px 38px}
.v2-kraft{background-color:var(--kraft);background-image:${grain},${grid("rgba(140,106,28,.08)")};background-size:160px 160px,38px 38px,38px 38px}
.v2-paper-photo{background:var(--sand) url(/v2/paper.webp) center/cover no-repeat}
.v2-night{background-color:var(--night);background-image:${grid("rgba(203,161,53,.06)")};background-size:38px 38px;color:var(--paper-hi)}
.v2-band{height:26px;background:url(/proposal/band.png) repeat-x center/auto 100%;pointer-events:none}
@media(min-width:768px){.v2-band{height:40px}}

/* type */
.v2-kicker{display:inline-flex;align-items:center;gap:.75rem;font-weight:700;font-size:.95rem;color:var(--ember);margin:0}
.v2-kicker::before{content:"";width:28px;height:1.5px;background:var(--gold);flex-shrink:0}
.v2-kicker.text-center{display:flex;justify-content:center}
@media(min-width:768px){.v2-kicker{font-size:1.1rem}}
.v2:lang(en) .v2-kicker{letter-spacing:.16em;font-size:.82rem}
@media(min-width:768px){.v2:lang(en) .v2-kicker{font-size:.95rem}}
.v2-kicker-paper{color:#E8876F}
.v2-title,.v2-title-xl,.v2-title-hero,.v2-title-sm{font-family:var(--display);font-weight:900;color:var(--ink);margin:0;line-height:1.3}
.v2-title{font-size:clamp(2.3rem,5vw,4.4rem);margin-top:.5rem}
.v2-title-xl{font-size:clamp(2.7rem,6.6vw,5.8rem);margin-top:.5rem}
.v2-title-hero{font-size:clamp(2.5rem,5.6vw,5.6rem);margin-top:.75rem}
.v2-title-sm{font-size:clamp(1.6rem,2.4vw,2.1rem)}
.v2:lang(en) .v2-title,.v2:lang(en) .v2-title-xl,.v2:lang(en) .v2-title-hero{line-height:1.08}
.v2:lang(en) .v2-title-hero{font-size:clamp(2.4rem,5vw,4.8rem)}
.v2-title-paper{color:var(--paper-hi)}
.v2-gold{color:var(--gold-deep)}
.v2-night .v2-gold{color:var(--gold)}
.v2-ember{color:var(--ember)}
.v2-line-mask{display:block;overflow:hidden;padding-block:.1em;margin-block:-.1em}
.v2-lead{font-size:clamp(1.08rem,1.45vw,1.3rem);line-height:1.8;color:var(--ink-soft);margin:0}
.v2-body{font-size:clamp(1rem,1.2vw,1.12rem);line-height:1.85;color:var(--ink-soft);margin:0}
.v2-body-paper{color:rgba(251,245,230,.78)}
.v2-small{font-size:.9rem;line-height:1.6;color:var(--ink-soft);margin:0}
.v2-cap{font-weight:700;font-size:1rem;color:var(--ink);margin:.8rem 0 0}
.v2-cap-paper{color:rgba(251,245,230,.85)}

/* controls */
.v2-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;border-radius:999px;font-weight:700;white-space:nowrap;transition:background .25s,color .25s,transform .25s,box-shadow .25s}
.v2-btn:active{transform:scale(.97)}
.v2-btn-ink{background:var(--ink);color:var(--paper-hi)}.v2-btn-ink:hover{background:#40311f}
.v2-btn-ember{background:var(--ember);color:var(--paper-hi);box-shadow:0 10px 24px rgba(181,56,42,.25)}.v2-btn-ember:hover{background:#9a2e22}
.v2-btn-ghost{border:1.5px solid rgba(43,33,24,.28);color:var(--ink);background:rgba(251,245,230,.5)}.v2-btn-ghost:hover{background:var(--paper-hi)}
.v2-chip{list-style:none;font-size:.95rem;color:var(--ink);background:rgba(251,245,230,.85);border:1.5px solid rgba(140,106,28,.32);border-radius:999px;padding:.45rem 1rem}
.v2-chip-sm{font-size:.85rem;padding:.35rem .85rem}
.v2-card{background:rgba(251,245,230,.92);border:1.5px solid rgba(140,106,28,.25);border-radius:22px;padding:2rem;box-shadow:0 14px 34px rgba(60,40,15,.1)}
.v2 ul,.v2 ol{list-style:none;margin:0;padding:0}

/* nav — solid paper, no backdrop blur (blur repaints every scroll frame) */
.v2-nav{position:fixed;inset-inline:0;top:0;z-index:50;background:rgba(244,234,210,.97);border-bottom:1px solid transparent;transition:border-color .3s,box-shadow .3s;will-change:transform}
.v2-nav-solid{border-bottom-color:rgba(140,106,28,.2);box-shadow:0 8px 30px rgba(40,25,10,.06)}
.v2-navlink{font-weight:600;font-size:.98rem;color:var(--ink-soft);background:linear-gradient(var(--gold-deep),var(--gold-deep)) no-repeat bottom/0% 1.5px;padding-bottom:4px;transition:background-size .35s,color .3s}
.v2-navlink:hover{color:var(--ink);background-size:100% 1.5px}

/* motion helpers */
.v2-par{position:absolute;inset-inline:0;will-change:transform}
.v2-par.inset-0{inset:0}
.v2-curtain{position:absolute;inset:0;background:var(--sand);transform-origin:top;z-index:2;pointer-events:none;will-change:transform}
.v2-kraft .v2-curtain{background:var(--kraft)}
.v2-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;background:#2a1f15}
.v2-film-grain{position:absolute;inset:0;pointer-events:none;background-image:${grain};background-size:180px 180px;opacity:.4;z-index:2}

/* hero */
.v2-hero{padding-top:64px;overflow:hidden}
@media(min-width:1024px){.v2-hero{padding-top:76px}}
.v2-meta{display:flex;align-items:center;gap:1rem;padding-top:2rem;font-size:.85rem;font-weight:600;color:var(--ink-soft)}
.v2:lang(en) .v2-meta{letter-spacing:.14em;text-transform:uppercase;font-size:.75rem}
.v2-meta-rule{flex:1;max-width:120px;height:1px;background:rgba(140,106,28,.45)}
.v2-hero-head{display:grid;gap:1.5rem;padding-top:1.25rem;padding-bottom:2.25rem}
@media(min-width:1024px){.v2-hero-head{grid-template-columns:1.4fr 1fr;align-items:end;gap:4.5rem;padding-top:1.75rem;padding-bottom:3.25rem}}
.v2-hero-side{max-width:31rem}
.v2-hero-stage{position:relative;padding-inline:1.25rem;padding-bottom:3.5rem}
@media(min-width:768px){.v2-hero-stage{padding-inline:2.25rem}}
@media(min-width:1280px){.v2-hero-stage{padding-inline:3rem}}
.v2-hero-frame{position:relative;aspect-ratio:1/1;max-height:72svh;width:100%;overflow:hidden;border-radius:22px;background:#3a2a1a;transform-origin:top center;will-change:transform;box-shadow:0 30px 60px rgba(40,25,10,.18)}
@media(min-width:768px){.v2-hero-frame{aspect-ratio:auto;max-height:none;height:min(74vh,780px);border-radius:28px}}
.v2-scroll-cue{position:absolute;bottom:.75rem;left:50%;width:40px;height:40px;margin-left:-20px;display:grid;place-items:center;border-radius:999px;border:1px solid rgba(43,33,24,.3);color:var(--ink);background:var(--sand)}

/* hero entrance (pure CSS, paints before hydration) */
@keyframes v2-rise{from{transform:translateY(108%)}to{transform:none}}
@keyframes v2-fade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes v2-stage{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:none}}
.v2-rise{animation:v2-rise 1.2s cubic-bezier(.16,1,.3,1) both}
.v2-fade{animation:v2-fade 1s cubic-bezier(.16,1,.3,1) both}
.v2-stage-in{animation:v2-stage 1.4s cubic-bezier(.16,1,.3,1) .35s both}
@media (prefers-reduced-motion: reduce){.v2-rise,.v2-fade,.v2-stage-in{animation:none}}

/* manifesto */
.v2-manifesto{max-width:62rem;margin:2.25rem auto 0;text-align:center;font-family:var(--display);font-weight:700;font-size:clamp(1.9rem,4.4vw,4rem);line-height:1.55;color:var(--ink)}
.v2:lang(en) .v2-manifesto{line-height:1.3;font-size:clamp(1.8rem,4vw,3.6rem)}
.v2-word{display:inline-block;margin-inline-end:.28em;will-change:transform}
.v2-pill{position:relative;display:inline-block;vertical-align:middle;width:2.3em;height:1.05em;margin-inline-end:.28em;margin-top:-.15em;border-radius:999px;overflow:hidden;background:#3a2a1a;box-shadow:0 6px 16px rgba(40,25,10,.18);will-change:transform}
@media(min-width:768px){.v2-pill{width:2.7em;height:1.1em}}

/* cinema */
.v2-cinema{position:relative;width:100%;height:100%;overflow:hidden;border-radius:28px;background:#2a1f15;will-change:transform}
@media(max-width:767px){.v2-cinema{border-radius:18px}}

/* day / night toggle */
.v2-toggle{display:inline-flex;padding:4px;border-radius:999px;background:rgba(251,245,230,.9);border:1px solid rgba(140,106,28,.3)}
.v2-toggle button{padding:.45rem 1.1rem;border-radius:999px;font-weight:700;font-size:.9rem;color:var(--ink-soft);transition:background .3s,color .3s}
.v2-toggle button[aria-pressed=true]{background:var(--ink);color:var(--paper-hi)}

/* ticker */
.v2-ticker{overflow:hidden;background:var(--ink);color:var(--paper-hi);padding:.85rem 0;border-block:3px solid var(--gold)}
.v2-tick-track{display:flex;width:max-content;animation:v2-tick 46s linear infinite}
.v2-tick-row{display:flex;flex-shrink:0}
.v2-tick-item{display:inline-flex;align-items:center;gap:1.4rem;padding-inline-end:1.4rem;font-weight:700;font-size:1rem;white-space:nowrap}
.v2-tick-star{color:var(--gold);font-size:.9rem}
@keyframes v2-tick{to{transform:translateX(-50%)}}
.v2-ticker:hover .v2-tick-track{animation-play-state:paused}

/* evening timeline */
.v2-steps{padding-inline-start:2.25rem}
.v2-steps-line{position:absolute;inset-inline-start:.45rem;top:.4rem;bottom:0;width:2px;background:rgba(140,106,28,.2)}
.v2-steps-line span{display:block;height:100%;background:var(--ember);transform-origin:top}
.v2-step{position:relative;padding-bottom:4.5rem;transition:opacity .4s}
.v2-step::before{content:"";position:absolute;inset-inline-start:-2.25rem;top:.35rem;width:16px;height:16px;border-radius:999px;background:var(--sand);border:3px solid rgba(140,106,28,.4);transition:background .3s,border-color .3s,transform .3s}
.v2-step.is-on::before{background:var(--ember);border-color:var(--ember);transform:scale(1.2)}
@media(min-width:1024px){.v2-step{min-height:72vh;padding-bottom:0;opacity:.32;display:flex;flex-direction:column;justify-content:center}.v2-step.is-on{opacity:1}.v2-step::before{top:calc(50% - 8px)}}
.v2-step-when{display:flex;align-items:center;gap:.6rem;font-weight:700;color:var(--ember);margin:0;font-size:1rem}
.v2-step-n{font-family:var(--display);font-weight:900;color:var(--gold-deep);font-size:1rem}
.v2-step-title{font-family:var(--display);font-weight:900;font-size:clamp(1.8rem,3.4vw,3rem);line-height:1.3;color:var(--ink);margin:.4rem 0 0}
.v2:lang(en) .v2-step-title{line-height:1.12}
.v2-dot{width:8px;height:8px;border-radius:99px;background:rgba(140,106,28,.3);transition:width .3s,background .3s}
.v2-dot.is-on{width:26px;background:var(--ember)}

/* map explorer */
.v2-spot{background:rgba(251,245,230,.9);border:1.5px solid rgba(140,106,28,.25);border-radius:22px;padding:1rem 1rem 1.5rem;box-shadow:0 14px 34px rgba(60,40,15,.1)}
@media(min-width:1024px){.v2-spot{padding:1.25rem 1.25rem 1.75rem}}
.v2-chip-btn{cursor:pointer;transition:background .25s,color .25s,border-color .25s}
.v2-chip-btn:hover{border-color:var(--ember)}
.v2-chip-btn.is-on{background:var(--ember);border-color:var(--ember);color:var(--paper-hi)}

/* numbers band */
.v2-band-stat{padding:2.2rem 1rem;border-inline-start:1.5px solid rgba(203,161,53,.25);text-align:center}
.v2-band-stat:nth-child(odd){border-inline-start:0}
@media(min-width:1024px){.v2-band-stat{padding:3.5rem 1rem}.v2-band-stat:nth-child(odd){border-inline-start:1.5px solid rgba(203,161,53,.25)}.v2-band-stat:first-child{border-inline-start:0}}
@media(max-width:1023px){.v2-band-stat:nth-child(-n+2){border-bottom:1.5px solid rgba(203,161,53,.25)}}
.v2-band-stat p{margin:0}
.v2-band-n{font-family:var(--display);font-weight:900;font-size:clamp(2.6rem,6vw,4.8rem);line-height:1.15;color:var(--gold);font-variant-numeric:tabular-nums}
.v2-band-l{color:rgba(251,245,230,.75);font-size:.95rem;margin-top:.25rem!important}

/* prints */
.v2-prints{columns:1;column-gap:1.75rem}
@media(min-width:640px){.v2-prints{columns:2}}
@media(min-width:1024px){.v2-prints{columns:3;column-gap:2.25rem}}
.v2-print{break-inside:avoid;margin:0 0 2rem;background:var(--paper-hi);padding:.7rem .7rem 0;border-radius:4px;box-shadow:0 2px 0 rgba(140,106,28,.15),0 18px 32px rgba(60,40,15,.16)}
.v2-print .v2-photo{border-radius:2px}
.v2-print-cap{font-weight:700;font-size:.95rem;color:var(--ink);padding:.8rem .2rem 1rem}

/* occasions */
.v2-occ{position:relative;display:flex;flex-direction:column;height:100%;background:rgba(251,245,230,.92);border:1.5px solid rgba(140,106,28,.25);border-radius:22px;padding:1.6rem 1.5rem 3.5rem;transition:transform .35s,box-shadow .35s,border-color .35s}
.v2-occ:hover{transform:translateY(-6px);border-color:var(--ember);box-shadow:0 22px 40px rgba(60,40,15,.14)}
.v2-occ-n{font-family:var(--display);font-weight:900;font-size:2.4rem;line-height:1;color:var(--ember)}
.v2-occ-go{position:absolute;inset-inline-start:1.5rem;bottom:1.25rem;font-weight:700;color:var(--ember);font-size:.95rem}

/* photos */
.v2-photo{position:relative;overflow:hidden;background:#d8c49c;isolation:isolate}
.v2-photo-round{border-radius:18px;box-shadow:0 16px 34px rgba(60,40,15,.16)}
.v2-tile{margin:0}


.v2-pin{--s:clamp(22px,2.9vw,42px);position:absolute;width:var(--s);height:var(--s);margin-left:calc(var(--s) / -2);margin-top:calc(var(--s) / -2);border-radius:999px;background:var(--ember);color:var(--paper-hi);font-weight:700;font-size:clamp(.7rem,1.2vw,1.05rem);display:grid;place-items:center;border:3px solid var(--paper-hi);box-shadow:0 6px 14px rgba(60,40,15,.35);transition:scale .25s,box-shadow .25s;cursor:default;z-index:2}
.v2-pin::after{content:"";position:absolute;inset:-3px;border-radius:999px;border:2px solid var(--ember);animation:v2-ping 2.4s ease-out infinite;pointer-events:none}
.v2-pin.is-on{scale:1.3;box-shadow:0 0 0 6px rgba(181,56,42,.25),0 6px 14px rgba(60,40,15,.35)}
@keyframes v2-ping{0%{transform:scale(1);opacity:.7}80%,100%{transform:scale(1.9);opacity:0}}

/* adventures */
.v2-adv-track{will-change:transform;display:flex;align-items:center;gap:clamp(1.5rem,3vw,3rem);width:max-content;padding-inline:max(2.25rem,calc((100vw - 1320px) / 2 + 3rem))}
.v2-adv-intro{width:min(30rem,80vw);flex-shrink:0}
.v2-adv-card{flex-shrink:0;margin:0}
.v2-adv-photo{height:min(58vh,560px);aspect-ratio:4/5}
.v2-adv-card.is-wide .v2-adv-photo{aspect-ratio:16/10}
.v2-adv-end{width:min(24rem,80vw);flex-shrink:0}
.v2-progress{height:3px;border-radius:3px;background:rgba(140,106,28,.2);overflow:hidden}
.v2-progress span{display:block;height:100%;background:var(--ember)}
.v2-scroll-hint{display:inline-block;width:34px;height:2px;background:var(--ember);animation:v2-hint 1.6s ease-in-out infinite}
.v2[dir=rtl] .v2-scroll-hint{animation-name:v2-hint-rtl}
@keyframes v2-hint{0%,100%{transform:translateX(0)}50%{transform:translateX(10px)}}
@keyframes v2-hint-rtl{0%,100%{transform:translateX(0)}50%{transform:translateX(-10px)}}
.v2-adv-swipe{display:flex;gap:1rem;overflow-x:auto;scroll-snap-type:x mandatory;padding-inline:1.25rem;padding-bottom:.5rem;scrollbar-width:none;overscroll-behavior-x:contain}
.v2-adv-swipe::-webkit-scrollbar{display:none}
.v2-adv-swipe>*{scroll-snap-align:center;flex-shrink:0}
.v2-adv-swipe .v2-adv-photo{height:auto;width:82vw;aspect-ratio:4/3}
.v2-adv-swipe .v2-adv-card.is-wide .v2-adv-photo{aspect-ratio:4/3}
.v2-adv-swipe .v2-adv-end{width:82vw;height:100%}


/* reused components restyled for the paper/night surfaces */
.v2-clients section{background:var(--night)!important;border-color:rgba(203,161,53,.15)!important}
.v2-clients .bg-\\[\\#000000\\]{background:var(--night)!important}
.v2-book .bg-\\[\\#0B0C10\\]{background:var(--night)!important}

/* footer */
.v2-foot-h{font-weight:700;color:var(--ember);font-size:.95rem;margin:0}
.v2-foot-link{display:inline-flex;align-items:center;gap:.55rem;color:var(--ink);font-weight:600;margin:0}
.v2-foot-link:hover{color:var(--ember)}
.v2-icon-btn{display:grid;place-items:center;width:42px;height:42px;border-radius:999px;border:1.5px solid rgba(43,33,24,.25);color:var(--ink);transition:background .25s}
.v2-icon-btn:hover{background:var(--paper-hi)}

@media (prefers-reduced-motion: reduce){.v2-pin::after,.v2-scroll-hint,.v2-tick-track{animation:none}}
`;
