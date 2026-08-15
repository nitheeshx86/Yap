import { NextResponse } from "next/server";

// English only for now — Indian languages stay on the Sarvam path until
// that's wired up separately.
const GROQ_STT_MODEL = "whisper-large-v3";

export async function POST(request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY is not configured on the server" }, { status: 500 });
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
  fd.append("model", GROQ_STT_MODEL);
  fd.append("language", "en");
  fd.append("response_format", "verbose_json");
  fd.append("temperature", "0");

  let res;
  try {
    res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: fd,
    });
  } catch (e) {
    return NextResponse.json({ error: "could not reach Groq" }, { status: 502 });
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json({ error: text || res.statusText }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ text: data.text || "", language: data.language || "en" });
}
