"use client";

import { useAuth } from "@/lib/supabase/useAuth";

export function AuthBar() {
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <button type="button" className="pot" onClick={signInWithGoogle} style={{ cursor: "pointer", border: "2.5px solid var(--line)" }}>
        <span style={{ fontSize: 13, fontFamily: "var(--mon)" }}>Sign in with Google</span>
      </button>
    );
  }

  return (
    <div className="pot" style={{ gap: 10 }}>
      <div>
        <b>{profile?.streak ?? 0}</b> <small>streak</small>
      </div>
      {profile?.plan === "paid" && <small style={{ color: "var(--ink60)" }}>PRO</small>}
      <button
        type="button"
        onClick={signOut}
        title={user.email}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "var(--ink60)", padding: 0 }}
      >
        Sign out
      </button>
    </div>
  );
}
