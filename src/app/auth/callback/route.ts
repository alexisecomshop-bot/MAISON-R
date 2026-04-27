import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase-server";

// Handles the OAuth redirect (Apple, Google) and email-confirm callback.
// Supabase sends ?code=… → we exchange it for a session cookie.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/mon-compte";

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/connexion?err=not-configured", req.url));
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL(`/connexion?err=${encodeURIComponent(error.message)}`, req.url),
      );
    }
  }

  return NextResponse.redirect(new URL(next, req.url));
}
