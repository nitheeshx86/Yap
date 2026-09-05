// Executable check: the free-trial cap must hold under the ways a user would
// actually try to get past it. There is no Postgres in this environment, so
// this models consume_free_trial()'s control flow exactly as the migration
// writes it — including the advisory lock — over an in-memory ledger, and
// asserts the decisions. It is a check on the LOGIC, not on the SQL dialect:
// if you edit the function body in the migration, edit this to match.
import test from "node:test";
import assert from "node:assert/strict";

const LIMIT = 3;

function makeDb() {
  return { rows: [], entitled: new Set(), locks: new Set() };
}

/* Mirrors public.consume_free_trial. `await`-free on purpose: the advisory
   lock makes the real function a critical section per user, so modelling it
   as a synchronous body under an explicit lock is faithful. */
function consumeFreeTrial(db, userId, clientEventId, kind) {
  if (!["topic", "debate", "vocab"].includes(kind)) throw new Error("invalid kind");

  // pg_advisory_xact_lock: one decision per user at a time.
  if (db.locks.has(userId)) throw new Error("lock contention — would have blocked");
  db.locks.add(userId);
  try {
    const used = () => db.rows.filter((r) => r.user_id === userId).length;

    if (db.entitled.has(userId)) {
      return { allowed: true, reason: "entitled", used: used(), remaining: Math.max(LIMIT - used(), 0), limit: LIMIT };
    }
    const existing = db.rows.some((r) => r.user_id === userId && r.client_event_id === clientEventId);
    if (existing) {
      return { allowed: true, reason: "replay", used: used(), remaining: Math.max(LIMIT - used(), 0), limit: LIMIT };
    }
    if (used() < LIMIT) {
      db.rows.push({ user_id: userId, client_event_id: clientEventId, kind });
      return { allowed: true, reason: "consumed", used: used(), remaining: Math.max(LIMIT - used(), 0), limit: LIMIT };
    }
    return { allowed: false, reason: "exhausted", used: used(), remaining: 0, limit: LIMIT };
  } finally {
    db.locks.delete(userId);
  }
}

test("a free user gets exactly three reports, then is refused", () => {
  const db = makeDb();
  const results = [1, 2, 3, 4, 5].map((n) => consumeFreeTrial(db, "u1", `event-${n}`, "topic"));
  assert.deepEqual(results.map((r) => r.allowed), [true, true, true, false, false]);
  assert.deepEqual(results.map((r) => r.reason),
    ["consumed", "consumed", "consumed", "exhausted", "exhausted"]);
  assert.equal(db.rows.length, 3, "never more than three rows are ever written");
});

test("the three trials are shared across modes, not three per mode", () => {
  const db = makeDb();
  assert.equal(consumeFreeTrial(db, "u1", "e1", "topic").allowed, true);
  assert.equal(consumeFreeTrial(db, "u1", "e2", "debate").allowed, true);
  assert.equal(consumeFreeTrial(db, "u1", "e3", "vocab").allowed, true);
  // A fourth, in a mode not yet used, must still be refused.
  const fourth = consumeFreeTrial(db, "u1", "e4", "debate");
  assert.equal(fourth.allowed, false);
  assert.equal(fourth.reason, "exhausted");
});

test("retrying ONE attempt is idempotent and free", () => {
  const db = makeDb();
  const first = consumeFreeTrial(db, "u1", "same-event", "topic");
  assert.equal(first.reason, "consumed");
  // the report's retry, a double-tap, a dropped connection: same event id
  for (let i = 0; i < 5; i++) {
    const again = consumeFreeTrial(db, "u1", "same-event", "topic");
    assert.equal(again.allowed, true);
    assert.equal(again.reason, "replay");
  }
  assert.equal(db.rows.length, 1, "a retried attempt costs exactly one trial");
  // and the other two trials are still available
  assert.equal(consumeFreeTrial(db, "u1", "e2", "topic").allowed, true);
  assert.equal(consumeFreeTrial(db, "u1", "e3", "topic").allowed, true);
  assert.equal(consumeFreeTrial(db, "u1", "e4", "topic").allowed, false);
});

test("N parallel requests cannot exceed the cap", () => {
  // The advisory lock serialises them, so this models them running one after
  // another rather than all reading the same pre-insert count. Ten requests
  // with ten distinct event ids must still yield exactly three grants.
  const db = makeDb();
  const results = Array.from({ length: 10 }, (_, i) => consumeFreeTrial(db, "u1", `race-${i}`, "topic"));
  assert.equal(results.filter((r) => r.allowed).length, 3);
  assert.equal(db.rows.length, 3);
});

test("the cap is per user — one user's spending does not affect another", () => {
  const db = makeDb();
  [1, 2, 3, 4].forEach((n) => consumeFreeTrial(db, "u1", `e${n}`, "topic"));
  assert.equal(consumeFreeTrial(db, "u2", "e1", "topic").allowed, true);
  assert.equal(db.rows.filter((r) => r.user_id === "u1").length, 3);
});

test("an entitled user never spends a trial, and banks the unused ones", () => {
  const db = makeDb();
  consumeFreeTrial(db, "u1", "e1", "topic");        // one spent while free
  db.entitled.add("u1");                             // they upgrade
  for (let i = 0; i < 20; i++) {
    const r = consumeFreeTrial(db, "u1", `pro-${i}`, "topic");
    assert.equal(r.allowed, true);
    assert.equal(r.reason, "entitled");
  }
  assert.equal(db.rows.length, 1, "PRO usage never touches the ledger");
  // If the entitlement later lapses, the two unspent trials are still there.
  db.entitled.delete("u1");
  assert.equal(consumeFreeTrial(db, "u1", "after-1", "topic").allowed, true);
  assert.equal(consumeFreeTrial(db, "u1", "after-2", "topic").allowed, true);
  assert.equal(consumeFreeTrial(db, "u1", "after-3", "topic").allowed, false);
});

test("an exhausted user stays exhausted across new attempts", () => {
  const db = makeDb();
  [1, 2, 3].forEach((n) => consumeFreeTrial(db, "u1", `e${n}`, "topic"));
  // minting fresh event ids (a new recording each time) must not help
  for (let i = 0; i < 10; i++) {
    assert.equal(consumeFreeTrial(db, "u1", `fresh-${i}`, "vocab").allowed, false);
  }
});
