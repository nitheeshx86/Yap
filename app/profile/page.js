"use client";

import { useAuth } from "@/lib/supabase/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUpgrade } from "@/lib/razorpay";

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  // hooks must run on every render, so this stays above the early returns below
  const { upgrade, paying, payError } = useUpgrade({ email: user?.email });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--sand)", padding: "40px 20px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* Header with Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <img src="/images/yap_logo.png" alt="Yap" style={{ height: "60px", marginBottom: "20px" }} />
          <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "var(--ink)" }}>Profile</h1>
        </div>

        {/* Profile Info Card */}
        <div style={{ 
          background: "white", 
          borderRadius: "12px", 
          padding: "30px", 
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "14px", color: "var(--ink60)", marginBottom: "5px" }}>Email</p>
            <p style={{ fontSize: "16px", fontWeight: "500", color: "var(--ink)" }}>{user.email}</p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "14px", color: "var(--ink60)", marginBottom: "5px" }}>Streak</p>
            <p style={{ fontSize: "16px", fontWeight: "500", color: "var(--ink)" }}>
              {profile?.streak ?? 0} days
            </p>
          </div>

          <div>
            <p style={{ fontSize: "14px", color: "var(--ink60)", marginBottom: "5px" }}>Plan</p>
            <p style={{ fontSize: "16px", fontWeight: "500", color: "var(--ink)" }}>
              {profile?.plan === "paid" ? "PRO" : "Free"}
            </p>
          </div>
        </div>

        {/* Payment Plan Card */}
        <div style={{ 
          background: "white", 
          borderRadius: "12px", 
          padding: "30px", 
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "15px", color: "var(--ink)" }}>
            Payment Plan
          </h2>
          <p style={{ fontSize: "14px", color: "var(--ink60)", marginBottom: "20px" }}>
            {profile?.plan === "paid" 
              ? "You are currently on the PRO plan with unlimited access to all features."
              : "Upgrade to PRO for unlimited speeches and advanced features."
            }
          </p>
          {profile?.plan !== "paid" && (
            <button
              onClick={upgrade}
              disabled={paying}
              style={{
                background: "var(--ink)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: paying ? "default" : "pointer",
                opacity: paying ? 0.6 : 1,
              }}
            >
              {paying ? "Opening payment…" : "Upgrade to PRO — ₹199/month"}
            </button>
          )}
          {payError && (
            <p style={{ marginTop: "12px", marginBottom: 0, fontSize: "13px", color: "#E8674A" }}>
              {payError}
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "15px", flexDirection: "column" }}>
          <button
            onClick={() => router.push("/")}
            style={{
              background: "white",
              color: "var(--ink)",
              border: "2px solid var(--line)",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Back to Home
          </button>
          
          <button
            onClick={handleSignOut}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
