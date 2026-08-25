/* ============================================================================
   YAP — network layer
   Groq and Sarvam calls (transcription, chat, TTS, translation), WAV
   encoding and the shared playback handle. Browser-only: every call goes
   to our own same-origin /api routes, never to a provider directly.
   Extracted verbatim from app/YapApp.jsx.
   ========================================================================== */

import { langName } from "./lang";
import { spokenLangCode } from "./analysis";

export const groqReady = () => true;   // the key lives on the server; failures are caught per-call

/** Re-transcribe a recorded clip with Whisper Large v3 (via Groq). This is
 *  the accurate pass that replaces the English-only, often-garbled live
 *  Web Speech caption once the recording finishes. */
export async function groqTranscribe(blob) {
  const fd = new FormData();
  fd.append("file", blob, "speech.webm");
  const res = await fetch("/api/groq/transcribe", { method: "POST", body: fd });
  // A 401 here is our own auth guard, not Groq — the request never left the
  // server. Tagged so the UI can say "sign in" instead of "unavailable".
  if (res.status === 401) {
    const err = new Error("not signed in");
    err.code = "unauthorized";
    throw err;
  }
  if (!res.ok) throw new Error("groq stt " + res.status);
  const j = await res.json();
  return { text: String(j.text || "").trim(), language: j.language || "en-IN" };
}

/** The evaluating AI — commends, recommends, plays the
 *  panel roles, and so on. Same JSON-in, JSON-out contract as
 *  askClaude so every existing call site keeps working unchanged. */
/* The brief's model. gpt-oss-20b is quicker but drops whole fields from the
   brief often enough to be unusable, so the brief stays on the 120b and buys
   its speed from `reasoning_effort: low` on the server instead. */
export const GROQ_FAST_MODEL = "openai/gpt-oss-120b";

export async function groqChat(system, user, maxTokens = 900, model) {
  // never let a stalled request hang the UI forever — the caller has an
  // offline fallback that is better than an indefinite spinner
  const res = await fetch("/api/groq/chat", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, user, max_tokens: maxTokens, model }),
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error("groq chat " + res.status);
  const j = await res.json();
  const txt = String(j.content || "").replace(/```json|```/g, "").trim();
  return JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1));
}

/* --------------------------- Sarvam, same-origin -------------------------- */
/* Sarvam's key lives server-side (app/api/sarvam/*), mirroring the Groq setup
   above — the browser only ever talks to our own /api routes, never
   api.sarvam.ai directly. */

export function sarvamBase() { return "/api/sarvam"; }
export const sarvamReady = () => true;   // the key lives on the server; failures are caught per-call

export async function sarvamTranscribeOnce(blob, langCode, { translate = false, mode = "verbatim", timestamps = false } = {}) {
  const base = sarvamBase();
  if (!base) throw new Error("no-proxy");
  const fd = new FormData();
  fd.append("file", blob, "speech.webm");
  if (!translate) {
    fd.append("mode", mode);
    fd.append("language_code", langCode && langCode !== "auto" ? langCode : "unknown");
    if (timestamps) fd.append("with_timestamps", "true");
  }
  const res = await fetch(base + (translate ? "/sttTranslate" : "/stt"), { method: "POST", body: fd });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`sarvam ${res.status}: ${body.slice(0, 300)}`);
  }
  const j = await res.json();
  return {
    text: String(j.transcript || "").trim(),
    language: j.language_code || null,
    confidence: typeof j.language_probability === "number" ? j.language_probability : null,
    timestamps: j.timestamps || null,
    mode: j.mode || mode,
  };
}

/* Duration via a plain <audio> element — cheap, no need to decode samples
   just to find out whether splitting is even necessary. */
export function clipDuration(blob) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(audio.duration || 0); };
    audio.onerror = () => { URL.revokeObjectURL(url); resolve(0); };
    audio.src = url;
  });
}

export function writeAsciiString(view, offset, str) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

/* Mono 16-bit PCM WAV — the simplest format Sarvam accepts, and simple
   enough to hand-encode without a library. */
export function encodeWav(samples, sampleRate) {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buf);
  writeAsciiString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeAsciiString(view, 8, "WAVE");
  writeAsciiString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);          // PCM
  view.setUint16(22, 1, true);          // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAsciiString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);
  let o = 44;
  for (let i = 0; i < samples.length; i++, o += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buf], { type: "audio/wav" });
}

/* Sarvam's synchronous speech-to-text endpoint hard-caps a request at 30
   seconds of audio ("use the batch API for longer files") — but Table
   Topics alone runs up to 5 minutes, so anything past a Table Topic's
   shortest slot was 400ing outright with no transcript at all. Decode the
   tape once and cut it into sub-30s pieces so every mode keeps working
   regardless of length; the cuts land on fixed timestamps rather than
   silences, so an occasional word is split across a chunk boundary — a much
   smaller cost than losing the whole take. */
