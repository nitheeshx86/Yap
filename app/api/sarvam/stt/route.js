import { NextResponse } from "next/server";

// Sarvam's key lives server-side, mirroring the Groq routes — the browser
// only ever talks to our own /api routes, never api.sarvam.ai directly.
const SARVAM_STT_MODEL = "saaras:v3";

export async function POST(request) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "SARVAM_API_KEY is not configured on the server" }, { status: 500 });
  }

  let incoming;
  try {
    incoming = await request.formData();
  } catch (e) {
    return NextResponse.json({ error: "expected multipart/form-data" }, { status: 400 });
  }

  const file = incoming.get("file");
  if (!file) {
    return NextResponse.json({ error: "missing 'file' field" }, { status: 400 });
  }

  // "verbatim" keeps every filler word and false start instead of tidying
  // the transcript into prose — see the comment on sarvamTranscribe.
  const mode = incoming.get("mode") || "verbatim";
  const languageCode = incoming.get("language_code");

  // Chrome's MediaRecorder tags the blob "audio/webm;codecs=opus", and
  // Sarvam allowlists file types by exact string match — "audio/webm" is on
  // it, "audio/webm;codecs=opus" isn't, so every real recording 400ed with
  // "Invalid file type". Re-wrap with the codec parameter stripped.
  const bareType = (file.type || "").split(";")[0].trim() || "audio/webm";
  const cleanFile = new File([await file.arrayBuffer()], "speech.webm", { type: bareType });

  const fd = new FormData();
  fd.append("file", cleanFile, "speech.webm");
  fd.append("model", SARVAM_STT_MODEL);
  fd.append("mode", mode);
  if (languageCode) fd.append("language_code", languageCode);
  if (incoming.get("with_timestamps")) fd.append("with_timestamps", "true");

  let res;
  try {
    res = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: { "api-subscription-key": apiKey },
      body: fd,
    });
  } catch (e) {
    return NextResponse.json({ error: "could not reach Sarvam" }, { status: 502 });
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[sarvam/stt]", res.status, text || res.statusText, "| fileType:", file.type, "| size:", file.size);
    return NextResponse.json({ error: text || res.statusText }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({
    transcript: data.transcript || "",
    language_code: data.language_code || null,
    language_probability: typeof data.language_probability === "number" ? data.language_probability : null,
    timestamps: data.timestamps || null,
    mode,
  });
}
