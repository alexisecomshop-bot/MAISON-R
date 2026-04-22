import Link from "next/link";
import { requireAdmin } from "../require-admin";
import type { Product } from "@/lib/types";

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("maison_r_products")
    .select("*")
    .order("created_at", { ascending: false });
  const products = (data as Product[]) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Produits</h1>
        <Link
          href="/admin/produits/nouveau"
          className="bg-[var(--color-primary)] text-white px-4 py-2 text-sm uppercase tracking-wider"
        >
          + Nouveau produit
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-sm text-black/50">
          Aucun produit pour l&apos;instant. Commence par en ajouter un.
        </div>
      ) : (
        <table className="w-full text-sm border border-black/10">
          <thead className="bg-black/5 text-left">
            <tr>
              <th className="px-3 py-2">Nom</th>
              <th className="px-3 py-2">Marque</th>
              <th className="px-3 py-2">Catégorie</th>
              <th className="px-3 py-2">Prix / jour</th>
              <th className="px-3 py-2">Disponible</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-black/10">
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2">{p.brand}</td>
                <td className="px-3 py-2">{p.category}{p.subcategory ? ` / ${p.subcategory}` : ""}</td>
                <td className="px-3 py-2">{p.daily_price} €</td>
                <td className="px-3 py-2">{p.available ? "✓" : "—"}</td>
                <td className="px-3 py-2">
                  <Link href={`/admin/produits/${p.id}`} className="text-[var(--color-accent)] hover:underline">
                    Éditer
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
