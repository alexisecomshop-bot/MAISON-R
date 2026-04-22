// Sends a WhatsApp message to the owner via Twilio's REST API.
// Requires env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM.
// `to` is the owner's WhatsApp number stored in site_settings.owner_whatsapp
// (E.164, e.g. "+33612345678").

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!sid || !token || !from) {
    console.warn("[whatsapp] Twilio env vars missing — message not sent:", body);
    return;
  }
  if (!to) {
    console.warn("[whatsapp] owner number empty — message not sent:", body);
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const form = new URLSearchParams({
    From: `whatsapp:${from}`,
    To: `whatsapp:${to}`,
    Body: body,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[whatsapp] Twilio error:", res.status, text);
  }
}

export function buildReservationMessage(args: {
  productName: string;
  customerName: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  acceptUrl: string;
  refuseUrl: string;
}): string {
  return [
    `Nouvelle demande de location`,
    ``,
    `Pièce : ${args.productName}`,
    `Client : ${args.customerName} (${args.customerPhone})`,
    `Du ${args.startDate} au ${args.endDate}`,
    `Total : ${args.totalPrice.toFixed(2)} €`,
    ``,
    `Accepter : ${args.acceptUrl}`,
    `Refuser : ${args.refuseUrl}`,
  ].join("\n");
}
