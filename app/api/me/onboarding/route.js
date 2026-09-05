import { NextResponse } from "next/server";
import { requireUser, getAdminClient } from "@/lib/supabase/authGuard";

/**
 * Persist the onboarding answers. Written through the service role because
 * `goals`/`blocks`/`onboarding_done` are deliberately not self-editable by the
 * browser (see 20260904000000_onboarding_profile.sql) — otherwise a client
 * could flip `onboarding_done` without ever answering anything.
 *
 * Answers are stored as ids, never free text: the client can only ever send
 * values from the fixed vocabularies below, so there is no user-authored
 * string reaching the table except `display_name`, which comes from the
 * Google profile rather than an input box.
 */

const GOAL_IDS = new Set([
  "confident", "meetings", "pitch", "stories", "network", "articulate",
]);
const BLOCK_IDS = new Set([
  "filler", "ramble", "fast", "slow", "nerves", "blank",
  "grammar", "vocab", "long", "repeat", "structure",
]);

/** Keep only known ids, de-duplicated, and cap the list so a crafted body
 *  can't write an unbounded array. */
function clean(input, allowed, max) {
  if (!Array.isArray(input)) return [];
  const out = [];
  for (const v of input) {
    if (typeof v !== "string" || !allowed.has(v) || out.includes(v)) continue;
    out.push(v);
    if (out.length >= max) break;
  }
  return out;
}

export async function POST(request) {
  const authed = await requireUser();
  if (!authed.ok) return authed.response;
  const { user } = authed.ctx;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request", message: "Invalid JSON" }, { status: 400 });
  }

  const goals = clean(body?.goals, GOAL_IDS, GOAL_IDS.size);
  const blocks = clean(body?.blocks, BLOCK_IDS, BLOCK_IDS.size);
  if (goals.length === 0) {
    return NextResponse.json({ error: "bad_request", message: "Pick at least one goal" }, { status: 400 });
  }

  const patch = {
    goals,
    blocks,
    goal: goals[0], // primary goal, for anything still reading the old column
    onboarding_done: true,
    onboarded_at: new Date().toISOString(),
  };
  // Both come from the Google identity, not a text input the user controls.
  if (typeof body?.display_name === "string" && body.display_name.trim()) {
    patch.display_name = body.display_name.trim().slice(0, 80);
  }
  if (typeof body?.timezone === "string" && body.timezone.trim()) {
    patch.timezone = body.timezone.trim().slice(0, 64);
  }

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update(patch)
    .eq("id", user.id)
    .select("onboarding_done, goal, goals, blocks, display_name, timezone")
    .maybeSingle();

  if (error) {
    console.error("[YAP] me/onboarding: update failed", { userId: user.id, code: error.code });
    return NextResponse.json({ error: "server_error", message: "Could not save your answers" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, profile: data ?? null });
}
