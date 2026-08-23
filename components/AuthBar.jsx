"use client";

import { useAuth } from "@/lib/supabase/useAuth";
import { useRouter } from "next/navigation";

export function AuthBar() {
  const { user, profile, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  if (loading) return null;

  if (!user) {
    return (
      <button type="button" className="pot" onClick={signInWithGoogle} style={{ cursor: "pointer", border: "2.5px solid var(--line)" }}>
        <span style={{ fontSize: 13, fontFamily: "var(--mon)" }}>Sign in with Google</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.push("/profile")}
      title={user.email}
      style={{ 
        cursor: "pointer", 
        border: "2.5px solid var(--line)",
        background: "white",
        position: "relative",
        borderRadius: "50%",
        width: "44px",
        height: "44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0"
      }}
    >
      {/* Profile Icon */}
      <svg 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        style={{ color: "var(--ink)" }}
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
      {profile?.plan === "paid" && (
        <span style={{ 
          position: "absolute", 
          top: "-5px", 
          right: "-5px", 
          background: "var(--ink)", 
          color: "white", 
          fontSize: "9px", 
          fontWeight: "bold", 
          padding: "2px 4px", 
          borderRadius: "4px" 
        }}>
          PRO
        </span>
      )}
    </button>
  );
}
