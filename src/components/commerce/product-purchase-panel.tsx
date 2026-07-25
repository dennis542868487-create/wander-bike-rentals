"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Package, ShoppingBag, Store, Truck } from "lucide-react";
import { useCart } from "@/components/commerce/cart-provider";
import { formatCad } from "@/lib/commerce/money";
import type { CatalogProduct } from "@/lib/commerce/types";

export function ProductPurchasePanel({ product }: { product: CatalogProduct }) {
  const router = useRouter();
  const { addLine } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants.find((variant) => variant.isAvailable)?.id ??
      product.variants[0]?.id ??
      0,
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = useMemo(
    () => product.variants.find((item) => item.id === selectedVariantId),
    [product.variants, selectedVariantId],
  );

  function addToCart(goToCart: boolean) {
    if (!variant?.isAvailable) return;
    addLine({
      variantId: variant.id,
      productSlug: product.slug,
      productName: product.name,
      variantTitle: variant.title,
      sku: variant.sku,
      imageSrc: product.images[0]?.src ?? null,
      unitPriceCents: variant.priceCents,
      quantity,
      available: variant.available,
      allowBackorder: variant.allowBackorder,
      requiresShipping: product.requiresShipping,
      pickupEligible: variant.pickupEligible,
      localDeliveryEligible: variant.localDeliveryEligible,
      canadaPostEligible: variant.canadaPostEligible,
      shippingProfile: variant.shippingProfile,
    });
    setAdded(true);
    if (goToCart) router.push("/cart");
  }

  if (!variant) {
    return (
      <div className="border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
        This product does not have a purchasable variant yet.
      </div>
    );
  }

  const maximum = variant.allowBackorder ? 99 : Math.max(variant.available, 1);

  return (
    <div>
      {product.isSandboxProduct ? (
        <div className="mb-5 border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <strong>Test product.</strong> No real item will be sold or shipped.
        </div>
      ) : null}

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-3xl font-semibold text-slate-950">
          {formatCad(variant.priceCents)}
          <span className="ml-1 text-sm font-medium text-slate-500">CAD</span>
        </p>
        {variant.compareAtPriceCents !== null &&
        variant.compareAtPriceCents > variant.priceCents ? (
          <p className="text-base text-slate-500 line-through">
            {formatCad(variant.compareAtPriceCents)}
          </p>
        ) : null}
      </div>
      <p
        className={`mt-3 flex items-center gap-2 text-sm font-semibold ${
          variant.isAvailable ? "text-emerald-800" : "text-rose-800"
        }`}
      >
        <Check aria-hidden="true" className="h-4 w-4" />
        {variant.isAvailable
          ? `Available${
              variant.available > 0
                ? ` · ${variant.available} ${
                    product.isSandboxProduct ? "in test stock" : "in stock"
                  }`
                : ""
            }`
          : "Currently unavailable"}
      </p>

      {product.variants.length > 1 ? (
        <fieldset className="mt-7">
          <legend className="text-sm font-bold text-slate-800">Choose an option</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {product.variants.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={!item.isAvailable}
                onClick={() => {
                  setSelectedVariantId(item.id);
                  setQuantity(1);
                  setAdded(false);
                }}
                className={`border px-4 py-3 text-left text-sm transition ${
                  item.id === selectedVariantId
                    ? "border-teal-700 bg-teal-50 text-teal-950"
                    : "border-slate-300 bg-white text-slate-700 hover:border-teal-400"
                } disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
              >
                <span className="font-semibold">{item.title}</span>
                <span className="mt-1 block text-xs">
                  {formatCad(item.priceCents)}
                  {item.compareAtPriceCents !== null &&
                  item.compareAtPriceCents > item.priceCents ? (
                    <span className="ml-2 text-slate-400 line-through">
                      {formatCad(item.compareAtPriceCents)}
                    </span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      ) : (
        <div className="mt-6 border-y border-slate-200 py-4 text-sm">
          <span className="font-semibold text-slate-800">Option: </span>
          <span className="text-slate-600">{variant.title}</span>
        </div>
      )}

      <label className="mt-6 block text-sm font-bold text-slate-800">
        Quantity
        <select
          value={quantity}
          onChange={(event) => {
            setQuantity(Number(event.target.value));
            setAdded(false);
          }}
          className="mt-2 h-11 w-28 border border-slate-300 bg-white px-3 font-normal outline-none focus:border-teal-700"
        >
          {Array.from({ length: Math.min(maximum, 10) }, (_, index) => index + 1).map(
            (value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ),
          )}
        </select>
      </label>

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          disabled={!variant.isAvailable}
          onClick={() => addToCart(false)}
          className="btn-secondary h-12 gap-2 rounded-none border-teal-700 text-teal-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {added ? (
            <>
              <Check aria-hidden="true" className="h-5 w-5" /> Added to cart
            </>
          ) : (
            <>
              <ShoppingBag aria-hidden="true" className="h-5 w-5" /> Add to cart
            </>
          )}
        </button>
        <button
          type="button"
          disabled={!variant.isAvailable}
          onClick={() => addToCart(true)}
          className="btn-primary h-12 gap-2 rounded-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy now
        </button>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-6">
        <h2 className="font-[Georgia] text-xl text-slate-950">
          Choose how to receive your order
        </h2>
        <div className="mt-4 space-y-3 text-sm">
          {variant.pickupEligible ? (
            <div className="flex gap-3 border border-teal-300 bg-teal-50 p-4">
              <Store aria-hidden="true" className="mt-0.5 h-5 w-5 text-teal-800" />
              <div>
                <p className="font-semibold text-slate-900">Pickup in Steveston</p>
                <p className="mt-1 leading-5 text-slate-600">
                  Free pickup at 12071 First Ave #101 after staff confirmation.
                </p>
              </div>
            </div>
          ) : null}
          {variant.localDeliveryEligible ? (
            <div className="flex gap-3 border border-slate-200 p-4">
              <Truck aria-hidden="true" className="mt-0.5 h-5 w-5 text-teal-800" />
              <div>
                <p className="font-semibold text-slate-900">Local delivery</p>
                <p className="mt-1 leading-5 text-slate-600">
                  Availability and fee are checked from your postal code at checkout.
                </p>
              </div>
            </div>
          ) : null}
          {product.requiresShipping && variant.canadaPostEligible ? (
            <div className="flex gap-3 border border-slate-200 p-4">
              <Package aria-hidden="true" className="mt-0.5 h-5 w-5 text-teal-800" />
              <div>
                <p className="font-semibold text-slate-900">
                  Canada Post shipping
                </p>
                <p className="mt-1 leading-5 text-slate-600">
                  {variant.shippingProfile === "large"
                    ? "This large item must ship by itself in one parcel."
                    : "Sandbox rates are calculated from package weight and destination."}
                </p>
              </div>
            </div>
          ) : null}
          {variant.shippingProfile === "special" ? (
            <div className="border border-amber-200 bg-amber-50 p-4 text-amber-950">
              Special handling is arranged directly with the Steveston team.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
