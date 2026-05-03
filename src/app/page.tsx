import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { getSettings } from "@/lib/theme";
import { ProductCard } from "@/components/product-card";
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
      .limit(12);
    products = (data as Product[]) || [];
  } catch {
    products = [];
  }

  return (
    <>
      {/* Hero — uses public/hero.jpg if present, falls back to neutral gradient */}
      <section className="relative h-[80vh] min-h-[520px] flex items-center justify-center text-center px-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-3xl text-white">
          <h1 className="font-display text-5xl md:text-7xl leading-tight mb-6">
            {settings.hero_title}
          </h1>
          <p className="text-lg md:text-xl text-white/85 mb-8">
            {settings.hero_subtitle}
          </p>
          <Link
            href="/catalogue/nouveautes"
            className="inline-block bg-white text-black px-8 py-3 text-sm uppercase tracking-wider hover:bg-[var(--color-accent)] hover:text-white transition-colors"
          >
            Découvrir la collection
          </Link>
        </div>
      </section>

      {/* Le principe */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-3xl md:text-4xl mb-6">
          Le luxe en location
        </h2>
        <p className="text-base md:text-lg text-black/75 leading-relaxed">
          Sélectionnez une pièce, choisissez vos dates, recevez-la chez vous.
          À la fin de la période, vous la retournez — la caution est libérée.
          Aucun engagement, aucun abonnement : vous payez uniquement les jours
          d&apos;utilisation.
        </p>
      </section>

      {/* Comment ça marche */}
      <section className="bg-black/[0.03] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-4xl mb-12 text-center">
            Comment ça marche
          </h2>
          <ol className="grid md:grid-cols-3 gap-10">
            <Step
              n="01"
              title="Choisissez"
              text="Parcourez le catalogue et sélectionnez la pièce qui vous tente, en taille adaptée."
            />
            <Step
              n="02"
              title="Réservez"
              text="Choisissez vos dates dans le calendrier. Nous validons votre demande sous 24 h."
            />
            <Step
              n="03"
              title="Profitez"
              text="Une fois confirmée, payez en ligne. Vous récupérez la pièce, vous la portez, vous la rendez."
            />
          </ol>
        </div>
      </section>

      {/* Nouveautés */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-baseline justify-between mb-10">
          <h2 className="font-display text-3xl md:text-4xl">Nouveautés</h2>
          <Link
            href="/catalogue/nouveautes"
            className="text-sm uppercase tracking-wider hover:text-[var(--color-accent)]"
          >
            Tout voir →
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-20 text-black/50 text-sm">
            Aucune pièce en ligne pour l&apos;instant. Les nouveautés
            apparaîtront ici dès que le catalogue sera synchronisé.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <li className="text-center">
      <div className="font-display text-3xl text-[var(--color-accent)] mb-3">{n}</div>
      <div className="font-display text-xl mb-2">{title}</div>
      <p className="text-sm text-black/70 leading-relaxed">{text}</p>
    </li>
  );
}
