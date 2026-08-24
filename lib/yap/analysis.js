/* ============================================================================
   YAP — analysis engine
   Speech scoring: fillers, grammar, register, vagueness, repetition,
   conciseness, segmentation and the role reports built on top of them.
   Pure functions: no React, no DOM beyond localStorage in spokenLangCode.
   Extracted verbatim from app/YapApp.jsx.
   ========================================================================== */

import {
  COMMON, BASIC, ACADEMIC, HEDGES, HARD_FILLERS, SOFT_FILLERS, AH_SOUNDS,
  STANCE, CONNECT, CLOSERS,
} from "./content";

export function spokenLangCode() {
  try {
    const raw = window.localStorage.getItem("yap:micLang");
    return raw ? String(JSON.parse(raw)) : "en-IN";
  } catch (e) { return "en-IN"; }
}

export const INDIC_RANGE = /[\u0900-\u0DFF]/;

/* A token counts as real if it's English *or* written in an Indian script *or*
   a romanised Indic word people actually use. Before this, "बिल्कुल" and
   "bilkul" were both scored as invented words. */
export function isRealWord(w) {
  if (INDIC_RANGE.test(w)) return true;
  if (typeof ROMAN_INDIC !== "undefined" && ROMAN_INDIC.has(w)) return true;
  return looksEnglish(w);
}

export function looksEnglish(w) {
  if (COMMON.has(w)) return true;
  if (w.length <= 2) return true;
  if (!/[aeiouy]/.test(w)) return false;
  if (/[bcdfghjklmnpqrstvwxz]{4,}/.test(w)) return false;
  if ((w.match(/[aeiouy]/g) || []).length / w.length < 0.18) return false;
  if (/(.)\1\1/.test(w)) return false;
  return true;
}

/* Was [a-z'] only, which silently deleted every Indic word before counting.
   Word counts, WPM and variety were therefore all wrong for those speakers. */
/* \p{L} alone splits Devanagari at its matras, which are combining marks, so
   a word like "बिल्कुल" would count as three. \p{M} keeps them attached. */
