import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { ReservationForm } from "@/components/reservation-form";
import type { Product } from "@/lib/types";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("maison_r_products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!product) notFound();
  const p = product as Product;

  const { data: blockedRows } = await supabase
    .from("maison_r_blocked_dates")
    .select("start_date, end_date")
    .eq("product_id", id);

  const blocked = (blockedRows || []).map((r) => ({
    start: r.start_date,
    end: r.end_date,
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <nav className="text-xs uppercase tracking-wider text-black/50 mb-6">
        <Link href="/">Accueil</Link> /{" "}
        <Link href={`/catalogue/${p.category}`}>{p.category}</Link> /{" "}
        <span>{p.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          {p.images && p.images.length > 0 ? (
            <div className="space-y-3">
              {p.images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={img}
                  alt={`${p.name} ${i + 1}`}
                  className="w-full bg-black/5"
                />
              ))}
            </div>
          ) : (
            <div className="aspect-[3/4] bg-black/5 flex items-center justify-center text-black/30 text-xs uppercase tracking-wider">
              Image à venir
            </div>
          )}
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-black/50 mb-2">
            {p.brand}
          </div>
          <h1 className="font-display text-3xl md:text-4xl mb-4">{p.name}</h1>
          <div className="text-xl mb-1">{p.daily_price.toFixed(0)} € / jour</div>
          <div className="text-sm text-black/60 mb-6">
            Caution : {p.deposit.toFixed(0)} €
          </div>

          <dl className="text-sm space-y-1 mb-8 text-black/70">
            {p.size && (
              <div className="flex gap-2"><dt className="w-24 text-black/50">Taille</dt><dd>{p.size}</dd></div>
            )}
            {p.color && (
              <div className="flex gap-2"><dt className="w-24 text-black/50">Couleur</dt><dd>{p.color}</dd></div>
            )}
          </dl>

          {p.description && (
            <p className="text-sm leading-relaxed mb-8 text-black/80">
              {p.description}
            </p>
          )}

          <ReservationForm product={p} blocked={blocked} />
        </div>
      </div>
    </div>
  );
}
