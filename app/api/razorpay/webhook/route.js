import { NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { getAdminClient } from "@/lib/supabase/authGuard";
import { settlePayment } from "@/lib/yap/payments";

/* Razorpay webhook. Verifies x-razorpay-signature as HMAC-SHA256 over the RAW
 * request body using RAZORPAY_WEBHOOK_SECRET — the body must be read with
 * request.text() BEFORE any JSON parsing, because parsing and re-stringifying
 * would change the byte sequence and break the signature.
 *
 * Operator action required: set RAZORPAY_WEBHOOK_SECRET in the environment
 * and register this endpoint (https://<host>/api/razorpay/webhook) in the
 * Razorpay dashboard, subscribed to payment.captured, payment.failed,
 * order.paid, and the refund events.
 *
 * Always returns 200 for events we deliberately ignore, so Razorpay stops
 * retrying. Idempotent on razorpay_payment_id via settlePayment's unique
 * constraint — a replayed event changes nothing. */

export async function POST(request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[YAP] razorpay webhook: RAZORPAY_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "webhook not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(signature), "utf8");
  const validSignature = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!validSignature) {
    console.error("[YAP] razorpay webhook: signature mismatch");
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const eventType = event?.event;
  const HANDLED = new Set(["payment.captured", "payment.failed", "order.paid", "refund.created", "refund.processed"]);
  if (!HANDLED.has(eventType)) {
    // deliberately ignored — 200 so Razorpay stops retrying
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    if (eventType === "refund.created" || eventType === "refund.processed") {
      const paymentId = event?.payload?.refund?.entity?.payment_id;
      if (paymentId) {
        const admin = getAdminClient();
        await admin.from("payments").update({ status: "refunded" }).eq("razorpay_payment_id", paymentId);
        await admin
          .from("entitlements")
          .update({ status: "cancelled" })
          .eq(
            "payment_id",
            (await admin.from("payments").select("id").eq("razorpay_payment_id", paymentId).maybeSingle()).data?.id ?? null
          );
      }
      return NextResponse.json({ ok: true });
    }

    const paymentEntity =
      eventType === "order.paid" ? event?.payload?.payment?.entity : event?.payload?.payment?.entity;
    if (!paymentEntity) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const razorpayPaymentId = paymentEntity.id;
    const razorpayOrderId = paymentEntity.order_id;
    const amountPaise = paymentEntity.amount;
    const razorpayStatus = paymentEntity.status; // "captured" | "failed" | ...

    if (!razorpayPaymentId || !razorpayOrderId) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    // fetch the order to read back notes {user_id, plan, months} — never
    // trust anything about plan/duration from the webhook payload itself
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      console.error("[YAP] razorpay webhook: gateway credentials not configured");
      return NextResponse.json({ error: "server not configured" }, { status: 500 });
    }
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.fetch(razorpayOrderId);
    const userId = order?.notes?.user_id;
    const planKey = order?.notes?.plan || "pro_monthly";

    if (!userId) {
      console.error("[YAP] razorpay webhook: order has no user_id in notes", { razorpayOrderId });
      return NextResponse.json({ ok: true, ignored: true });
    }

    const admin = getAdminClient();
    const status = eventType === "payment.failed" ? "failed" : razorpayStatus === "captured" ? "captured" : "failed";

    const result = await settlePayment(admin, {
      userId,
      razorpayOrderId,
      razorpayPaymentId,
      planKey,
      amountPaise,
      status,
      verifiedVia: "webhook",
    });

    if (!result.ok) {
      console.error("[YAP] razorpay webhook: settlement failed", { userId, razorpayPaymentId, error: result.error });
      // still 200 — Razorpay retrying will not fix a logic error, and we
      // already recorded what we could
      return NextResponse.json({ ok: true, settled: false });
    }

    return NextResponse.json({ ok: true, settled: true });
  } catch (e) {
    console.error("[YAP] razorpay webhook: handler threw", { eventType, message: e && e.message });
    // 200 to stop retries; the failure is logged for investigation
    return NextResponse.json({ ok: true, error: "handled with error" });
  }
}
