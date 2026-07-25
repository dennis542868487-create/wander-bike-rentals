import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";
import { getCatalogFacets, getCatalogProducts } from "@/lib/commerce/catalog";
import { formatCad } from "@/lib/commerce/money";
import { getServerEnvironment } from "@/lib/env";

export const metadata: Metadata = {
  title: "Bike Shop in Steveston, Richmond",
  description:
    "Shop bicycles, helmets, lights, baskets, and riding accessories from Wander Bike in Steveston, Richmond.",
  alternates: { canonical: "/shop" },
};

type ShopSearchParams = {
  q?: string | string[];
  category?: string | string[];
  brand?: string | string[];
  type?: string | string[];
  min?: string | string[];
  max?: string | string[];
  sort?: string | string[];
};

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function optionalCadCents(value: string | string[] | undefined) {
  const normalized = single(value).trim();
  if (!normalized) return null;

  const amount = Number(normalized);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount * 100) : null;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const [params, allProducts, facets] = await Promise.all([
    searchParams,
    getCatalogProducts(),
    getCatalogFacets(),
  ]);
  const query = single(params.q).trim().toLowerCase();
  const category = single(params.category);
  const brand = single(params.brand);
  const productType = single(params.type);
  const minimumCents = optionalCadCents(params.min);
  const maximumCents = optionalCadCents(params.max);
  const sort = single(params.sort) || "featured";

  const products = allProducts
    .filter((product) => {
      const matchesQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.shortDescription.toLowerCase().includes(query) ||
        product.tags.some((tag) => tag.toLowerCase().includes(query));
      const prices = product.variants.map((variant) => variant.priceCents);
      const lowestPrice =
        prices.length > 0 ? Math.min(...prices) : Number.MAX_SAFE_INTEGER;
      return (
        matchesQuery &&
        (!category || product.category?.slug === category) &&
        (!brand || product.brand?.slug === brand) &&
        (!productType || product.productType === productType) &&
        (minimumCents === null || lowestPrice >= minimumCents) &&
        (maximumCents === null || lowestPrice <= maximumCents)
      );
    })
    .sort((a, b) => {
      const aPrice = a.variants[0]?.priceCents ?? Number.MAX_SAFE_INTEGER;
      const bPrice = b.variants[0]?.priceCents ?? Number.MAX_SAFE_INTEGER;
      if (sort === "price-asc") return aPrice - bPrice;
      if (sort === "price-desc") return bPrice - aPrice;
      if (sort === "name") return a.name.localeCompare(b.name);
      return a.id - b.id;
    });

  const sandbox = getServerEnvironment().COMMERCE_SANDBOX_MODE;

  return (
    <main className="bg-[#fbfaf6] text-slate-900">
      <section className="border-b border-slate-200">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-14 sm:px-8 lg:py-20">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
              Wander Bike Shop
            </p>
            <h1 className="mt-4 max-w-2xl font-[Georgia] text-4xl leading-[1.08] text-slate-950 sm:text-5xl">
              Quality gear for every kind of ride.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Browse bicycles and practical riding accessories, with pickup in
              Steveston plus configurable local delivery and Canada Post shipping.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop?category=bikes" className="btn-primary gap-2 px-6 py-3.5">
                Shop bikes <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                href="/shop?category=accessories"
                className="btn-secondary gap-2 px-6 py-3.5"
              >
                Shop accessories <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="relative min-h-72 lg:min-h-full">
            <Image
              src="/assets/fishermans-wharf.webp"
              alt="Steveston waterfront near Wander Bike"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#fbfaf6]/20 to-transparent lg:from-[#fbfaf6]/10" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:py-14">
        {sandbox ? (
          <div className="mb-8 border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <strong>Sandbox catalog:</strong> the products, prices, and inventory
            below are test data for validating the purchase workflow. No real item
            will be sold or shipped.
          </div>
        ) : null}

        <form
          action="/shop"
          className="grid gap-3 border-y border-slate-200 py-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-9"
        >
          <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600 xl:col-span-2">
            Search
            <input
              type="search"
              name="q"
              defaultValue={single(params.q)}
              placeholder="Bikes, helmets, lights…"
              className="mt-2 h-11 w-full border border-slate-300 bg-white px-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            />
          </label>
          <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
            Category
            <select
              name="category"
              defaultValue={category}
              className="mt-2 h-11 w-full border border-slate-300 bg-white px-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-teal-700"
            >
              <option value="">All categories</option>
              {facets.categories.map((facet) => (
                <option key={facet.slug} value={facet.slug}>
                  {facet.name} ({facet.count})
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
            Brand
            <select
              name="brand"
              defaultValue={brand}
              className="mt-2 h-11 w-full border border-slate-300 bg-white px-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-teal-700"
            >
              <option value="">All brands</option>
              {facets.brands.map((facet) => (
                <option key={facet.slug} value={facet.slug}>
                  {facet.name} ({facet.count})
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
            Product type
            <select
              name="type"
              defaultValue={productType}
              className="mt-2 h-11 w-full border border-slate-300 bg-white px-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-teal-700"
            >
              <option value="">All types</option>
              <option value="physical">Physical products</option>
              <option value="service">Services</option>
              <option value="gift_card">Gift cards</option>
            </select>
          </label>
          <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
            Min CAD
            <input
              type="number"
              name="min"
              min="0"
              step="0.01"
              defaultValue={single(params.min)}
              className="mt-2 h-11 w-full border border-slate-300 bg-white px-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-teal-700"
            />
          </label>
          <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
            Max CAD
            <input
              type="number"
              name="max"
              min="0"
              step="0.01"
              defaultValue={single(params.max)}
              className="mt-2 h-11 w-full border border-slate-300 bg-white px-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-teal-700"
            />
          </label>
          <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
            Sort
            <select
              name="sort"
              defaultValue={sort}
              className="mt-2 h-11 w-full border border-slate-300 bg-white px-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-teal-700"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </label>
          <button
            type="submit"
            className="btn-primary mt-auto h-11 gap-2 px-5 text-sm sm:col-span-2 lg:col-span-1"
          >
            <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
            Apply
          </button>
        </form>

        <div className="flex flex-col gap-2 py-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-[Georgia] text-3xl text-slate-950">Shop the catalog</h2>
            <p className="mt-1 text-sm text-slate-600">
              {products.length} {products.length === 1 ? "product" : "products"}
              {facets.priceRange.maxCents > 0
                ? ` · ${formatCad(facets.priceRange.minCents)}–${formatCad(facets.priceRange.maxCents)}`
                : ""}
            </p>
          </div>
          {query ||
          category ||
          brand ||
          productType ||
          minimumCents !== null ||
          maximumCents !== null ? (
            <Link href="/shop" className="text-sm font-semibold text-teal-800 underline">
              Clear filters
            </Link>
          ) : null}
        </div>

        {products.length > 0 ? (
          <div className="grid gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="border border-slate-200 bg-white px-6 py-16 text-center">
            <h2 className="font-[Georgia] text-3xl text-slate-950">
              No products match those filters.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
              Try a broader search, or contact the Steveston shop for current
              availability.
            </p>
            <Link href="/shop" className="btn-primary mt-6 px-6 py-3">
              View all products
            </Link>
          </div>
        )}
      </section>

      <section className="border-t border-teal-200 bg-[#dff5f0]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <Image
            src="/assets/steveston-ride-idea.jpg"
            alt="A bicycle ride near Steveston"
            width={720}
            height={420}
            className="h-64 w-full object-cover"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">
              Ride here. Buy here.
            </p>
            <h2 className="mt-3 font-[Georgia] text-4xl text-slate-950">
              Try the route before choosing the gear.
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-700">
              Rent a bike for a Steveston ride, then talk with the shop about the
              fit, accessories, and setup that worked for you.
            </p>
            <Link href="/booking" className="mt-6 inline-flex items-center gap-2 font-semibold text-teal-900 underline">
              Explore rentals <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
