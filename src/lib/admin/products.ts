import "server-only";

import { cache } from "react";
import type {
  AdminInventoryRow,
  AdminBrand,
  AdminCategory,
  AdminProductEditorValue,
  AdminProductListItem,
  AdminTaxonomyOption,
} from "@/lib/admin/product-types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  if (Array.isArray(value)) return (value[0] as UnknownRecord | undefined) ?? null;
  return value && typeof value === "object" ? (value as UnknownRecord) : null;
}

function asRecords(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? (value as UnknownRecord[]) : [];
}

function asNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function asStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function publicProductImageUrl(storagePath: string) {
  return getSupabaseAdmin().storage.from("product-images").getPublicUrl(storagePath)
    .data.publicUrl;
}

export async function getAdminProducts(query?: string): Promise<AdminProductListItem[]> {
  const supabase = getSupabaseAdmin();
  const result = await supabase
    .from("products")
    .select(`
      id,
      slug,
      name,
      status,
      product_type,
      updated_at,
      product_categories ( name ),
      product_variants (
        id,
        price_cents,
        inventory_levels ( available )
      )
    `)
    .order("updated_at", { ascending: false })
    .limit(500);

  if (result.error) throw new Error("Products are unavailable.");

  const normalizedQuery = query?.trim().toLowerCase();
  return ((result.data ?? []) as UnknownRecord[])
    .map((row) => {
      const category = asRecord(row.product_categories);
      const variants = asRecords(row.product_variants);
      const prices = variants.map((variant) => asNumber(variant.price_cents));
      const available = variants.reduce(
        (total, variant) =>
          total +
          asRecords(variant.inventory_levels).reduce(
            (variantTotal, level) => variantTotal + asNumber(level.available),
            0,
          ),
        0,
      );

      return {
        id: asNumber(row.id),
        slug: asString(row.slug),
        name: asString(row.name),
        status: asString(row.status),
        productType: asString(row.product_type),
        categoryName: asString(category?.name) || "Uncategorized",
        variantCount: variants.length,
        minPriceCents: prices.length > 0 ? Math.min(...prices) : 0,
        available,
        updatedAt: asString(row.updated_at),
      };
    })
    .filter(
      (product) =>
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.slug.toLowerCase().includes(normalizedQuery),
    );
}

