"use client";

import { useCallback, useState } from "react";

/* Loads Razorpay's checkout script once and resolves when it is ready.
   Kept out of the page so the <script> is only fetched if someone actually
   goes to pay, rather than on every page load. */
const SRC = "https://checkout.razorpay.com/v1/checkout.js";
let pending = null;

export function loadRazorpay() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (pending) return pending;

  pending = new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${SRC}"]`);
    const el = existing || document.createElement("script");
    el.addEventListener("load", () => resolve(!!window.Razorpay));
    el.addEventListener("error", () => { pending = null; resolve(false); });
    if (!existing) {
      el.src = SRC;
      el.async = true;
      document.body.appendChild(el);
    }
  });
  return pending;
}

/* Shared checkout flow: create the order server-side, open Razorpay against
   it, then verify the signature on our own endpoint before anything counts as
   paid. Lives here rather than in a page so every upgrade entry point behaves
   identically. */
export function useUpgrade({ email, plan = "pro_monthly", months = 1, onPaid } = {}) {
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const upgrade = useCallback(async () => {
    setPayError("");
    setPaying(true);
    try {
      const ready = await loadRazorpay();
      if (!ready) throw new Error("Could not load the payment window. Check your connection.");

      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const order = await res.json();
      if (!res.ok) throw new Error(order?.error || "Could not start the payment.");

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: order.order_id,
        amount: order.amount,
        currency: order.currency,
        name: "Yap",
        description: order.label,
        prefill: { email: email || "" },
        theme: { color: "#5FAECB" },
        modal: {
          // the user closed the sheet without paying — not an error
          ondismiss: () => setPaying(false),
        },
        handler: async (response) => {
          try {
            const v = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, months }),
            });
            const out = await v.json();
            if (!v.ok || !out.verified) throw new Error(out?.error || "Payment could not be verified.");
            if (!out.upgraded) {
              setPayError(out.error || "Payment received — contact support to activate PRO.");
              return;
            }
            if (onPaid) onPaid();
            else window.location.reload();   // pick the new plan up from profiles
          } catch (err) {
            setPayError(err.message || "Payment could not be verified.");
          } finally {
            setPaying(false);
          }
        },
      });

      rzp.on("payment.failed", (resp) => {
        setPayError((resp && resp.error && resp.error.description) || "The payment failed. You have not been charged.");
        setPaying(false);
      });

      rzp.open();
    } catch (err) {
      setPayError(err.message || "Something went wrong starting the payment.");
      setPaying(false);
    }
  }, [email, plan, months, onPaid]);

  return { upgrade, paying, payError };
}
