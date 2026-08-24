import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

/* Verifies the signature Razorpay hands back, and only then upgrades the plan.
 *
 * Two things worth knowing about this file:
 *   1. The signature is HMAC-SHA256 over "order_id|payment_id" using the key
 *      SECRET, compared in constant time. A mismatch means the payload was
 *      forged or tampered with, and nothing is marked as paid.
 *   2. The upgrade is written with the SERVICE ROLE key, because the schema
 *      deliberately revokes `plan` updates from authenticated users — that
 *      column may only ever move as the result of a verified payment. */

export async function POST(request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
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

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  // constant-time compare; lengths must match or timingSafeEqual throws
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(signature), "utf8");
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) {
    console.error("[YAP] razorpay signature mismatch for order", orderId);
    return NextResponse.json({ error: "Payment could not be verified" }, { status: 400 });
  }

  // Signature is good. Work out who this was for, from the session.
  let user = null;
  try {
    const supabase = await createServerClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch (e) { /* handled below */ }
  if (!user) {
    return NextResponse.json({ error: "Sign in again to finish the upgrade" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    // The payment IS valid at this point — say so, and flag that the account
    // still needs upgrading, rather than telling the user it failed.
    console.error("[YAP] verified payment but SUPABASE_SERVICE_ROLE_KEY is missing");
    return NextResponse.json(
      { verified: true, upgraded: false, error: "Payment received, but the account could not be upgraded automatically." },
      { status: 200 }
    );
  }

  const months = Number(body?.months) === 12 ? 12 : 1;
  const expires = new Date();
  expires.setMonth(expires.getMonth() + months);

  try {
    const admin = createAdminClient(url, serviceKey, { auth: { persistSession: false } });
    const { error } = await admin
      .from("profiles")
      .update({ plan: "paid", plan_expires_at: expires.toISOString() })
      .eq("id", user.id);
    if (error) throw error;
  } catch (e) {
    console.error("[YAP] plan upgrade failed after verified payment:", e && (e.message || e));
    return NextResponse.json(
      { verified: true, upgraded: false, error: "Payment received, but the account could not be upgraded automatically." },
      { status: 200 }
    );
  }

  return NextResponse.json({ verified: true, upgraded: true, plan_expires_at: expires.toISOString() });
}
