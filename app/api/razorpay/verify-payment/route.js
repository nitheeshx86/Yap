import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/authGuard";
import { settlePayment } from "@/lib/yap/payments";

/* Verifies the signature Razorpay hands back, then confirms the payment with
 * Razorpay's own API (never trusting client-declared success), and settles
 * through the SAME `settlePayment` function the webhook uses — so whichever
 * of the two arrives first wins and the second is a no-op.
 *
 * Two things worth knowing about this file:
 *   1. The signature is HMAC-SHA256 over "order_id|payment_id", compared in
 *      constant time. A mismatch means the payload was forged or tampered
 *      with, and nothing is marked as paid.
 *   2. `months` is NEVER read from the request body. The plan and its
 *      duration are resolved from the order's own `notes` (written at
 *      create-order time), fetched fresh from Razorpay's API — a client
 *      posting `months: 12` after paying for one month has no effect. */

export async function POST(request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Payments are not configured on the server" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const orderId = body?.razorpay_order_id;
  const paymentId = body?.razorpay_payment_id;
  const signature = body?.razorpay_signature;
  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
  }

  const expected = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(signature), "utf8");
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) {
    console.error("[YAP] razorpay signature mismatch for order", orderId);
    return NextResponse.json({ error: "Payment could not be verified" }, { status: 400 });
  }

  let user = null;
  try {
    const supabase = await createServerClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch (e) {
    /* handled below */
  }
  if (!user) {
    return NextResponse.json({ error: "Sign in again to finish the upgrade" }, { status: 401 });
  }

  // Confirm with Razorpay's own API — never trust the browser's say-so that
  // the payment succeeded. Read the order's notes for plan/months, and the
  // payment's own status/amount for what was actually captured.
  let order, payment;
  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    [order, payment] = await Promise.all([
      razorpay.orders.fetch(orderId),
      razorpay.payments.fetch(paymentId),
    ]);
  } catch (e) {
    console.error("[YAP] verify-payment: could not fetch order/payment from Razorpay", { orderId, message: e && e.message });
    return NextResponse.json({ error: "Could not confirm the payment with the gateway" }, { status: 502 });
  }

  if (!order || order.notes?.user_id !== user.id) {
    console.error("[YAP] verify-payment: order does not belong to this user", { orderId, userId: user.id });
    return NextResponse.json({ error: "Payment does not match the signed-in account" }, { status: 400 });
  }

  if (payment.order_id !== orderId) {
    console.error("[YAP] verify-payment: payment/order mismatch", { orderId, paymentId });
    return NextResponse.json({ error: "Payment could not be verified" }, { status: 400 });
  }

  const planKey = order.notes?.plan || "pro_monthly";
  const status = payment.status === "captured" ? "captured" : "failed";

  const admin = getAdminClient();
  const result = await settlePayment(admin, {
    userId: user.id,
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    planKey,
    amountPaise: payment.amount,
    status,
    verifiedVia: "handler",
  });

  if (!result.ok) {
    const message =
      result.error === "amount_mismatch"
        ? "Payment amount did not match the plan. Contact support."
        : "Payment received, but the account could not be upgraded automatically.";
    return NextResponse.json({ verified: true, upgraded: false, error: message }, { status: 200 });
  }

  if (status !== "captured") {
    return NextResponse.json({ verified: true, upgraded: false, error: "Payment was not captured" }, { status: 200 });
  }

  return NextResponse.json({ verified: true, upgraded: true, plan_expires_at: result.expiresAt });
}
