/* ============================================================================
   YAP — custom content store and word progression
   Colleges, clubs and individuals bring their own topics and words. Anything
   added here flows through the identical engine the built-in content uses.
   Also holds word-of-the-day selection, usage checking and stage progression.
   Extracted verbatim from app/YapApp.jsx.
   ========================================================================== */

import { VOCAB } from "./content";
import { segment, esc } from "./analysis";

export const STORE_KEY = "yap_library_v1";
export const memStore = { data: null };

export function loadLibrary() {
  if (memStore.data) return memStore.data;
  let saved = null;
  try { saved = JSON.parse(window.localStorage.getItem(STORE_KEY) || "null"); } catch (e) { saved = null; }
  memStore.data = saved && saved.topics ? saved : { topics: [], words: [], packs: [] };
  return memStore.data;
}

/* ---------------- did they actually USE the word? ------------------------
   Detection is not usage. "The word ostensible means fake" mentions it;
   "the ostensible reason was scale" uses it. These checks separate the two
   before any model is consulted, so the judgement holds with no API key. */

export const INFLECTIONS = (w) => {
  const b = w.toLowerCase();
  const forms = new Set([b]);
  const stem = b.replace(/(e|y)$/, "");
  [b + "s", b + "es", b + "d", b + "ed", b + "ing", stem + "ed", stem + "ing", stem + "ies",
   stem + "y", b + "ly", b + "ness", b + "ity", b + "ment", b + "ally"].forEach((f) => forms.add(f));
  if (b.endsWith("e")) forms.add(b.slice(0, -1) + "ing");
  if (b.endsWith("y")) forms.add(b.slice(0, -1) + "ies");
  return [...forms];
};

/* Phrases that mean the speaker is talking *about* the word, not with it. */
export const MENTION_PATTERNS = [
  (w) => new RegExp(`\\b(the\\s+)?word\\s+["']?${w}`, "i"),
  (w) => new RegExp(`\\b${w}\\s+means\\b`, "i"),
  (w) => new RegExp(`\\bmeaning\\s+of\\s+["']?${w}`, "i"),
  (w) => new RegExp(`\\b${w}\\s+is\\s+(a|an)\\s+(word|adjective|noun|verb|adverb)\\b`, "i"),
  (w) => new RegExp(`\\btoday'?s?\\s+word\\s+(is\\s+)?["']?${w}`, "i"),
  (w) => new RegExp(`\\bthe\\s+word\\s+of\\s+the\\s+day`, "i"),
  (w) => new RegExp(`\\bi\\s+(will|would|am going to|have to)\\s+use\\s+["']?${w}`, "i"),
  (w) => new RegExp(`\\bhow\\s+to\\s+use\\s+["']?${w}`, "i"),
];

