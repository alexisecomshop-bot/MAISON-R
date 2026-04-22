import { requireAdmin } from "../require-admin";
import { SyncButton } from "./sync-button";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("maison_r_products")
    .select("*")
    .order("updated_at", { ascending: false });
  const products = (data as (Product & { sku?: string; updated_at?: string })[]) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-3xl">Produits</h1>
        <SyncButton />
      </div>
      <p className="text-sm text-black/60 mb-8 max-w-2xl">
        Le catalogue est synchronisé automatiquement depuis la Google Sheet
        toutes les 10 minutes. Pour modifier un produit, édite la sheet — les
        changements arrivent à la prochaine sync (ou clique sur le bouton
        ci-dessus pour forcer).
      </p>

      {products.length === 0 ? (
        <div className="text-sm text-black/50">
          Aucun produit. Vérifie que la Google Sheet est publiée en CSV et que
          <code className="mx-1">GOOGLE_SHEET_CSV_URL</code> est bien configurée.
        </div>
      ) : (
        <table className="w-full text-sm border border-black/10">
          <thead className="bg-black/5 text-left">
            <tr>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Nom</th>
              <th className="px-3 py-2">Marque</th>
              <th className="px-3 py-2">Catégorie</th>
              <th className="px-3 py-2">Prix / jour</th>
              <th className="px-3 py-2">Dispo</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-black/10">
                <td className="px-3 py-2 font-mono text-xs">{p.sku || "—"}</td>
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2">{p.brand}</td>
                <td className="px-3 py-2">
                  {p.category}{p.subcategory ? ` / ${p.subcategory}` : ""}
                </td>
                <td className="px-3 py-2">{p.daily_price} €</td>
                <td className="px-3 py-2">{p.available ? "✓" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