export async function splitIntoChunks(blob, chunkSeconds = 25) {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  try {
    const audioBuffer = await ctx.decodeAudioData(await blob.arrayBuffer());
    const sr = audioBuffer.sampleRate;
    const chunkLen = Math.floor(chunkSeconds * sr);
    const mono = audioBuffer.numberOfChannels === 1
      ? audioBuffer.getChannelData(0)
      : (() => {
          const chans = Array.from({ length: audioBuffer.numberOfChannels }, (_, i) => audioBuffer.getChannelData(i));
          const out = new Float32Array(audioBuffer.length);
          for (let i = 0; i < out.length; i++) {
            let sum = 0; for (const c of chans) sum += c[i];
            out[i] = sum / chans.length;
          }
          return out;
        })();
    const parts = [];
    for (let start = 0; start < mono.length; start += chunkLen) {
      parts.push(encodeWav(mono.subarray(start, Math.min(start + chunkLen, mono.length)), sr));
    }
    return parts;
  } finally {
    ctx.close().catch(() => {});
  }
}

/** Transcribe a recorded clip. Returns the words in the language they were
 *  spoken in — YAP analyses the original, never a translation.
 *
 *  Mode matters more than it looks. Sarvam's default "transcribe" normalises
 *  the audio into tidy prose, which quietly deletes the filler words the
 *  Ah-Counter exists to count. "verbatim" keeps every "um", "matlab" and false
 *  start, so the coaching is about what was actually said. */
export async function sarvamTranscribe(blob, langCode, opts = {}) {
  const dur = await clipDuration(blob);
  if (!dur || dur <= 28) return sarvamTranscribeOnce(blob, langCode, opts);

  const chunks = await splitIntoChunks(blob);
  const results = await Promise.all(
    chunks.map((c) => sarvamTranscribeOnce(c, langCode, opts).catch(() => null))
  );
  const ok = results.filter(Boolean);
  if (!ok.length) throw new Error("sarvam: every chunk failed");
  return {
    text: ok.map((r) => r.text).filter(Boolean).join(" ").trim(),
    language: ok.find((r) => r.language)?.language || null,
    confidence: ok.find((r) => typeof r.confidence === "number")?.confidence ?? null,
    timestamps: null,
    mode: ok[0].mode,
  };
}

/* ---- Sarvam-105B: the better writer when the reply is going out in an
   Indian language. Claude stays the default for English. --------------- */

export async function sarvamChat(system, user, maxTokens = 900) {
  const base = sarvamBase();
  if (!base) throw new Error("no-proxy");
  const res = await fetch(base + "/chat", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      max_tokens: maxTokens, temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error("sarvam chat " + res.status);
  const j = await res.json();
  const txt = String(j.content || "").replace(/```json|```/g, "").trim();
  return JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1));
}

/* ---- Bulbul: role-players with voices. -------------------------------- */

/* Distinct voices per role, so a session sounds like more than one
   narrator reading every part. */
export const VOICE_FOR = {
  kavya: "manisha", arjun: "abhilash", meera: "vidya", rohit: "karun",
  interviewer: "arya", moderator: "anushka", coach: "anushka",
};

export async function sarvamSpeak(text, { language = "en-IN", speaker = "anushka", pace } = {}) {
  const base = sarvamBase();
  if (!base) throw new Error("no-proxy");
  const res = await fetch(base + "/tts", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language_code: language, speaker, pace }),
  });
  if (!res.ok) throw new Error("sarvam tts " + res.status);
  const j = await res.json();
  const chunks = j.audios || [];
  if (!chunks.length) return null;
  // base64 wav chunks -> one playable blob
  const bytes = chunks.map((b64) => {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  });
  return URL.createObjectURL(new Blob(bytes, { type: "audio/wav" }));
}

/* One shared player so two panellists can never talk over each other. */
export const speech = { audio: null, url: null, token: 0 };
export function stopSpeaking() {
  speech.token += 1;
  if (speech.audio) { try { speech.audio.pause(); } catch (e) { /* already stopped */ } }
  if (speech.url) { URL.revokeObjectURL(speech.url); speech.url = null; }
}
export async function speakAs(who, text, language) {
  if (!sarvamReady() || !text) return false;
  const mine = ++speech.token;
  try {
    const url = await sarvamSpeak(text, { language: language || replyLangCode(),
      speaker: VOICE_FOR[who] || "anushka" });
    if (!url || mine !== speech.token) { if (url) URL.revokeObjectURL(url); return false; }
    stopSpeaking(); speech.token = mine;
    speech.url = url;
    speech.audio = new Audio(url);
    await speech.audio.play().catch(() => {});
    return true;
  } catch (e) { return false; }
}

export async function sarvamTranslate(text, from, to) {
  const base = sarvamBase();
  if (!base) throw new Error("no-proxy");
  const res = await fetch(base + "/translate", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: String(text).slice(0, 900), source_language_code: from || "auto",
      target_language_code: to, model: "sarvam-translate:v1", mode: "formal",
    }),
  });
  if (!res.ok) throw new Error("sarvam " + res.status);
  const j = await res.json();
  return String(j.translated_text || j.output || "").trim();
}