export const getAdminProductTaxonomies = cache(async (): Promise<{
  categories: AdminTaxonomyOption[];
  brands: AdminTaxonomyOption[];
}> => {
  const supabase = getSupabaseAdmin();
  const [categories, brands] = await Promise.all([
    supabase
      .from("product_categories")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("product_brands")
      .select("id, name")
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  if (categories.error || brands.error) {
    throw new Error("Product categories and brands are unavailable.");
  }

  return {
    categories: ((categories.data ?? []) as UnknownRecord[]).map((row) => ({
      id: asNumber(row.id),
      name: asString(row.name),
    })),
    brands: ((brands.data ?? []) as UnknownRecord[]).map((row) => ({
      id: asNumber(row.id),
      name: asString(row.name),
    })),
  };
});

export const getAdminCatalogTaxonomies = cache(async (): Promise<{
  categories: AdminCategory[];
  brands: AdminBrand[];
}> => {
  const supabase = getSupabaseAdmin();
  const [categories, brands] = await Promise.all([
    supabase
      .from("product_categories")
      .select("id, parent_id, slug, name, description, sort_order, is_active")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("product_brands")
      .select("id, slug, name, description, website_url, is_active")
      .order("name", { ascending: true }),
  ]);

  if (categories.error || brands.error) {
    throw new Error("Product categories and brands are unavailable.");
  }

  return {
    categories: ((categories.data ?? []) as UnknownRecord[]).map((row) => ({
      id: asNumber(row.id),
      parentId: asNullableNumber(row.parent_id),
      slug: asString(row.slug),
      name: asString(row.name),
      description: asString(row.description),
      sortOrder: asNumber(row.sort_order),
      isActive: asBoolean(row.is_active, true),
    })),
    brands: ((brands.data ?? []) as UnknownRecord[]).map((row) => ({
      id: asNumber(row.id),
      slug: asString(row.slug),
      name: asString(row.name),
      description: asString(row.description),
      websiteUrl: asString(row.website_url),
      isActive: asBoolean(row.is_active, true),
    })),
  };
});

export const getAdminProduct = cache(
  async (productId: number): Promise<AdminProductEditorValue | null> => {
    const supabase = getSupabaseAdmin();
    const [productResult, imagesResult] = await Promise.all([
      supabase
        .from("products")
        .select(`
          *,
          product_variants (
            *,
            inventory_levels (
              on_hand,
              reserved,
              available,
              reorder_point,
              allow_backorder,
              store_locations!inner ( code )
            )
          )
        `)
        .eq("id", productId)
        .maybeSingle(),
      supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true }),
    ]);

    if (productResult.error || imagesResult.error) {
      throw new Error("Product details are unavailable.");
    }
    if (!productResult.data) return null;

    const row = productResult.data as UnknownRecord;
    const variants = asRecords(row.product_variants)
      .map((variant) => {
        const inventory =
          asRecords(variant.inventory_levels).find(
            (level) => asRecord(level.store_locations)?.code === "steveston",
          ) ?? asRecords(variant.inventory_levels)[0];

        return {
          id: asNumber(variant.id),
          sku: asString(variant.sku),
          barcode: asString(variant.barcode),
          title: asString(variant.title) || "Default",
          optionValues: asStringRecord(variant.option_values),
          priceCents: asNumber(variant.price_cents),
          compareAtPriceCents: asNullableNumber(variant.compare_at_price_cents),
          costCents: asNullableNumber(variant.cost_cents),
          weightGrams: asNullableNumber(variant.weight_grams),
          lengthCm: asNullableNumber(variant.length_cm),
          widthCm: asNullableNumber(variant.width_cm),
          heightCm: asNullableNumber(variant.height_cm),
          canadaPostEligible: asBoolean(variant.canada_post_eligible, true),
          taxCode: asString(variant.tax_code),
          isActive: asBoolean(variant.is_active, true),
          sortOrder: asNumber(variant.sort_order),
          initialOnHand: 0,
          onHand: asNumber(inventory?.on_hand),
          reserved: asNumber(inventory?.reserved),
          available: asNumber(inventory?.available),
          reorderPoint: asNumber(inventory?.reorder_point),
          allowBackorder: asBoolean(inventory?.allow_backorder),
        };
      })
      .sort((left, right) => left.sortOrder - right.sortOrder || left.id - right.id);

    return {
      id: asNumber(row.id),
      categoryId: asNullableNumber(row.category_id),
      brandId: asNullableNumber(row.brand_id),
      slug: asString(row.slug),
      name: asString(row.name),
      shortDescription: asString(row.short_description),
      description: asString(row.description),
      productType: row.product_type as AdminProductEditorValue["productType"],
      status: row.status as AdminProductEditorValue["status"],
      tags: Array.isArray(row.tags)
        ? row.tags.filter((value): value is string => typeof value === "string")
        : [],
      trackInventory: asBoolean(row.track_inventory, true),
      requiresShipping: asBoolean(row.requires_shipping, true),
      seoTitle: asString(row.seo_title),
      seoDescription: asString(row.seo_description),
      variants,
      images: ((imagesResult.data ?? []) as UnknownRecord[]).map((image) => {
        const storagePath = asString(image.storage_path);
        return {
          storagePath,
          publicUrl: publicProductImageUrl(storagePath),
          altText: asString(image.alt_text),
          width: asNullableNumber(image.width),
          height: asNullableNumber(image.height),
          sortOrder: asNumber(image.sort_order),
        };
      }),
    };
  },
);

export async function getAdminInventory(query?: string): Promise<AdminInventoryRow[]> {
  const supabase = getSupabaseAdmin();
  const result = await supabase
    .from("inventory_levels")
    .select(`
      variant_id,
      location_id,
      on_hand,
      reserved,
      available,
      reorder_point,
      allow_backorder,
      store_locations!inner ( name ),
      product_variants!inner (
        product_id,
        sku,
        title,
        products!inner ( name, status )
      )
    `)
    .order("available", { ascending: true })
    .limit(1000);

  if (result.error) throw new Error("Inventory is unavailable.");
  const normalizedQuery = query?.trim().toLowerCase();

  return ((result.data ?? []) as UnknownRecord[])
    .map((row) => {
      const location = asRecord(row.store_locations);
      const variant = asRecord(row.product_variants);
      const product = asRecord(variant?.products);
      return {
        variantId: asNumber(row.variant_id),
        productId: asNumber(variant?.product_id),
        productName: asString(product?.name),
        productStatus: asString(product?.status),
        variantTitle: asString(variant?.title),
        sku: asString(variant?.sku),
        locationId: asNumber(row.location_id),
        locationName: asString(location?.name),
        onHand: asNumber(row.on_hand),
        reserved: asNumber(row.reserved),
        available: asNumber(row.available),
        reorderPoint: asNumber(row.reorder_point),
        allowBackorder: asBoolean(row.allow_backorder),
      };
    })
    .filter(
      (row) =>
        !normalizedQuery ||
        row.productName.toLowerCase().includes(normalizedQuery) ||
        row.sku.toLowerCase().includes(normalizedQuery),
    );
}
