/* YAP — wotd styles. Extracted verbatim from app/YapApp.jsx.
   Kept as a JS template literal so the <style> injection is byte-identical. */

export const WOTD_CSS = `
.wotd-word{display:flex;align-items:baseline;gap:9px;margin-top:4px}
.wotd-word b{font-family:var(--dis);font-weight:800;font-size:26px;letter-spacing:-.01em;color:var(--ink)}
.wotd-word span{font-family:var(--bod);font-weight:700;font-size:11px;letter-spacing:.1em;
  text-transform:uppercase;color:var(--ink3)}
.wotd-def{font-size:15px;line-height:1.6;color:var(--ink2);margin:6px 0 0}
.wotd-eg{font-family:var(--dis);font-weight:600;font-size:17px;line-height:1.55;color:var(--ink);
  margin:8px 0 0;padding-left:14px;border-left:3px solid var(--ocean)}
.wotd-note{font-size:13.5px;line-height:1.6;color:var(--ink3);margin:12px 0 0}
.wotd-note.ok{color:var(--ink2)}
.wotd-note b{color:var(--ink);font-weight:700}
`;
