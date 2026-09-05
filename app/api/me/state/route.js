import { NextResponse } from "next/server";
import { requireUser, getAdminClient, readAccessState } from "@/lib/supabase/authGuard";
import { todayLocalDate } from "@/lib/yap/date";

/**
 * One authoritative payload the client hydrates from on load and after every
 * mutation: profile, streak, stats, active challenge + day completions,
 * entitlement status.
 */
export async function GET() {
  const authed = await requireUser();
  if (!authed.ok) return authed.response;
  const { user } = authed.ctx;
  const admin = getAdminClient();

  const [{ data: profile, error: profileErr }, { data: enrollment, error: enrollErr }, { data: entitlement, error: entErr }] =
    await Promise.all([
      admin
        .from("profiles")
        .select("streak, last_active_date, plan, plan_expires_at, timezone, display_name, onboarding_done, goal, total_xp, total_reps, total_seconds")
        .eq("id", user.id)
        .maybeSingle(),
      admin
        .from("challenge_enrollments")
        .select("id, challenge_key, started_on, target_days, status, completed_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      admin
        .from("entitlements")
        .select("product, status, expires_at")
        .eq("user_id", user.id)
        .eq("product", "pro")
        .maybeSingle(),
    ]);

  if (profileErr) {
    console.error("[YAP] me/state: profile lookup failed", { userId: user.id, code: profileErr.code });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if (enrollErr) {
    console.error("[YAP] me/state: enrollment lookup failed", { userId: user.id, code: enrollErr.code });
  }
  if (entErr) {
    console.error("[YAP] me/state: entitlement lookup failed", { userId: user.id, code: entErr.code });
  }

  let challenge = null;
  if (enrollment) {
    const { data: days } = await admin
      .from("challenge_day_completions")
      .select("day_number, local_date, completed_at")
      .eq("enrollment_id", enrollment.id)
      .order("day_number", { ascending: true });
    // Two different numbers, and conflating them was the streak bug: how many
    // days the user actually spoke on is NOT which day of the challenge it is.
    // `current_day` walks the calendar from started_on; `completed_days` is the
    // set of day_numbers actually earned, so a skipped day leaves a real gap
    // instead of silently shifting every later day back by one.
    const completedDayNumbers = (days || []).map((d) => d.day_number);
    const startedOn = enrollment.started_on;
    const today = todayLocalDate(profile?.timezone || "Asia/Kolkata");
    const elapsed =
      Math.floor((Date.parse(today + "T00:00:00Z") - Date.parse(startedOn + "T00:00:00Z")) / 86400000) + 1;
    const currentDay = Math.min(Math.max(elapsed, 1), enrollment.target_days);

    challenge = {
      id: enrollment.id,
      challenge_key: enrollment.challenge_key,
      started_on: startedOn,
      target_days: enrollment.target_days,
      status: enrollment.status,
      completed_at: enrollment.completed_at,
      days_completed: days || [],
      completed_days: completedDayNumbers,
      completed_count: completedDayNumbers.length,
      current_day: currentDay,
    };
  }

  const entitlementActive =
    !!entitlement && entitlement.status === "active" && (!entitlement.expires_at || new Date(entitlement.expires_at) > new Date());

  // Free-trial balance, so the UI can say "2 free reports left" and show the
  // paywall before a recording starts. Advisory only: the real decision is
  // made — and the trial actually spent — inside requireReportAccess at the
  // moment a report is generated. A client that ignores this learns nothing
  // and gains nothing.
  let access = { entitled: entitlementActive, used: 0, remaining: 0, limit: 0 };
  try {
    access = await readAccessState(admin, user.id);
  } catch (e) {
    console.error("[YAP] me/state: access state lookup failed", { userId: user.id });
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    profile: profile || null,
    streak: profile?.streak ?? 0,
    stats: profile
      ? { xp: profile.total_xp, reps: profile.total_reps, seconds: profile.total_seconds }
      : { xp: 0, reps: 0, seconds: 0 },
    challenge,
    entitlement: {
      active: entitlementActive,
      product: "pro",
      expires_at: entitlement?.expires_at ?? null,
    },
    access,
  });
}
