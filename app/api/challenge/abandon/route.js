import { NextResponse } from "next/server";
import { requireUser, getAdminClient } from "@/lib/supabase/authGuard";

/** Close the active enrolment. Never deletes challenge_day_completions history. */
export async function POST() {
  const authed = await requireUser();
  if (!authed.ok) return authed.response;
  const { user } = authed.ctx;

  const admin = getAdminClient();
  const { error } = await admin.rpc("abandon_challenge", { p_user_id: user.id });
  if (error) {
    console.error("[YAP] challenge/abandon: rpc failed", { userId: user.id, code: error.code, message: error.message });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
