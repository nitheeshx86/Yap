/* YAP — debate styles. Extracted verbatim from app/YapApp.jsx.
   Kept as a JS template literal so the <style> injection is byte-identical. */

export const DEBATE_CSS = `
/* ---- choose your side ---- */
.side-head{display:flex;align-items:center;gap:12px;justify-content:center;margin:2px 0 16px}
.side-head span{font-family:var(--bod);font-weight:800;font-size:11.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink2);white-space:nowrap}
.side-head i{height:2px;flex:1;max-width:70px;border-radius:2px;background:linear-gradient(90deg,transparent,rgba(126,200,227,.85))}
.side-head i:last-child{background:linear-gradient(90deg,rgba(126,200,227,.85),transparent)}

/* The tapered edges already open a wedge between the cards, so the grid gap is
   pulled in tight — with a positive gap the two read as far apart. */
.stance{display:grid;grid-template-columns:1fr 1fr;gap:0;align-items:stretch;margin:0 -2px}
.stance > :first-child{margin-right:-30px}
@media (max-width:430px){
  .stance{grid-template-columns:1fr;gap:8px;margin:0}
  .stance > :first-child{margin-right:0}
}

/* The shape, border and fill are all drawn by <StanceFrame> (SVG), because a
   clip-path can carry neither a rounded corner nor a stroke. The button is a
   transparent box; the SVG stretches behind the content. Both the top and the
   bottom edge slant, mirrored between the two sides. */
.stancecard{position:relative;display:block;width:100%;text-align:left;
  border:none;background:none;padding:20px 20px 22px;min-height:180px;
  cursor:pointer;transition:transform .28s cubic-bezier(.2,.9,.3,1),filter .28s;
  filter:drop-shadow(0 12px 26px rgba(var(--sc-glow),.20))}
.sc-frame{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
.stancecard:hover{transform:translateY(-3px);filter:drop-shadow(0 18px 36px rgba(var(--sc-glow),.30))}
.stancecard[data-on="1"]{filter:drop-shadow(0 0 20px rgba(var(--sc-glow),.42)) drop-shadow(0 16px 34px rgba(var(--sc-glow),.30))}
.stancecard:focus-visible{outline:none}
.stancecard:focus-visible .sc-frame{outline:3px solid var(--sc-accent);outline-offset:4px;border-radius:18px}
@media (prefers-reduced-motion:reduce){.stancecard{transition:none}}

.sc-badge{position:absolute;top:16px;left:18px;z-index:4;width:34px;height:34px;border-radius:50%;
  display:grid;place-items:center;color:#fff;
  background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.55),transparent 58%),var(--sc-accent);
  box-shadow:0 4px 10px rgba(var(--sc-glow),.5),inset 0 -2px 4px rgba(0,0,0,.18)}
.sc-badge svg{width:17px;height:17px}

.sc-copy{display:block;position:relative;z-index:2;padding-top:30px}
/* The tapered vertical edge eats into the card, so the copy is pushed clear of
   it: FOR tapers on the right, AGAINST on the left. The straight edge keeps a
   normal 20px, the tapered one needs room for the widest part of the wedge. */
/* FOR's straight edge is on the right, so its content aligns there — against
   the solid edge rather than floating over the tapered one */
.stancecard[data-side="for"]{padding-right:30px;text-align:right}
.stancecard[data-side="against"]{padding-left:40px}
.stancecard[data-side="against"] .sc-badge{left:auto;right:18px}
@media (max-width:430px){
  .stancecard[data-side="for"]{padding-right:34px}
  .stancecard[data-side="against"]{padding-left:34px}
}
.sc-label{display:block;font-family:var(--dis);font-optical-sizing:auto;font-variation-settings:"SOFT" 12,"WONK" 1;font-style:italic;font-weight:800;font-size:clamp(23px,5.8vw,31px);
  line-height:1;letter-spacing:-.01em;color:var(--sc-accent);margin-bottom:11px}
/* the little wave-on-a-rule divider */
.sc-rule{display:flex;align-items:center;gap:5px;margin-bottom:13px}
.sc-rule i{height:1.5px;flex:1;background:rgba(var(--sc-glow),.42);border-radius:2px}
.sc-rule svg{width:16px;height:8px;flex:none;color:var(--sc-accent);opacity:.75}
.sc-blurb{display:block;font-size:12.5px;line-height:1.68;color:var(--ink2)}

/* the board sits bottom-right, bleeding off the card edge */
/* faint birds, as in the reference */
/* birds sit opposite the badge: FOR's badge is left, AGAINST's is right */
.sc-birds{position:absolute;top:16px;right:16px;width:44px;color:var(--sc-accent);opacity:.26;z-index:2}
.stancecard[data-side="against"] .sc-birds{right:auto;left:16px}
.prepgrid{display:flex;gap:8px;flex-wrap:wrap}
.preptile{flex:1 1 90px;border:1px solid var(--line);background:var(--surf1);border-radius:16px;
  padding:12px 8px;cursor:pointer;text-align:center;font-family:var(--bod);color:var(--ink);transition:.2s cubic-bezier(.2,.9,.3,1)}
.preptile[data-on="1"]{background:var(--ocean);color:#fff;border-color:var(--ocean)}
.preptile b{display:block;font-family:var(--bod);font-weight:800;font-size:15px}
.preptile span{font-size:10px;opacity:.75;line-height:1.35;display:block;margin-top:3px}
.prepbig{font-family:var(--bod);font-weight:800;font-size:clamp(46px,14vw,80px);text-align:center;
  letter-spacing:-.02em;line-height:1;font-variant-numeric:tabular-nums;color:var(--ink)}
.prepbig.low{color:var(--bad)}
  resize:vertical;margin-top:8px}
.brief li{font-size:14.5px;line-height:1.6;margin-bottom:7px;color:var(--ink2)}

/* ---- research brief ---- */
/* one solid white sheet: the brief is read at a glance under time pressure,
   so it needs a flat opaque ground, not the translucent glass used elsewhere */
.bsheet{background:#fff;border:1px solid var(--line);border-radius:26px;padding:24px 22px;margin-bottom:20px;box-shadow:0 18px 44px rgba(31,79,91,.12);animation:cardin .5s cubic-bezier(.2,.9,.3,1) both}
.bsheet .bsec:last-child{margin-bottom:0}
@media (max-width:560px){.bsheet{padding:20px 16px;border-radius:22px}}

.bsec{margin-bottom:14px;border-bottom:1px solid var(--line);padding-bottom:14px}
.bsheet .bsec:last-child{border-bottom:none;padding-bottom:0}

/* the whole header is the toggle, so the hit target is the full row */
.bhead{display:flex;align-items:center;gap:10px;width:100%;background:none;border:none;padding:4px 0;margin:0;cursor:pointer;text-align:left;font:inherit;color:inherit}
.bhead:focus-visible{outline:3px solid var(--ocean);outline-offset:3px;border-radius:8px}
.bhead .btit{font-family:var(--bod);font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink2)}
.bhead:hover .btit{color:var(--ink)}
.bhead .bcount{font-size:11px;font-weight:700;color:var(--ink3);font-variant-numeric:tabular-nums;background:var(--foam);border-radius:999px;padding:2px 8px}
.bhead .bchev{margin-left:auto;flex:none;width:15px;height:15px;color:var(--ink3);transition:transform .3s cubic-bezier(.2,.9,.3,1)}
.bhead[aria-expanded="false"] .bchev{transform:rotate(-90deg)}

/* grid-rows animates cleanly to auto height, unlike max-height guesswork */
.bbody{display:grid;grid-template-rows:1fr;transition:grid-template-rows .32s cubic-bezier(.2,.9,.3,1),opacity .25s;opacity:1;margin-top:11px}
.bbody[data-open="0"]{grid-template-rows:0fr;opacity:0;margin-top:0}
.bbody > div{overflow:hidden;min-height:0}
@media (prefers-reduced-motion:reduce){.bbody{transition:none}}

/* the thesis — the one thing they must internalise, so it leads and is biggest */
.bthesis{background:rgba(126,200,227,.12);border:1px solid rgba(126,200,227,.4);border-radius:20px;padding:18px 20px;margin-bottom:18px}
.bthesis .btit{font-family:var(--bod);font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3);display:block;margin-bottom:8px}
.bthesis p{font-size:17px;line-height:1.55;margin:0;font-weight:600;color:var(--ink)}

/* numbered argument cards — countable at a glance while speaking */
.bpoint{display:flex;gap:12px;align-items:flex-start;padding:9px 0;margin:0}
.bpoint + .bpoint{border-top:1px solid var(--line)}
.bpoint .bn{flex:none;width:21px;height:21px;border-radius:50%;background:var(--foam);color:var(--ink2);font-size:11px;font-weight:800;display:grid;place-items:center;margin-top:2px}
.bpoint p{margin:0;font-size:15px;line-height:1.55;color:var(--ink)}

/* objection → answer, visually separated so the rebuttal is findable */
.bcounter{padding:10px 0;margin:0}
.bcounter + .bcounter{border-top:1px solid var(--line)}
.bcounter .bq{font-size:14.5px;line-height:1.5;font-weight:700;color:var(--coral-deep);margin:0}
.bcounter .ba{margin:7px 0 0;font-size:14.5px;line-height:1.55;color:var(--ink2)}
.bcounter .ba b{font-weight:800;font-size:10px;letter-spacing:.1em;text-transform:uppercase;display:block;margin-bottom:3px;color:var(--ink3)}

.bfact{padding:10px 0;margin:0;font-size:14.5px;line-height:1.55;color:var(--ink2)}
.bfact + .bfact{border-top:1px solid var(--line)}
.bwarn{font-size:12.5px;line-height:1.5;color:var(--ink3);margin:12px 0 0;font-style:italic}

.bcase{padding:10px 0;margin:0;font-size:14.5px;line-height:1.55;color:var(--ink2)}
.bcase + .bcase{border-top:1px solid var(--line)}
.brief ul{margin:6px 0 0;padding-left:18px}
.pill{display:inline-block;font-family:var(--bod);font-weight:700;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;
  border:1px solid var(--line);border-radius:999px;padding:4px 11px;margin-bottom:8px;color:var(--ink2)}
`;
