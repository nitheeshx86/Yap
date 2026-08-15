import { NextResponse } from "next/server";

export async function POST(request) {
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

  const { input, source_language_code: source, target_language_code: target, model, mode } = body || {};
  if (!input || !target) {
    return NextResponse.json({ error: "missing 'input' or 'target_language_code'" }, { status: 400 });
  }

  let res;
  try {
    res = await fetch("https://api.sarvam.ai/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-subscription-key": apiKey },
      body: JSON.stringify({
        input,
        source_language_code: source || "auto",
        target_language_code: target,
        model: model || "sarvam-translate:v1",
        mode: mode || "formal",
      }),
    });
  } catch (e) {
    return NextResponse.json({ error: "could not reach Sarvam" }, { status: 502 });
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json({ error: text || res.statusText }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ translated_text: data.translated_text || "" });
}
