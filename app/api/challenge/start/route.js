import { NextResponse } from "next/server";
import { requireUser, getAdminClient } from "@/lib/supabase/authGuard";
import { reconcileLocalDate } from "@/lib/yap/date";

/**
 * Start (or resume) the 7-Day Island Challenge. Idempotent: re-starting an
 * active enrolment returns the existing one and never deletes history.
 */
export async function POST(request) {
  const authed = await requireUser();
  if (!authed.ok) return authed.response;
  const { user } = authed.ctx;

  let body = {};
  try {
    body = await request.json();
  } catch (e) {
    body = {};
  }

  const admin = getAdminClient();
  const { data: profileRow } = await admin.from("profiles").select("timezone").eq("id", user.id).maybeSingle();
  const timezone = profileRow?.timezone || "Asia/Kolkata";
  const localDate = reconcileLocalDate(body?.local_date, timezone);

  const { data, error } = await admin.rpc("start_challenge", { p_user_id: user.id, p_local_date: localDate });
  if (error) {
    console.error("[YAP] challenge/start: rpc failed", { userId: user.id, code: error.code, message: error.message });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ enrollment: data });
}
