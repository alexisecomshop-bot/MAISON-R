import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase-server";
import { buildReservationMessage, sendWhatsApp } from "@/lib/whatsapp";

function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.round(ms / 86400000) + 1);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const {
    product_id,
    start_date,
    end_date,
    customer_name,
    customer_email,
    customer_phone,
  } = body as Record<string, string>;

  if (
    !product_id || !start_date || !end_date ||
    !customer_name || !customer_email || !customer_phone
  ) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }
  if (new Date(end_date) < new Date(start_date)) {
    return NextResponse.json({ error: "Dates invalides" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Fetch product
  const { data: product } = await supabase
    .from("maison_r_products")
    .select("*")
    .eq("id", product_id)
    .maybeSingle();
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  // Check overlap with existing blocking reservations
  const { data: conflicts } = await supabase
    .from("maison_r_reservations")
    .select("id,start_date,end_date,status")
    .eq("product_id", product_id)
    .in("status", ["pending", "accepted", "returned"])
    .lte("start_date", end_date)
    .gte("end_date", start_date);
  if (conflicts && conflicts.length > 0) {
    return NextResponse.json(
      { error: "Ces dates ne sont plus disponibles." },
      { status: 409 },
    );
  }

  const nbDays = daysBetween(start_date, end_date);
  const total = nbDays * Number(product.daily_price);
  const action_token = crypto.randomBytes(24).toString("hex");

  const { data: inserted, error } = await supabase
    .from("maison_r_reservations")
    .insert({
      product_id,
      customer_name,
      customer_email,
      customer_phone,
      start_date,
      end_date,
      total_price: total,
      deposit: product.deposit,
      status: "pending",
      action_token,
    })
    .select("id, action_token")
    .single();

  if (error || !inserted) {
    return NextResponse.json(
      { error: error?.message || "Erreur enregistrement" },
      { status: 500 },
    );
  }

  // Owner WhatsApp
  const { data: settings } = await supabase
    .from("maison_r_site_settings")
    .select("owner_whatsapp")
    .eq("id", "default")
    .maybeSingle();

  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
  const acceptUrl = `${base}/api/reservations/${inserted.id}/action?token=${inserted.action_token}&decision=accept`;
  const refuseUrl = `${base}/api/reservations/${inserted.id}/action?token=${inserted.action_token}&decision=refuse`;

  const message = buildReservationMessage({
    productName: product.name,
    customerName: customer_name,
    customerPhone: customer_phone,
    startDate: start_date,
    endDate: end_date,
    totalPrice: total,
    acceptUrl,
    refuseUrl,
  });

  // Owner number priority: DB (admin-editable) → OWNER_WHATSAPP env var (default).
  // The env-var fallback lets us deploy with the owner's number set in Vercel
  // before the admin UI is even configured.
  const ownerNumber =
    settings?.owner_whatsapp || process.env.OWNER_WHATSAPP || "";

  try {
    await sendWhatsApp(ownerNumber, message);
  } catch (err) {
    console.error("[reservations] WhatsApp send failed:", err);
    // Don't fail the reservation — the admin still sees it in /admin.
  }

  return NextResponse.json({ id: inserted.id, status: "pending" });
}
