/* YAP — reveal styles. Extracted verbatim from app/YapApp.jsx.
   Kept as a JS template literal so the <style> injection is byte-identical. */

export const REVEAL_CSS = `
/* The reveal is two stacked cards: a gradient hero carrying the one number,
   and a plain white list carrying the six measures. Keeping them separate
   stops the sub-scores competing with the headline figure. */
.rv{ position:relative; z-index:1; margin-bottom:24px;
  animation:cardin .5s cubic-bezier(.2,.9,.3,1) both; }

/* ---- hero ---- */
.rv-hero{ position:relative; overflow:hidden; border-radius:28px; padding:26px 24px 30px; text-align:center;
  background:linear-gradient(168deg,#4E9BB8 0%,#5FAECB 42%,#8FCFE0 100%);
  box-shadow:0 20px 46px rgba(31,79,91,.20);
  animation:rvRise .7s cubic-bezier(.22,1,.36,1) both; }
.rv-eye{ font-family:var(--bod); font-weight:800; font-size:11.5px; letter-spacing:.2em; text-transform:uppercase;
  color:rgba(255,255,255,.82); }
.rv-big{ display:flex; align-items:baseline; justify-content:center; gap:6px; margin-top:10px; }
.rv-big b{ font-family:var(--dis); font-weight:800; font-size:clamp(62px,17vw,86px); line-height:.95;
  letter-spacing:-.04em; color:#fff; font-variant-numeric:tabular-nums;
  text-shadow:0 6px 22px rgba(16,64,80,.30); }
.rv-big i{ font-style:normal; font-family:var(--bod); font-weight:700; font-size:19px; color:rgba(255,255,255,.85); }
.rv-meter{ height:9px; border-radius:999px; background:rgba(255,255,255,.28); overflow:hidden; margin:18px 4px 0; }
.rv-meter span{ display:block; height:100%; border-radius:999px;
  transition:width 1.4s cubic-bezier(.2,.8,.3,1) .25s; box-shadow:0 0 12px rgba(255,255,255,.45); }
.rv-verdict{ margin-top:20px; font-family:var(--dis); font-weight:700; font-size:20px; color:#fff;
  animation:rvFade .5s .9s ease both; }
.rv-vline{ margin:8px auto 0; max-width:30ch; font-size:14.5px; line-height:1.6; color:rgba(255,255,255,.88);
  animation:rvFade .5s 1.05s ease both; }
/* a soft shoreline so the card sits in the scene rather than on top of it */
.rv-shore{ position:absolute; left:0; right:0; bottom:0; height:34px;
  background:linear-gradient(180deg,rgba(255,255,255,0),rgba(248,242,231,.85)); }

/* ---- measures ---- */
.rv-list{ margin-top:14px; padding:6px 18px; border-radius:24px; background:#fff;
  border:1px solid var(--line); box-shadow:0 14px 34px rgba(31,79,91,.10); }
.rv-row{ display:flex; align-items:center; gap:13px; padding:15px 0;
  animation:rvFade .45s cubic-bezier(.2,.9,.3,1) both; }
.rv-row + .rv-row{ border-top:1px solid var(--line); }
.rv-ico{ flex:none; width:34px; height:34px; border-radius:50%; display:grid; place-items:center;
  border:1.5px solid currentColor; background:rgba(255,255,255,.6); }
.rv-ico svg{ width:17px; height:17px; }
.rv-rowbody{ flex:1; min-width:0; }
.rv-rowtop{ display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:7px; }
.rv-name{ font-family:var(--bod); font-weight:800; font-size:15px; color:var(--ink); }
.rv-val b{ font-family:var(--dis); font-weight:800; font-size:17px; color:var(--ink);
  font-variant-numeric:tabular-nums; }
.rv-val i{ font-style:normal; font-size:11.5px; font-weight:700; color:var(--ink3); margin-left:2px; }
.rv-bar{ height:7px; border-radius:999px; background:rgba(31,79,91,.10); overflow:hidden; }
.rv-bar span{ display:block; height:100%; border-radius:999px;
  transition:width 1.1s cubic-bezier(.2,.8,.3,1); }

.rv-line{ font-size:14px; line-height:1.6; color:var(--ink2); text-align:center; margin:16px auto 0;
  animation:rvFade .5s 1.25s ease both; }
.rv-cta{ margin-top:20px; text-align:center; animation:rvFade .5s 1.5s ease both; }
.rv-cta .btn{ font-size:16px; padding:15px 30px; }
.rv-hint{ font-size:12.5px; color:var(--ink3); margin-top:12px; }
@keyframes rvRise{ from{ opacity:0; transform:translateY(24px) scale(.94); } }
@keyframes rvFade{ from{ opacity:0; transform:translateY(8px); } }
@media (prefers-reduced-motion: reduce){
  .rv,.rv-hero,.rv-row,.rv-verdict,.rv-vline,.rv-line,.rv-cta{ animation:none; }
  .rv-meter span,.rv-bar span{ transition:none; }
}
`;
