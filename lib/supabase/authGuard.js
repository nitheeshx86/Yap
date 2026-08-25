import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "./server";

/**
 * @typedef {object} AuthResult
 * @property {import("@supabase/supabase-js").SupabaseClient} supabase - the request-scoped SSR client (RLS applies)
 * @property {{ id: string, email: string|null }} user
 */

/**
 * Require a signed-in user for a route handler. Never trusts a client-supplied
 * user id — always reads the session from cookies via `auth.getUser()`.
 * @returns {Promise<{ ok: true, ctx: AuthResult } | { ok: false, response: NextResponse }>}
 */
export async function requireUser() {
  let supabase;
  try {
    supabase = await createClient();
  } catch (e) {
    console.error("[YAP] auth guard: could not create supabase client", e && e.message);
    return { ok: false, response: NextResponse.json({ error: "server_error", message: "Could not read session" }, { status: 500 }) };
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return { ok: false, response: NextResponse.json({ error: "unauthorized", message: "Sign in required" }, { status: 401 }) };
  }

  return { ok: true, ctx: { supabase, user: { id: data.user.id, email: data.user.email ?? null } } };
}

/**
 * Service-role admin client. Import this ONLY from files under app/api/ —
 * never from client-reachable code. `SUPABASE_SERVICE_ROLE_KEY` must never
 * ship in the browser bundle.
 * @returns {import("@supabase/supabase-js").SupabaseClient}
 */
export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL is not configured");
  }
  return createAdminClient(url, serviceKey, { auth: { persistSession: false } });
}

/**
 * Require a signed-in user AND an active entitlement for `product`.
 * Uses the admin client to read `entitlements` (RLS still allows select-own,
 * but the admin client avoids a second round trip through cookies).
 * @param {{ product?: string }} [opts]
 * @returns {Promise<{ ok: true, ctx: AuthResult } | { ok: false, response: NextResponse }>}
 */
export async function requireEntitlement(opts = {}) {
  const product = opts.product || "pro";
  const authed = await requireUser();
  if (!authed.ok) return authed;

  const { user } = authed.ctx;
  try {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("entitlements")
      .select("status, expires_at")
      .eq("user_id", user.id)
      .eq("product", product)
      .maybeSingle();

    if (error) {
      console.error("[YAP] entitlement check failed", { route: "requireEntitlement", userId: user.id, code: error.code });
      return { ok: false, response: NextResponse.json({ error: "server_error", message: "Could not verify entitlement" }, { status: 500 }) };
    }

    const active = !!data && data.status === "active" && (!data.expires_at || new Date(data.expires_at) > new Date());
    if (!active) {
      return { ok: false, response: NextResponse.json({ error: "entitlement_required", message: "PRO required for this feature" }, { status: 403 }) };
    }
    return authed;
  } catch (e) {
    console.error("[YAP] entitlement check threw", { route: "requireEntitlement", userId: user.id, message: e && e.message });
    return { ok: false, response: NextResponse.json({ error: "server_error", message: "Could not verify entitlement" }, { status: 500 }) };
  }
}
