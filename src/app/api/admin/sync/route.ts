import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Admin-initiated sync. The admin is authenticated via Supabase session;
// this route forwards the call to /api/sync-products with the SYNC_SECRET
// so the browser never sees the secret.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: adminRow } = await supabase
    .from("maison_r_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!adminRow) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const secret = process.env.SYNC_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "SYNC_SECRET not configured" }, { status: 500 });
  }

  const origin = new URL(req.url).origin;
  const res = await fetch(`${origin}/api/sync-products`, {
    method: "POST",
    headers: { "x-sync-secret": secret },
  });
  const body = await res.json();
  return NextResponse.json(body, { status: res.status });
}
