import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

/* Creates a Razorpay order. The amount is decided HERE, never taken from the
 * request body — a client-supplied price is a client-controlled price. The
 * caller only says which plan it wants. */

// paise. One place to change the price.
const PLANS = {
  pro_monthly: { amount: 19900, label: "Yap PRO — 1 month", months: 1 },
  pro_yearly: { amount: 149900, label: "Yap PRO — 12 months", months: 12 },
};

export async function POST(request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: "Payments are not configured on the server" }, { status: 500 });
  }

  // Only a signed-in user can start a purchase: the order receipt carries the
  // user id, which is what verify-payment later uses to upgrade the right row.
  let user = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch (e) {
    return NextResponse.json({ error: "Could not read the session" }, { status: 500 });
  }
  if (!user) {
    return NextResponse.json({ error: "Sign in before upgrading" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    body = {};
  }

  const plan = PLANS[body?.plan] || PLANS.pro_monthly;
  if (plan.amount < 100) {
    return NextResponse.json({ error: "Amount is below the minimum of 100 paise" }, { status: 400 });
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

  try {
    const order = await razorpay.orders.create({
      amount: plan.amount,
      currency: "INR",
      // receipts are capped at 40 chars by Razorpay
      receipt: `yap_${user.id.replace(/-/g, "").slice(0, 24)}_${Date.now().toString(36)}`.slice(0, 40),
      notes: { user_id: user.id, plan: body?.plan || "pro_monthly", months: String(plan.months) },
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      label: plan.label,
    });
  } catch (e) {
    const status = e && e.statusCode === 401 ? 401 : 500;
    const message = status === 401
      ? "Payment gateway rejected the credentials"
      : "Could not create the order. Try again in a moment.";
    // the full error is for the server log, never the client
    console.error("[YAP] razorpay create-order failed:", e && (e.error || e.message || e));
    return NextResponse.json({ error: message }, { status });
  }
}
