/* YAP — onboarding styles. Extracted verbatim from app/YapApp.jsx.
   Kept as a JS template literal so the <style> injection is byte-identical. */

export const ONB_CSS = `
.onb{position:fixed;inset:0;z-index:200;overflow:hidden;background:#1B3A42;color:#F6FBF5;font-family:var(--bod);transition:background 1.3s ease}
.onb[data-dawn="1"]{background:var(--mist);color:var(--ink)}
.onb-sky{position:absolute;inset:-10%;pointer-events:none;z-index:0;transition:opacity .9s ease, transform 1.1s cubic-bezier(.2,.8,.2,1)}
.onb-glow{position:absolute;border-radius:50%;filter:blur(70px);opacity:.4;transition:all 1.2s cubic-bezier(.2,.8,.2,1)}
.g1{width:52vw;height:52vw;background:#FF9F7F;left:-12%;top:6%}
.g2{width:44vw;height:44vw;background:#7EC8E3;right:-14%;top:34%}
.g3{width:38vw;height:38vw;background:#EEDBB8;left:26%;bottom:-12%;opacity:.3}
.onb[data-dawn="1"] .onb-glow{opacity:.3;filter:blur(80px)}
.onb-field{position:absolute;inset:0;pointer-events:none;z-index:0;transition:transform 1s cubic-bezier(.2,.8,.2,1)}
.mote{position:absolute;border-radius:50%;background:#FFE3D3;opacity:.2;animation:float 9s ease-in-out infinite alternate}
@keyframes float{to{transform:translate3d(0,-20px,0)}}
.onb-stage{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;max-width:640px;margin:0 auto;padding:16px 24px calc(24px + env(safe-area-inset-bottom))}
.onb-top{display:flex;align-items:center;gap:12px;padding:6px 0 2px;flex:0 0 auto}
.onb-back{border:none;background:none;color:inherit;font-size:20px;cursor:pointer;padding:6px 8px 6px 0;opacity:.75}
.onb-back:disabled{opacity:0;pointer-events:none}
.pips{display:flex;gap:5px;flex:1}
.pip{height:3px;flex:1;border-radius:99px;background:rgba(246,251,245,.2);transition:background .4s}
.onb[data-dawn="1"] .pip{background:rgba(31,79,91,.14)}
.pip[data-on="1"]{background:#FF9F7F}
.pip[data-on="2"]{background:#F6FBF5}
.onb[data-dawn="1"] .pip[data-on="1"]{background:var(--ocean)}
.onb-skip{border:none;background:none;color:inherit;opacity:.6;font-size:12.5px;cursor:pointer;font-family:var(--bod);font-weight:600;letter-spacing:.06em}
.onb-body{flex:1 1 auto;display:flex;flex-direction:column;justify-content:center;overflow-y:auto;padding:8px 0;scrollbar-width:none;gap:2px}
.onb-body::-webkit-scrollbar{display:none}
.onb-foot{flex:0 0 auto;padding-top:16px}
.onb-h{font-family:var(--dis);font-size:clamp(28px,7.6vw,42px);line-height:1.08;letter-spacing:-.02em;margin:0 0 14px;font-weight:700;text-wrap:balance}
.onb-h em{font-style:normal;color:#FF9F7F}
.onb[data-dawn="1"] .onb-h em{color:var(--coral)}
.onb-p{font-size:16px;line-height:1.6;opacity:.78;max-width:34ch;margin:0 0 8px;text-wrap:pretty}
.onb-kicker{font-family:var(--bod);font-weight:700;font-size:10px;letter-spacing:.18em;text-transform:uppercase;opacity:.55;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.wfade{display:inline-block;opacity:0;transform:translateY(10px);animation:wf .55s forwards}
@keyframes wf{to{opacity:1;transform:none}}
.onb-btn{width:100%;border:none;border-radius:999px;padding:16px 24px;font-size:16px;font-weight:700;background:#FF9F7F;color:#1B3A42;cursor:pointer;font-family:var(--bod);transition:.2s cubic-bezier(.2,.9,.3,1);box-shadow:0 10px 26px rgba(255,159,127,.28);position:relative;overflow:hidden}
.onb-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 14px 30px rgba(255,159,127,.32)}
.onb-btn:active:not(:disabled){transform:translateY(0)}
.onb-btn:disabled{opacity:.35;cursor:not-allowed;box-shadow:none}
.onb-btn.ghost{background:transparent;color:inherit;border:1px solid rgba(246,251,245,.3);box-shadow:none;font-weight:600}
.onb[data-dawn="1"] .onb-btn{background:var(--coral);color:#fff;box-shadow:0 12px 28px rgba(255,159,127,.3)}
.onb-hint{font-family:var(--bod);font-size:11px;opacity:.5;text-align:center;margin-top:10px}
/* fear cards */
.fears{display:flex;gap:10px;margin:6px 0 18px}
.fear{flex:1;border:1px solid rgba(246,251,245,.18);border-radius:20px;padding:18px 10px;text-align:center;background:rgba(246,251,245,.04);animation:rise .6s cubic-bezier(.2,.9,.35,1) both}
.fear svg{opacity:.6;margin-bottom:8px}
.fear b{display:block;font-size:13.5px;font-weight:600}
/* selectable pods — the floating multi-select */
.pods{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding:6px 0 4px}
.pod{border:1px solid rgba(246,251,245,.22);background:rgba(246,251,245,.05);color:inherit;border-radius:999px;padding:13px 18px;font-size:14.5px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:8px;font-family:var(--bod);transition:transform .3s cubic-bezier(.2,.9,.3,1), background .25s, border-color .25s, box-shadow .3s;animation:podin .5s cubic-bezier(.2,.9,.35,1) both;position:relative}
@keyframes podin{from{opacity:0;transform:translateY(14px)}}
.pod:hover{border-color:rgba(246,251,245,.4)}
.pod[data-on="1"]{background:#FF9F7F;color:#1B3A42;border-color:#FF9F7F;font-weight:700;transform:translateY(-2px);box-shadow:0 10px 22px rgba(255,159,127,.28)}
.pod.sq{border-radius:16px}
.pod.cap{border-radius:999px;padding:11px 22px}
.pod i{font-style:normal;font-size:15px;opacity:.8}
.pod[data-on="1"] i{opacity:1}
.count{font-family:var(--bod);font-size:11px;opacity:.55;text-align:center;margin-top:14px}
/* the timer bloom */
.ring-wrap{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:14px 0 6px}
.ring2{position:relative;display:grid;place-items:center;color:var(--ink)}
.ring2 svg{position:absolute;inset:0;transform:rotate(-90deg);animation:ringin 1.1s cubic-bezier(.2,.8,.2,1) both}
@keyframes ringin{from{opacity:0;transform:rotate(-90deg) scale(.9)}}
.ring2-core{position:relative;z-index:1;display:grid;place-items:center;animation:corein .7s .18s cubic-bezier(.2,.9,.35,1) both}
@keyframes corein{from{opacity:0;transform:scale(.75)}}
.ring2-num{font-family:var(--bod);font-weight:800;font-size:40px;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.ring2-cap{font-family:var(--bod);font-weight:700;font-size:10px;letter-spacing:.2em;text-transform:uppercase;opacity:.5;margin:16px 0 0;text-align:center}
.micmark{display:grid;place-items:center;color:var(--ink)}
.micmark.live{animation:breathe 2.8s ease-in-out infinite}
@keyframes breathe{0%,100%{transform:scale(1);opacity:.92}50%{transform:scale(1.05);opacity:1}}
/* live waveform */
.wave{display:flex;gap:3px;align-items:center;justify-content:center;height:56px;margin:14px 0 6px}
.wbar{width:5px;border-radius:99px;background:#FF9F7F;min-height:5px;transition:height .07s linear,background .3s}
.wbar.dim{background:rgba(246,251,245,.2)}
/* transcript preview */
.otxt{font-size:16px;line-height:1.8;max-height:150px;overflow-y:auto;opacity:.92;border-left:2px solid rgba(255,159,127,.4);padding-left:14px;margin:8px 0}
.otxt .fil{background:rgba(255,159,127,.28);border:none;border-radius:4px;padding:0 3px;color:inherit}
.otxt .hed{background:rgba(238,219,184,.32);border:none;border-radius:4px;padding:0 3px;color:inherit;font-style:italic}
/* baseline result */
.bmet{display:flex;gap:9px;flex-wrap:wrap;margin:4px 0 12px}
.bm{flex:1 1 78px;border:1px solid rgba(246,251,245,.18);border-radius:18px;padding:14px 6px;text-align:center;background:rgba(246,251,245,.04);animation:rise .5s cubic-bezier(.2,.9,.35,1) both}
.bm b{display:block;font-family:var(--dis);font-weight:700;font-size:26px;line-height:1;font-variant-numeric:tabular-nums}
.bm span{font-family:var(--bod);font-weight:700;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;opacity:.6}
.focusrow{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
.ftag{font-family:var(--bod);font-weight:600;font-size:11px;border:1px solid rgba(255,159,127,.55);color:#FF9F7F;border-radius:999px;padding:5px 11px}
.onb[data-dawn="1"] .ftag{border-color:var(--coral);color:var(--coral-deep)}
/* the final bloom — sunrise ripple */
.bloom{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none}
.bloom span{position:absolute;border-radius:50%;border:2px solid rgba(255,159,127,.5);animation:bloomout 1.6s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes bloomout{from{width:20px;height:20px;opacity:.9}to{width:200vmax;height:200vmax;opacity:0}}
.orbit{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:16px 0 4px}
.orbit span{font-family:var(--dis);font-size:19px;opacity:0;animation:drawin .7s cubic-bezier(.2,.9,.3,1) forwards}
@keyframes drawin{from{opacity:0;transform:translateY(12px)}to{opacity:.9;transform:none}}
.pod:active{transform:scale(.97)}
.pod[data-on="1"]:active{transform:translateY(-2px) scale(.99)}
.onb-btn:focus-visible,.onb-back:focus-visible,.onb-skip:focus-visible,.pod:focus-visible{outline:3px solid #FF9F7F;outline-offset:3px}
.onb-btn>span{display:inline-flex;align-items:center;gap:8px}
.onb-kicker::after{content:"";height:1px;flex:1;background:currentColor;opacity:.2}
@media (prefers-reduced-motion:reduce){
  .onb *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
}
`;
