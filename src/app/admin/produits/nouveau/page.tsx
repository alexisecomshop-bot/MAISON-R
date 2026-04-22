import { requireAdmin } from "../../require-admin";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Nouveau produit</h1>
      <ProductForm />
    </div>
  );
}
