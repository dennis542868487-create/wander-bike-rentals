import Link from "next/link";
import { ListTree, Plus, Search } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { getAdminProducts } from "@/lib/admin/products";
import { formatCad } from "@/lib/commerce/money";
import { getCurrentStaff } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

function dateTime(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Vancouver",
  }).format(new Date(value));
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const filters = await searchParams;
  const [products, staff] = await Promise.all([
    getAdminProducts(filters.q),
    getCurrentStaff(),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Catalog
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Products
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage products, variants, prices, shipping dimensions, and publishing.
          </p>
        </div>
        {staff?.role === "admin" ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/products/taxonomies"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800"
            >
              <ListTree aria-hidden="true" className="h-4 w-4" />
              Categories &amp; brands
            </Link>
            <Link
              href="/admin/products/new"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              New product
            </Link>
          </div>
        ) : null}
      </div>

      <form className="mt-7 flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
        <label className="relative flex-1">
          <span className="sr-only">Search products</span>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Product name or slug"
            className="h-11 w-full rounded-xl border border-slate-300 pl-10 pr-3 text-sm outline-none focus:border-teal-700"
          />
        </label>
        <button className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white">
          Search
        </button>
      </form>

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Variants</th>
                <th className="px-5 py-3">Available</th>
                <th className="px-5 py-3 text-right">From</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    {staff?.role === "admin" ? (
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-semibold text-teal-800"
                      >
                        {product.name}
                      </Link>
                    ) : (
                      <p className="font-semibold text-slate-900">{product.name}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">
                      /shop/{product.slug} · {dateTime(product.updatedAt)}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge value={product.status} />
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {product.categoryName}
                  </td>
                  <td className="px-5 py-4">{product.variantCount}</td>
                  <td className="px-5 py-4">{product.available}</td>
                  <td className="px-5 py-4 text-right font-semibold">
                    {formatCad(product.minPriceCents)}
                  </td>
                </tr>
              ))}
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                    No products match this search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
