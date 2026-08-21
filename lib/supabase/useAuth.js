"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "./client";

// Minimal client-side auth/profile hook: who's signed in, and their
// streak/plan row from `profiles`. No transcripts or analysis are stored.
export function useAuth() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (supabase, uid) => {
    const { data } = await supabase
      .from("profiles")
      .select("streak, plan, plan_expires_at")
      .eq("id", uid)
      .single();
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      const u = data.user ?? null;
      setUser(u);
      if (u) loadProfile(supabase, u.id);
      setLoading(false);
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

  return { user, profile, loading, signInWithGoogle, signOut };
}
