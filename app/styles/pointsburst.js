/* YAP — pointsburst styles. Extracted verbatim from app/YapApp.jsx.
   Kept as a JS template literal so the <style> injection is byte-identical. */

export const PBURST_CSS = `
.pburst{position:fixed;inset:0;z-index:900;display:grid;place-items:center;pointer-events:none;
  animation:pbFade .3s ease both}
.pburst-glow{position:absolute;width:min(78vw,420px);aspect-ratio:1;border-radius:50%;
  background:radial-gradient(circle,rgba(255,255,255,.92),rgba(238,219,184,.55) 42%,transparent 70%);
  animation:pbGlow 2.1s cubic-bezier(.2,.9,.3,1) both}
.pburst-core{position:relative;display:grid;place-items:center;animation:pbPop .7s cubic-bezier(.2,1.5,.4,1) both}
.pburst-num{position:relative;z-index:2;text-align:center;animation:pbLift 2.1s cubic-bezier(.2,.9,.3,1) both}
.pburst-num b{display:block;font-family:var(--dis),system-ui,sans-serif;font-weight:800;
  font-size:clamp(64px,19vw,116px);line-height:.9;letter-spacing:-.03em;color:#1F4F5B;
  text-shadow:0 6px 0 rgba(255,255,255,.9),0 10px 26px rgba(31,79,91,.28)}
.pburst-num span{display:block;margin-top:6px;font-family:var(--bod),system-ui,sans-serif;font-weight:800;
  font-size:clamp(13px,3.4vw,17px);letter-spacing:.24em;text-transform:uppercase;color:#45636B;
  text-shadow:0 2px 6px rgba(255,255,255,.9)}
.pburst-star{position:absolute;color:#F2B33D;filter:drop-shadow(0 4px 10px rgba(201,154,75,.5));
  animation:pbStar 1.5s cubic-bezier(.2,.9,.3,1) both}
.pburst-star svg{width:38px;height:38px;display:block}
@keyframes pbFade{from{opacity:0}to{opacity:1}}
@keyframes pbPop{0%{transform:scale(.3);opacity:0}60%{transform:scale(1.06);opacity:1}100%{transform:scale(1);opacity:1}}
@keyframes pbGlow{0%{transform:scale(.4);opacity:0}25%{opacity:1}100%{transform:scale(1.25);opacity:0}}
@keyframes pbLift{0%,72%{transform:translateY(0);opacity:1}100%{transform:translateY(-26px);opacity:0}}
@keyframes pbStar{
  0%{transform:translate(0,0) scale(0) rotate(-60deg);opacity:0}
  35%{opacity:1}
  70%{transform:translate(var(--px),var(--py)) scale(var(--ps)) rotate(10deg);opacity:1}
  100%{transform:translate(calc(var(--px) * 1.18),calc(var(--py) * 1.18 + 16px)) scale(calc(var(--ps) * .82)) rotate(24deg);opacity:0}}
@media (prefers-reduced-motion:reduce){
  .pburst-glow,.pburst-star{animation-duration:.01s;animation-iteration-count:1}
  .pburst-core,.pburst-num{animation:pbFade .2s ease both}
}
`;
