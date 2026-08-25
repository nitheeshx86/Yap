import { NextResponse } from "next/server";
import { requireUser, getAdminClient } from "@/lib/supabase/authGuard";

/** `{ active, product, expires_at }`, computed from `entitlements`. */
export async function GET() {
  const authed = await requireUser();
  if (!authed.ok) return authed.response;
  const { user } = authed.ctx;

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("entitlements")
    .select("status, expires_at")
    .eq("user_id", user.id)
    .eq("product", "pro")
    .maybeSingle();

  if (error) {
    console.error("[YAP] entitlement: lookup failed", { userId: user.id, code: error.code });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  const active = !!data && data.status === "active" && (!data.expires_at || new Date(data.expires_at) > new Date());
  return NextResponse.json({ active, product: "pro", expires_at: data?.expires_at ?? null });
}
