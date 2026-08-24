/* YAP — decor styles. Extracted verbatim from app/YapApp.jsx.
   Kept as a JS template literal so the <style> injection is byte-identical. */

export const DECOR_CSS = `
.decor-corner{ position:absolute; top:14px; right:16px; font-size:20px; pointer-events:none; animation:decorBob 3.4s ease-in-out infinite; z-index:1; }
@keyframes decorBob{ 0%,100%{ transform:translateY(0) rotate(-3deg); } 50%{ transform:translateY(-4px) rotate(3deg); } }
.lighthouse{ position:absolute; top:12px; right:16px; width:60px; height:44px; pointer-events:none; z-index:1; }
.lighthouse .lh-tower{ position:absolute; bottom:0; right:0; width:12px; height:32px; background:linear-gradient(180deg,#fff,#EEDBB8); border-radius:3px 3px 0 0; border:1px solid rgba(31,79,91,.15); }
.lighthouse .lh-cap{ position:absolute; top:0; right:0; width:12px; height:7px; background:#E8674A; border-radius:2px 2px 6px 6px; }
.lighthouse .lh-beam{ position:absolute; top:5px; right:11px; width:52px; height:3px; background:linear-gradient(90deg,rgba(246,199,106,.85),transparent); transform-origin:right center; animation:beamSweep 3.2s ease-in-out infinite; }
@keyframes beamSweep{ 0%,100%{ transform:rotate(18deg); } 50%{ transform:rotate(-18deg); } }
.pearl-wrap{ position:relative; display:flex; align-items:center; gap:10px; margin-bottom:14px; }
.pearl-wrap img{ width:40px; height:40px; object-fit:contain; animation:pearlOpen .6s cubic-bezier(.2,1.2,.35,1) both; }
@keyframes pearlOpen{ 0%{ opacity:0; transform:scale(.5) rotate(-14deg); } 100%{ opacity:1; transform:scale(1) rotate(0deg); } }
.speech-row{ display:flex; align-items:flex-start; gap:10px; margin-bottom:12px; }
.speech-bubble{ position:relative; background:var(--sand); border:1px solid var(--line); border-radius:16px; padding:10px 14px; font-weight:700; font-size:13px; color:var(--ink2); }
.speech-bubble::before{ content:""; position:absolute; left:-6px; top:14px; width:12px; height:12px; background:var(--sand); border-left:1px solid var(--line); border-bottom:1px solid var(--line); transform:rotate(45deg); }
.run-turtle-row{ display:flex; align-items:center; gap:8px; }
.run-turtle{ animation:runBounce 1s ease-in-out infinite; }
@keyframes runBounce{ 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-3px); } }
.rhythm-wave{ flex:1; height:18px; }
.rhythm-wave path{ animation:rhythmDash 1.4s linear infinite; }
@keyframes rhythmDash{ 0%{ stroke-dashoffset:0; } 100%{ stroke-dashoffset:-24; } }
.thumbs-badge{ display:inline-flex; align-items:center; gap:4px; font-size:12px; font-weight:800; color:var(--good); margin-left:8px; }
.celebrate-check{ width:56px; height:56px; border-radius:50%; background:var(--good); display:grid; place-items:center; margin:4px auto 12px;
  animation:mascpop .5s .1s cubic-bezier(.2,1,.35,1) both; box-shadow:0 12px 26px rgba(123,174,143,.4); }
.celebrate-splash{ position:absolute; bottom:-6px; left:50%; transform:translateX(-50%); width:120px; height:14px;
  background:radial-gradient(ellipse, rgba(126,200,227,.4), transparent 70%); animation:splashPulse 1.6s ease-in-out infinite; pointer-events:none; }
@keyframes splashPulse{ 0%,100%{ opacity:.5; transform:translateX(-50%) scaleX(1); } 50%{ opacity:.9; transform:translateX(-50%) scaleX(1.15); } }
.celebrate-coconut{ position:absolute; top:-10px; right:24px; font-size:22px; animation:coconutDrop 1.8s ease-in infinite; pointer-events:none; }
@keyframes coconutDrop{ 0%{ transform:translateY(-14px); opacity:0; } 15%{ opacity:1; } 60%{ transform:translateY(6px); } 70%{ transform:translateY(0); } 100%{ opacity:1; transform:translateY(0); } }
.overall-celebrate{ display:flex; justify-content:center; margin-top:6px; animation:mascpop .6s 1.2s cubic-bezier(.2,1,.35,1) both; opacity:0; animation-fill-mode:forwards; }

/* ---- the closing summary card ---- */
.sum{ text-align:center; position:relative; }
.sum-sun{ position:absolute; top:-70px; left:50%; transform:translateX(-50%); width:210px; height:210px; border-radius:50%;
  background:radial-gradient(circle, rgba(246,199,106,.34), rgba(246,199,106,0) 68%); pointer-events:none; animation:sumSun 5s ease-in-out infinite; }
@keyframes sumSun{ 0%,100%{ opacity:.65; transform:translateX(-50%) scale(1); } 50%{ opacity:1; transform:translateX(-50%) scale(1.06); } }
.sum-score{ font-family:var(--dis); font-weight:800; font-size:60px; line-height:1; letter-spacing:-.03em; color:var(--ink);
  font-variant-numeric:tabular-nums; animation:thump .6s .25s cubic-bezier(.2,1,.4,1) both; }
.sum-outof{ font-size:11px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--ink3); margin-top:4px; }
.sum-title{ font-family:var(--dis); font-weight:700; font-size:23px; color:var(--ink); margin:14px 0 4px; }
.sum-sub{ font-size:14.5px; line-height:1.6; color:var(--ink2); max-width:34ch; margin:0 auto; }
.sum-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin:18px 0 4px; }
.sum-stat{ background:var(--sand); border:1px solid var(--line); border-radius:18px; padding:11px 6px; }
.sum-stat b{ display:block; font-family:var(--dis); font-weight:800; font-size:21px; color:var(--ink); font-variant-numeric:tabular-nums; }
.sum-stat span{ font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--ink3); }
.sum-shells{ display:flex; justify-content:center; gap:10px; margin-top:14px; font-size:17px; }
.sum-shells span{ animation:decorBob 3s ease-in-out infinite; }
.sum-shells span:nth-child(2){ animation-delay:.4s; } .sum-shells span:nth-child(3){ animation-delay:.8s; }
.sum-actions{ display:grid; gap:9px; margin-top:20px; }
.sum-actions .row2{ display:grid; grid-template-columns:1fr 1fr; gap:9px; }
.sum-actions .btn{ width:100%; }
.sum-toast{ margin-top:12px; font-size:13px; font-weight:700; color:var(--good); animation:rvFade .3s ease both; }
@media (prefers-reduced-motion: reduce){
  .decor-corner,.lighthouse .lh-beam,.pearl-wrap img,.run-turtle,.rhythm-wave path,.celebrate-check,.celebrate-splash,.celebrate-coconut,.overall-celebrate,
  .sum-sun,.sum-score,.sum-shells span{ animation:none; opacity:1; }
}
`;
