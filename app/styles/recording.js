/* YAP — recording styles. Extracted verbatim from app/YapApp.jsx.
   Kept as a JS template literal so the <style> injection is byte-identical. */

export const RECORDING_SCREEN_CSS = `
/* ---- timing lights ---- */
/* A single pill in two segments: the clock, and — once the speaker passes the
   green mark — an attached light. Before green there is no light at all; a
   colour from second zero would train people to ignore it. */
.rec-timer{display:inline-flex;align-items:stretch;margin-top:12px;border-radius:999px;
  background:rgba(255,255,255,.5);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);
  box-shadow:0 4px 14px rgba(31,79,91,.10),inset 0 0 0 1px rgba(255,255,255,.6);
  overflow:hidden;transition:box-shadow .4s}
.rec-timer.on{box-shadow:0 6px 20px rgba(var(--lg),.30),inset 0 0 0 1px rgba(255,255,255,.55)}

.rec-clock{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;
  font-family:var(--bod);font-size:13px;color:var(--ocean-deep);
  transition:background .45s,color .45s}
.rec-clock b{font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:.01em}
.rec-clock i{font-style:normal;font-weight:600;opacity:.65}
/* the clock itself tints only faintly — the light segment carries the signal */
.rec-timer.on .rec-clock{background:rgba(var(--lg),.16);color:var(--lc)}

.rec-light{display:inline-flex;align-items:center;gap:7px;padding:8px 15px 8px 12px;
  background:var(--lc);color:#fff;
  font-family:var(--bod);font-weight:800;font-size:10.5px;letter-spacing:.13em;text-transform:uppercase;
  white-space:nowrap;animation:recLightIn .4s cubic-bezier(.2,.9,.3,1) both}
.rec-dot{width:7px;height:7px;border-radius:50%;background:#fff;flex:none;
  box-shadow:0 0 0 3px rgba(255,255,255,.3);animation:recDot 1.6s ease-in-out infinite}
.rec-timer[data-light="red"] .rec-light{animation:recLightIn .4s cubic-bezier(.2,.9,.3,1) both,recRed 1s ease-in-out infinite .4s}

@keyframes recLightIn{from{opacity:0;clip-path:inset(0 100% 0 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}
@keyframes recDot{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes recRed{0%,100%{filter:brightness(1)}50%{filter:brightness(1.22)}}
@media (prefers-reduced-motion:reduce){
  .rec-light,.rec-dot,.rec-timer[data-light="red"] .rec-light{animation:none}
}

/* ---- the prompt, kept legible while speaking ---- */
/* The topic is the thing being answered, so it outranks the chrome around it;
   the word of the day sits under it as a quieter reminder. Both are capped in
   width so a long prompt wraps into a readable column rather than a full-bleed
   line, and both stay clear of the waveform below. */
.rec-topic{max-width:34ch;margin:14px auto 0;font-family:var(--dis);font-style:italic;
  font-weight:600;font-size:19px;line-height:1.35;color:var(--ocean-deep);text-wrap:balance}
.rec-wotd{display:inline-flex;align-items:baseline;gap:7px;margin:9px auto 0;
  padding:5px 12px;border-radius:999px;background:rgba(255,255,255,.42);
  -webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.55)}
.rec-wotd span{font-family:var(--bod);font-weight:800;font-size:9.5px;letter-spacing:.13em;
  text-transform:uppercase;opacity:.6;color:var(--ocean-deep)}
.rec-wotd b{font-family:var(--bod);font-weight:800;font-size:13.5px;color:var(--ocean-deep)}
@media (max-width:380px){
  .rec-topic{font-size:17px;margin-top:11px}
}

@keyframes recBarPulse{0%,100%{opacity:.85}50%{opacity:1}}
@keyframes recDotPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.18);opacity:.7}}
@keyframes recButtonRing{0%{box-shadow:0 0 0 0 rgba(255,255,255,.55)}100%{box-shadow:0 0 0 22px rgba(255,255,255,0)}}
.rec-bar{width:5px;border-radius:99px;background:#FBF8F1;min-height:6px;transition:height .09s linear;box-shadow:0 0 6px rgba(255,255,255,.5)}
.rec-bar.idle{animation:recBarPulse 1.8s ease-in-out infinite}
.rec-dot{animation:recDotPulse 1.3s ease-in-out infinite}
.rec-stopbtn{animation:recButtonRing 2.2s ease-out infinite}
@media (prefers-reduced-motion: reduce){.rec-bar,.rec-dot,.rec-stopbtn{animation:none}}
`;
