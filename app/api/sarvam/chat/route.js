import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/authGuard";

// Sarvam's own model: native to Indian languages, so a reply reads far less
// like a translation than routing it through an English-first model first.
const SARVAM_CHAT_MODEL = "sarvam-105b";

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

  const { messages, max_tokens: maxTokens, temperature } = body || {};
  if (!Array.isArray(messages) || !messages.length) {
    return NextResponse.json({ error: "missing 'messages' field" }, { status: 400 });
  }

  // sarvam-105b is a reasoning model: it spends tokens on a hidden
  // reasoning_content pass before it ever writes the JSON in `content`, so
  // the max_tokens every call site sends (tuned for Claude/Groq, which don't
  // do this) isn't enough headroom — the response comes back truncated with
  // content: null. Give it real room and keep the reasoning pass short.
  const tokenBudget = Math.min(Math.max((maxTokens || 900) * 3, 2500), 4000);

  let res;
  try {
    res = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-subscription-key": apiKey },
      body: JSON.stringify({
        model: SARVAM_CHAT_MODEL,
        messages,
        max_tokens: tokenBudget,
        temperature: typeof temperature === "number" ? temperature : 0.7,
        response_format: { type: "json_object" },
        reasoning_effort: "low",
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
  const content = data.choices?.[0]?.message?.content || "";
  return NextResponse.json({ content });
}
