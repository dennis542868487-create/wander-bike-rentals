import Image from "next/image";
import Link from "next/link";
import { MapPin, PackageCheck } from "lucide-react";
import { formatCad } from "@/lib/commerce/money";
import type { CatalogProduct } from "@/lib/commerce/types";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const variant = product.variants[0];
  const image = product.images[0];

  return (
    <article className="group flex h-full flex-col overflow-hidden border border-slate-200 bg-white">
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-stone-100"
      >
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Product image coming soon
          </div>
        )}
        {product.isSandboxProduct ? (
          <span className="absolute left-3 top-3 bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-950">
            Test catalog
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">
          {product.brand?.name ?? product.category?.name ?? "Wander Bike"}
        </div>
        <Link href={`/shop/${product.slug}`} className="mt-2">
          <h2 className="font-[Georgia] text-2xl leading-tight text-slate-950 transition group-hover:text-teal-800">
            {product.name}
          </h2>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {product.shortDescription}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="text-xl font-semibold text-slate-950">
              {variant ? formatCad(variant.priceCents) : "Contact us"}
              <span className="ml-1 text-xs font-medium text-slate-500">CAD</span>
            </p>
            {variant?.compareAtPriceCents !== null &&
            variant?.compareAtPriceCents !== undefined &&
            variant.compareAtPriceCents > variant.priceCents ? (
              <p className="text-sm text-slate-400 line-through">
                {formatCad(variant.compareAtPriceCents)}
              </p>
            ) : null}
          </div>
          <div className="mt-3 space-y-1.5 text-xs text-slate-600">
            <p className="flex items-center gap-2">
              <PackageCheck
                aria-hidden="true"
                className={`h-4 w-4 ${variant?.isAvailable ? "text-emerald-700" : "text-rose-700"}`}
              />
              {variant?.isAvailable
                ? `Available at Steveston${
                    variant.available > 0
                      ? ` · ${variant.available} ${
                          product.isSandboxProduct ? "in test stock" : "in stock"
                        }`
                      : ""
                  }`
                : "Currently unavailable"}
            </p>
            <p className="flex items-center gap-2">
              <MapPin aria-hidden="true" className="h-4 w-4 text-teal-700" />
              {!product.requiresShipping
                ? "No shipping required"
                : [
                    variant?.pickupEligible ? "pickup" : null,
                    variant?.localDeliveryEligible ? "local delivery" : null,
                    variant?.canadaPostEligible ? "Canada Post" : null,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Contact the shop for fulfillment"}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
