import Link from "next/link";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const img = product.images[0];
  return (
    <Link href={`/produit/${product.id}`} className="group block">
      <div className="aspect-[3/4] bg-black/5 mb-3 overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black/30 text-xs uppercase tracking-wider">
            Image à venir
          </div>
        )}
      </div>
      <div className="text-xs uppercase tracking-wider text-black/50 mb-1">
        {product.brand}
      </div>
      <div className="text-sm mb-1">{product.name}</div>
      <div className="text-sm font-medium">
        {product.daily_price.toFixed(0)} € / jour
      </div>
    </Link>
  );
}
