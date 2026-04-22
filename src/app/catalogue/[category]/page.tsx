import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { CATEGORIES } from "@/lib/categories";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.slug === category);
  if (!cat) notFound();

  let products: Product[] = [];
  try {
    const supabase = await createClient();
    const query = supabase
      .from("maison_r_products")
      .select("*")
      .eq("available", true)
      .order("created_at", { ascending: false });
    const { data } =
      cat.slug === "nouveautes"
        ? await query.limit(24)
        : await query.eq("category", cat.slug);
    products = (data as Product[]) || [];
  } catch {
    products = [];
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <nav className="text-xs uppercase tracking-wider text-black/50 mb-4">
        <Link href="/">Accueil</Link> / <span>{cat.label}</span>
      </nav>
      <h1 className="font-display text-3xl md:text-4xl mb-6">{cat.label}</h1>

      {cat.subcategories.length > 0 && (
        <div className="flex gap-6 overflow-x-auto pb-4 mb-8 text-sm border-b border-black/10">
          <Link
            href={`/catalogue/${cat.slug}`}
            className="whitespace-nowrap border-b-2 border-[var(--color-primary)] pb-3"
          >
            Tout
          </Link>
          {cat.subcategories.map((sub) => (
            <Link
              key={sub.slug}
              href={`/catalogue/${cat.slug}/${sub.slug}`}
              className="whitespace-nowrap text-black/60 hover:text-[var(--color-primary)] pb-3"
            >
              {sub.label}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-20 text-black/50 text-sm">
          Aucune pièce dans cette catégorie pour l&apos;instant.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
