import "server-only";

import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { CommerceError } from "@/lib/commerce/errors";
import type { z } from "zod";
import type { cartItemInputSchema } from "@/lib/commerce/schemas";

type CartItemInput = z.infer<typeof cartItemInputSchema>;
type UnknownRow = Record<string, unknown>;

export type ResolvedCartLine = {
  variantId: number;
  productId: number;
  productName: string;
  variantTitle: string;
  sku: string;
  quantity: number;
  unitPriceCents: number;
  weightGrams: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  canadaPostEligible: boolean;
  requiresShipping: boolean;
  available: number;
  allowBackorder: boolean;
  trackInventory: boolean;
};

export type ResolvedCart = {
  locationId: number;
  locationCode: string;
  items: ResolvedCartLine[];
};

export type CanadaPostPackage = {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  packagingAllowanceGrams: number;
};

function asNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function firstRelation(value: unknown): UnknownRow | null {
  if (Array.isArray(value)) return (value[0] as UnknownRow | undefined) ?? null;
  return value && typeof value === "object" ? (value as UnknownRow) : null;
}

export function normalizeCartItems(items: CartItemInput[]) {
  const quantities = new Map<number, number>();

  for (const item of items) {
    quantities.set(
      item.variantId,
      (quantities.get(item.variantId) ?? 0) + item.quantity,
    );
  }

  const normalized = [...quantities.entries()]
    .sort(([left], [right]) => left - right)
    .map(([variantId, quantity]) => ({ variantId, quantity }));

  if (normalized.some((item) => item.quantity > 100)) {
    throw new CommerceError(
      "A cart quantity exceeds the allowed limit.",
      "INVALID_CART_QUANTITY",
      400,
    );
  }

  return normalized;
}

export function databaseCartItems(items: CartItemInput[]) {
  return normalizeCartItems(items).map((item) => ({
    variant_id: item.variantId,
    quantity: item.quantity,
  }));
}

export async function resolveDatabaseCart(
  items: CartItemInput[],
): Promise<ResolvedCart> {
  const normalized = normalizeCartItems(items);
  const variantIds = normalized.map((item) => item.variantId);
  const supabase = getSupabaseAdmin();

  const [locationResult, variantsResult] = await Promise.all([
    supabase
      .from("store_locations")
      .select("id, code, is_active")
      .eq("code", "steveston")
      .eq("is_active", true)
      .single(),
    supabase
      .from("product_variants")
      .select(`
        id,
        product_id,
        sku,
        title,
        price_cents,
        weight_grams,
        length_cm,
        width_cm,
        height_cm,
        canada_post_eligible,
        is_active,
        products!inner (
          id,
          name,
          status,
          published_at,
          requires_shipping,
          track_inventory
        )
      `)
      .in("id", variantIds),
  ]);

  if (locationResult.error || !locationResult.data) {
    throw new CommerceError(
      "The Steveston fulfillment location is not configured.",
      "FULFILLMENT_LOCATION_UNAVAILABLE",
      503,
    );
  }

  if (variantsResult.error) {
    throw new CommerceError(
      "The product catalog is temporarily unavailable.",
      "CATALOG_UNAVAILABLE",
      503,
    );
  }

  const locationId = asNumber(locationResult.data.id);
  const inventoryResult = await supabase
    .from("inventory_levels")
    .select("variant_id, on_hand, reserved, available, allow_backorder")
    .eq("location_id", locationId)
    .in("variant_id", variantIds);

  if (inventoryResult.error) {
    throw new CommerceError(
      "Inventory is temporarily unavailable.",
      "INVENTORY_UNAVAILABLE",
      503,
    );
  }

  const inventoryByVariant = new Map<number, UnknownRow>(
    ((inventoryResult.data ?? []) as UnknownRow[]).map((row) => [
      asNumber(row.variant_id),
      row,
    ]),
  );
  const variantById = new Map<number, UnknownRow>(
    ((variantsResult.data ?? []) as UnknownRow[]).map((row) => [
      asNumber(row.id),
      row,
    ]),
  );
  const now = Date.now();

  const resolvedItems = normalized.map<ResolvedCartLine>((item) => {
    const variant = variantById.get(item.variantId);
    const product = variant ? firstRelation(variant.products) : null;

    if (
      !variant ||
      !product ||
      variant.is_active === false ||
      product.status !== "active" ||
      typeof product.published_at !== "string" ||
      Date.parse(product.published_at) > now
    ) {
      throw new CommerceError(
        "One of the products in your cart is no longer available.",
        "CART_ITEM_UNAVAILABLE",
        409,
      );
    }

    const trackInventory = product.track_inventory !== false;
    const inventory = inventoryByVariant.get(item.variantId);
    const allowBackorder = inventory?.allow_backorder === true;
    const available = trackInventory ? asNumber(inventory?.available) : 100;

    if (trackInventory && !inventory) {
      throw new CommerceError(
        `Inventory is not configured for SKU ${String(variant.sku)}.`,
        "INVENTORY_NOT_CONFIGURED",
        409,
      );
    }

    if (!allowBackorder && available < item.quantity) {
      throw new CommerceError(
        `Only ${available} unit(s) of ${String(variant.sku)} are available.`,
        "INSUFFICIENT_INVENTORY",
        409,
      );
    }

    return {
      variantId: item.variantId,
      productId: asNumber(product.id),
      productName: String(product.name),
      variantTitle: String(variant.title),
      sku: String(variant.sku),
      quantity: item.quantity,
      unitPriceCents: asNumber(variant.price_cents),
      weightGrams:
        variant.weight_grams == null ? null : asNumber(variant.weight_grams),
      lengthCm: variant.length_cm == null ? null : asNumber(variant.length_cm),
      widthCm: variant.width_cm == null ? null : asNumber(variant.width_cm),
      heightCm: variant.height_cm == null ? null : asNumber(variant.height_cm),
      canadaPostEligible: variant.canada_post_eligible !== false,
      requiresShipping: product.requires_shipping !== false,
      available,
      allowBackorder,
      trackInventory,
    };
  });

  return {
    locationId,
    locationCode: String(locationResult.data.code),
    items: resolvedItems,
  };
}

