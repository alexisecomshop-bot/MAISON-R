import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { getSettings } from "@/lib/theme";
import { ProductCard } from "@/components/product-card";
import { CATEGORIES } from "@/lib/categories";
import type { Product } from "@/lib/types";

export default async function HomePage() {
  const settings = await getSettings();
  let products: Product[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("maison_r_products")
      .select("*")
      .eq("available", true)
      .order("created_at", { ascending: false })
      .limit(8);
    products = (data as Product[]) || [];
  } catch {
    products = [];
  }

  return (
    <>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] flex items-center justify-center text-center px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/10" />
        <div className="relative max-w-3xl">
          <h1 className="font-display text-4xl md:text-6xl leading-tight mb-6">
            {settings.hero_title}
          </h1>
          <p className="text-lg md:text-xl text-black/70 mb-8">
            {settings.hero_subtitle}
          </p>
          <Link
            href="/catalogue/vetements"
            className="inline-block bg-[var(--color-primary)] text-white px-8 py-3 text-sm uppercase tracking-wider hover:bg-[var(--color-accent)] transition-colors"
          >
            Découvrir la collection
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="font-display text-2xl md:text-3xl mb-10 text-center">
          Explorer par catégorie
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/catalogue/${cat.slug}`}
              className="group relative aspect-[3/4] bg-black/5 overflow-hidden flex items-end p-6"
            >
              <div className="relative z-10 text-white mix-blend-difference">
                <div className="font-display text-xl">{cat.label}</div>
                <div className="text-xs uppercase tracking-wider mt-1 opacity-80">
                  Voir →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="font-display text-2xl md:text-3xl">Sélection</h2>
          <Link
            href="/catalogue/nouveautes"
            className="text-sm uppercase tracking-wider hover:text-[var(--color-accent)]"
          >
            Tout voir →
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-16 text-black/50 text-sm">
            Aucune pièce en ligne pour l'instant. Les produits ajoutés depuis
            l'admin apparaîtront ici.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
