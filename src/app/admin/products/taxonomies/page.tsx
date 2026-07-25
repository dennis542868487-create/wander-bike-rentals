import { redirect } from "next/navigation";
import { CatalogTaxonomyManager } from "@/components/admin/catalog-taxonomy-manager";
import { getAdminCatalogTaxonomies } from "@/lib/admin/products";
import { getCurrentStaff } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AdminTaxonomiesPage() {
  const [taxonomies, staff] = await Promise.all([
    getAdminCatalogTaxonomies(),
    getCurrentStaff(),
  ]);
  if (staff?.role !== "admin") redirect("/admin/products");

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
        Catalog
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
        Categories and brands
      </h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
        Organize storefront filters without deleting historical product
        relationships. Deactivate entries that should no longer be offered.
      </p>
      <CatalogTaxonomyManager
        key={[
          ...taxonomies.categories.map(
            (category) =>
              `c:${category.id}:${category.slug}:${category.isActive}`,
          ),
          ...taxonomies.brands.map(
            (brand) => `b:${brand.id}:${brand.slug}:${brand.isActive}`,
          ),
        ].join("|")}
        initialCategories={taxonomies.categories}
        initialBrands={taxonomies.brands}
      />
    </div>
  );
}
