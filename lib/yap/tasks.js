/* ============================================================================
   YAP — server-owned AI task registry (server-only)

   Why this file exists, and why the prompts are not in the client any more.

   The paywall meters report generation. If the client decided what counted as
   a "report" — by sending a flag, or by sending its own system prompt — then
   evading the meter would be trivial: flip the flag, or paste the evaluator
   prompt into an "unmetered" request and get the identical answer back.

   So the client no longer sends prompts at all. It sends a `task` name from
   this registry, and the SERVER supplies the prompt and decides whether that
   task is metered. Forging the task name gets you a different prompt, never
   an unmetered evaluation — the metered tasks are exactly the ones that
   produce a report, and there is no unmetered task that produces one.

   Never import this from client code: it would put the prompts back in the
   browser bundle and hand an attacker the thing this file exists to keep.
   ========================================================================== */

const EVAL_SYS = `You are the General Evaluator at a Toastmasters-style meeting, reviewing a student's impromptu answer in India. You are reading a speech-to-text transcript: no punctuation, no capitals — never mention either.
Return ONLY raw JSON:
{"structure":"one sentence on how the speech was organised — did it open with a position, build a case, and close, or just wander","flow":"one sentence on how ideas moved from one to the next — smooth transitions, or abrupt jumps a listener has to bridge themselves","content":"one sentence on the substance offered — real reasons and examples, or mostly restating the question","language":"one sentence on how clear and precise the language was — could a listener follow it first-time, or did it need re-reading","coverage":"one sentence on how much of the topic they actually covered — one angle only, or several sides of it","commend":"one specific thing that worked, quoting their words, 1-2 sentences","recommend":"the single change that would most improve the next speech, 1-2 sentences, concrete"}
Warm but not soft — a real evaluator commends first, then gives one recommendation they can act on tomorrow. Address them as "you". Every field must be grounded in what they actually said — quote or paraphrase specifics, never generic praise or generic criticism.`;

const DEBATE_EVAL_SYS = `You are judging one debate speech. The speaker chose a side before speaking and had limited prep time. The text is a speech transcript — no punctuation, ignore it.
Return ONLY raw JSON:
{"argument":"the quality of the case they built, 1-2 sentences, quoting them",
"consistency":"did they hold their chosen side, and where did they wobble, 1-2 sentences",
"evidence":"what they used as support and what was missing, 1 sentence",
"counter":"how they handled the other side, or that they ignored it, 1 sentence",
"fix":"the single change that would most improve the next round, 2 sentences, concrete"}
Judge the case, never the position — a well-argued side you disagree with scores high. Be direct, no praise padding.`;

const BRIEF_SYS = `You prepare a debate brief for an Indian college student who has two minutes to get ready. Be concrete and honest — never invent statistics, and never cite a study you are not confident exists.
Return ONLY raw JSON:
{"summary":"what this debate is really about, 1-2 sentences, framed for their chosen side",
"points":["3-4 arguments FOR THEIR SIDE, each one sentence, each a different line of attack"],
"counters":["2-3 objections the other side will raise, each with a short answer in the same string"],
"facts":["2-3 verifiable facts or figures, each with its source named inline. If you are not confident, return an empty array rather than a plausible-sounding number."],
"examples":["1-2 concrete real cases, Indian where possible"]}
Write for someone about to speak out loud, not for an essay: short, sayable sentences.`;

const WORD_JUDGE_SYS = `You judge whether a student used a target word correctly and naturally in one spoken sentence. The sentence is a speech-to-text transcript, so ignore punctuation, capitalisation and small transcription slips.
Return ONLY raw JSON:
{"used":true|false,"grammatical":true|false,"natural":true|false,"intended":true|false,
"verdict":"one direct sentence addressed to them as 'you'",
"better":"a stronger version of THEIR OWN sentence keeping their words, topic and tone — or an empty string if theirs is already good"}
Definitions: "used" = the word or a clear inflection appears doing real work, not merely named or defined. "grammatical" = the word's form and the sentence around it are correct. "natural" = a fluent speaker would actually say it this way, not shoehorned in. "intended" = the meaning matches the definition given, not a different sense of the word.
Be fair but strict: naming the word, defining it, or forcing it into an unrelated clause is not a pass. Never rewrite them into a different register — keep their vocabulary level and personality.`;

/**
 * @typedef {object} TaskSpec
 * @property {string} system - the prompt, owned here and never accepted from the client
 * @property {boolean} metered - does producing this spend a free trial?
 * @property {"topic"|"debate"|"vocab"} kind - which mode it belongs to, for the ledger
 * @property {number} maxTokens - server-side ceiling, so the client cannot ask for an expensive call
 */

/** @type {Record<string, TaskSpec>} */
export const TASKS = {
  // The three report evaluations. These ARE the paid product, so all three
  // are metered against the same shared allowance.
  topic_eval:  { system: EVAL_SYS,        metered: true,  kind: "topic",  maxTokens: 1100 },
  debate_eval: { system: DEBATE_EVAL_SYS, metered: true,  kind: "debate", maxTokens: 900 },
  vocab_judge: { system: WORD_JUDGE_SYS,  metered: true,  kind: "vocab",  maxTokens: 500 },

  // Preparation help, shown BEFORE the user speaks. Not a report, and
  // deliberately free: metering it would charge a trial for a session the
  // user has not even given yet, and it reveals nothing about their speech.
  debate_brief: { system: BRIEF_SYS,      metered: false, kind: "debate", maxTokens: 800 },
};

export function getTask(name) {
  return Object.prototype.hasOwnProperty.call(TASKS, name) ? TASKS[name] : null;
}
