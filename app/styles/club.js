/* YAP — club styles. Extracted verbatim from app/YapApp.jsx.
   Kept as a JS template literal so the <style> injection is byte-identical. */

export const CLUB_CSS = `
@keyframes clubWaveDrift{0%{transform:translateX(0)}100%{transform:translateX(-25%)}}
@keyframes clubFoamPulse{0%,100%{opacity:.55}50%{opacity:.9}}
.pro-card{position:relative;overflow:hidden;border-radius:var(--r-card,26px);
  background:linear-gradient(150deg,#2E6F86 0%,#3E8FAD 46%,#5FAECB 100%);
  box-shadow:0 18px 44px rgba(16,72,92,.28)}
.pro-glow{position:absolute;top:-40%;right:-14%;width:230px;height:230px;border-radius:50%;
  background:radial-gradient(circle,rgba(255,255,255,.30),transparent 66%);pointer-events:none}
.pro-body{position:relative;z-index:1;padding:22px 20px 20px}
.pro-eye{display:inline-block;font-family:var(--bod);font-weight:800;font-size:10px;letter-spacing:.2em;
  text-transform:uppercase;color:#2E6F86;background:#F2C14E;border-radius:999px;padding:4px 11px}
.pro-head{margin-top:12px;font-family:var(--dis);font-optical-sizing:auto;font-variation-settings:"SOFT" 12,"WONK" 1;font-style:italic;font-weight:800;font-size:22px;line-height:1.18;color:#fff}
.pro-list{margin:13px 0 0;padding:0;list-style:none}
.pro-list li{position:relative;padding-left:22px;margin-bottom:7px;font-size:13.5px;line-height:1.5;
  color:rgba(255,255,255,.9)}
.pro-list li::before{content:"";position:absolute;left:3px;top:7px;width:9px;height:5px;
  border-left:2px solid #F2C14E;border-bottom:2px solid #F2C14E;transform:rotate(-45deg)}
.pro-cta{width:100%;margin-top:16px;border:none;border-radius:999px;padding:14px 20px;cursor:pointer;
  background:#fff;color:#2E6F86;font-family:var(--bod);font-weight:800;font-size:15px;
  box-shadow:0 8px 20px rgba(16,72,92,.26);transition:transform .2s,box-shadow .2s}
.pro-cta:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 26px rgba(16,72,92,.34)}
.pro-cta:active:not(:disabled){transform:scale(.98)}
.pro-cta:disabled{opacity:.65;cursor:default}
.pro-err{margin:10px 0 0;font-size:12.5px;line-height:1.5;color:#FFD9CF}
@keyframes clubPalmSway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
@keyframes clubBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes clubRipple{0%{box-shadow:0 0 0 0 rgba(10,158,196,.35)}100%{box-shadow:0 0 0 18px rgba(10,158,196,0)}}
.club-wave{animation:clubWaveDrift 9s linear infinite alternate}
.club-wave-front{animation-duration:6.5s}
.club-foam{animation:clubFoamPulse 3.4s ease-in-out infinite}
.club-turtle{animation:clubBob 4.5s ease-in-out infinite}
.club-palm-sway{transform-origin:bottom center;animation:clubPalmSway 3.2s ease-in-out infinite}
.club-cta:active{animation:clubRipple .5s ease-out}
.club-shell-pop:hover .club-shell-art{transform:scale(1.08) rotate(-4deg)}
.club-shell-art{transition:transform .3s cubic-bezier(.2,.9,.3,1)}
@media (prefers-reduced-motion: reduce){.club-wave,.club-foam,.club-turtle,.club-palm-sway{animation:none}}
`;
