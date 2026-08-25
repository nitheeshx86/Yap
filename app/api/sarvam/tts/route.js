import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/authGuard";

const SARVAM_TTS_MODEL = "bulbul:v2";

export async function POST(request) {
  const authed = await requireUser();
  if (!authed.ok) return authed.response;

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "SARVAM_API_KEY is not configured on the server" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { text, language_code: languageCode, speaker, pace } = body || {};
  if (!text) {
    return NextResponse.json({ error: "missing 'text' field" }, { status: 400 });
  }

  let res;
  try {
    res = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-subscription-key": apiKey },
      body: JSON.stringify({
        text,
        language_code: languageCode || "en-IN",
        speaker: speaker || "anushka",
        pace: pace || 1,
        model: SARVAM_TTS_MODEL,
      }),
    });
  } catch (e) {
    return NextResponse.json({ error: "could not reach Sarvam" }, { status: 502 });
  }

  if (!res.ok) {
    const text2 = await res.text().catch(() => "");
    return NextResponse.json({ error: text2 || res.statusText }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ audios: data.audios || [] });
}
