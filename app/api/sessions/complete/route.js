import { NextResponse } from "next/server";
import { requireUser, getAdminClient } from "@/lib/supabase/authGuard";
import { reconcileLocalDate } from "@/lib/yap/date";

/**
 * @typedef {object} SessionCompleteBody
 * @property {string} client_event_id - uuid, idempotency key minted by the client per attempt
 * @property {"topic"|"debate"|"vocab"} kind
 * @property {number} duration_seconds
 * @property {number} xp
 * @property {string} [topic]
 * @property {number} [overall_score]
 * @property {string} [local_date] - YYYY-MM-DD, client-computed; re-validated server-side
 */

const KINDS = new Set(["topic", "debate", "vocab"]);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request) {
  const authed = await requireUser();
  if (!authed.ok) return authed.response;
  const { user } = authed.ctx;

  /** @type {SessionCompleteBody} */
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "invalid_body", message: "invalid JSON body" }, { status: 400 });
  }

  const clientEventId = body?.client_event_id;
  const kind = body?.kind;
  const durationSeconds = Number(body?.duration_seconds);
  const xp = Number(body?.xp);
  const topic = typeof body?.topic === "string" ? body.topic.slice(0, 300) : null;
  const overallScore = body?.overall_score == null ? null : Number(body.overall_score);

  if (!clientEventId || !UUID_RE.test(String(clientEventId))) {
    return NextResponse.json({ error: "invalid_client_event_id" }, { status: 400 });
  }
  if (!KINDS.has(kind)) {
    return NextResponse.json({ error: "invalid_kind" }, { status: 400 });
  }
  if (!Number.isFinite(durationSeconds) || durationSeconds < 0) {
    return NextResponse.json({ error: "invalid_duration_seconds" }, { status: 400 });
  }
  if (!Number.isFinite(xp) || xp < 0) {
    return NextResponse.json({ error: "invalid_xp" }, { status: 400 });
  }
  if (overallScore != null && !Number.isFinite(overallScore)) {
    return NextResponse.json({ error: "invalid_overall_score" }, { status: 400 });
  }

  const admin = getAdminClient();

  // read the user's stored timezone to validate local_date server-side
  const { data: profileRow, error: profileErr } = await admin
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();
  if (profileErr) {
    console.error("[YAP] sessions/complete: profile lookup failed", { userId: user.id, code: profileErr.code });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  const timezone = profileRow?.timezone || "Asia/Kolkata";
  const localDate = reconcileLocalDate(body?.local_date, timezone);

  const { data, error } = await admin.rpc("complete_practice_session", {
    p_user_id: user.id,
    p_kind: kind,
    p_duration_seconds: Math.round(durationSeconds),
    p_xp: Math.round(xp),
    p_topic: topic,
    p_overall_score: overallScore == null ? null : Math.round(overallScore),
    p_client_event_id: clientEventId,
    p_local_date: localDate,
  });

  if (error) {
    console.error("[YAP] sessions/complete: rpc failed", { userId: user.id, code: error.code, message: error.message });
    return NextResponse.json({ error: "server_error", message: "Could not record session" }, { status: 500 });
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    console.error("[YAP] sessions/complete: rpc returned no row", { userId: user.id });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  const { data: profileAfter } = await admin
    .from("profiles")
    .select("total_xp, total_reps, total_seconds, streak")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({
    session: { id: row.session_id, inserted: row.inserted, kind, local_date: localDate },
    streak: row.streak,
    challenge: { day: row.challenge_day, status: row.challenge_status },
    stats: profileAfter
      ? { xp: profileAfter.total_xp, reps: profileAfter.total_reps, seconds: profileAfter.total_seconds }
      : null,
  });
}
