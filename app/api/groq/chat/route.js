import { NextResponse } from "next/server";
import { requireUser, requireReportAccess } from "@/lib/supabase/authGuard";
import { getTask } from "@/lib/yap/tasks";

// Groq retired the Llama chat models (they 404 as model_not_found), so the app
// runs on gpt-oss. Note this is a REASONING model: it returns a separate
// `reasoning` field alongside the answer, which Groq's own JSON-mode validator
// rejects — so `response_format` is deliberately NOT set below, and the JSON is
// parsed out of the content instead. Every caller already tolerates that.
const GROQ_CHAT_MODEL = "openai/gpt-oss-120b";

// Callers may request a different model, but only from this list — the body
// comes from the browser, so an arbitrary model string must never reach Groq.
const ALLOWED_MODELS = new Set([GROQ_CHAT_MODEL, "openai/gpt-oss-20b"]);

/* The client sends { task, user, ... } where `task` names an entry in the
 * server-owned registry. It no longer sends a system prompt: the prompt and
 * the metering policy both live server-side, so a user cannot reach the
 * evaluator prompt through an unmetered request. See lib/yap/tasks.js.
 *
 * `directive` is the one piece of prompt the client still contributes — the
 * language instructions built from the user's own spoken/reply language. It
 * is appended, never substituted, and capped, so it can shape the reply's
 * language without replacing the task. */
export async function POST(request) {
  // Read the body before branching on auth: which guard applies depends on
  // whether the named task is a metered report.
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { task: taskName, user, directive, model, client_event_id: clientEventId } = body || {};

  const task = getTask(taskName);
  if (!task) {
    return NextResponse.json({ error: "unknown_task" }, { status: 400 });
  }
  if (!user) {
    return NextResponse.json({ error: "missing 'user' field" }, { status: 400 });
  }

  // The paywall. A metered task spends a free trial (or requires PRO); the
  // guard is atomic and idempotent on client_event_id, so retrying one
  // attempt is free while a new attempt costs one.
  const authed = task.metered
    ? await requireReportAccess({ clientEventId, kind: task.kind })
    : await requireUser();
  if (!authed.ok) return authed.response;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY is not configured on the server" }, { status: 500 });
  }

  const system = task.system + (typeof directive === "string" ? directive.slice(0, 2000) : "");

  let res;
  try {
    res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: ALLOWED_MODELS.has(model) ? model : GROQ_CHAT_MODEL,
        // the reasoning pass burns tokens before the answer is written, so the
        // budget needs headroom beyond what the caller asked for. The ceiling
        // comes from the task, not the client.
        max_tokens: Math.min(Math.max(task.maxTokens * 2, 1400), 3000),
        temperature: 0.7,
        reasoning_effort: "low",
        messages: [
          { role: "system", content: system },
          { role: "user", content: String(user).slice(0, 24000) },
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
  // The access state rides back with the answer so the UI can update its
  // "N free reports left" counter without a second round trip.
  return NextResponse.json({ content, access: authed.ctx.access ?? null });
}
