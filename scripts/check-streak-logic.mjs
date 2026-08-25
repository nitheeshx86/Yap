// Executable model check for the streak-walk algorithm implemented in
// supabase/migrations/..._sessions_challenge_entitlements.sql's
// recompute_streak(). This file re-implements the SAME algorithm in JS
// (distinct local_date values, newest first; consecutive-day walk) so the
// logic can be exercised without a live Postgres instance. It is a design
// cross-check, not a replacement for testing the actual SQL function against
// a real database — see the final report for what that means for confidence.
import test from "node:test";
import assert from "node:assert/strict";

const oneDay = (dateStr, n) => {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Mirrors recompute_streak()'s SQL walk exactly. */
function computeStreak(qualifyingDatesDesc, today) {
  if (!qualifyingDatesDesc.length) return 0;
  const newest = qualifyingDatesDesc[0];
  const yesterday = oneDay(today, -1);
  if (newest < yesterday) return 0; // gap of 2+ days since the last qualifying day
  let streak = 1;
  let expected = oneDay(newest, -1);
  for (let i = 1; i < qualifyingDatesDesc.length; i++) {
    if (qualifyingDatesDesc[i] === expected) {
      streak++;
      expected = oneDay(qualifyingDatesDesc[i], -1);
    } else break;
  }
  return streak;
}

test("two topic sessions on the same local_date count once, not twice (dedup happens before this function via DISTINCT)", () => {
  const today = "2026-08-24";
  // distinct local_date values only — the SQL uses `array_agg(distinct local_date ...)`
  const dates = [today];
  assert.equal(computeStreak(dates, today), 1);
});

test("consecutive days extend the streak", () => {
  const today = "2026-08-24";
  const dates = [today, oneDay(today, -1), oneDay(today, -2)];
  assert.equal(computeStreak(dates, today), 3);
});

test("a session yesterday but none today still counts (grace until local midnight)", () => {
  const today = "2026-08-24";
  const dates = [oneDay(today, -1), oneDay(today, -2)];
  assert.equal(computeStreak(dates, today), 2);
});

test("a gap of 2+ days resets the streak to 0 (server then starts fresh at 1 on the next qualifying session)", () => {
  const today = "2026-08-24";
  const dates = [oneDay(today, -3), oneDay(today, -4)]; // nothing yesterday or today
  assert.equal(computeStreak(dates, today), 0);
});

test("a missed single day in the middle of history stops the walk there", () => {
  const today = "2026-08-24";
  const dates = [today, oneDay(today, -1), oneDay(today, -3), oneDay(today, -4)]; // gap at -2
  assert.equal(computeStreak(dates, today), 2);
});

test("no qualifying sessions at all -> streak 0", () => {
  assert.equal(computeStreak([], "2026-08-24"), 0);
});
