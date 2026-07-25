import { notFound, redirect } from "next/navigation";
import { ProductEditor } from "@/components/admin/product-editor";
import {
  getAdminProduct,
  getAdminProductTaxonomies,
} from "@/lib/admin/products";
import { getCurrentStaff } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function EditAdminProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isSafeInteger(productId) || productId <= 0) notFound();

  const [staff, product, taxonomies] = await Promise.all([
    getCurrentStaff(),
    getAdminProduct(productId),
    getAdminProductTaxonomies(),
  ]);
  if (staff?.role !== "admin") redirect("/admin/products");
  if (!product) notFound();

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
        Catalog
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        Edit {product.name}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Existing stock changes remain separate so every adjustment has an audit reason.
      </p>
      <ProductEditor
        product={product}
        categories={taxonomies.categories}
        brands={taxonomies.brands}
      />
    </div>
  );
}