export async function sarvamTransliterate(text, from, to) {
  const base = sarvamBase();
  if (!base) throw new Error("no-proxy");
  const res = await fetch(base + "/transliterate", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: String(text).slice(0, 900),
      source_language_code: from || "auto", target_language_code: to }),
  });
  if (!res.ok) throw new Error("sarvam " + res.status);
  const j = await res.json();
  return String(j.transliterated_text || j.output || "").trim();
}

export function replyLangCode() {
  try { return window.localStorage.getItem("yap:replyLang") || "en-IN"; } catch (e) { return "en-IN"; }
}

/* One place to tell the model both halves of the language question: what it is
   reading, and what it should write. Before this it was only ever told the
   second, so a Hindi transcript arrived with no explanation and the model was
   free to treat it as broken English. */
export function languageDirective(spoken) {
  const reply = replyLangCode();
  const heard = spoken && spoken !== "auto" ? spoken : null;
  const lines = [];

  if (heard && heard !== "en-IN") {
    const h = langName(heard);
    lines.push(`WHAT YOU ARE READING: this transcript is ${h}, or ${h} mixed with English. It is not broken English and must never be treated as an error, a typo, or something to correct. Judge the ideas, the structure and the delivery — never the choice of language.`);
    lines.push(`Do not comment on English grammar, English word choice or English idiom. Those rules do not apply here. If you would have made a point about English usage, make a point about clarity or structure instead.`);
  }

  if (reply && reply !== "en-IN") {
    const r = langName(reply);
    lines.push(`WRITE YOUR REPLY IN ${r.toUpperCase()}: every field VALUE, including short labels. Natural spoken ${r}, not translated-sounding ${r}.`);
    lines.push(`The JSON keys in the schema above are not part of the reply — keep every key exactly as given, in English, unchanged, with the exact same structure (same nesting, same arrays). Only the text inside the values moves to ${r}.`);
    lines.push(`If the speaker mixed ${r} with English, mix the same way they did — that is how they actually talk, and flattening it into pure ${r} or pure English would misrepresent them.`);
    lines.push(`Quote their own words verbatim, in whatever language they said them. Never translate a quotation.`);
  } else if (heard && heard !== "en-IN") {
    lines.push(`Write your reply in English, but quote their words verbatim in ${langName(heard)} — never translate a quotation.`);
  }

  return lines.length ? "\n\n" + lines.join("\n") : "";
}

/* Which model should write the coaching? Claude for English, Sarvam-105B when
   the reply is going out in an Indian language — it is native to those
   languages and reads far less like a translation. */
export function preferSarvamWriter() {
  try {
    if (window.localStorage.getItem("yap:writer") === "groq") return false;
  } catch (e) { /* default below */ }
  const r = replyLangCode();
  return sarvamReady() && r && r !== "en-IN";
}

/* `fastModel` opts a call into Groq's small, low-latency free model. Use it for
   generative helpers where speed matters more than nuance (the debate research
   brief); the evaluators stay on the bigger default model.

   Both backends keep their key server-side, in our own /api routes — there is
   no browser-held key and no user-configured proxy. Sarvam goes first for
   non-English replies because it is native to Indian languages; Groq is the
   default and the fallback. */
/* `fastModel` also implies "speed matters": it skips Sarvam entirely. Sarvam is
   the better writer for Indian languages, but sarvam-105b is a reasoning model
   that thinks for thousands of hidden tokens before writing a word, which is
   the wrong trade for anything a student is waiting on. */
export async function askClaude(system, user, maxTokens = 900, spoken, fastModel) {
  const sys = system + languageDirective(spoken || spokenLangCode());
  if (!fastModel && preferSarvamWriter()) {
    try {
      return await sarvamChat(sys, user, maxTokens);
    } catch (e) { /* fall through to Groq rather than losing the feature */ }
  }
  return groqChat(sys, user, maxTokens, fastModel);
}

export const EVAL_SYS = `You are the General Evaluator at a Toastmasters-style meeting, reviewing a student's impromptu answer in India. You are reading a speech-to-text transcript: no punctuation, no capitals — never mention either.
Return ONLY raw JSON:
{"structure":"one sentence on how the speech was organised — did it open with a position, build a case, and close, or just wander","flow":"one sentence on how ideas moved from one to the next — smooth transitions, or abrupt jumps a listener has to bridge themselves","content":"one sentence on the substance offered — real reasons and examples, or mostly restating the question","language":"one sentence on how clear and precise the language was — could a listener follow it first-time, or did it need re-reading","coverage":"one sentence on how much of the topic they actually covered — one angle only, or several sides of it","commend":"one specific thing that worked, quoting their words, 1-2 sentences","recommend":"the single change that would most improve the next speech, 1-2 sentences, concrete"}
Warm but not soft — a real evaluator commends first, then gives one recommendation they can act on tomorrow. Address them as "you". Every field must be grounded in what they actually said — quote or paraphrase specifics, never generic praise or generic criticism.`;
