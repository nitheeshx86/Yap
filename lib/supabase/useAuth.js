"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "./client";

// Minimal client-side auth/profile hook: who's signed in, and their
// streak/plan row from `profiles`. No transcripts or analysis are stored.
// Note: `streak`/`plan`/`plan_expires_at` here are read-only denormalised
// caches — the authoritative streak/entitlement come from /api/me/state
// (see useMeState in YapApp.jsx). This hook stays focused on identity.
export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async (supabase, uid) => {
    const { data, error: err } = await supabase
      .from("profiles")
      .select("streak, plan, plan_expires_at, timezone, display_name, onboarding_done, goal")
      .eq("id", uid)
      .single();
    if (err) {
      setError(err.message || "Could not load profile");
      setProfile(null);
      return;
    }
    setError(null);
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const u = data.user ?? null;
      setUser(u);
      if (u) loadProfile(supabase, u.id).finally(() => active && setLoading(false));
      else setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadProfile(supabase, u.id);
      else setProfile(null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  /* Re-read the profile row on demand. Needed because `onboarding_done` is
     written server-side (via /api/me/onboarding, service role) rather than by
     this client, so nothing here would otherwise learn that it flipped — the
     app would keep replaying onboarding forever on a stale `false`. */
  const refreshProfile = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const uid = data?.user?.id;
    if (!uid) return null;
    await loadProfile(supabase, uid);
    return true;
  }, [loadProfile]);

  const signInWithGoogle = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  }, []);

  return { user, profile, loading, error, signInWithGoogle, signOut, refreshProfile };
}
