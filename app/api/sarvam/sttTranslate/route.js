import { NextResponse } from "next/server";

// Speech straight to English text (Sarvam's legacy speech-to-text-translate
// endpoint) — kept separate from /stt because it takes no mode/language_code.
const SARVAM_STT_TRANSLATE_MODEL = "saaras:v2.5";

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

  const fd = new FormData();
  fd.append("file", file, "speech.webm");
  fd.append("model", SARVAM_STT_TRANSLATE_MODEL);

  let res;
  try {
    res = await fetch("https://api.sarvam.ai/speech-to-text-translate", {
      method: "POST",
      headers: { "api-subscription-key": apiKey },
      body: fd,
    });
  } catch (e) {
    return NextResponse.json({ error: "could not reach Sarvam" }, { status: 502 });
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json({ error: text || res.statusText }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({
    transcript: data.transcript || "",
    language_code: data.language_code || null,
    language_probability: typeof data.language_probability === "number" ? data.language_probability : null,
  });
}
