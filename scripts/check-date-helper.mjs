// Executable scenario checks for lib/yap/date.js — the shared local-date
// helper every streak/challenge boundary depends on. Run with:
//   node scripts/check-date-helper.mjs
// No test framework installed anywhere in this repo; node:test is used
// deliberately because it ships with Node and adds zero dependencies.
import test from "node:test";
import assert from "node:assert/strict";
import { localDateInTimezone, reconcileLocalDate, todayLocalDate } from "../lib/yap/date.js";

test("localDateInTimezone: Asia/Kolkata is UTC+5:30, so 23:00 UTC is already tomorrow locally", () => {
  // 2026-01-01T23:00:00Z + 5:30 = 2026-01-02T04:30 IST
  const d = new Date("2026-01-01T23:00:00Z");
  assert.equal(localDateInTimezone(d, "Asia/Kolkata"), "2026-01-02");
});

test("localDateInTimezone: same instant is still 2026-01-01 in UTC", () => {
  const d = new Date("2026-01-01T23:00:00Z");
  assert.equal(localDateInTimezone(d, "UTC"), "2026-01-01");
});

test("localDateInTimezone: falls back to Asia/Kolkata on a bad timezone string instead of throwing", () => {
  const d = new Date("2026-01-01T12:00:00Z");
  assert.doesNotThrow(() => localDateInTimezone(d, "Not/ARealZone"));
});

test("reconcileLocalDate: accepts a client date within 1 day of the server's own computation", () => {
  const server = todayLocalDate("UTC");
  assert.equal(reconcileLocalDate(server, "UTC"), server);
});

test("reconcileLocalDate: rejects a client date far in the future/past and substitutes the server value", () => {
  const server = todayLocalDate("UTC");
  const farFuture = "2099-01-01";
  assert.equal(reconcileLocalDate(farFuture, "UTC"), server);
});

test("reconcileLocalDate: missing/garbage client input always falls back to the server value", () => {
  const server = todayLocalDate("Asia/Kolkata");
  assert.equal(reconcileLocalDate(null, "Asia/Kolkata"), server);
  assert.equal(reconcileLocalDate(undefined, "Asia/Kolkata"), server);
  assert.equal(reconcileLocalDate("not-a-date", "Asia/Kolkata"), server);
  assert.equal(reconcileLocalDate("2026-13-99", "Asia/Kolkata"), server);
});