export function checkWordUsage(word, text) {
  const clean = (text || "").trim();
  const low = clean.toLowerCase();
  const forms = INFLECTIONS(word);
  // \b is ASCII-only, so it fails against an Indic neighbour. Fall back to a
  // lookaround on Latin letters, which works when the word sits inside a
  // Devanagari or Tamil sentence — the common case for a word of the day.
  const hasForm = (f) => new RegExp("\\b" + esc(f) + "\\b", "i").test(low)
    || new RegExp("(?:^|[^a-z])" + esc(f) + "(?:[^a-z]|$)", "i").test(low);
  const hit = forms.find(hasForm);

  if (!hit) {
    return { used: false, natural: false, mention: false, form: null,
      reason: `You didn't say “${word}” at all — not in any form.` };
  }

  const mention = MENTION_PATTERNS.some((mk) => mk(esc(word.toLowerCase())).test(low));

  // Position in the sentence doesn't matter — a word can open a clause. What
  // matters is whether there's a real sentence around it at all.
  const toks = words0(clean);
  const isolated = toks.length < 5;

  // The clause it lives in should be a sentence, not a definition read aloud.
  const unit = segment(clean).find((u) => new RegExp("\\b" + esc(hit) + "\\b", "i").test(u)) || clean;
  const unitWords = (unit.match(/\S+/g) || []).length;
  // hasVerb() only knows English verbs. In another language, a clause of a
  // reasonable length around the word is the honest test we can actually make.
  const nonEnglishClause = INDIC_RANGE.test(unit) ||
    (typeof langProfile === "function" && !langProfile(unit, spokenLangCode()).englishDominant);
  const clauseOk = unitWords >= (nonEnglishClause ? 5 : 6) && (nonEnglishClause || hasVerb(unit));

  if (mention) {
    return { used: true, natural: false, mention: true, form: hit, unit,
      reason: `You named the word rather than using it. “${unit.trim()}” talks about “${word}”; a sentence that uses it wouldn't need to mention the word itself.` };
  }
  if (isolated || !clauseOk) {
    return { used: true, natural: false, mention: false, form: hit, unit,
      reason: `“${word}” appeared, but not inside a working sentence — “${unit.trim()}”. Build a full clause around it: subject, verb, and the word doing a job.` };
  }
  return { used: true, natural: true, mention: false, form: hit, unit,
    reason: `Used inside a real sentence — “${unit.trim()}”.` };
}

/* Local grammatical sanity for the clause the word appeared in. */
export function usageGrammar(word, unit) {
  return checkGrammar(unit || "").filter((g) => g.kind === "grammar");
}

/* WORD_JUDGE_SYS moved to lib/yap/tasks.js (server-only) with the other
   evaluator prompts — see the note there. */

/* ------------------------------- HELPERS --------------------------------- */

export const pick = (a) => a[Math.floor(Math.random() * a.length)];

/* A short mechanical click, like a pawl catching a notch on a spin wheel.
   Synthesised rather than a sound file, so a topic-spin never waits on an
   asset to load and stays silent by default if audio is blocked. */
let spinAudioCtx = null;
export function spinTick() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!spinAudioCtx) spinAudioCtx = new AC();
    const ctx = spinAudioCtx;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const now = ctx.currentTime;

    const dur = 0.045;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);

    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const click = ctx.createBiquadFilter();
    click.type = "bandpass"; click.frequency.value = 2600; click.Q.value = 5;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(click).connect(gain).connect(ctx.destination);
    noise.start(now); noise.stop(now + dur);
  } catch (e) { /* a click is a bonus, never a blocker */ }
}

export const STAGES = [
  { at: 0, name: "Guest", note: "You haven't spoken yet." },
  { at: 1, name: "Member", note: "First meeting done." },
  { at: 3, name: "Regular", note: "It's becoming a habit." },
  { at: 6, name: "Club veteran", note: "You've stopped dreading the mic." },
  { at: 10, name: "Table Topics master", note: "People can hear the difference." },
  { at: 18, name: "Distinguished", note: "You speak like someone who practises." },
];
export const stageFor = (n) => STAGES.slice().reverse().find((s) => n >= s.at) || STAGES[0];

/* Word of the Day is stable for a calendar day — same word all session. */
export function wordOfTheDay(custom) {
  const deck = [...(custom || []), ...VOCAB];
  const d = new Date();
  const seed = d.getFullYear() * 1000 + d.getMonth() * 40 + d.getDate();
  return deck[seed % deck.length];
}

/* Loose stem match, so "nuanced" and "nuances" both count for "nuance" — a
   speaker who inflected the word correctly did use it, and being told
   otherwise would read as a bug. */
export function usedWord(word, text) {
  if (!word || !text) return false;
  const w = String(word).toLowerCase().replace(/[^a-z]/g, "");
  if (w.length < 3) return false;
  const stem = w.length > 5 ? w.slice(0, Math.max(4, w.length - 3)) : w.replace(/e$/, "");
  return new RegExp("\\b" + stem, "i").test(text);
}
