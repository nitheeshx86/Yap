/* ============================================================================
   YAP — multilingual layer
   Language tables, script detection and the romanised-Indic vocabulary the
   engine uses to tell real words from invented ones. Pure data + helpers.
   Extracted verbatim from app/YapApp.jsx.
   ========================================================================== */

export const LANGUAGES = [
  { code: "auto",  label: "Detect automatically", native: "Auto", script: null },
  { code: "en-IN", label: "English",   native: "English",  script: "latin" },
  { code: "hi-IN", label: "Hindi",     native: "हिन्दी",     script: "deva" },
  { code: "bn-IN", label: "Bengali",   native: "বাংলা",     script: "beng" },
  { code: "gu-IN", label: "Gujarati",  native: "ગુજરાતી",   script: "gujr" },
  { code: "kn-IN", label: "Kannada",   native: "ಕನ್ನಡ",     script: "knda" },
  { code: "ml-IN", label: "Malayalam", native: "മലയാളം",   script: "mlym" },
  { code: "mr-IN", label: "Marathi",   native: "मराठी",     script: "deva" },
  { code: "od-IN", label: "Odia",      native: "ଓଡ଼ିଆ",      script: "orya" },
  { code: "pa-IN", label: "Punjabi",   native: "ਪੰਜਾਬੀ",     script: "guru" },
  { code: "ta-IN", label: "Tamil",     native: "தமிழ்",     script: "taml" },
  { code: "te-IN", label: "Telugu",    native: "తెలుగు",     script: "telu" },
];
export const LANG_BY_CODE = LANGUAGES.reduce((m, l) => ((m[l.code] = l), m), {});
export const langName = (code) => (LANG_BY_CODE[code] || {}).label || "your language";

/* Unicode blocks, so a word in an Indian script is never mistaken for noise. */
export const SCRIPTS = [
  ["deva", /[\u0900-\u097F]/], ["beng", /[\u0980-\u09FF]/], ["guru", /[\u0A00-\u0A7F]/],
  ["gujr", /[\u0A80-\u0AFF]/], ["orya", /[\u0B00-\u0B7F]/], ["taml", /[\u0B80-\u0BFF]/],
  ["telu", /[\u0C00-\u0C7F]/], ["knda", /[\u0C80-\u0CFF]/], ["mlym", /[\u0D00-\u0D7F]/],
];
export const ANY_INDIC = /[\u0900-\u0DFF]/;
export const isIndicToken = (w) => ANY_INDIC.test(w);

/* Romanised Indic that people genuinely type and say. Without this the sanity
   check reads "bilkul", "yaar", "matlab" as invented words and the speaker is
   told their speech wasn't English — which is true, and beside the point. */
export const ROMAN_INDIC = new Set(("aap aapka accha acha achha adhik agar ainvayi aise aisa ajeeb ajj andar apna apne arre asal ata bas basically bahut bahot bana banda bandi bata batao bhai bhaiya bhi bhool bilkul bohot boht bola bolo bura chahiye chal chalo chhota cheez chinta college crore dekh dekha dekho desi dhang dhyan dikkat dil dimag din dost dukan ek ekdum fir ghar gussa haan hai hain hamara hamare hi hoga hona hone hota hoti huh humein idhar isliye issue itna jaana jab jaisa jaise jaldi jana jaruri jarurat jee jo jyada kaafi kaam kabhi kaise kaisa kal kam kar karna karo karta karte kaun kaunsa kya kyun kyunki lag laga lagta lekin log logon lekhin matlab mein mera mere mil mila mujhe na nahi nahin nai nako nikal padha padhai paisa par pata phir pura raha rahe raho rakh sab sahi samajh samay sath shuru sirf sochna soch tab tak thoda theek tum tumhara udhar upar us usko vaise vo waha wahan woh yaar yaani yahan ye yeh zyada zaroori "
  + "naan naanga neenga enna epdi seri appuram romba illa vanakkam thambi anna akka ipo appo enakku unakku ellam kekka paaru vaa po nalla kastam "
  + "nenu meeru enti ela sare tarvatha chala ledu vasthunna cheppu kastam bagundi ekkada eppudu adi idi "
  + "naanu neevu yenu hege sari ashtu illa channagide yaake elli "
  + "njan ningal entha engane sheri valare illa ariyilla "
  + "ami tumi ki kemon bhalo na aache hoy ekhon "
  + "mi tu kay kasa bara nahi ahe ata "
  + "hu tame shu kem saras nathi che "
  + "main tusi ki kiven changa nahi hai hun").split(/\s+/).filter(Boolean));

