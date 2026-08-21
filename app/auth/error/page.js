import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div style={{ padding: 40, fontFamily: "sans-serif", textAlign: "center" }}>
      <h1>Sign-in failed</h1>
      <p>Something went wrong while signing you in. Please try again.</p>
      <Link href="/">Back to Yap</Link>
    </div>
  );
}
