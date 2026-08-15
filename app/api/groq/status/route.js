import { NextResponse } from "next/server";

// A tiny, key-free check so the client can tell "on by default" from "not
// configured yet" instead of guessing from a browser key that no longer
// matters. Never returns the key itself, only whether one is set.
export async function GET() {
  return NextResponse.json({ ready: !!process.env.GROQ_API_KEY });
}
