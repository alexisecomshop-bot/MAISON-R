import { notFound } from "next/navigation";
import { requireAdmin } from "../../require-admin";
import { ProductForm } from "../product-form";
import type { Product } from "@/lib/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const { data } = await supabase
    .from("maison_r_products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Éditer : {data.name}</h1>
      <ProductForm existing={data as Product} />
    </div>
  );
}
