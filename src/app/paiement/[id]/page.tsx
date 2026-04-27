import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-server";
import { PayButton } from "./pay-button";
import type { Reservation } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string; status?: string }>;
}) {
  const { id } = await params;
  const { token, status: urlStatus } = await searchParams;

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-2xl mb-3">Configuration requise</h1>
        <p className="text-sm text-black/60">
          Le paiement nécessite Supabase, qui n&apos;est pas encore configuré.
        </p>
      </div>
    );
  }
  const { data } = await supabase
    .from("maison_r_reservations")
    .select("*, maison_r_products(name)")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const r = data as Reservation & { maison_r_products?: { name?: string } | { name?: string }[] };
  if (token !== r.action_token) notFound();

  const productName = Array.isArray(r.maison_r_products)
    ? r.maison_r_products[0]?.name
    : r.maison_r_products?.name;

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl md:text-4xl mb-2 text-center">Paiement</h1>
      <p className="text-center text-sm text-black/60 mb-10">
        Votre demande a été acceptée. Réglez maintenant pour confirmer la location.
      </p>

      <div className="border border-black/10 p-6 space-y-2 mb-8">
        <Row label="Pièce" value={productName || "—"} />
        <Row label="Du" value={r.start_date} />
        <Row label="Au" value={r.end_date} />
        <Row label="Caution (bloquée)" value={`${r.deposit.toFixed(2)} €`} />
        <div className="flex justify-between pt-3 border-t border-black/10 mt-3 font-medium">
          <span>Total à régler</span>
          <span>{r.total_price.toFixed(2)} €</span>
        </div>
      </div>

      {urlStatus === "cancelled" && (
        <div className="text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 px-3 py-2 mb-4">
          Le paiement a été annulé. Vous pouvez réessayer.
        </div>
      )}

      {r.status === "paid" ? (
        <div className="text-sm text-green-800 bg-green-50 border border-green-200 px-4 py-3 text-center">
          ✓ Paiement reçu. Réservation confirmée.
        </div>
      ) : r.status === "accepted" ? (
        <PayButton reservationId={r.id} token={r.action_token} />
      ) : (
        <div className="text-sm text-black/70 border border-black/10 px-4 py-3 text-center">
          Cette réservation est <strong>{r.status}</strong>. Aucun paiement requis.
        </div>
      )}

      <p className="text-xs text-black/50 text-center mt-6">
        Paiement sécurisé via PayPlug · CB, Apple Pay, Google Pay
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-black/60">{label}</span>
      <span>{value}</span>
    </div>
  );
}
