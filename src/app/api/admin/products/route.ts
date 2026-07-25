import { NextResponse } from "next/server";
import { adminProductSchema } from "@/lib/admin/schemas";
import { isSameOriginRequest } from "@/lib/http/security";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const auth = await requireStaff(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (auth.role !== "admin") {
    return NextResponse.json(
      { error: "Only administrators can change the product catalog." },
      { status: 403 },
    );
  }

  try {
    const body: unknown = await request.json();
    const parsed = adminProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Invalid product.",
          issues: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    const product = parsed.data;
    const result = await getSupabaseAdmin().rpc("commerce_upsert_product", {
      p_product_id: product.productId,
      p_product: {
        category_id: product.categoryId,
        brand_id: product.brandId,
        slug: product.slug,
        name: product.name,
        short_description: product.shortDescription,
        description: product.description,
        product_type: product.productType,
        status: product.status,
        tags: product.tags,
        track_inventory: product.trackInventory,
        requires_shipping: product.requiresShipping,
        seo_title: product.seoTitle,
        seo_description: product.seoDescription,
      },
      p_variants: product.variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        barcode: variant.barcode,
        title: variant.title,
        option_values: variant.optionValues,
        price_cents: variant.priceCents,
        compare_at_price_cents: variant.compareAtPriceCents,
        cost_cents: variant.costCents,
        weight_grams: variant.weightGrams,
        length_cm: variant.lengthCm,
        width_cm: variant.widthCm,
        height_cm: variant.heightCm,
        pickup_eligible: variant.pickupEligible,
        local_delivery_eligible: variant.localDeliveryEligible,
        canada_post_eligible: variant.canadaPostEligible,
        shipping_profile: variant.shippingProfile,
        tax_code: variant.taxCode,
        is_active: variant.isActive,
        sort_order: variant.sortOrder,
        initial_on_hand: variant.initialOnHand,
        reorder_point: variant.reorderPoint,
        allow_backorder: variant.allowBackorder,
      })),
      p_images: product.images.map((image) => ({
        storage_path: image.storagePath,
        alt_text: image.altText,
        width: image.width,
        height: image.height,
        sort_order: image.sortOrder,
      })),
      p_actor_user_id: auth.user.id,
    });

    if (result.error) {
      const conflict = result.error.code === "23505";
      return NextResponse.json(
        {
          error: conflict
            ? "That product slug, SKU, or barcode is already in use."
            : "The product could not be saved.",
        },
        { status: conflict ? 409 : 400 },
      );
    }

    return NextResponse.json(
      { product: result.data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "The product could not be saved." },
      { status: 500 },
    );
  }
}
