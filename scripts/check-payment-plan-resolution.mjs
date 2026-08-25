// Executable check: settlePayment() must resolve plan/duration from PLANS
// (sourced from the order's own notes), never from client-controlled input.
// This directly covers the "months: 12 forged in the body -> ignored" and
// "amount tampered -> rejected" scenarios from the task's verification list,
// without needing a live Supabase project — the admin client is a minimal
// in-memory fake of just the chainable methods settlePayment() calls.
import test from "node:test";
import assert from "node:assert/strict";
import { settlePayment, PLANS } from "../lib/yap/payments.js";

function makeFakeAdmin({ existingPayment = null, existingEntitlement = null } = {}) {
  const calls = { paymentsUpserts: [], entitlementsUpserts: [], profilesUpdates: [] };
  const admin = {
    from(table) {
      if (table === "payments") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data: existingPayment, error: null }),
            }),
          }),
          upsert: (row) => {
            calls.paymentsUpserts.push(row);
            return { select: () => ({ single: async () => ({ data: { id: "payment-1" }, error: null }) }) };
          },
        };
      }
      if (table === "entitlements") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({ data: existingEntitlement, error: null }),
              }),
            }),
          }),
          upsert: async (row) => {
            calls.entitlementsUpserts.push(row);
            return { error: null };
          },
        };
      }
      if (table === "profiles") {
        return {
          update: (row) => ({
            eq: async () => {
              calls.profilesUpdates.push(row);
              return { error: null };
            },
          }),
        };
      }
      throw new Error("unexpected table " + table);
    },
  };
  return { admin, calls };
}

test("months forged to 12 in the client body is ignored — the plan's own duration wins", async () => {
  const { admin, calls } = makeFakeAdmin();
  const result = await settlePayment(admin, {
    userId: "u1",
    razorpayOrderId: "order_1",
    razorpayPaymentId: "pay_1",
    planKey: "pro_monthly",       // order.notes.plan says monthly
    months: 12,                   // forged client value — settlePayment must not read this
    amountPaise: PLANS.pro_monthly.amount, // amount actually captured matches the monthly plan
    status: "captured",
    verifiedVia: "handler",
  });
  assert.equal(result.ok, true);
  const paymentRow = calls.paymentsUpserts[0];
  assert.equal(paymentRow.months, 1, "must resolve to the monthly plan's 1 month, not the forged 12");
  const expiresAt = new Date(result.expiresAt);
  const now = new Date();
  const monthsDiff = (expiresAt.getFullYear() - now.getFullYear()) * 12 + (expiresAt.getMonth() - now.getMonth());
  assert.ok(monthsDiff <= 1, `expiry should be ~1 month out, was ${monthsDiff} months`);
});

test("amount mismatch (client paid less than the plan price) is rejected, not silently accepted", async () => {
  const { admin, calls } = makeFakeAdmin();
  const result = await settlePayment(admin, {
    userId: "u1",
    razorpayOrderId: "order_2",
    razorpayPaymentId: "pay_2",
    planKey: "pro_yearly",
    months: 12,
    amountPaise: 100, // far below the yearly plan's real price
    status: "captured",
    verifiedVia: "handler",
  });
  assert.equal(result.ok, false);
  assert.equal(result.error, "amount_mismatch");
  assert.equal(calls.entitlementsUpserts.length, 0, "no entitlement should be granted on a mismatched amount");
});

test("a replayed payment_id that is already captured is a no-op (idempotent)", async () => {
  const { admin, calls } = makeFakeAdmin({ existingPayment: { id: "payment-1", status: "captured" } });
  const result = await settlePayment(admin, {
    userId: "u1",
    razorpayOrderId: "order_3",
    razorpayPaymentId: "pay_3",
    planKey: "pro_monthly",
    months: 1,
    amountPaise: PLANS.pro_monthly.amount,
    status: "captured",
    verifiedVia: "webhook",
  });
  assert.equal(result.ok, true);
  assert.equal(result.alreadySettled, true);
  assert.equal(calls.paymentsUpserts.length, 0, "must not write a new payment row for an already-captured payment_id");
  assert.equal(calls.entitlementsUpserts.length, 0, "must not extend the entitlement again");
});

test("a failed payment records the payment but never grants an entitlement", async () => {
  const { admin, calls } = makeFakeAdmin();
  const result = await settlePayment(admin, {
    userId: "u1",
    razorpayOrderId: "order_4",
    razorpayPaymentId: "pay_4",
    planKey: "pro_monthly",
    months: 1,
    amountPaise: PLANS.pro_monthly.amount,
    status: "failed",
    verifiedVia: "webhook",
  });
  assert.equal(result.ok, true);
  assert.equal(calls.paymentsUpserts.length, 1);
  assert.equal(calls.paymentsUpserts[0].status, "failed");
  assert.equal(calls.entitlementsUpserts.length, 0, "a failed payment must never grant PRO access");
});
