import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { createPayment } from "@/lib/payplug";

// Triggered by the customer (from /paiement/[id]) once their reservation is
// 'accepted'. Creates a PayPlug hosted payment and returns the checkout URL.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.reservation_id || !body?.token) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: r } = await supabase
    .from("maison_r_reservations")
    .select("*, maison_r_products(name)")
    .eq("id", body.reservation_id)
    .maybeSingle();

  if (!r) return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
  if (r.action_token !== body.token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }
  if (r.status !== "accepted") {
    return NextResponse.json(
      { error: `Reservation status is ${r.status}, cannot pay` },
      { status: 409 },
    );
  }

  const productName = Array.isArray(r.maison_r_products)
    ? r.maison_r_products[0]?.name
    : (r.maison_r_products as { name?: string } | null)?.name;

  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

  try {
    const payment = await createPayment({
      amountCents: Math.round(Number(r.total_price) * 100),
      reservationId: r.id,
      customerEmail: r.customer_email,
      customerFirstName: r.customer_name.split(" ")[0],
      customerLastName: r.customer_name.split(" ").slice(1).join(" ") || r.customer_name,
      productName: productName || "Location Maison R",
      returnUrl: `${base}/paiement/${r.id}/succes?token=${r.action_token}`,
      cancelUrl: `${base}/paiement/${r.id}?token=${r.action_token}&status=cancelled`,
    });

    // Store the payment id so the webhook can correlate
    await supabase
      .from("maison_r_reservations")
      .update({ payplug_payment_id: payment.id })
      .eq("id", r.id);

    return NextResponse.json({ payment_url: payment.hosted_payment.payment_url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "PayPlug error" },
      { status: 502 },
    );
  }
}
