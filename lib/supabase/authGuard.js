import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "./server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REPORT_KINDS = new Set(["topic", "debate", "vocab"]);

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
 * @typedef {object} AccessState
 * @property {boolean} entitled - has an active PRO entitlement
 * @property {number} used - free trials consumed so far
 * @property {number} remaining - free trials left
 * @property {number} limit - the total free allowance
 */

/**
 * Read the caller's access state without consuming anything. For hydrating
 * the UI ("2 free reports left") — never as a gate. The gate is
 * `requireReportAccess`, which decides and consumes in one atomic step.
 * @param {import("@supabase/supabase-js").SupabaseClient} admin
 * @param {string} userId
 * @returns {Promise<AccessState>}
 */
export async function readAccessState(admin, userId) {
  const { data, error } = await admin.rpc("get_access_state", { p_user_id: userId });
  if (error) {
    console.error("[YAP] readAccessState failed", { userId, code: error.code });
    throw new Error("access_state_unavailable");
  }
  const row = Array.isArray(data) ? data[0] : data;
  return {
    entitled: !!row?.entitled,
    used: row?.used ?? 0,
    remaining: row?.remaining ?? 0,
    limit: row?.limit_total ?? 0,
  };
}

/**
 * The paywall. Require a signed-in user who may generate one report — either
 * because they have an active entitlement, or because they still have a free
 * trial left, which this call spends.
 *
 * Consumption is atomic and idempotent on `clientEventId`: a retry of the same
 * attempt (a dropped connection, a double-tap, the report's second AI call)
 * costs nothing, while a genuinely new attempt costs one trial. That id must
 * therefore be minted per attempt by the client and reused across the retries
 * of that attempt — which is exactly the contract `client_event_id` already
 * has in /api/sessions/complete.
 *
 * A caller that omits `clientEventId` gets a per-call charge, which is the
 * safe default: it can only ever over-charge the trial budget, never let an
 * extra report through.
 *
 * @param {object} params
 * @param {string} params.clientEventId - uuid, the per-attempt idempotency key
 * @param {"topic"|"debate"|"vocab"} params.kind
 * @returns {Promise<{ ok: true, ctx: AuthResult & { access: AccessState & { reason: string } } } | { ok: false, response: NextResponse }>}
 */
export async function requireReportAccess({ clientEventId, kind }) {
  const authed = await requireUser();
  if (!authed.ok) return authed;
  const { user } = authed.ctx;

  const eventId = UUID_RE.test(String(clientEventId || "")) ? String(clientEventId) : randomUUID();
  const safeKind = REPORT_KINDS.has(kind) ? kind : "topic";

  let admin;
  try {
    admin = getAdminClient();
  } catch (e) {
    console.error("[YAP] requireReportAccess: admin client unavailable", e && e.message);
    return { ok: false, response: NextResponse.json({ error: "server_error", message: "Could not verify access" }, { status: 500 }) };
  }

  const { data, error } = await admin.rpc("consume_free_trial", {
    p_user_id: user.id,
    p_client_event_id: eventId,
    p_kind: safeKind,
  });

  // Fail CLOSED. A database error here must deny, not allow: an attacker who
  // can induce an error should not thereby get unlimited free reports.
  if (error) {
    console.error("[YAP] requireReportAccess: rpc failed", { userId: user.id, code: error.code, message: error.message });
    return { ok: false, response: NextResponse.json({ error: "server_error", message: "Could not verify access" }, { status: 500 }) };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    console.error("[YAP] requireReportAccess: rpc returned no row", { userId: user.id });
    return { ok: false, response: NextResponse.json({ error: "server_error", message: "Could not verify access" }, { status: 500 }) };
  }

  const access = {
    entitled: row.reason === "entitled",
    reason: row.reason,
    used: row.used ?? 0,
    remaining: row.remaining ?? 0,
    limit: row.limit_total ?? 0,
  };

  if (!row.allowed) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "trial_exhausted",
          message: `You've used all ${access.limit} free reports. Upgrade to Yap PRO to keep going.`,
          used: access.used,
          remaining: 0,
          limit: access.limit,
        },
        { status: 402 }
      ),
    };
  }

  return { ok: true, ctx: { ...authed.ctx, access } };
}
