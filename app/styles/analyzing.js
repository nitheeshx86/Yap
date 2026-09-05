/* YAP — analyzing styles. Extracted verbatim from app/YapApp.jsx.
   Kept as a JS template literal so the <style> injection is byte-identical. */

export const ANALYZING_SCREEN_CSS = `
@keyframes spinSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes tickIn{0%{opacity:0;transform:scale(0)}100%{opacity:1;transform:scale(1)}}
.ana-spinner{animation:spinSlow 3s linear infinite}
.ana-check{animation:tickIn .6s cubic-bezier(.2,.9,.3,1) forwards}
.ana-circle{width:20px;height:20px;border:2.5px solid #0A9EC4;border-radius:50%;border-right-color:transparent;animation:spinSlow 1s linear infinite}
/* The whole .ana-spinner rotates, so anything meant to look upright has to
   turn back the other way at the same rate. */
@keyframes spinBack{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(-360deg)}}
.ana-core{position:absolute;top:50%;left:50%;line-height:0;
  transform:translate(-50%,-50%);animation:spinBack 3s linear infinite;
  filter:drop-shadow(0 6px 12px rgba(10,158,196,.28))}
.ana-orbit{position:absolute;line-height:0;animation:spinBack 3s linear infinite}
.ana-orbit1{top:8%;left:50%}
.ana-orbit2{top:50%;left:6%}
@media (prefers-reduced-motion: reduce){.ana-spinner,.ana-circle,.ana-core,.ana-orbit{animation:none}}
`;
