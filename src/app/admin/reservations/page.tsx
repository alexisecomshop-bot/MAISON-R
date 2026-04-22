import { requireAdmin } from "../require-admin";
import { ReservationRow } from "./reservation-row";

export default async function AdminReservationsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("maison_r_reservations")
    .select("*, maison_r_products(name)")
    .order("created_at", { ascending: false });

  const rows = data || [];

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Réservations</h1>

      {rows.length === 0 ? (
        <div className="text-sm text-black/50">Aucune demande pour l&apos;instant.</div>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => {
            const productName = Array.isArray(r.maison_r_products)
              ? r.maison_r_products[0]?.name
              : (r.maison_r_products as { name?: string } | null)?.name;
            return (
              <ReservationRow
                key={r.id}
                id={r.id}
                productName={productName || "—"}
                customerName={r.customer_name}
                customerEmail={r.customer_email}
                customerPhone={r.customer_phone}
                startDate={r.start_date}
                endDate={r.end_date}
                total={r.total_price}
                status={r.status}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
