import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { sendWhatsApp } from "@/lib/whatsapp";

// Clicked from the WhatsApp message by the owner. Token-authenticated so
// the owner does not need to log in.
export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const decision = url.searchParams.get("decision");

  if (!token || (decision !== "accept" && decision !== "refuse")) {
    return htmlResponse(400, "Lien invalide.");
  }

  const supabase = createAdminClient();
  const { data: res } = await supabase
    .from("maison_r_reservations")
    .select("id, status, action_token, customer_name, customer_phone, start_date, end_date, product_id, total_price")
    .eq("id", id)
    .maybeSingle();

  if (!res) return htmlResponse(404, "Réservation introuvable.");
  if (res.action_token !== token) return htmlResponse(403, "Lien invalide.");
  if (res.status !== "pending") {
    return htmlResponse(200, `Cette demande a déjà été traitée (${res.status}).`);
  }

  const newStatus = decision === "accept" ? "accepted" : "refused";
  const { error } = await supabase
    .from("maison_r_reservations")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) return htmlResponse(500, "Erreur lors de la mise à jour.");

  // If accepted, send the customer a WhatsApp with the payment link.
  if (newStatus === "accepted") {
    const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    const payUrl = `${base}/paiement/${res.id}?token=${res.action_token}`;
    const customerMsg = [
      `Bonne nouvelle ${res.customer_name},`,
      ``,
      `Votre demande de location est acceptée :`,
      `Du ${res.start_date} au ${res.end_date}`,
      `Total : ${Number(res.total_price).toFixed(2)} €`,
      ``,
      `Réglez ici pour confirmer :`,
      payUrl,
    ].join("\n");
    try {
      await sendWhatsApp(res.customer_phone, customerMsg);
    } catch (err) {
      console.error("[action] customer WhatsApp failed:", err);
    }
  }

  const title = newStatus === "accepted" ? "Demande acceptée" : "Demande refusée";
  const body =
    newStatus === "accepted"
      ? `La demande de ${res.customer_name} du ${res.start_date} au ${res.end_date} est confirmée. Le client a reçu le lien de paiement par WhatsApp.`
      : `La demande de ${res.customer_name} du ${res.start_date} au ${res.end_date} a été refusée.`;

  return htmlResponse(200, `${title}\n\n${body}`);
}

function htmlResponse(status: number, message: string) {
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Réservation</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>
    body { font-family: -apple-system, system-ui, sans-serif; background: #f7f5f1; color: #111; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 2rem; }
    .card { background: white; max-width: 480px; padding: 2.5rem; border: 1px solid rgba(0,0,0,0.08); text-align: center; }
    h1 { font-family: "Times New Roman", serif; font-size: 1.5rem; margin: 0 0 1rem; }
    p { color: rgba(0,0,0,0.7); white-space: pre-line; margin: 0; }
  </style></head><body><div class="card"><h1>${message.split("\n")[0]}</h1><p>${message.split("\n").slice(2).join("\n")}</p></div></body></html>`;
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
