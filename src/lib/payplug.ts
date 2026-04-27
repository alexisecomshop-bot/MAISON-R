// Minimal PayPlug client. We use the REST API directly (no SDK) — keeps the
// dependency tree small and gives us full control.
// Docs: https://docs.payplug.com/api

const PAYPLUG_API = "https://api.payplug.com/v1";

export type PayPlugPayment = {
  id: string;
  amount: number;
  currency: string;
  hosted_payment: { payment_url: string };
  is_paid: boolean;
  metadata?: Record<string, string>;
};

function authHeader(): string {
  const key = process.env.PAYPLUG_SECRET_KEY;
  if (!key) throw new Error("PAYPLUG_SECRET_KEY not configured");
  return `Bearer ${key}`;
}

// Creates a payment and returns the hosted checkout URL the customer must visit.
export async function createPayment(args: {
  amountCents: number;
  reservationId: string;
  customerEmail: string;
  customerFirstName?: string;
  customerLastName?: string;
  productName: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<PayPlugPayment> {
  const body = {
    amount: args.amountCents,
    currency: "EUR",
    customer: {
      email: args.customerEmail,
      first_name: args.customerFirstName || "",
      last_name: args.customerLastName || args.customerEmail,
    },
    hosted_payment: {
      return_url: args.returnUrl,
      cancel_url: args.cancelUrl,
    },
    notification_url:
      (process.env.NEXT_PUBLIC_SITE_URL || "") + "/api/payments/webhook",
    metadata: {
      reservation_id: args.reservationId,
    },
    description: `Location ${args.productName}`,
  };

  const res = await fetch(`${PAYPLUG_API}/payments`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPlug createPayment ${res.status}: ${err}`);
  }
  return (await res.json()) as PayPlugPayment;
}

export async function getPayment(id: string): Promise<PayPlugPayment> {
  const res = await fetch(`${PAYPLUG_API}/payments/${id}`, {
    headers: { Authorization: authHeader() },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPlug getPayment ${res.status}: ${err}`);
  }
  return (await res.json()) as PayPlugPayment;
}

// PayPlug signs notifications with HMAC-SHA256 over the raw body, using the
// secret key. Header: PayPlug-Signature.
// Docs: https://docs.payplug.com/api#authentification-des-notifications
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  if (!signature) return false;
  const secret = process.env.PAYPLUG_SECRET_KEY;
  if (!secret) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(rawBody));
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex === signature.toLowerCase();
}
