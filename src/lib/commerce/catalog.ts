import "server-only";

import { cache } from "react";
import { getServerEnvironment } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { demoCatalog } from "@/lib/commerce/demo-catalog";
import type {
  CatalogFacets,
  CatalogImage,
  CatalogProduct,
  CatalogVariant,
  ProductOptionValues,
} from "@/lib/commerce/types";

type UnknownRow = Record<string, unknown>;

function firstRelation(value: unknown): UnknownRow | null {
  if (Array.isArray(value)) return (value[0] as UnknownRow | undefined) ?? null;
  return value && typeof value === "object" ? (value as UnknownRow) : null;
}

function asNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function imageSource(storagePath: string) {
  if (storagePath.startsWith("/") || storagePath.startsWith("http")) return storagePath;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url
    ? `${url}/storage/v1/object/public/product-images/${encodeURI(storagePath)}`
    : storagePath;
}

function mapProduct(row: UnknownRow): CatalogProduct {
  const category = firstRelation(row.product_categories);
  const brand = firstRelation(row.product_brands);

  const images = Array.isArray(row.product_images)
    ? (row.product_images as UnknownRow[])
        .sort((a, b) => asNumber(a.sort_order) - asNumber(b.sort_order))
        .map<CatalogImage>((image) => ({
          id: asNumber(image.id),
          src: imageSource(String(image.storage_path ?? "")),
          alt: String(image.alt_text ?? row.name ?? "Wander Bike product"),
          width: image.width == null ? null : asNumber(image.width),
          height: image.height == null ? null : asNumber(image.height),
        }))
    : [];

  const variants = Array.isArray(row.product_variants)
    ? (row.product_variants as UnknownRow[])
        .filter((variant) => variant.is_active !== false)
        .sort((a, b) => asNumber(a.sort_order) - asNumber(b.sort_order))
        .map<CatalogVariant>((variant) => {
          const levels = Array.isArray(variant.inventory_levels)
            ? (variant.inventory_levels as UnknownRow[])
            : [];
          const available = levels.reduce(
            (total, level) => total + asNumber(level.available),
            0,
          );
          const allowBackorder = levels.some((level) => level.allow_backorder === true);

          return {
            id: asNumber(variant.id),
            sku: String(variant.sku ?? ""),
            title: String(variant.title ?? "Default"),
            optionValues:
              variant.option_values && typeof variant.option_values === "object"
                ? (variant.option_values as ProductOptionValues)
                : {},
            priceCents: asNumber(variant.price_cents),
            compareAtPriceCents:
              variant.compare_at_price_cents == null
                ? null
                : asNumber(variant.compare_at_price_cents),
            weightGrams:
              variant.weight_grams == null ? null : asNumber(variant.weight_grams),
            lengthCm:
              variant.length_cm == null ? null : asNumber(variant.length_cm),
            widthCm:
              variant.width_cm == null ? null : asNumber(variant.width_cm),
            heightCm:
              variant.height_cm == null ? null : asNumber(variant.height_cm),
            canadaPostEligible: variant.canada_post_eligible !== false,
            available,
            isAvailable: available > 0 || allowBackorder,
            allowBackorder,
          };
        })
    : [];

  const tags = Array.isArray(row.tags)
    ? row.tags.filter((tag): tag is string => typeof tag === "string")
    : [];

  return {
    id: asNumber(row.id),
    slug: String(row.slug ?? ""),
    name: String(row.name ?? ""),
    shortDescription: String(row.short_description ?? ""),
    description: String(row.description ?? row.short_description ?? ""),
    productType:
      row.product_type === "service" || row.product_type === "gift_card"
        ? row.product_type
        : "physical",
    brand: brand
      ? {
          id: asNumber(brand.id),
          slug: String(brand.slug ?? ""),
          name: String(brand.name ?? ""),
        }
      : null,
    category: category
      ? {
          id: asNumber(category.id),
          slug: String(category.slug ?? ""),
          name: String(category.name ?? ""),
        }
      : null,
    tags,
    requiresShipping: row.requires_shipping !== false,
    images,
    variants,
    isSandboxProduct: tags.includes("sandbox"),
  };
}

async function loadDatabaseCatalog(): Promise<CatalogProduct[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("products")
    .select(`
      id,
      slug,
      name,
      short_description,
      description,
      product_type,
      tags,
      requires_shipping,
      product_categories ( id, slug, name ),
      product_brands ( id, slug, name ),
      product_images ( id, storage_path, alt_text, width, height, sort_order ),
      product_variants (
        id,
        sku,
        title,
        option_values,
        price_cents,
        compare_at_price_cents,
        weight_grams,
        length_cm,
        width_cm,
        height_cm,
        canada_post_eligible,
        is_active,
        sort_order,
        inventory_levels ( available, allow_backorder )
      )
    `)
    .eq("status", "active")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as UnknownRow[]).map(mapProduct);
}

export const getCatalogProducts = cache(async () => {
  const environment = getServerEnvironment();

  if (environment.NEXT_PUBLIC_SUPABASE_URL && environment.SUPABASE_SECRET_KEY) {
    try {
      const products = await loadDatabaseCatalog();
      if (products.length > 0) return products;
    } catch (error) {
      console.error("Storefront catalog load failed", error);
    }
  }

  return environment.COMMERCE_SANDBOX_MODE && environment.COMMERCE_DEMO_CATALOG
    ? demoCatalog
    : [];
});

export const getCatalogProductBySlug = cache(async (slug: string) => {
  const products = await getCatalogProducts();
  return products.find((product) => product.slug === slug) ?? null;
});

export async function getCatalogFacets(): Promise<CatalogFacets> {
  const products = await getCatalogProducts();
  const categoryCounts = new Map<string, { name: string; count: number }>();
  const brandCounts = new Map<string, { name: string; count: number }>();
  const prices = products.flatMap((product) =>
    product.variants.map((variant) => variant.priceCents),
  );

  for (const product of products) {
    if (product.category) {
      const current = categoryCounts.get(product.category.slug);
      categoryCounts.set(product.category.slug, {
        name: product.category.name,
        count: (current?.count ?? 0) + 1,
      });
    }
    if (product.brand) {
      const current = brandCounts.get(product.brand.slug);
      brandCounts.set(product.brand.slug, {
        name: product.brand.name,
        count: (current?.count ?? 0) + 1,
      });
    }
  }

  return {
    categories: [...categoryCounts.entries()].map(([slug, value]) => ({
      slug,
      ...value,
    })),
    brands: [...brandCounts.entries()].map(([slug, value]) => ({
      slug,
      ...value,
    })),
    priceRange: {
      minCents: prices.length > 0 ? Math.min(...prices) : 0,
      maxCents: prices.length > 0 ? Math.max(...prices) : 0,
    },
  };
}
