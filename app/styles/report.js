/* YAP — report styles. Extracted verbatim from app/YapApp.jsx.
   Kept as a JS template literal so the <style> injection is byte-identical. */

export const RPT_CSS = `
/* the single most useful line on any card: what to change next time */
.fixit{display:flex;gap:12px;align-items:flex-start;margin-top:16px;padding:14px 15px;border-radius:18px;
  background:linear-gradient(140deg,rgba(242,193,78,.20),rgba(242,193,78,.07));
  border:1px solid rgba(242,193,78,.55)}
.fixit-ico{flex:none;width:28px;height:28px;border-radius:9px;display:grid;place-items:center;
  background:#F2C14E;color:#5B4212;font-weight:800;font-size:14px}
.fixit b{display:block;font-family:var(--bod);font-weight:800;font-size:10.5px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--ink3);margin-bottom:4px}
.fixit p{margin:0;font-size:14.5px;line-height:1.6;color:var(--ink)}

/* headline numbers, read before any sentence is */
.statstrip{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:2px;margin:2px 0 14px;
  border-radius:16px;overflow:hidden;background:rgba(31,79,91,.07)}
.statstrip > div{background:rgba(255,255,255,.72);padding:12px 8px;text-align:center}
.statstrip b{display:block;font-family:var(--dis);font-optical-sizing:auto;font-variation-settings:"SOFT" 12,"WONK" 1;font-weight:800;font-size:23px;line-height:1;
  color:var(--ink);font-variant-numeric:tabular-nums}
.statstrip b.ok{color:#4E9E6A} .statstrip b.warn{color:#C99A4B} .statstrip b.bad{color:#E8674A}
.statstrip span{display:block;margin-top:5px;font-size:9.5px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:var(--ink3)}

/* where the speech actually sat against green / amber / red */
.tl{position:relative;height:38px;margin:6px 0 4px}
.tl-track{position:absolute;inset:14px 0 auto;height:10px;border-radius:999px;overflow:hidden;display:flex}
.tl-track i{height:100%}
.tl-you{position:absolute;top:6px;width:3px;height:26px;border-radius:2px;background:var(--ink);
  box-shadow:0 0 0 3px rgba(255,255,255,.9)}
.tl-you::after{content:attr(data-at);position:absolute;top:-16px;left:50%;transform:translateX(-50%);
  font-family:var(--bod);font-weight:800;font-size:10.5px;color:var(--ink);white-space:nowrap}
.tl-keys{display:flex;justify-content:space-between;margin-top:2px;font-size:9.5px;font-weight:700;
  letter-spacing:.08em;text-transform:uppercase;color:var(--ink3)}

/* a word tally that shows relative weight, not just counts */
.wbars{margin-top:10px}
.wbar{display:flex;align-items:center;gap:10px;margin-bottom:7px}
.wbar span:first-child{flex:0 0 96px;font-size:13px;font-weight:700;color:var(--ink);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wbar-t{flex:1;height:8px;border-radius:999px;background:rgba(31,79,91,.09);overflow:hidden}
.wbar-t i{display:block;height:100%;border-radius:999px;background:var(--wb,#E8674A)}
.wbar b{flex:none;font-size:12.5px;font-variant-numeric:tabular-nums;color:var(--ink2);min-width:22px;text-align:right}
`;
