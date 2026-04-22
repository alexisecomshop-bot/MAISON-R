import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { parseProductsCsv } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Syncs products from the Google Sheet (published as CSV) into Supabase.
// Called either manually from /admin or on a schedule by GitHub Actions.
export async function POST(req: Request) {
  return handle(req);
}
export async function GET(req: Request) {
  return handle(req);
}

async function handle(req: Request) {
  const secret = process.env.SYNC_SECRET;
  const csvUrl = process.env.GOOGLE_SHEET_CSV_URL;

  if (!secret || !csvUrl) {
    return NextResponse.json(
      { error: "SYNC_SECRET or GOOGLE_SHEET_CSV_URL not configured" },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  const provided =
    req.headers.get("x-sync-secret") ||
    url.searchParams.get("secret") ||
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let csv: string;
  try {
    const res = await fetch(csvUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`CSV fetch ${res.status}`);
    csv = await res.text();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "CSV fetch failed" },
      { status: 502 },
    );
  }

  const rows = parseProductsCsv(csv);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Sheet is empty or unreadable" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // Upsert each row by sku
  const upsertPayload = rows.map((r) => ({
    sku: r.sku,
    name: r.name,
    description: r.description,
    brand: r.brand,
    category: r.category,
    subcategory: r.subcategory,
    size: r.size,
    color: r.color,
    daily_price: r.daily_price,
    deposit: r.deposit,
    images: r.images,
    available: r.available,
    updated_at: now,
  }));

  const { error: upsertErr } = await supabase
    .from("maison_r_products")
    .upsert(upsertPayload, { onConflict: "sku" });

  if (upsertErr) {
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  // Soft-delete : any product with a sku not in the sheet → available = false
  const skusInSheet = rows.map((r) => r.sku);
  const { error: softDelErr } = await supabase
    .from("maison_r_products")
    .update({ available: false, updated_at: now })
    .not("sku", "is", null)
    .not("sku", "in", `(${skusInSheet.map((s) => `"${s.replace(/"/g, '""')}"`).join(",")})`);

  if (softDelErr) {
    console.error("[sync] soft-delete error:", softDelErr);
  }

  return NextResponse.json({
    ok: true,
    synced: rows.length,
    at: now,
  });
}
