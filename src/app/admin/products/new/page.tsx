import { redirect } from "next/navigation";
import { ProductEditor } from "@/components/admin/product-editor";
import { getAdminProductTaxonomies } from "@/lib/admin/products";
import { getCurrentStaff } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function NewAdminProductPage() {
  const [staff, taxonomies] = await Promise.all([
    getCurrentStaff(),
    getAdminProductTaxonomies(),
  ]);
  if (staff?.role !== "admin") redirect("/admin/products");

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
        Catalog
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        New product
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        New products start as drafts unless you explicitly publish them.
      </p>
      <ProductEditor
        categories={taxonomies.categories}
        brands={taxonomies.brands}
      />
    </div>
  );
}
