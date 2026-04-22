import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { CATEGORIES } from "@/lib/categories";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>;
}) {
  const { category, subcategory } = await params;
  const cat = CATEGORIES.find((c) => c.slug === category);
  const sub = cat?.subcategories.find((s) => s.slug === subcategory);
  if (!cat || !sub) notFound();

  let products: Product[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("maison_r_products")
      .select("*")
      .eq("available", true)
      .eq("category", cat.slug)
      .eq("subcategory", sub.slug)
      .order("created_at", { ascending: false });
    products = (data as Product[]) || [];
  } catch {
    products = [];
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <nav className="text-xs uppercase tracking-wider text-black/50 mb-4">
        <Link href="/">Accueil</Link> /{" "}
        <Link href={`/catalogue/${cat.slug}`}>{cat.label}</Link> /{" "}
        <span>{sub.label}</span>
      </nav>
      <h1 className="font-display text-3xl md:text-4xl mb-8">{sub.label}</h1>

      {products.length === 0 ? (
        <div className="text-center py-20 text-black/50 text-sm">
          Aucune pièce dans cette sous-catégorie pour l&apos;instant.
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