export const words0 = (t) => (t.toLowerCase().match(/[\p{L}\p{M}']+/gu) || []);
export const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* -- context-aware filler detection ------------------------------------- */
/* "I like this" is not a filler. "it's, like, hard" is. The old version
   counted both, which is why the numbers were wrong. */

export const LIKE_VERB_BEFORE = new Set(["i", "we", "you", "they", "he", "she", "it", "people", "everyone", "really", "would", "do", "does", "did", "don't", "doesn't", "didn't", "much", "not", "also", "students"]);
export const LIKE_NOUNISH_AFTER = new Set(["this", "that", "it", "them", "him", "her", "us", "me", "you", "to", "a", "an", "the", "my", "your", "our", "their", "his", "any", "some", "what", "how"]);

export function findFillers(text, lang) {
  const toks = words0(text);
  // a speaker's crutch words are in their own language: "matlab" is "like"
  const extra = (typeof FILLERS_BY_LANG !== "undefined" && lang && FILLERS_BY_LANG[lang])
    ? FILLERS_BY_LANG[lang]
    : (typeof ALL_INDIC_FILLERS !== "undefined" ? ALL_INDIC_FILLERS : []);
  // words that are only a filler when they're part of a hesitation cluster —
  // see the comment on AMBIGUOUS_FILLERS_BY_LANG for why these can't be
  // matched unconditionally the way "matlab" or "arre" can.
  const ambiguous = (typeof AMBIGUOUS_FILLERS_BY_LANG !== "undefined" && lang && AMBIGUOUS_FILLERS_BY_LANG[lang])
    ? AMBIGUOUS_FILLERS_BY_LANG[lang]
    : (typeof ALL_AMBIGUOUS_INDIC !== "undefined" ? ALL_AMBIGUOUS_INDIC : []);
  const isFillerish = (x) => !!x && (HARD_FILLERS.includes(x) || extra.includes(x) || ambiguous.includes(x) || SOFT_FILLERS.includes(x));
  const found = [];

  const add = (kind, phrase, i, len) => {
    const from = Math.max(0, i - 3), to = Math.min(toks.length, i + len + 3);
    found.push({ kind, phrase, index: i, context: toks.slice(from, to).join(" ") });
  };

  // multi-word phrases first
  const multi = [
    ...HARD_FILLERS.filter((f) => f.includes(" ")).map((f) => ({ f, kind: "filler" })),
    ...extra.filter((f) => f.includes(" ")).map((f) => ({ f, kind: "filler" })),
    ...HEDGES.map((f) => ({ f, kind: "hedge" })),
  ];
  const taken = new Set();
  multi.forEach(({ f, kind }) => {
    const parts = f.split(" ");
    for (let i = 0; i + parts.length <= toks.length; i++) {
      if (parts.every((p, k) => toks[i + k] === p) && !taken.has(i)) {
        for (let k = 0; k < parts.length; k++) taken.add(i + k);
        add(kind, f, i, parts.length);
      }
    }
  });

  toks.forEach((w, i) => {
    if (taken.has(i)) return;
    const prev = toks[i - 1], next = toks[i + 1];

    // "toh" also chains an "agar" ("if") clause as a real conjunction —
    // "agar tum aaoge toh main khush hounga" isn't hesitation, it's grammar.
    if (w === "toh" && lang === "hi-IN") {
      const back = toks.slice(Math.max(0, i - 12), i);
      if (back.some((t) => t === "agar" || t === "yadi" || t === "अगर" || t === "यदि")) return;
      add("filler", w, i, 1); return;
    }

    if (HARD_FILLERS.includes(w) || extra.includes(w)) { add("filler", w, i, 1); return; }

    // an ambiguous particle ("accha" = good/I-see, "haan" = yes, "sari" = okay)
    // only counts once it's next to another filler-type word — the shape of an
    // actual hesitation cluster, not a sentence that happens to use the word.
    if (ambiguous.includes(w)) {
      if (isFillerish(prev) || isFillerish(next)) { add("filler", w, i, 1); }
      return;
    }

    if (!SOFT_FILLERS.includes(w)) return;

    // Each soft word is only a filler in the right position.
    if (w === "like") {
      if (prev && LIKE_VERB_BEFORE.has(prev)) return;       // "people like this"
      if (next && LIKE_NOUNISH_AFTER.has(next)) return;      // "like a wolf", "like this"
      add("filler", "like", i, 1); return;
    }
    if (w === "so" || w === "well" || w === "okay" || w === "yeah") {
      if (i === 0) { add("filler", w, i, 1); return; }        // sentence-opening crutch
      if (w === "so" && next && ["i", "we", "the", "that", "it", "you"].includes(next) && i > 0) {
        add("filler", "so", i, 1); return;                   // "so I think... so we..."
      }
      return;
    }
    if (w === "right" || w === "na") {
      if (!next) { add("filler", w, i, 1); return; }          // tag question at the end
      return;
    }
    if (w === "just") {
      if (next && ["a", "the", "one", "want", "wanted", "think"].includes(next)) { add("hedge", "just", i, 1); }
      return;
    }
    // actually / basically / literally are crutches wherever they land
    add("crutch", w, i, 1);
  });

  return found.sort((a, b) => a.index - b.index);
}

/* -- grammar rules: run locally, no API needed -------------------------- */

export const RULES = [
  { re: /\bdiscuss(ed|ing)?\s+about\b/gi, fix: (m) => m.replace(/\s+about\b/i, ""), why: "“Discuss” already means talk about.", kind: "grammar" },
  { re: /\brevert\s+back\b/gi, fix: () => "revert", why: "“Revert” already means go back.", kind: "grammar" },
  { re: /\breturn\s+back\b/gi, fix: () => "return", why: "“Back” is doing no work here.", kind: "grammar" },
  { re: /\brepeat\s+again\b/gi, fix: () => "repeat", why: "Repeating is already doing it again.", kind: "grammar" },
  { re: /\bcope\s+up\s+with\b/gi, fix: () => "cope with", why: "It's “cope with”, no “up”.", kind: "grammar" },
  { re: /\bgood\s+in\s+(?=[a-z])/gi, fix: () => "good at ", why: "You're good *at* something.", kind: "grammar" },
  { re: /\bmarried\s+with\b/gi, fix: () => "married to", why: "Married *to* a person.", kind: "grammar" },
  { re: /\b(informations|advices|equipments|furnitures|feedbacks|softwares|luggages)\b/gi, fix: (m) => m.slice(0, -1), why: "This noun has no plural form.", kind: "grammar" },
  { re: /\b(peoples|childrens|womens|mens)\b/gi, fix: (m) => m.slice(0, -1), why: "Already plural.", kind: "grammar" },
  { re: /\bmore\s+(better|worse|easier|faster|higher|lower|bigger)\b/gi, fix: (m) => m.replace(/more\s+/i, ""), why: "Don't stack two comparatives.", kind: "grammar" },
  { re: /\bmost\s+(easiest|best|worst|biggest|highest)\b/gi, fix: (m) => m.replace(/most\s+/i, "the "), why: "Already a superlative.", kind: "grammar" },
  { re: /\b(didn't|doesn't|don't|did\s+not)\s+(went|came|took|gave|made|said|got|saw|knew|thought)\b/gi, fix: (m) => m.replace(/(went|came|took|gave|made|said|got|saw|knew|thought)$/i, (v) => ({ went: "go", came: "come", took: "take", gave: "give", made: "make", said: "say", got: "get", saw: "see", knew: "know", thought: "think" }[v.toLowerCase()])), why: "After “didn't”, use the base verb.", kind: "grammar" },
  { re: /\b(he|she|it)\s+don't\b/gi, fix: (m) => m.replace(/don't/i, "doesn't"), why: "He/she/it takes “doesn't”.", kind: "grammar" },
  { re: /\b(they|we|you)\s+was\b/gi, fix: (m) => m.replace(/was/i, "were"), why: "Plural subject takes “were”.", kind: "grammar" },
  { re: /\bthere\s+is\s+(many|several|lots\s+of|a\s+lot\s+of|two|three|four|five)\b/gi, fix: (m) => m.replace(/there\s+is/i, "there are"), why: "Plural subject needs “there are”.", kind: "grammar" },
  { re: /\bsince\s+(\d+|two|three|four|five|ten)\s+(years|months|days|hours)\b/gi, fix: (m) => m.replace(/since/i, "for"), why: "“Since” takes a point in time, “for” takes a duration.", kind: "grammar" },
  { re: /\bmyself\s+[A-Z][a-z]+/g, fix: (m) => "I'm " + m.split(/\s+/)[1], why: "Introduce yourself with “I'm”.", kind: "grammar" },
  { re: /\bless\s+(people|students|jobs|companies|opportunities|options)\b/gi, fix: (m) => m.replace(/less/i, "fewer"), why: "“Fewer” for things you can count.", kind: "grammar" },
  { re: /\bdifferent\s+than\b/gi, fix: () => "different from", why: "“Different from” is the safe form.", kind: "grammar" },
  { re: /\b(could|would|should)\s+of\b/gi, fix: (m) => m.replace(/of/i, "have"), why: "It's “have”, not “of”.", kind: "grammar" },
  { re: /\bthe\s+reason\s+is\s+because\b/gi, fix: () => "the reason is that", why: "“Reason” and “because” repeat each other.", kind: "grammar" },
  { re: /\bbetween\s+you\s+and\s+I\b/gi, fix: () => "between you and me", why: "After a preposition, use “me”.", kind: "grammar" },
  { re: /\bvery\s+(unique|perfect|essential)\b/gi, fix: (m) => m.replace(/very\s+/i, ""), why: "It's absolute — no degrees of it.", kind: "grammar" },
  { re: /\banyways\b/gi, fix: () => "anyway", why: "“Anyways” isn't standard in an interview.", kind: "grammar" },
  { re: /\birregardless\b/gi, fix: () => "regardless", why: "Not a word.", kind: "grammar" },
  { re: /\ba\s+(?=[aeiou][a-z]{2,})/gi, fix: () => "an ", why: "Use “an” before a vowel sound.", kind: "grammar" },
  { re: /\ban\s+(?=[bcdfgjklmnpqrstvwxyz][a-z]{2,})/gi, fix: () => "a ", why: "Use “a” before a consonant sound.", kind: "grammar" },
  { re: /\beach\s+of\s+(them|us|the\s+\w+)\s+are\b/gi, fix: (m) => m.replace(/are$/i, "is"), why: "“Each” is singular.", kind: "grammar" },
  { re: /\bone\s+of\s+the\s+(reason|way|thing|problem|factor|issue|point)\b/gi, fix: (m) => m + "s", why: "“One of the…” needs a plural.", kind: "grammar" },
  { re: /\bmuch\s+(people|students|jobs|companies|things|problems)\b/gi, fix: (m) => m.replace(/much/i, "many"), why: "“Many” for countable things.", kind: "grammar" },
  // --- subject-verb agreement ---
  { re: /\b(he|she|it)\s+(go|come|want|need|make|take|think|know|say|work|feel|look|seem|give|get|have)\b(?!\s+to\s+be)/gi, fix: (m) => { const p = m.split(/\s+/); const v = p[1].toLowerCase(); const irr = { have: "has", go: "goes", do: "does" }; return p[0] + " " + (irr[v] || v + "s"); }, why: "He/she/it takes the -s form.", kind: "grammar" },
  { re: /\b(i|we|they|you)\s+(goes|comes|wants|needs|makes|takes|thinks|knows|says|works|has)\b/gi, fix: (m) => { const p = m.split(/\s+/); const v = p[1].toLowerCase(); return p[0] + " " + (v === "has" ? "have" : v.replace(/s$/, "")); }, why: "Plural subject drops the -s.", kind: "grammar" },
  { re: /\b(everyone|everybody|nobody|somebody|someone|each)\s+(are|were|have)\b/gi, fix: (m) => m.replace(/are|were|have/i, (v) => ({ are: "is", were: "was", have: "has" }[v.toLowerCase()])), why: "These are singular.", kind: "grammar" },
  { re: /\bthere\s+was\s+(many|several|lots\s+of|a\s+lot\s+of|two|three|four|five)\b/gi, fix: (m) => m.replace(/there\s+was/i, "there were"), why: "Plural subject needs “there were”.", kind: "grammar" },
  { re: /\bi\s+(are|is)\b/gi, fix: (m) => m.replace(/are|is/i, "am"), why: "It's “I am”.", kind: "grammar" },
  { re: /\b(you|we|they)\s+is\b/gi, fix: (m) => m.replace(/is/i, "are"), why: "Plural subject takes “are”.", kind: "grammar" },
  // --- tense ---
  { re: /\b(have|has)\s+(went|came|did|saw|took|gave|wrote|spoke|broke|chose|drove)\b/gi, fix: (m) => m.replace(/(went|came|did|saw|took|gave|wrote|spoke|broke|chose|drove)$/i, (v) => ({ went: "gone", came: "come", did: "done", saw: "seen", took: "taken", gave: "given", wrote: "written", spoke: "spoken", broke: "broken", chose: "chosen", drove: "driven" }[v.toLowerCase()])), why: "After have/has, use the past participle.", kind: "grammar" },
  { re: /\b(am|is|are)\s+(agree|disagree|belong|know|understand|want|need)\b/gi, fix: (m) => { const p = m.split(/\s+/); return p[1]; }, why: "This verb doesn't take “am/is/are”.", kind: "grammar" },
  { re: /\b(am|is|are)\s+having\s+(a|an|the|two|three|some|many)\b/gi, fix: (m) => m.replace(/(am|is|are)\s+having/i, (x) => (/am/i.test(x) ? "have" : /is/i.test(x) ? "has" : "have")), why: "“Have” for possession, not “having”.", kind: "grammar" },
  { re: /\bwill\s+(went|came|did|saw|took)\b/gi, fix: (m) => m.replace(/(went|came|did|saw|took)$/i, (v) => ({ went: "go", came: "come", did: "do", saw: "see", took: "take" }[v.toLowerCase()])), why: "After “will”, use the base verb.", kind: "grammar" },
  // --- countables and number agreement ---
  { re: /\b(two|three|four|five|six|seven|eight|nine|ten|\d+)\s+(year|month|week|day|hour|minute|rupee|student|person|company|job|time)\b(?!s)/gi, fix: (m) => m + "s", why: "After a number, use the plural.", kind: "grammar" },
  { re: /\bmuch\s+(more\s+)?(?=(people|students|jobs|companies|things|problems|options|reasons))/gi, fix: () => "many ", why: "“Many” for countable things.", kind: "grammar" },
  { re: /\ba\s+(informations?|advice|equipment|furniture|luggage|news|research|homework)\b/gi, fix: (m) => m.replace(/^a\s+/i, "some ").replace(/s$/, ""), why: "Uncountable — no “a”.", kind: "grammar" },
  // --- prepositions ---
  { re: /\bexplain\s+me\b/gi, fix: () => "explain to me", why: "You explain something *to* someone.", kind: "grammar" },
  { re: /\bdiscuss\s+on\b/gi, fix: () => "discuss", why: "“Discuss” takes no preposition.", kind: "grammar" },
  { re: /\bcomprises?\s+of\b/gi, fix: () => "comprises", why: "“Comprise” takes no “of”.", kind: "grammar" },
  { re: /\bemphasi[sz]e\s+on\b/gi, fix: () => "emphasise", why: "You emphasise something, not on it.", kind: "grammar" },
  { re: /\bdepends\s+(?!on|upon)(?=[a-z])/gi, fix: () => "depends on ", why: "It “depends on” something.", kind: "grammar" },
  { re: /\bcapable\s+to\b/gi, fix: () => "capable of", why: "Capable *of* doing.", kind: "grammar" },
  { re: /\binterested\s+about\b/gi, fix: () => "interested in", why: "Interested *in*.", kind: "grammar" },
  { re: /\bconsists\s+(?!of)(?=[a-z])/gi, fix: () => "consists of ", why: "It “consists of”.", kind: "grammar" },
  // --- word confusions that survive transcription ---
  { re: /\bthen\s+(me|him|her|them|us|the\s+other)\b/gi, fix: (m) => m.replace(/^then/i, "than"), why: "Comparison takes “than”.", kind: "grammar" },
  { re: /\b(advice|advise)\s+(me|him|her|them)\s+to\b/gi, fix: (m) => m.replace(/^advice/i, "advise"), why: "“Advise” is the verb.", kind: "grammar" },
  { re: /\bloose\s+(the|a|my|your|their|this)\b/gi, fix: (m) => m.replace(/^loose/i, "lose"), why: "“Lose” is the verb.", kind: "grammar" },
  { re: /\beffect\s+(the|a|my|our|their)\s+/gi, fix: (m) => m.replace(/^effect/i, "affect"), why: "“Affect” is the verb.", kind: "grammar" },
  { re: /\bcan\s+be\s+able\s+to\b/gi, fix: () => "can", why: "“Can” already means able to.", kind: "grammar" },
  { re: /\breturn\s+it\s+back\b/gi, fix: () => "return it", why: "“Back” is redundant.", kind: "grammar" },
  { re: /\bnot\s+(never|nothing|nobody|nowhere)\b/gi, fix: (m) => m.replace(/not\s+/i, "").replace(/never/i, "ever"), why: "Two negatives cancel out.", kind: "grammar" },
  { re: /\bthe\s+both\b/gi, fix: () => "both", why: "No article before “both”.", kind: "grammar" },
  { re: /\baccording\s+to\s+me\b/gi, fix: () => "in my opinion", why: "“According to” is for other sources.", kind: "grammar" },
  { re: /\bas\s+per\s+me\b/gi, fix: () => "in my view", why: "Not idiomatic.", kind: "grammar" },
  { re: /\bsince\s+long\b/gi, fix: () => "for a long time", why: "Not idiomatic.", kind: "grammar" },
  { re: /\b(years?|months?|days?)\s+back\b/gi, fix: (m) => m.replace(/back$/i, "ago"), why: "“Ago” for time past.", kind: "grammar" },
  { re: /\bupdation|upgradation\b/gi, fix: (m) => (/^upd/i.test(m) ? "update" : "upgrade"), why: "Not a standard word.", kind: "grammar" },
  { re: /\bcolleague'?s?\s+of\s+mine\b/gi, fix: () => "a colleague of mine", why: "Fixed phrase.", kind: "grammar" },
  // --- more regional usage ---
  { re: /\btoday\s+(morning|evening|night|afternoon)\b/gi, fix: (m) => "this " + m.split(/\s+/)[1], why: "Indian English. “This morning” elsewhere.", kind: "regional" },
  { re: /\bcousin\s+(brother|sister)\b/gi, fix: () => "cousin", why: "Indian English. Just “cousin” abroad.", kind: "regional" },
  { re: /\bi\s+have\s+a\s+doubt\b/gi, fix: () => "I have a question", why: "“Doubt” means suspicion outside India.", kind: "regional" },
  { re: /\b(give|gave|giving)\s+(an?\s+)?exam\b/gi, fix: (m) => m.replace(/give|gave|giving/i, (v) => ({ give: "take", gave: "took", giving: "taking" }[v.toLowerCase()])), why: "Abroad you take an exam.", kind: "regional" },
  { re: /\bsame\s+to\s+same\b/gi, fix: () => "identical", why: "Indian English.", kind: "regional" },
  { re: /\b(yesterday|tomorrow|now)\s+itself\b/gi, fix: (m) => m.split(/\s+/)[0], why: "The emphatic “itself” is regional.", kind: "regional" },
  { re: /\bclose\s+the\s+(light|fan|tv)\b/gi, fix: (m) => m.replace(/close/i, "turn off"), why: "You turn a light off.", kind: "regional" },
  // regional: correct in India, worth knowing for a global room
  { re: /\bdo\s+the\s+needful\b/gi, fix: () => "please take care of it", why: "Standard in India, opaque to a global panel.", kind: "regional" },
  { re: /\bprepone\b/gi, fix: () => "bring forward", why: "Indian English. Fine here, unknown abroad.", kind: "regional" },
  { re: /\bout\s+of\s+station\b/gi, fix: () => "out of town", why: "Indian English. Fine here, unusual abroad.", kind: "regional" },
  { re: /\bpass\s+out\s+(of|from)\b/gi, fix: () => "graduate from", why: "Abroad, “pass out” means faint.", kind: "regional" },
  { re: /\bkindly\s+(do|note|check|revert|inform)\b/gi, fix: (m) => "please " + m.split(/\s+/)[1], why: "“Kindly” reads formal and dated outside India.", kind: "regional" },
];

export function checkGrammar(text) {
  const out = [];
  const seen = new Set();
  RULES.forEach((r) => {
    const re = new RegExp(r.re.source, r.re.flags);
    let m;
    while ((m = re.exec(text)) !== null) {
      const was = m[0].trim();
      const key = r.kind + "|" + was.toLowerCase();
      if (seen.has(key)) break;
      seen.add(key);
      let now;
      try { now = r.fix(was).trim(); } catch (e) { now = was; }
      if (now.toLowerCase() !== was.toLowerCase()) {
        const s = Math.max(0, m.index - 26), e2 = Math.min(text.length, m.index + was.length + 26);
        out.push({ was, now, why: r.why, kind: r.kind, ctx: (s > 0 ? "…" : "") + text.slice(s, e2).trim() + (e2 < text.length ? "…" : "") });
      }
      if (!re.global) break;
    }
  });
  return out;
}

/* -- words that are not words -------------------------------------------- */
/* A transcript full of invented words was passing the Grammarian silently.
   Anything the sanity check rejects is now reported by name. */
export function findNonWords(text) {
  const toks = words0(text);
  const seen = new Map();
  toks.forEach((w, i) => {
    if (isRealWord(w)) return;   // a word in any supported language is a word
    const from = Math.max(0, i - 3), to = Math.min(toks.length, i + 4);
    if (!seen.has(w)) seen.set(w, { word: w, n: 1, ctx: toks.slice(from, to).join(" ") });
    else seen.get(w).n += 1;
  });
  return [...seen.values()].sort((a, b) => b.n - a.n);
}

/* -- register: fine with friends, wrong in front of a panel --------------- */
export const SLANG = {
  "bro": "a neutral address, or nothing at all", "bruh": "nothing — cut it",
  "dude": "nothing — cut it", "guys": "everyone", "gonna": "going to", "wanna": "want to",
  "gotta": "have to", "kinda": "somewhat", "sorta": "somewhat", "yeah": "yes", "yep": "yes",
  "nah": "no", "ain't": "isn't", "cool": "impressive", "awesome": "impressive",
  "crazy": "striking", "insane": "extreme", "lol": "nothing — cut it", "sus": "questionable",
  "lowkey": "somewhat", "highkey": "clearly", "vibe": "atmosphere", "hella": "very",
  "legit": "genuinely", "chill": "relaxed", "dope": "impressive", "trash": "poor",
  "mad": "very", "bunch of": "several", "tons of": "a great deal of", "stuff like that": "and so on",
};
export function findRegister(text) {
  const low = " " + text.toLowerCase().replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ") + " ";
  const out = [];
  Object.keys(SLANG).forEach((w) => {
    const n = (low.match(new RegExp("\\b" + esc(w) + "\\b", "g")) || []).length;
    if (n) out.push({ was: w, now: SLANG[w], n, why: "Too casual for a panel.", kind: "register" });
  });
  return out.sort((a, b) => b.n - a.n);
}

/* -- vagueness: words that stand in for a thought ------------------------- */
export const VAGUE = ["thing", "things", "stuff", "something", "somehow", "somewhere", "whatever",
  "and all", "and so on", "or whatever", "that kind of thing", "you get it", "some kind of",
  "anything like that", "et cetera", "and everything"];
export function findVagueness(text) {
  const low = " " + text.toLowerCase().replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ") + " ";
  const out = [];
  VAGUE.forEach((w) => {
    const n = (low.match(new RegExp("\\b" + esc(w) + "\\b", "g")) || []).length;
    if (n) out.push({ word: w, n });
  });
  return out.sort((a, b) => b.n - a.n);
}

/* -- leaning on the same word -------------------------------------------- */
export const STOPW = new Set(("the a an and or but is are was were to of in on it that this i you we they he she be been being am do does did have has had for with as at so not no if then there their its my your our his her me him them what which who when where how can will would could should may might must very just also more most much many some any all each every other another same such than then now here").split(" "));
export function findRepetition(text) {
  const toks = words0(text).filter((w) => w.length > 3 && !STOPW.has(w));
  const freq = {};
  toks.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  return Object.entries(freq).filter(([, n]) => n >= 3).sort((a, b) => b[1] - a[1]).map(([word, n]) => ({ word, n }));
}

/* -- stumbles: doubled words and restarts -------------------------------- */

// Words that are fine said twice on purpose ("no no", "very very tired") —
// shared with segmentSpeech's own repeat check below, so the two don't drift.
export const STUMBLE_OK_REPEAT = new Set(["that", "had", "very", "no", "ha"]);

export function findStumbles(text) {
  const toks = words0(text);
  const out = [];
  for (let i = 1; i < toks.length; i++) {
    if (toks[i] === toks[i - 1] && !STUMBLE_OK_REPEAT.has(toks[i])) {
      out.push({ phrase: toks[i] + " " + toks[i], at: i });
    }
  }
  return out;
}

/* -- segment spontaneous, multilingual speech into units ------------------ */
/* Thin wrapper kept for every existing call site: segmentSpeech (defined
   further down, once the discourse-marker sets it needs exist) does the
   actual boundary reasoning and returns classified units; this just hands
   back the plain text of each one, exactly as before, so nothing downstream
   has to change shape. */
export function segment(text) {
  const rich = (typeof segmentSpeech === "function") ? segmentSpeech(text) : null;
  if (rich && rich.length) return rich.map((u) => u.text);
  const t = (text || "").trim();
  return t ? [t] : [];
}

/* ==========================================================================
   CONCISENESS & CLARITY
   Every rewrite here is surgical — words are deleted or swapped, never
   regenerated — so the speaker's own phrasing, level and personality survive.
   ========================================================================== */

/* Words that carry no meaning of their own in speech. Deleting them never
   changes what was said. */
export const EMPTY_WORDS = ["very", "really", "quite", "rather", "somewhat", "fairly", "pretty much",
  "actually", "basically", "literally", "definitely", "certainly", "absolutely", "totally",
  "completely", "simply", "just", "even", "only really", "so much", "kind of", "sort of",
  "a little bit", "in a way", "to be honest", "honestly", "personally", "obviously",
  "at the end of the day", "needless to say", "as a matter of fact", "it goes without saying",
  "for all intents and purposes", "when it comes to", "as far as i'm concerned"];

/* Long phrases with a one-word equivalent. */
export const WORDY = [
  ["due to the fact that", "because"], ["owing to the fact that", "because"],
  ["in spite of the fact that", "although"], ["despite the fact that", "although"],
  ["in the event that", "if"], ["in the case that", "if"], ["on the condition that", "if"],
  ["for the purpose of", "to"], ["in order to", "to"], ["with a view to", "to"],
  ["at this point in time", "now"], ["at the present time", "now"], ["in this day and age", "today"],
  ["a large number of", "many"], ["a small number of", "a few"], ["a majority of", "most"],
  ["the vast majority of", "most"], ["a great deal of", "much"],
  ["in the near future", "soon"], ["at an early date", "soon"],
  ["with regard to", "about"], ["with respect to", "about"], ["in relation to", "about"],
  ["in terms of", "in"], ["in the field of", "in"], ["in the area of", "in"],
  ["it is important to note that", ""], ["it should be noted that", ""],
  ["the fact of the matter is that", ""], ["what i want to say is that", ""],
  ["the reason why is because", "because"], ["the thing is that", ""],
  ["make a decision", "decide"], ["take into consideration", "consider"],
  ["come to the conclusion", "conclude"], ["give consideration to", "consider"],
  ["have an impact on", "affect"], ["is able to", "can"], ["are able to", "can"],
  ["has the ability to", "can"], ["in the absence of", "without"],
  ["prior to", "before"], ["subsequent to", "after"], ["in close proximity to", "near"],
  ["a number of", "several"], ["there is no doubt that", ""], ["it seems to me that", ""],
];

/* Saying the same thing twice inside one phrase. */
export const REDUNDANT = [
  ["each and every", "every"], ["first and foremost", "first"], ["one and only", "only"],
  ["past history", "history"], ["past experience", "experience"], ["future plans", "plans"],
  ["end result", "result"], ["final outcome", "outcome"], ["basic fundamentals", "fundamentals"],
  ["advance planning", "planning"], ["free gift", "gift"], ["new innovation", "innovation"],
  ["true fact", "fact"], ["personal opinion", "opinion"], ["absolutely essential", "essential"],
  ["completely eliminate", "eliminate"], ["totally destroyed", "destroyed"],
  ["join together", "join"], ["merge together", "merge"], ["combine together", "combine"],
  ["small in size", "small"], ["large in size", "large"], ["round in shape", "round"],
  ["period of time", "period"], ["time period", "period"], ["sum total", "total"],
  ["close proximity", "proximity"], ["unexpected surprise", "surprise"],
  ["added bonus", "bonus"], ["general consensus", "consensus"], ["exact same", "same"],
  ["ask a question", "ask"], ["brief summary", "summary"], ["mutual cooperation", "cooperation"],
];

export function findEmptyWords(text) {
  const low = " " + text.toLowerCase().replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ") + " ";
  const out = [];
  EMPTY_WORDS.forEach((w) => {
    const n = (low.match(new RegExp("\\b" + esc(w) + "\\b", "g")) || []).length;
    if (n) out.push({ phrase: w, n });
  });
  return out.sort((a, b) => b.n - a.n);
}

export function findWordy(text) {
  const out = [];
  const low = text.toLowerCase();
  WORDY.forEach(([long, short]) => {
    const n = (low.match(new RegExp("\\b" + esc(long) + "\\b", "g")) || []).length;
    if (n) out.push({ was: long, now: short, n, kind: "wordy" });
  });
  REDUNDANT.forEach(([long, short]) => {
    const n = (low.match(new RegExp("\\b" + esc(long) + "\\b", "g")) || []).length;
    if (n) out.push({ was: long, now: short, n, kind: "redundant" });
  });
  return out.sort((a, b) => b.n - a.n);
}

/* Repeated ideas, not just repeated words: the same two-word pairing coming
   back is usually a speaker circling, and the emphasis case (back-to-back,
   or in the opening and the close) is deliberately excluded. */
export function findRepeatedIdeas(text) {
  const toks = words0(text).filter((w) => !STOPW.has(w) && w.length > 3);
  const grams = {};
  for (let i = 0; i < toks.length - 1; i++) {
    const g = toks[i] + " " + toks[i + 1];
    (grams[g] = grams[g] || []).push(i);
  }
  return Object.entries(grams)
    .filter(([, at]) => at.length >= 2)
    .map(([phrase, at]) => {
      const spread = at[at.length - 1] - at[0];
      const emphasis = spread <= 3;                    // said twice in a row = emphasis
      return { phrase, n: at.length, spread, emphasis };
    })
    .filter((x) => !x.emphasis)
    .sort((a, b) => b.n - a.n);
}

/* Sentences a listener can't hold in their head. Clause-joins used to be
   counted from an English-only word list, so this never fired on a long
   Tamil or Hindi answer even when it genuinely rambled. SUBORD_ANY/COORD_ANY
   (defined with the segmentation engine below) cover the same role across
   every supported language, so this counts real joins wherever they're said. */
export function findLongSentences(units) {
  const markers = (typeof SUBORD_ANY !== "undefined" && typeof COORD_ANY !== "undefined")
    ? SUBORD_ANY.concat(COORD_ANY)
    : [/\b(and|but|so|because|which|that|when|while|although|however|then)\b/i];
  return units.map((u, i) => {
    const w = (u.match(/\S+/g) || []).length;
    const clauses = markers.reduce((n, re) =>
      n + (u.match(new RegExp(re.source, "gi")) || []).length, 0);
    return { i, text: u, words: w, clauses };
  }).filter((u) => u.words >= 30 || u.clauses >= 5)
    .sort((a, b) => b.words - a.words);
}

/* Sentences that never resolve: no verb, or so many joins the thread is lost. */
/* "thing", "morning" and "everything" all end in -ing, so a bare -ing test
   finds verbs that aren't there. This checks properly. */
export const AUX = /\b(is|are|was|were|am|be|been|being|have|has|had|do|does|did|can|could|will|would|shall|should|may|might|must|need to|going to)\b/i;
export const VERB_LIST = /\b(set|sets|cites|cite|cited|put|puts|cut|cuts|hit|hits|cost|costs|let|lets|shut|read|reads|beat|beats|split|spread|quit|bet|shed|burst|cast|casts|means|meant|kept|keeps|left|leaves|sent|sends|spent|spends|built|builds|held|holds|told|tells|sold|sells|lost|loses|felt|feels|met|meets|paid|pays|said|says|led|leads|fed|feeds|drew|draws|grew|grows|knew|knows|threw|throws|flew|flies|rose|rises|chose|chooses|arose|bore|bears|wore|wears|tore|tears|swore|stood|stands|understood|withdrew|need|needs|needed|want|wants|wanted|like|likes|liked|love|loves|hate|hates|cost|costs|lack|lacks|face|faces|hold|holds|think|thinks|thought|believe|believes|say|says|said|make|makes|made|take|takes|took|go|goes|went|get|gets|got|know|knows|knew|see|sees|saw|feel|feels|felt|give|gives|gave|come|comes|came|use|uses|used|find|finds|found|work|works|worked|mean|means|meant|happen|happens|happened|become|becomes|became|seem|seems|seemed|show|shows|showed|start|starts|started|keep|keeps|kept|put|puts|bring|brings|brought|hold|holds|held|turn|turns|turned|call|calls|called|try|tries|tried|ask|asks|asked|move|moves|moved|live|lives|lived|run|runs|ran|play|plays|played|pay|pays|paid|help|helps|helped|talk|talks|talked|write|writes|wrote|read|reads|build|builds|built|create|creates|created|change|changes|changed|learn|learns|learned|lead|leads|led|watch|watches|watched|follow|follows|followed|stop|stops|stopped|allow|allows|allowed|add|adds|added|spend|spends|spent|grow|grows|grew|open|opens|opened|win|wins|won|offer|offers|offered|remember|remembers|consider|considers|wait|waits|expect|expects|stay|stays|fall|falls|fell|cut|cuts|reach|reaches|remain|remains|suggest|suggests|raise|raises|pass|passes|sell|sells|require|requires|report|reports|decide|decides|decided|support|supports|supported|argue|argues|argued|improve|improves|improved|reduce|reduces|affect|affects|matter|matters|depend|depends|hire|hires|hired|replace|replaces|solve|solves|explain|explains|prove|proves|agree|agrees|disagree)\b/i;
export const ING_NOUNS = new Set(["thing", "things", "something", "anything", "everything", "nothing",
  "morning", "evening", "meaning", "building", "feeling", "beginning", "ceiling", "king", "ring",
  "during", "spring", "string", "wedding", "training", "meeting", "warning", "opening", "ending"]);

export function hasVerb(sentence) {
  if (AUX.test(sentence) || VERB_LIST.test(sentence)) return true;
  const toks = words0(sentence);
  // an -ing word only counts as a verb if it isn't one of the common -ing nouns
  if (toks.some((w) => /ing$/.test(w) && w.length > 4 && !ING_NOUNS.has(w))) return true;
  // a past-tense -ed word, excluding adjectives that end the same way
  if (toks.some((w) => /ed$/.test(w) && w.length > 4 && !/^(tired|bored|interested|excited|worried|surprised|confused|pleased|scared|involved|related|supposed|advanced|limited|detailed|mixed|red)$/.test(w))) return true;
  return false;
}

/* rich is the classified output of segmentSpeech, index-aligned with units
   (both are derived from the same text by the same function, so unit k and
   rich[k] are the same span). A unit the segmenter already recognised as an
   abandoned or self-corrected construction isn't a listener losing the
   thread — it's the speaker fixing course, which Fluency accounts for
   separately — so it's excluded here rather than double-counted as tangled. */
export function findTangled(units, rich) {
  const out = [];
  units.forEach((u, i) => {
    const w = (u.match(/\S+/g) || []).length;
    if (w < 4) return;
    if (rich && rich[i] && rich[i].kind === "ABANDONED_CONSTRUCTION") return;
    const clauses = (u.toLowerCase().match(/\b(and|but|so|because|which|that|when|while|although|however)\b/g) || []).length;
    if (!hasVerb(u)) { out.push({ i, text: u, why: "no clear verb — this never becomes a statement" }); return; }
    if (clauses >= 6) { out.push({ i, text: u, why: `${clauses} joins in one breath — the thread is lost before the end` }); return; }
    if (/^(which|and|but|so|because|that)\b/i.test(u.trim()) && w >= 10) {
      out.push({ i, text: u, why: "starts mid-thought, so the listener has to reconstruct the subject" });
    }
  });
  return out;
}

/* The surgical rewrite: delete empty words, swap wordy phrases for their own
   short form, split a run-on at its weakest join. Nothing is invented. */
export function tightenSentence(sentence) {
  let out = sentence;
  const removed = [];
  WORDY.concat(REDUNDANT).forEach(([long, short]) => {
    const re = new RegExp("\\b" + esc(long) + "\\b", "gi");
    if (re.test(out)) {
      removed.push(short ? `“${long}” → “${short}”` : `cut “${long}”`);
      out = out.replace(re, short);
    }
  });
  EMPTY_WORDS.forEach((w) => {
    const re = new RegExp("\\s*\\b" + esc(w) + "\\b", "gi");
    if (re.test(out)) { removed.push(`cut “${w}”`); out = out.replace(re, ""); }
  });
  out = out.replace(/\s{2,}/g, " ").replace(/\s+([,.])/g, "$1").trim();
  if (out) out = out[0].toUpperCase() + out.slice(1);
  const before = (sentence.match(/\S+/g) || []).length;
  const after = (out.match(/\S+/g) || []).length;
  return { original: sentence, tightened: out, removed, before, after, saved: before - after };
}

export function concisenessReport(text, units) {
  // Recomputed from the same text, so it lines up index-for-index with
  // units — segmentSpeech is deterministic on identical input.
  const rich = (typeof segmentSpeech === "function") ? segmentSpeech(text) : null;
  const empty = findEmptyWords(text);
  const wordy = findWordy(text);
  const longOnes = findLongSentences(units);
  const tangled = findTangled(units, rich);
  const repeatedIdeas = findRepeatedIdeas(text);

  const wc = words0(text).length;
  const emptyCount = empty.reduce((a, x) => a + x.n, 0);
  const wordyCount = wordy.reduce((a, x) => a + x.n, 0);
  const wastedWords = emptyCount + wordy.reduce((a, x) => a + x.n * Math.max(1, x.was.split(" ").length - (x.now ? x.now.split(" ").length : 0)), 0);
  const wastePct = wc ? (wastedWords / wc) * 100 : 0;

  // Rewrites for the worst offenders only — the ones actually worth showing.
  const candidates = [...longOnes.map((u) => u.text), ...tangled.map((u) => u.text)];
  const seen = new Set();
  const rewrites = [];
  units.forEach((u) => {
    const t = tightenSentence(u);
    if (t.saved >= 3 && !seen.has(u)) { seen.add(u); rewrites.push({ ...t, reason: "too many words doing no work" }); }
  });
  candidates.forEach((u) => {
    if (seen.has(u)) return;
    const t = tightenSentence(u);
    seen.add(u);
    const long = longOnes.find((l) => l.text === u);
    rewrites.push({ ...t, reason: long ? `${long.words} words in one sentence` : (tangled.find((x) => x.text === u) || {}).why || "hard to follow" });
  });
  rewrites.sort((a, b) => b.saved - a.saved);

  const score = wc < 12 ? 0 : Math.max(0, Math.min(100, Math.round(
    100
    - wastePct * 2.2
    - longOnes.length * 9
    - tangled.length * 11
    - repeatedIdeas.length * 5
  )));

  let line;
  if (wc < 12) line = "Too short to judge how efficiently you speak.";
  else if (score >= 82) line = `Tight. About ${Math.round(wastePct)}% of your words were doing no work, which is well below what a listener notices.`;
  else if (score >= 62) line = `Reasonably tight, but roughly ${Math.round(wastePct)}% of your words could go without changing your meaning${longOnes.length ? `, and ${longOnes.length} sentence${longOnes.length === 1 ? "" : "s"} ran long` : ""}.`;
  else line = `You're using more words than your ideas need — around ${Math.round(wastePct)}% could be cut${longOnes.length ? `, with ${longOnes.length} over-long sentence${longOnes.length === 1 ? "" : "s"}` : ""}${tangled.length ? ` and ${tangled.length} that a listener would lose` : ""}.`;

  return { empty, wordy, longOnes, tangled, repeatedIdeas, rewrites: rewrites.slice(0, 4),
    emptyCount, wordyCount, wastedWords, wastePct, score, line };
}



/* Structure markers that survive translation. A speaker taking a position or
   closing a point does it in every language; these catch the common Indic
   forms plus anything the speaker said in English while code-mixing. */
/* Structure markers that survive translation. A speaker taking a position or
   closing a point does it in every language.

   No \b anywhere below: JavaScript word boundaries are ASCII-only, so \b
   before "मुझे" or "ஏனென்றால்" never matches. These phrases are distinctive
   enough not to need one. */
export const STANCE_ANY = [
  /(mujhe lagta|mera manna|main sochta|meri raye|मुझे लगता|मेरा मानना|मेरे हिसाब|मुझे ऐसा लगता)/i,
  /(நான் நினைக்கிறேன்|enakku thonuthu|என் கருத்து)/i,
  /(nenu anukuntunna|నా అభిప్రాయం|నేను అనుకుంటున్నాను)/i,
  /(amar mone hoy|আমার মনে হয়)/i,
  /(mala vatate|मला वाटतं|माझ्या मते)/i,
  /(nanage anisuttade|ನನ್ನ ಪ್ರಕಾರ)/i,
  /(enikku thonnunnu|എന്റെ അഭിപ്രായം)/i,
  /(mane lage che|મને લાગે છે)/i,
  /(mainu lagda|ਮੈਨੂੰ ਲੱਗਦਾ)/i,
  /\b(i think|i believe|in my view|i would argue)\b/i,
];
export const CONNECT_ANY = [
  /(kyunki|kyonki|क्योंकि|isliye|इसलिए|lekin|लेकिन|magar|मगर|phir bhi|फिर भी|udaharan|उदाहरण)/i,
  /(ஏனென்றால்|ஆனால்|அதனால்|உதாரணமாக)/i,
  /(endukante|కానీ|అందుకే|ఉదాహరణకు)/i,
  /(कारण|पण|म्हणून)/i,
  /(কিন্তু|কারণ|তাই)/i,
  /(ಏಕೆಂದರೆ|ಆದರೆ|ಆದ್ದರಿಂದ)/i,
  /(കാരണം|പക്ഷേ|അതുകൊണ്ട്)/i,
  /(કારણ કે|પણ|તેથી)/i,
  /(ਕਿਉਂਕਿ|ਪਰ|ਇਸ ਲਈ)/i,
  /\b(for example|because|however)\b/i,
];
export const CLOSERS_ANY = [
  /(isliye main|इसलिए मैं|अंत में|कुल मिलाकर|to kul milakar)/i,
  /(மொத்தத்தில்|கடைசியா|ஆகவே)/i,
  /(మొత్తానికి|చివరగా|కాబట్టి)/i,
  /(शेवटी|थोडक्यात)/i,
  /(সবশেষে|মোটকথা)/i,
  /(ಒಟ್ಟಾರೆ|ಕೊನೆಯದಾಗಿ)/i,
  /(ചുരുക്കത്തിൽ|അവസാനം)/i,
  /(ટૂંકમાં|છેલ્લે)/i,
  /(ਅੰਤ ਵਿੱਚ|ਸੰਖੇਪ ਵਿੱਚ)/i,
  /\b(so overall|to conclude|in short)\b/i,
];

/* ==========================================================================
   SPEECH SEGMENTATION
   Where units used to come from ASR punctuation (or, failing that, a short
   list of English breaker words), a boundary is now a decision weighed from
   several independent signals — closing/discourse markers, subordination,
   accumulated length, self-correction — rather than a single rule. Nothing
   below treats "the language changed" as evidence of anything: a clause that
   opens in English and finishes in Tamil is never split for that reason
   alone, because no signal here even looks at script or vocabulary origin —
   every marker set is checked against the window regardless of which
   language it belongs to. ASR punctuation still counts, but as one signal
   among several, and it is the first one a subordinate clause overrides —
   "...was because. Because of that..." never splits at the period. */

/* "because"/"for example"-type: opens a clause that finishes the thought
   already in progress. A boundary is never placed where one of these
   begins, even across a punctuation mark. "but/so/therefore"-type: can
   start a genuinely new unit, but only once the clause behind it is
   already substantial. Both are pulled from the same vetted vocabulary as
   STANCE_ANY/CONNECT_ANY/CLOSERS_ANY above, split by grammatical role. */
export const SUBORD_ANY = [
  /\b(because|since|although|though|while|unless|whereas|if|when|that|which|who|for example|for instance)\b/i,
  /(kyunki|kyonki|क्योंकि|udaharan|उदाहरण|agar|अगर|jab\b|जब)/i,
  /(ஏனென்றால்|உதாரணமாக)/i,
  /(endukante|ఉదాహరణకు)/i,
  /(ಏಕೆಂದರೆ)/i,
  /(കാരണം)/i,
  /(\bकारण\b)/i,
  /(কারণ)/i,
  /(કારણ કે)/i,
  /(ਕਿਉਂਕਿ)/i,
];
export const COORD_ANY = [
  /\b(but|however|so|yet|and|then)\b/i,
  /(lekin|लेकिन|magar|मगर|isliye|इसलिए)/i,
  /(ஆனால்|அதனால்)/i,
  /(కానీ|అందుకే)/i,
  /(ಆದರೆ|ಆದ್ದರಿಂದ)/i,
  /(പക്ഷേ|അതുകൊണ്ട്)/i,
  /(\bपण\b|म्हणून)/i,
  /(কিন্তু|তাই)/i,
  /(પણ|તેથી)/i,
  /(ਪਰ|ਇਸ ਲਈ)/i,
];
/* A speaker announcing their own restart. Kept to phrasing this confident
   about — "matlab"/"yaani" are already established discourse markers
   elsewhere in this file, not a new guess. */
export const SELF_CORRECTION_ANY = [
  /\b(i mean|actually|sorry|no wait|wait,? i mean|what i meant|let me rephrase|or rather)\b/i,
  /(matlab|मतलब|yaani|यानी)/i,
];

export const SEG_SAFETY_MAX = 42;      // tokens — a ceiling so unpunctuated speech
                                  // in any language still gets segmented
export const SEG_MIN_FOR_COORD = 6;     // a coordinator only counts once the clause
                                  // behind it is long enough to be its own unit

export function segWindowAfter(toks, i, fwd) {
  return toks.slice(i + 1, Math.min(toks.length, i + 1 + fwd)).join(" ");
}

/* True only if one of the patterns matches starting at the very first token
   of the window — i.e. the marker begins right after the candidate boundary,
   not merely somewhere within the lookahead. Without this anchor, a closer
   like "so overall" three tokens further on would make every position in
   between look like a boundary too, splitting the unit one word at a time. */
export function startsWithMarker(window, patterns) {
  return patterns.some((re) => {
    const m = new RegExp(re.source, re.flags.replace(/g/g, "")).exec(window);
    return m && m.index === 0;
  });
}

/* text -> [{ text, kind, confidence, endReason, wc }].
   kind is the subset of the full spoken-unit taxonomy this heuristic engine
   can back with real evidence:
     COMPLETE_SENTENCE        — closes on punctuation with no other signal contradicting it
     THOUGHT_GROUP_END        — closes on a coordinator or a new stance-opener
     COMMUNICATIVE_UNIT_END   — closes on a closing/conclusion marker
     ABANDONED_CONSTRUCTION   — cut short by the speaker's own restart or a stutter-repeat
     HESITATION               — the unit is nothing but filler/hedge tokens
     UNCERTAIN_BOUNDARY       — no real signal fired; split only because the
                                 unit hit the safety ceiling, so treat it as
                                 a rough boundary, not a confident one
   Categories the spec names but this engine has no honest way to tell apart
   from these — INTERRUPTION (needs a second speaker's audio), LIST_CONTINUATION
   and TOPIC_SHIFT (need real discourse parsing) — are not invented; they fall
   into UNCERTAIN_BOUNDARY rather than being guessed at. */
export function segmentSpeech(text) {
  const raw = (text || "").trim();
  if (!raw) return [];
  const toks = raw.split(/\s+/).filter(Boolean);
  if (!toks.length) return [];

  const stripPunct = (w) => w.replace(/^[^\p{L}\p{M}\d]+|[^\p{L}\p{M}\d]+$/gu, "");
  const cleanToks = toks.map((w) => stripPunct(w).toLowerCase());
  const fillerWord = (w) => HARD_FILLERS.includes(w) || HEDGES.includes(w) || SOFT_FILLERS.includes(w) ||
    (typeof ALL_INDIC_FILLERS !== "undefined" && ALL_INDIC_FILLERS.includes(w));

  const units = [];
  let start = 0;

  const flush = (end, reason, confidence) => {
    if (end < start) return;
    const unitToks = toks.slice(start, end + 1);
    const unitText = unitToks.join(" ");
    const wc = unitToks.length;
    const cleanUnit = unitToks.map((w) => stripPunct(w).toLowerCase()).filter(Boolean);
    const allFiller = wc > 0 && cleanUnit.every(fillerWord);
    let kind;
    if (allFiller) kind = "HESITATION";
    else if (reason === "selfcorrect" || reason === "repeat") kind = "ABANDONED_CONSTRUCTION";
    else if (reason === "closer") kind = "COMMUNICATIVE_UNIT_END";
    else if (reason === "stance" || reason === "coord") kind = "THOUGHT_GROUP_END";
    else if (reason === "punct") kind = "COMPLETE_SENTENCE";
    // The speaker simply stopped talking here — real evidence the utterance
    // is over, and stronger than an arbitrary length cutoff. This is what
    // classifies the finished construction after a restart, e.g. "...actually,
    // I joined because I wanted to become more confident" — that isn't
    // uncertain, it's the thing that should be graded on its own merits.
    else if (reason === "end") kind = "COMPLETE_SENTENCE";
    else kind = "UNCERTAIN_BOUNDARY";  // reason === "maxlen": a forced cut, not a real one
    units.push({ text: unitText, kind, confidence, endReason: reason, wc });
    start = end + 1;
  };

  for (let i = 0; i < toks.length; i++) {
    const unitLen = i - start + 1;
    const hasNext = i + 1 < toks.length;
    const nextClean = hasNext ? cleanToks[i + 1] : "";

    // The speaker signalling their own restart overrides everything else —
    // this is direct evidence, not an inference from a pause or a word list.
    if (hasNext && unitLen >= 2 && startsWithMarker(segWindowAfter(toks, i, 4), SELF_CORRECTION_ANY)) {
      flush(i, "selfcorrect", 0.7); continue;
    }
    if (hasNext && unitLen >= 2 && nextClean && nextClean === cleanToks[i] && !STUMBLE_OK_REPEAT.has(cleanToks[i])) {
      flush(i, "repeat", 0.55); continue;
    }
    // Safety valve before the subordinate check, so a long unpunctuated
    // stretch that happens to keep opening dependent clauses still segments
    // instead of becoming one giant unit.
    if (unitLen >= SEG_SAFETY_MAX) { flush(i, "maxlen", 0.3); continue; }
    // Never split into a subordinate clause — the thought isn't finished,
    // whatever else the window says. This is the one place linguistic
    // structure is allowed to override punctuation outright, per spec.
    if (hasNext && SUBORD_ANY.some((re) => re.test(toks[i + 1]))) continue;

    if (hasNext) {
      const after = segWindowAfter(toks, i, 4);
      if (startsWithMarker(after, CLOSERS_ANY)) { flush(i, "closer", 0.85); continue; }
      if (startsWithMarker(after, STANCE_ANY)) { flush(i, "stance", 0.65); continue; }
      if (unitLen >= SEG_MIN_FOR_COORD && COORD_ANY.some((re) => re.test(toks[i + 1]))) { flush(i, "coord", 0.7); continue; }
      if (/[.!?]$/.test(toks[i])) { flush(i, "punct", 0.55); continue; }
    }
  }
  if (start <= toks.length - 1) flush(toks.length - 1, "end", 0.6);

  return units;
}

/* Conciseness for non-English speech. The English rules (wordy phrase swaps,
   filler-word lists) don't transfer, so this measures only what
   is genuinely language-neutral: sentence length, repeated ideas, and how much
   of the answer is spent circling. It returns the same shape as the English
   report so every consumer downstream keeps working untouched. */
export function concisenessNeutral(text, units, repeats) {
  const wc = words0(text).length;
  const longOnes = findLongSentences(units);
  const repeatedIdeas = findRepeatedIdeas(text);
  const repeatLoad = (repeats || []).reduce((a, v) => a + Math.max(0, v.n - 2), 0);
  const score = wc < 12 ? 0 : Math.max(0, Math.min(100, Math.round(
    100 - longOnes.length * 10 - repeatedIdeas.length * 6 - repeatLoad * 4
  )));
  const line = wc < 12
    ? "Too short to judge how efficiently you speak."
    : score >= 78
      ? "Tight. Your sentences stay a length a listener can hold."
      : `${longOnes.length ? `${longOnes.length} sentence${longOnes.length === 1 ? "" : "s"} ran long` : "Sentence length is fine"}${repeatedIdeas.length ? `, and ${repeatedIdeas.length} idea${repeatedIdeas.length === 1 ? "" : "s"} came back around` : ""}. Word-level tightening is only checked for English, so this is the shape of your answer rather than its wording.`;
  return { empty: [], wordy: [], longOnes, tangled: [], repeatedIdeas,
    rewrites: [], emptyCount: 0, wordyCount: 0, wastedWords: 0, wastePct: 0, score, line,
    neutral: true };
}

/* -- the main analysis --------------------------------------------------- */

export function analyse(text, seconds, mode, declaredLang) {
  const clean = (text || "").trim();
  // Every call site used to omit this, so a user who had selected Hindi was
  // still being auto-detected. Falling back to the stored setting fixes all
  // six call sites at once and keeps the argument for explicit overrides.
  if (declaredLang === undefined && typeof spokenLangCode === "function") {
    declaredLang = spokenLangCode();
  }
  const toks = words0(clean);
  const wc = toks.length;

  // Read the language before judging anything, so English-only checks don't
  // fire on speech that was never meant to be English.
  const lang = typeof langProfile === "function"
    ? langProfile(clean, declaredLang)
    : { primary: "en-IN", englishDominant: true, mixed: false, codeMix: 0, englishShare: 100 };
  const isEnglish = lang.englishDominant;

  const real = toks.filter(isRealWord);
  const intelligibility = wc ? Math.round((real.length / wc) * 100) : 0;
  const junk = [...new Set(toks.filter((w) => !isRealWord(w)))];
  const unintelligible = wc >= 3 && intelligibility < 55;

  const fillers = findFillers(clean, lang.primary);
  const fillerCount = fillers.filter((f) => f.kind === "filler").length;
  const hedgeCount = fillers.filter((f) => f.kind === "hedge").length;
  const crutchCount = fillers.filter((f) => f.kind === "crutch").length;

  // Non-words are reported even when the overall percentage looks healthy —
  // six invented words in eighty is still six invented words.
  const nonWords = findNonWords(clean);
  // These four are rules *about English*. Running them on Hindi or Tamil would
  // invent errors that aren't there, so they only run when English dominates.
  const grammar = isEnglish ? checkGrammar(clean) : [];
  const register = isEnglish ? findRegister(clean) : [];
  const vague = isEnglish ? findVagueness(clean) : [];
  const repeats = findRepetition(clean);
  const stumbles = findStumbles(clean);
  // The full classified segmentation — where units come from, not just what
  // they say. units stays the plain-text array every existing consumer
  // expects; richUnits carries the same spans with a boundary reason,
  // confidence and category (self-correction, hesitation, closer...) for
  // anything downstream that wants to reason about completion rather than
  // just word-count.
  const richUnits = typeof segmentSpeech === "function" ? segmentSpeech(clean) : [];
  const units = richUnits.length ? richUnits.map((u) => u.text) : segment(clean);
  const avgUnit = units.length ? Math.round(wc / units.length) : wc;
  const abandonedUnits = richUnits.filter((u) => u.kind === "ABANDONED_CONSTRUCTION");
  const concise = isEnglish
    ? concisenessReport(clean, units)
    : concisenessNeutral(clean, units, repeats);

  // Strip punctuation first: "for example," must still match "for example".
  const low = " " + clean.toLowerCase().replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ").trim() + " ";
  const enMark = (list) => list.some((x) => low.includes(" " + x + " ") || low.startsWith(" " + x + " "));
  const hasStance = enMark(STANCE) || (!isEnglish && STANCE_ANY.some((r) => r.test(clean)));
  const connectives = new Set(CONNECT.filter((c) => low.includes(" " + c + " "))).size
    + (isEnglish ? 0 : CONNECT_ANY.filter((r) => r.test(clean)).length);
  const hasClose = CLOSERS.some((c) => low.includes(" " + c + " "))
    || (!isEnglish && CLOSERS_ANY.some((r) => r.test(clean)));

  const wpm = seconds > 0 ? Math.round((wc / seconds) * 60) : 0;
  const realUnique = new Set(real).size;
  const ttr = real.length ? realUnique / real.length : 0;
  const sampleTrust = Math.min(1, wc / 70);
  const variety = Math.round(ttr * 100 * (0.4 + 0.6 * sampleTrust));

  // Range is vocabulary reach, not novelty. Saying forty different everyday
  // words is not range; unique nonsense certainly isn't.
  const content = real.filter((w) => !STOPW.has(w) && w.length > 3);
  const beyondBasic = content.filter((w) =>
    !BASIC.has(w) && !COMMON.has(w) && (w.length >= 7 || ACADEMIC.test(w)));
  // "Beyond basic" is an English word list. For other languages, reach is
  // measured on spread and word length only — a narrower claim, honestly made.
  const sophistication = !isEnglish
    ? Math.min(1, (content.filter((w) => w.length >= 6).length / Math.max(1, content.length)) * 1.15)
    : (content.length ? beyondBasic.length / content.length : 0);

  const clarity = Math.pow(intelligibility / 100, 1.6);
  const enough = Math.min(1, 0.2 + (wc / 90) * 0.8);
  const per100 = wc ? ((fillerCount + crutchCount * 0.6) / wc) * 100 : 0;

  const vagueCount = vague.reduce((a, v) => a + v.n, 0);
  const registerCount = register.reduce((a, v) => a + v.n, 0);
  const repeatLoad = repeats.reduce((a, v) => a + (v.n - 2), 0);

  const fluency = Math.max(0, Math.round((100 - per100 * 7 - hedgeCount * 3 - stumbles.length * 4) * clarity));
  const pace = wc < 8 ? 0 : Math.max(0, Math.round(100 - Math.abs(wpm - 140) * 0.8));
  const lengthTrust = Math.min(1, 0.55 + (wc / 120) * 0.45);
  const range = Math.max(0, Math.min(100, Math.round(
    (ttr * 58 + sophistication * 80 - vagueCount * 4 - repeatLoad * 3) * clarity * lengthTrust
  )));
  const structure = Math.round(
    ((hasStance ? 34 : 0) + Math.min(33, connectives * 12) + (hasClose ? 33 : 0)) * clarity * enough
  );
  // Invented words and slang are language errors too, so the Grammar score
  // must move when they appear.
  const accuracy = wc < 10 ? 0 : Math.max(0, Math.round(
    100
      - grammar.filter((g) => g.kind === "grammar").length * 12
      - nonWords.reduce((a, j) => a + j.n, 0) * 9
      - registerCount * 5
  ));
  const clarity100 = concise.score;
  const overall = Math.round((fluency + pace + range + structure + accuracy + clarity100) / 6);

  return {
    text: clean, wc, wpm, seconds, mode,
    intelligibility, junk, unintelligible,
    lang, isEnglish, codeMix: lang.codeMix, mixed: lang.mixed,
    fillers, fillerCount, hedgeCount, crutchCount,
    grammar, nonWords, register, vague, repeats, stumbles,
    vagueCount, registerCount, sophistication: Math.round(sophistication * 100),
    units, unitCount: units.length, avgUnit, concise, clarity100,
    richUnits, abandonedCount: abandonedUnits.length,
    hasStance, connectives, hasClose,
    variety, fluency, pace, range, structure, accuracy, overall,
  };
}

/* ---------------------- THE ROLE-PLAYERS' REPORTS ------------------------ */

/* The Timer. Toastmasters signals green at the qualifying time, amber next,
   red at the limit. Under green or well over red doesn't qualify. */
export function signalFor(elapsed, slot) {
  if (elapsed >= slot.red) return "red";
  if (elapsed >= slot.amber) return "amber";
  if (elapsed >= slot.green) return "green";
  return "none";
}

export function timerReport(seconds, slot) {
  const sig = signalFor(seconds, slot);
  if (seconds < slot.green) {
    return {
      verdict: "under", vclass: "u", signal: sig,
      line: `You finished at ${fmt(seconds)}. The green light comes on at ${fmt(slot.green)}, so this one doesn't qualify — in a real meeting you'd be timed out of the vote. Short answers usually mean you stopped at your first idea instead of developing it.`,
    };
  }
  if (seconds > slot.red) {
    return {
      verdict: "over", vclass: "o", signal: "red",
      line: `You ran to ${fmt(seconds)}, past the ${fmt(slot.red)} limit. Overrunning reads as poor control, not enthusiasm. Watch for the amber at ${fmt(slot.amber)} — that's your cue to start landing the plane.`,
    };
  }
  return {
    verdict: "qualified", vclass: "q", signal: sig,
    line: `${fmt(seconds)} — inside the window. You saw green at ${fmt(slot.green)} and closed before red. That's the part most people never manage.`,
  };
}

export function fmt(s) {
  s = Math.max(0, Math.round(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* The Ah-Counter. The classic Toastmasters role: names every "ah", "um" and
   "uh" by count first — that's the seat's actual namesake — then the other
   crutch words and hedges it also listens for, kept as a clearly separate
   group rather than folded into one undifferentiated tally. */
export function ahReport(r) {
  const tally = {};
  r.fillers.forEach((f) => { tally[f.phrase] = (tally[f.phrase] || 0) + 1; });
  const rows = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const sounds = rows.filter(([w]) => AH_SOUNDS.has(w));
  const crutches = rows.filter(([w]) => !AH_SOUNDS.has(w));
  const soundTotal = sounds.reduce((s, [, n]) => s + n, 0);
  const total = r.fillerCount + r.hedgeCount + r.crutchCount;
  const crutchTotal = total - soundTotal;
  const per = r.wc ? (total / r.wc) * 100 : 0;
  const soundPer = r.wc ? (soundTotal / r.wc) * 100 : 0;

  let line;
  if (total === 0) {
    line = "Not one ah, um or uh — and no crutch words either. That's rare, and it's the single biggest thing that makes someone sound prepared.";
  } else if (soundTotal === 0) {
    line = `Zero "ah", "um" or "uh" — the sound of hesitation is gone. What's left is ${crutchTotal} crutch word${crutchTotal === 1 ? "" : "s"}${crutches[0] ? `, mostly "${crutches[0][0]}" (×${crutches[0][1]})` : ""} — a much easier habit to break than a real filler sound.`;
  } else {
    const worst = sounds[0];
    if (soundPer < 3) {
      line = `${soundTotal} "ah"/"um"/"uh" in ${r.wc} words — about ${soundPer.toFixed(1)}%. Below three percent is where a listener stops noticing. You're there.`;
    } else if (soundPer < 6) {
      line = `${soundTotal} "ah"/"um"/"uh" in ${r.wc} words, roughly ${soundPer.toFixed(1)}% — mostly "${worst[0]}" (×${worst[1]}). Audible but not distracting. They cluster where you change direction — that's the place to swap in a half-second of silence instead of a sound.`;
    } else {
      line = `${soundTotal} "ah"/"um"/"uh" in ${r.wc} words, about ${soundPer.toFixed(1)}%. That's high enough that a panel hears the hesitation instead of the argument. "${worst[0]}" alone is ${worst[1]} of them — hunt just that one sound for a week before touching anything else.`;
    }
  }
  return { rows, sounds, crutches, soundTotal, crutchTotal, total, per, soundPer, line };
}

/* The Grammarian. Errors, plus whether the Word of the Day was used. */
export function gramReport(r, wotd, usedWotd) {
  const errs = r.grammar.filter((g) => g.kind === "grammar");
  const regional = r.grammar.filter((g) => g.kind === "regional");
  const junk = r.nonWords || [];
  const junkTotal = junk.reduce((a, j) => a + j.n, 0);
  const parts = [];

  if (r.wc < 12) return { errs, regional, junk, junkTotal, line: "Not enough said to judge the language.", wotd, usedWotd };

  // Speaking another language is not an error, and mixing is not a defect.
  if (r.lang && !r.isEnglish) {
    parts.push(`You spoke mainly in ${langName(r.lang.primary)}. English grammar rules don't apply to that, so I've checked structure, pacing and repetition instead — the parts that carry across every language.`);
  }
  // Said whenever the speech is mixed, in either direction. The speaker who
  // most needs to hear it is the one speaking mostly Hindi with English in it.
  if (r.mixed) {
    parts.push(`You moved between ${langName(r.lang.primary)} and English — roughly ${r.lang.englishShare}% English. That's how most people in this room actually talk, and it's scored as one answer rather than penalised.`);
  }

  if (junkTotal > 0) {
    parts.push(`${junkTotal} word${junkTotal === 1 ? "" : "s"} I couldn't recognise at all` +
      ` — ${junk.slice(0, 4).map((j) => `“${j.word}”`).join(", ")}. If you said something real there, the mic misheard you. If you didn't, a panel hears it as bluffing through a gap.`);
  }
  if (errs.length === 0) {
    // Claiming "no errors from the patterns I watch for" is false when those
    // patterns were never run — they're English rules and this wasn't English.
    if (r.lang && !r.isEnglish) {
      // already explained above; don't imply a clean English check happened
    } else {
      parts.push(junkTotal ? "The grammar itself was sound." : "No errors from the seventy-odd patterns I watch for. Clean.");
    }
  }
  else if (errs.length <= 2) parts.push(`${errs.length} grammatical slip${errs.length === 1 ? "" : "s"}. Small, but they're patterns rather than accidents.`);
  else parts.push(`${errs.length} grammatical errors. Each is minor; together they make a panel work harder to follow you.`);

  if (r.registerCount > 0) {
    const top = r.register.slice(0, 3).map((x) => `“${x.was}”`).join(", ");
    parts.push(`${r.registerCount} word${r.registerCount === 1 ? "" : "s"} too casual for the room — ${top}. Fine with friends, costly in an interview.`);
  }
  if (r.vagueCount >= 3) {
    parts.push(`You reached for vague filler ${r.vagueCount} times (${r.vague.slice(0, 3).map((v) => `“${v.word}”`).join(", ")}). Each one is a place a specific noun would have been stronger.`);
  }
  if (r.repeats && r.repeats.length) {
    parts.push(`You leaned on “${r.repeats[0].word}” ${r.repeats[0].n} times.`);
  }
  if (regional.length) {
    parts.push(`${regional.length} usage${regional.length === 1 ? "" : "s"} reads perfectly normal here but lands oddly in a global room.`);
  }
  // A construction the speaker themselves abandoned and restarted isn't a
  // grammar error — it's self-repair, and only the finished version is
  // judged. Said here so it doesn't quietly show up as an unexplained
  // "tangled sentence" instead.
  if (r.abandonedCount > 0) {
    parts.push(`You caught yourself and restarted ${r.abandonedCount} time${r.abandonedCount === 1 ? "" : "s"} mid-thought. That's self-correction, not an error — only the sentence you actually finished gets judged.`);
  }
  return { errs, regional, junk, junkTotal, line: parts.join(" "), wotd, usedWotd };
}

/* The General Evaluator. Works with no API key by deriving both a commendation
   and a recommendation from the strongest and weakest measured dimension. */
export function evalReport(r, timer) {
  const dims = [
    { k: "structure", v: r.structure, up: "You gave the answer a shape — a position, reasons, and an ending. Most speakers only manage the middle.", down: "The answer had no frame. Open with your position in the first sentence, give one reason, then say the position again to close. That structure alone lifts a Table Topic more than better vocabulary would." },
    { k: "fluency", v: r.fluency, up: "Your delivery ran clean — very little reaching for crutch words.", down: "The crutch words are doing your thinking out loud. When you feel one coming, close your mouth instead. A pause sounds like confidence; 'um' sounds like searching." },
    { k: "range", v: r.range, up: "Good vocabulary reach — you used precise words, not just different ones.", down: r.vagueCount >= 3
        ? "Vague words are standing in for your thinking — “thing”, “stuff”, “somehow”. Every one of those is a place where a specific noun would have made the point land. Name the thing."
        : "You circled a small set of everyday words. Pick one precise word before you start and build a sentence toward it." },
    { k: "accuracy", v: r.accuracy, up: "Grammatically solid throughout.", down: (r.nonWords && r.nonWords.length)
        ? "Several words weren't words. If that's the mic, move somewhere quieter; if it's you filling a gap with noise, stop and take the silence instead — a pause reads as thinking, invented syllables read as panic."
        : r.registerCount > 0
          ? "The register slipped into friend-group speech. A panel scores you on whether you can switch registers, and that switch is entirely learnable."
          : "The grammar slipped where a panel would notice. See the Grammarian's list — they're patterns, not one-offs." },
    { k: "pace", v: r.pace, up: "Your pace sat in the range listeners find easy.", down: r.wpm > 170 ? "You're racing. Slow to about 140 words a minute — you'll say less and land more." : "You're speaking slowly enough that attention drifts. Push toward 130–150 words a minute." },
  ].filter((d) => d.v > 0 || r.wc > 12);

  const sorted = dims.slice().sort((a, b) => b.v - a.v);
  const best = sorted[0], worst = sorted[sorted.length - 1];
  return {
    commend: best ? best.up : "You showed up and spoke, which is the part most people skip.",
    recommend: worst ? worst.down : "Speak for longer next time — there wasn't enough to evaluate.",
    timing: timer.verdict,
  };
}