/* Crutch words are language-specific. "Matlab" is Hindi's "like". Every entry
   here is a word that is *only* a discourse crutch — it carries no ordinary
   lexical meaning of its own, so flagging it unconditionally never mistakes
   a real word for a filler. "toh" is the one exception: it also chains an
   "agar" ("if") clause as a genuine conjunction, so that one case is excluded
   in findFillers instead of being pulled out of the dictionary. */
export const FILLERS_BY_LANG = {
  "hi-IN": ["matlab", "yaani", "arre", "toh", "bas", "na", "kya bolun", "समझे", "मतलब", "यानी", "अरे", "तो", "बस"],
  "mr-IN": ["mhanje", "arre", "म्हणजे", "अरे"],
  "bn-IN": ["mane", "jani", "মানে", "মানে কি"],
  "gu-IN": ["etle", "matlab", "એટલે", "મતલબ"],
  "ta-IN": ["appuram", "அப்புறம்"],
  "te-IN": ["ante", "అంటే"],
  "kn-IN": ["andre", "ಅಂದ್ರೆ"],
  "ml-IN": ["ennu vachal", "athayat", "അതായത്"],
  "pa-IN": ["matlab", "ਮਤਲਬ"],
  "od-IN": ["mane", "ମାନେ"],
};
export const ALL_INDIC_FILLERS = [...new Set(Object.values(FILLERS_BY_LANG).flat())];

/* Words that are fillers in one breath and ordinary vocabulary in the next:
   "accha"/"achha" is also the adjective "good", "haan" is also the literal
   answer "yes", "sari"/"sare"/"seri"/"sheri" ("okay/correct") double as a
   genuine agreement. None of these carry a fixed meaning on their own the way
   "matlab" or "arre" do, so counting every occurrence penalised a speaker for
   using an ordinary word. They only count as a filler when they sit next to
   another filler-type word — the pattern of an actual hesitation cluster
   ("accha... matlab... woh kya bolte hain") rather than a sentence that
   happens to contain "good" or "yes" or "okay". See findFillers. */
export const AMBIGUOUS_FILLERS_BY_LANG = {
  "hi-IN": ["acha", "achha", "accha", "haan"],
  "ta-IN": ["seri", "சரி"],
  "te-IN": ["sare", "avunu", "సరే"],
  "kn-IN": ["sari", "ಸರಿ"],
  "ml-IN": ["sheri", "ശരി"],
};
export const ALL_AMBIGUOUS_INDIC = [...new Set(Object.values(AMBIGUOUS_FILLERS_BY_LANG).flat())];

/* What language is this, really? Reads the text rather than trusting a
   setting, because code-mixing is the normal case, not the exception. */
export function langProfile(text, declared) {
  const raw = (text || "");
  const tokens = raw.split(/\s+/).filter(Boolean);
  if (!tokens.length) return { primary: declared && declared !== "auto" ? declared : "en-IN",
    scripts: [], indicShare: 0, romanShare: 0, codeMix: 0, mixed: false, tokens: 0 };

  const scripts = SCRIPTS.filter(([, re]) => re.test(raw)).map(([s]) => s);
  const words = raw.toLowerCase().match(/[\p{L}']+/gu) || [];
  const indic = words.filter(isIndicToken).length;
  const roman = words.filter((w) => !isIndicToken(w) && ROMAN_INDIC.has(w)).length;
  const english = words.length - indic - roman;

  const indicShare = words.length ? indic / words.length : 0;
  const romanShare = words.length ? roman / words.length : 0;
  const nonEnglish = indicShare + romanShare;

  let primary = declared && declared !== "auto" ? declared : "en-IN";
  if (!declared || declared === "auto") {
    if (scripts.length) {
      const hit = LANGUAGES.find((l) => l.script === scripts[0] && l.code !== "auto");
      primary = hit ? hit.code : "hi-IN";
    } else if (nonEnglish > 0.25) primary = "hi-IN";     // romanised, script unknown
  }

  // code-mixing is a feature of how people speak, not an error
  const codeMix = Math.round(Math.min(nonEnglish, 1 - nonEnglish) * 200);
  return {
    primary, scripts, tokens: words.length,
    indicShare: Math.round(indicShare * 100),
    romanShare: Math.round(romanShare * 100),
    englishShare: Math.round((english / Math.max(1, words.length)) * 100),
    codeMix, mixed: codeMix >= 25,
    englishDominant: nonEnglish < 0.25,
  };
}
