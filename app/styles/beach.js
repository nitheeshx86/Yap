/* YAP — beach styles. Extracted verbatim from app/YapApp.jsx.
   Kept as a JS template literal so the <style> injection is byte-identical. */

export const BEACH_CSS = `
.beach-ambient{ position:fixed; inset:0; z-index:0; overflow:hidden; pointer-events:none; }
.ba-sun{ position:absolute; top:6%; right:9%; width:150px; height:150px; border-radius:50%;
  background:radial-gradient(circle, rgba(246,199,106,.45), rgba(246,199,106,0) 70%); animation:baGlow 6s ease-in-out infinite; }
.ba-sun-art{ position:absolute; top:8%; right:12%; opacity:.8; animation:baGlow 6s ease-in-out infinite; }
/* Pill clouds: a rounded body with two puff blobs, drifting across at
   different depths. Pure transforms so they stay GPU-cheap. */
.ba-cloud{ position:absolute; background:rgba(255,255,255,.62); border-radius:999px; filter:blur(.4px);
  box-shadow:0 6px 18px rgba(31,79,91,.06); }
.ba-cloud::before, .ba-cloud::after{ content:""; position:absolute; background:inherit; border-radius:50%; }
.ba-cloud::before{ width:58%; height:170%; left:12%; top:-78%; }
.ba-cloud::after{ width:42%; height:130%; right:14%; top:-46%; }
.ba-cloud1{ top:8%;  left:-20%; width:132px; height:30px; opacity:.9;  animation:baFloat 58s linear infinite, baBobble 7s ease-in-out infinite; }
.ba-cloud2{ top:16%; left:-40%; width:92px;  height:22px; opacity:.65; animation:baFloat 84s linear infinite 6s, baBobble 9s ease-in-out infinite; }
.ba-cloud3{ top:23%; left:-30%; width:64px;  height:17px; opacity:.45; animation:baFloat 108s linear infinite 18s, baBobble 11s ease-in-out infinite; }
.ba-island{ position:absolute; bottom:17%; left:72%; width:90px; height:18px; border-radius:50%; background:rgba(90,174,90,.24); }
.ba-island-palms{ position:absolute; bottom:calc(17% + 6px); left:calc(72% + 8px); opacity:.42; }
.ba-bird{ position:absolute; opacity:.38; animation:baBird 16s linear infinite; }
.ba-bird1{ top:19%; left:18%; animation-delay:0s; }
.ba-bird2{ top:25%; left:33%; animation-delay:5s; }
@keyframes baGlow{ 0%,100%{ opacity:.7; } 50%{ opacity:1; } }
@keyframes baFloat{ 0%{ transform:translateX(0); } 100%{ transform:translateX(180vw); } }
@keyframes baBobble{ 0%,100%{ margin-top:0; } 50%{ margin-top:6px; } }
@keyframes baBird{ 0%{ transform:translate(0,0); } 100%{ transform:translate(40vw,-10px); } }
@media (prefers-reduced-motion: reduce){
  .ba-sun,.ba-sun-art,.ba-cloud,.ba-bird{ animation:none; }
  .ba-cloud1{ left:8%; } .ba-cloud2{ left:52%; } .ba-cloud3{ left:30%; }
}
`;
