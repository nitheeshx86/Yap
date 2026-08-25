import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/authGuard";

// Groq retired the Llama chat models (they 404 as model_not_found), so the app
// runs on gpt-oss. Note this is a REASONING model: it returns a separate
// `reasoning` field alongside the answer, which Groq's own JSON-mode validator
// rejects — so `response_format` is deliberately NOT set below, and the JSON is
// parsed out of the content instead. Every caller already tolerates that.
const GROQ_CHAT_MODEL = "openai/gpt-oss-120b";

// Callers may request a different model, but only from this list — the body
// comes from the browser, so an arbitrary model string must never reach Groq.
const ALLOWED_MODELS = new Set([GROQ_CHAT_MODEL, "openai/gpt-oss-20b"]);

/* Every caller on the client (askClaude) sends { system, user, max_tokens }
 * and expects back a JSON object it can hand straight to JSON.parse. Keeping
 * the key here, server-side, means the browser never sees it. */
export async function POST(request) {
  const authed = await requireUser();
  if (!authed.ok) return authed.response;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY is not configured on the server" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { system, user, max_tokens: maxTokens, model } = body || {};
  if (!user) {
    return NextResponse.json({ error: "missing 'user' field" }, { status: 400 });
  }

  let res;
  try {
    res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: ALLOWED_MODELS.has(model) ? model : GROQ_CHAT_MODEL,
        // the reasoning pass burns tokens before the answer is written, so the
        // budget needs headroom beyond what the caller asked for
        max_tokens: Math.min(Math.max((maxTokens || 900) * 2, 1400), 3000),
        temperature: 0.7,
        reasoning_effort: "low",
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          { role: "user", content: user },
        ],
      }),
    });
  } catch (e) {
    return NextResponse.json({ error: "could not reach Groq" }, { status: 502 });
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json({ error: text || res.statusText }, { status: res.status });
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";
  return NextResponse.json({ content });
}
