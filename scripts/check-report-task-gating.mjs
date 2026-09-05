// Executable check: the metering decision must come from the server-owned
// task registry, never from anything the browser can set. This is the half of
// the paywall that stops "just don't send the flag" — the client cannot name
// a task that yields a report without that task being metered.
import test from "node:test";
import assert from "node:assert/strict";
import { TASKS, getTask } from "../lib/yap/tasks.js";

test("every task that produces a report is metered", () => {
  // These four are the whole registry; a report is what the user pays for.
  for (const name of ["topic_eval", "debate_eval", "vocab_judge"]) {
    assert.equal(TASKS[name].metered, true, `${name} must be metered`);
  }
});

test("the only unmetered task is prep help, shown before the user speaks", () => {
  const unmetered = Object.entries(TASKS).filter(([, t]) => !t.metered).map(([n]) => n);
  assert.deepEqual(unmetered, ["debate_brief"],
    "a new unmetered task is a paywall hole unless it genuinely predates the speech");
});

test("an unknown task name is rejected outright", () => {
  // The bypass attempt: invent a task, or send none at all.
  for (const bogus of ["", null, undefined, "eval", "topic_eval_", "__proto__", "constructor", "toString"]) {
    assert.equal(getTask(bogus), null, `getTask(${JSON.stringify(bogus)}) must be null`);
  }
});

test("prototype keys cannot be reached through the registry", () => {
  // hasOwnProperty guard: without it, getTask("toString") would return a
  // function and the route would treat it as a task spec.
  assert.equal(getTask("hasOwnProperty"), null);
  assert.equal(getTask("valueOf"), null);
});

test("every task owns its prompt and its token ceiling server-side", () => {
  for (const [name, t] of Object.entries(TASKS)) {
    assert.equal(typeof t.system, "string", `${name} must carry its own prompt`);
    assert.ok(t.system.length > 100, `${name}'s prompt must be the real one`);
    assert.ok(["topic", "debate", "vocab"].includes(t.kind), `${name} needs a ledger kind`);
    assert.equal(typeof t.maxTokens, "number", `${name} must cap its own token spend`);
  }
});
