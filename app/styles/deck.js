/* YAP — deck styles. Extracted verbatim from app/YapApp.jsx.
   Kept as a JS template literal so the <style> injection is byte-identical. */

export const DECK_CSS = `
.deck{ position:relative; }
.deck-stack{ position:relative; width:100%; animation: deckRise .7s cubic-bezier(.22,1,.36,1) both; }
.deck-card{ width:100%; will-change:transform; touch-action: pan-y; }
.deck-card:not(.deck-card-top){ position:absolute; top:0; left:0; right:0; bottom:0; overflow:hidden; border-radius:32px; }
.deck-card:not(.deck-card-top) > .card{ height:100%; margin-bottom:0; overflow:hidden; }
.deck-card-top{ position:relative; cursor:grab; }
.deck-scrim{ position:absolute; inset:0; border-radius:32px; background:rgba(248,242,231,.72); backdrop-filter:blur(1px); pointer-events:none; }
.deck-card-top:active{ cursor:grabbing; }
.deck-nav{ display:flex; justify-content:center; align-items:center; gap:14px; margin:14px 0 4px; position:relative; z-index:2; }
.deck-arrow{ width:44px; height:44px; border-radius:50%; border:1px solid var(--line); background:#FFFDF8; color:var(--ink);
  display:grid; place-items:center; cursor:pointer; box-shadow:0 6px 16px rgba(31,79,91,.12); transition:transform .18s, opacity .18s; }
.deck-arrow:hover:not(:disabled){ transform:translateY(-2px); }
.deck-arrow:active:not(:disabled){ transform:scale(.92); }
.deck-arrow:disabled{ opacity:.32; cursor:default; }
.deck-arrow:focus-visible{ outline:3px solid var(--ocean); outline-offset:2px; }
.deck-count{ font-weight:800; font-size:13px; color:var(--ink3); font-variant-numeric:tabular-nums; min-width:52px; text-align:center; }
.deck-dots{ display:flex; justify-content:center; align-items:center; gap:8px; margin:4px 0 20px; position:relative; z-index:1; }
.deck-dot{ width:18px; height:18px; object-fit:contain; cursor:pointer; transition:transform .2s; border:none; background:none; padding:0; }
.deck-dot:hover{ transform:scale(1.15); }
.deck-dot[data-on="1"]{ transform:scale(1.2); }
.deck-dot[data-state="current"] img{ filter:drop-shadow(0 0 7px rgba(10,158,196,.85)) saturate(1.4); }
.deck-dot[data-state="done"] img{ filter:drop-shadow(0 0 3px rgba(246,199,106,.65)); }
.card.pcard{ background:#FFFDF8; border:1px solid rgba(255,255,255,.5); border-radius:32px;
  box-shadow:0 24px 50px rgba(31,79,91,.16), inset 0 1px 0 rgba(255,255,255,.7); backdrop-filter:none; -webkit-backdrop-filter:none;
  overflow:hidden; padding-bottom:34px; }
/* ocean light spilling over the top edge of the postcard */
.pcard::before{ content:""; position:absolute; top:0; left:0; right:0; height:76px; pointer-events:none;
  background:linear-gradient(180deg, rgba(126,200,227,.26), rgba(126,200,227,.06) 60%, rgba(126,200,227,0)); }
/* a wavy shoreline along the bottom edge of every postcard */
.pcard::after{ content:""; position:absolute; bottom:0; left:0; right:0; height:26px; pointer-events:none;
  background-repeat:repeat-x; background-position:bottom center; background-size:200px 26px;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 26' preserveAspectRatio='none'><path d='M0,13 C25,3 50,20 75,13 C100,6 125,20 150,13 C175,6 200,16 200,13 L200,26 L0,26 Z' fill='rgba(126,200,227,0.30)'/><path d='M0,18 C28,10 52,23 78,17 C104,11 128,24 154,17 C180,10 200,20 200,18 L200,26 L0,26 Z' fill='rgba(111,215,240,0.42)'/></svg>"); }
.deck-intro-caption{ position:absolute; left:50%; top:8px; transform:translateX(-50%); display:flex; align-items:center; gap:8px;
  background:rgba(255,253,248,.92); border:1px solid rgba(255,255,255,.6); border-radius:999px; padding:6px 14px 6px 6px;
  box-shadow:0 10px 24px rgba(31,79,91,.14); z-index:20; font-weight:700; font-size:13px; color:var(--ink);
  animation: introCaptionIn .5s .15s cubic-bezier(.2,1,.35,1) both, introCaptionOut .4s 1.4s ease-in forwards; pointer-events:none; }
@keyframes introCaptionIn{ from{ opacity:0; transform:translate(-50%,-8px) scale(.9); } to{ opacity:1; transform:translate(-50%,0) scale(1); } }
@keyframes introCaptionOut{ to{ opacity:0; transform:translate(-50%,-6px) scale(.96); } }
@keyframes deckRise{ 0%{ opacity:0; transform:translateY(52px) scale(.94); filter:blur(6px); } 100%{ opacity:1; transform:translateY(0) scale(1); filter:blur(0); } }
@keyframes shellSparklePop{ 0%{ opacity:0; transform:scale(.4) translateY(0) rotate(0deg); } 30%{ opacity:1; transform:scale(1.15) translateY(-8px) rotate(8deg); } 100%{ opacity:0; transform:scale(.75) translateY(-26px) rotate(16deg); } }
.shell-sparkle{ position:absolute; pointer-events:none; font-size:16px; z-index:15; animation:shellSparklePop .55s ease-out both; }
@media (prefers-reduced-motion: reduce){
  .deck-stack{ animation:none; }
  .deck-intro-caption{ animation:none; }
  .shell-sparkle{ animation:none; display:none; }
  .deck-dot[data-state] img{ filter:none; }
}
`;
