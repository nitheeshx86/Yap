import { NextResponse } from "next/server";

// Groq's flagship general-purpose instruct model — good at following the
// strict "return only raw JSON" system prompts this app relies on everywhere.
const GROQ_CHAT_MODEL = "llama-3.3-70b-versatile";

// Callers may request a faster model, but only from this list — the body comes
// from the browser, so an arbitrary model string must never reach Groq.
const ALLOWED_MODELS = new Set([GROQ_CHAT_MODEL, "llama-3.1-8b-instant"]);

/* Every caller on the client (askClaude) sends { system, user, max_tokens }
 * and expects back a JSON object it can hand straight to JSON.parse. Keeping
 * the key here, server-side, means the browser never sees it. */
export async function POST(request) {
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
        max_tokens: maxTokens || 900,
        temperature: 0.7,
        response_format: { type: "json_object" },
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