function roundPackageDimension(value: number) {
  return Math.ceil(value * 10) / 10;
}

export function buildCanadaPostPackage(cart: ResolvedCart): CanadaPostPackage {
  const shippable = cart.items.filter((item) => item.requiresShipping);

  if (shippable.length === 0) {
    throw new CommerceError(
      "This cart does not contain an item that requires shipping.",
      "NO_SHIPPABLE_ITEMS",
      422,
    );
  }

  const pickupOnly = shippable.filter((item) => !item.canadaPostEligible);
  if (pickupOnly.length > 0) {
    throw new CommerceError(
      "One or more cart items require pickup at the Steveston shop.",
      "PICKUP_REQUIRED",
      422,
    );
  }

  if (
    shippable.some(
      (item) =>
        !item.weightGrams ||
        !item.lengthCm ||
        !item.widthCm ||
        !item.heightCm,
    )
  ) {
    throw new CommerceError(
      "Package dimensions are not configured for one or more cart items.",
      "PACKAGE_DETAILS_MISSING",
      422,
    );
  }

  const packagingAllowanceGrams = 150;
  const weightGrams =
    shippable.reduce(
      (total, item) => total + (item.weightGrams ?? 0) * item.quantity,
      0,
    ) + packagingAllowanceGrams;
  const lengthCm = Math.max(...shippable.map((item) => item.lengthCm ?? 0));
  const widthCm = Math.max(...shippable.map((item) => item.widthCm ?? 0));
  const tallestItemCm = Math.max(...shippable.map((item) => item.heightCm ?? 0));
  const totalVolume = shippable.reduce(
    (total, item) =>
      total +
      (item.lengthCm ?? 0) *
        (item.widthCm ?? 0) *
        (item.heightCm ?? 0) *
        item.quantity,
    0,
  );
  const packedHeightCm = Math.max(tallestItemCm, totalVolume / (lengthCm * widthCm));

  return {
    weightKg: Math.ceil(weightGrams) / 1000,
    lengthCm: roundPackageDimension(lengthCm),
    widthCm: roundPackageDimension(widthCm),
    heightCm: roundPackageDimension(packedHeightCm),
    packagingAllowanceGrams,
  };
}

export function shippingRequestFingerprint(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
