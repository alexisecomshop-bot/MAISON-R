import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { verifyWebhookSignature } from "@/lib/payplug";

// PayPlug calls this endpoint when a payment completes (or fails).
// We verify the HMAC signature, then mark the reservation as 'paid'.
export const runtime = "nodejs";

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("payplug-signature");

  const ok = await verifyWebhookSignature(raw, signature);
  if (!ok) {
    console.warn("[payplug webhook] Bad signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { id?: string; is_paid?: boolean; metadata?: { reservation_id?: string } };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const reservationId = payload.metadata?.reservation_id;
  if (!reservationId) {
    return NextResponse.json({ error: "Missing reservation_id metadata" }, { status: 400 });
  }

  if (!payload.is_paid) {
    // Could be a failure notification — leave the reservation as 'accepted'
    // so the customer can retry.
    return NextResponse.json({ ok: true, ignored: true });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("maison_r_reservations")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payplug_payment_id: payload.id || null,
    })
    .eq("id", reservationId)
    .eq("status", "accepted"); // only flip if currently accepted

  if (error) {
    console.error("[payplug webhook] DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
