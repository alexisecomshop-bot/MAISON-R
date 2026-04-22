import Link from "next/link";
import { requireAdmin } from "./require-admin";

export default async function AdminDashboard() {
  const { supabase } = await requireAdmin();

  const [{ count: productsCount }, { count: pendingCount }, { data: recent }] =
    await Promise.all([
      supabase.from("maison_r_products").select("*", { count: "exact", head: true }),
      supabase
        .from("maison_r_reservations")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("maison_r_reservations")
        .select("id, customer_name, start_date, end_date, status, product_id, maison_r_products(name)")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Tableau de bord</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <Link href="/admin/produits" className="border border-black/10 p-6 hover:bg-black/5">
          <div className="text-xs uppercase tracking-wider text-black/50">Produits</div>
          <div className="font-display text-3xl mt-2">{productsCount ?? 0}</div>
        </Link>
        <Link href="/admin/reservations" className="border border-black/10 p-6 hover:bg-black/5">
          <div className="text-xs uppercase tracking-wider text-black/50">Demandes en attente</div>
          <div className="font-display text-3xl mt-2">{pendingCount ?? 0}</div>
        </Link>
        <Link href="/admin/parametres" className="border border-black/10 p-6 hover:bg-black/5">
          <div className="text-xs uppercase tracking-wider text-black/50">Paramètres</div>
          <div className="font-display text-lg mt-2">Thème, contact, logo</div>
        </Link>
      </div>

      <h2 className="font-display text-xl mb-4">Demandes récentes</h2>
      {!recent || recent.length === 0 ? (
        <div className="text-sm text-black/50">Aucune demande pour l&apos;instant.</div>
      ) : (
        <table className="w-full text-sm border border-black/10">
          <thead className="bg-black/5 text-left">
            <tr>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Pièce</th>
              <th className="px-3 py-2">Dates</th>
              <th className="px-3 py-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((r) => {
              const productName = Array.isArray(r.maison_r_products)
                ? r.maison_r_products[0]?.name
                : (r.maison_r_products as { name?: string } | null)?.name;
              return (
                <tr key={r.id} className="border-t border-black/10">
                  <td className="px-3 py-2">{r.customer_name}</td>
                  <td className="px-3 py-2">{productName || "—"}</td>
                  <td className="px-3 py-2">{r.start_date} → {r.end_date}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    refused: "bg-red-100 text-red-800",
    returned: "bg-gray-100 text-gray-700",
    cancelled: "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded ${map[status] || ""}`}>
      {status}
    </span>
  );
}
