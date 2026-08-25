/* ============================================================================
   YAP — Razorpay payment settlement (server-only)
   Shared by /api/razorpay/verify-payment (the handler callback path) and
   /api/razorpay/webhook (the authoritative async path) so whichever arrives
   first wins and the second is a no-op. Never import this from client code.
   ========================================================================== */

/**
 * @typedef {object} PlanInfo
 * @property {number} amount - paise
 * @property {string} label
 * @property {number} months
 */

/** Mirrors app/api/razorpay/create-order/route.js — the single source of
 *  truth for price and duration. Never taken from client input. */
export const PLANS = {
  pro_monthly: { amount: 19900, label: "Yap PRO — 1 month", months: 1 },
  pro_yearly: { amount: 149900, label: "Yap PRO — 12 months", months: 12 },
};

/**
 * Settle a captured Razorpay payment: insert/upsert the `payments` row and
 * extend the `entitlements` row, idempotent on `razorpay_payment_id`.
 * Resolves the plan from the order's `notes` (set at create-order time),
 * never from client input.
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} admin - service-role client
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.razorpayOrderId
 * @param {string} params.razorpayPaymentId
 * @param {string} params.planKey - from order.notes.plan
 * @param {number} params.months - from order.notes.months, clamped to a known plan
 * @param {number} params.amountPaise - the amount Razorpay actually captured
 * @param {"captured"|"failed"} params.status
 * @param {"handler"|"webhook"} params.verifiedVia
 * @returns {Promise<{ ok: boolean, alreadySettled: boolean, expiresAt: string|null, error?: string }>}
 */
export async function settlePayment(admin, params) {
  const { userId, razorpayOrderId, razorpayPaymentId, planKey, months, amountPaise, status, verifiedVia } = params;

  const plan = PLANS[planKey] || PLANS.pro_monthly;
  const resolvedMonths = plan.months; // never trust a client/body-supplied months value

  // Idempotency: has this payment_id already been recorded?
  const { data: existing, error: existingErr } = await admin
    .from("payments")
    .select("id, status")
    .eq("razorpay_payment_id", razorpayPaymentId)
    .maybeSingle();

  if (existingErr) {
    console.error("[YAP] settlePayment: existing lookup failed", { userId, code: existingErr.code });
    return { ok: false, alreadySettled: false, expiresAt: null, error: "server_error" };
  }

  if (existing && existing.status === "captured") {
    // already settled by the other path (handler or webhook) — no-op
    const { data: ent } = await admin
      .from("entitlements")
      .select("expires_at")
      .eq("user_id", userId)
      .eq("product", "pro")
      .maybeSingle();
    return { ok: true, alreadySettled: true, expiresAt: ent?.expires_at ?? null };
  }

  // amount sanity check — the plan's expected amount must match what was
  // actually captured, so a tampered client can't buy 12 months for the
  // price of 1
  if (status === "captured" && amountPaise !== plan.amount) {
    console.error("[YAP] settlePayment: amount mismatch", { userId, planKey, expected: plan.amount, got: amountPaise });
    await admin.from("payments").upsert(
      {
        user_id: userId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        plan_key: planKey,
        months: resolvedMonths,
        amount_paise: amountPaise,
        status: "failed",
        verified_via: verifiedVia,
      },
      { onConflict: "razorpay_payment_id" }
    );
    return { ok: false, alreadySettled: false, expiresAt: null, error: "amount_mismatch" };
  }

  const paymentRow = {
    user_id: userId,
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    plan_key: planKey,
    months: resolvedMonths,
    amount_paise: amountPaise,
    status,
    verified_via: verifiedVia,
  };

  const { data: payment, error: paymentErr } = await admin
    .from("payments")
    .upsert(paymentRow, { onConflict: "razorpay_payment_id" })
    .select("id")
    .single();

  if (paymentErr) {
    console.error("[YAP] settlePayment: payment upsert failed", { userId, code: paymentErr.code });
    return { ok: false, alreadySettled: false, expiresAt: null, error: "server_error" };
  }

  if (status !== "captured") {
    return { ok: true, alreadySettled: false, expiresAt: null };
  }

  // Extend from the greater of now() or the current expiry, so a renewal
  // before the old one lapses does not lose the remaining time.
  const { data: currentEnt } = await admin
    .from("entitlements")
    .select("expires_at, status")
    .eq("user_id", userId)
    .eq("product", "pro")
    .maybeSingle();

  const now = new Date();
  const base =
    currentEnt && currentEnt.status === "active" && currentEnt.expires_at && new Date(currentEnt.expires_at) > now
      ? new Date(currentEnt.expires_at)
      : now;
  const expires = new Date(base);
  expires.setMonth(expires.getMonth() + resolvedMonths);

  const { error: entErr } = await admin.from("entitlements").upsert(
    {
      user_id: userId,
      product: "pro",
      source: "razorpay",
      starts_at: now.toISOString(),
      expires_at: expires.toISOString(),
      status: "active",
      payment_id: payment.id,
    },
    { onConflict: "user_id,product" }
  );

  if (entErr) {
    console.error("[YAP] settlePayment: entitlement upsert failed", { userId, code: entErr.code });
    return { ok: false, alreadySettled: false, expiresAt: null, error: "server_error" };
  }

  // keep the profiles read-cache in sync for the legacy `plan`/`plan_expires_at` UI checks
  await admin
    .from("profiles")
    .update({ plan: "paid", plan_expires_at: expires.toISOString() })
    .eq("id", userId);

  return { ok: true, alreadySettled: false, expiresAt: expires.toISOString() };
}
