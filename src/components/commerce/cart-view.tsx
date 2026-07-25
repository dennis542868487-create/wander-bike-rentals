"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/commerce/cart-provider";
import { formatCad } from "@/lib/commerce/money";

export function CartView() {
  const {
    lines,
    ready,
    subtotalCents,
    updateQuantity,
    removeLine,
  } = useCart();

  if (!ready) {
    return (
      <div className="grid animate-pulse gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="h-80 bg-white" />
        <div className="h-72 bg-white" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="border border-slate-200 bg-white px-6 py-16 text-center">
        <ShoppingBag aria-hidden="true" className="mx-auto h-10 w-10 text-teal-700" />
        <h2 className="mt-5 font-[Georgia] text-3xl text-slate-950">
          Your cart is ready for a ride.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
          Add a test product to exercise pickup, local delivery, Canada Post rates,
          and Stripe Checkout.
        </p>
        <Link href="/shop" className="btn-primary mt-7 px-6 py-3.5">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_23rem] lg:items-start">
      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
          <p className="text-sm font-semibold text-slate-700">
            {lines.length} {lines.length === 1 ? "product" : "products"}
          </p>
        </div>
        <ul className="divide-y divide-slate-200">
          {lines.map((line) => {
            const maximum = line.allowBackorder ? 99 : Math.max(line.available, 1);
            return (
              <li
                key={line.variantId}
                className="grid gap-5 p-5 sm:grid-cols-[8rem_1fr_auto] sm:p-6"
              >
                <Link
                  href={`/shop/${line.productSlug}`}
                  className="relative aspect-square overflow-hidden bg-stone-100"
                >
                  {line.imageSrc ? (
                    <Image
                      src={line.imageSrc}
                      alt={line.productName}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  ) : null}
                </Link>
                <div>
                  <Link
                    href={`/shop/${line.productSlug}`}
                    className="font-[Georgia] text-xl text-slate-950 hover:text-teal-800"
                  >
                    {line.productName}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">{line.variantTitle}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.08em] text-slate-400">
                    {line.sku}
                  </p>
                  <div className="mt-4 inline-flex items-center border border-slate-300">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${line.productName}`}
                      disabled={line.quantity <= 1}
                      onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                      className="flex h-10 w-10 items-center justify-center text-slate-700 disabled:opacity-30"
                    >
                      <Minus aria-hidden="true" className="h-4 w-4" />
                    </button>
                    <span className="flex h-10 min-w-10 items-center justify-center border-x border-slate-300 text-sm font-semibold">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${line.productName}`}
                      disabled={line.quantity >= maximum}
                      onClick={() => updateQuantity(line.variantId, line.quantity + 1)}
                      className="flex h-10 w-10 items-center justify-center text-slate-700 disabled:opacity-30"
                    >
                      <Plus aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-4 sm:block sm:text-right">
                  <p className="text-lg font-semibold text-slate-950">
                    {formatCad(line.unitPriceCents * line.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeLine(line.variantId)}
                    className="mt-0 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 underline sm:mt-5"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="border border-slate-200 bg-white p-6 lg:sticky lg:top-28">
        <h2 className="font-[Georgia] text-2xl text-slate-950">Order summary</h2>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Subtotal</dt>
            <dd className="font-semibold text-slate-950">{formatCad(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Shipping</dt>
            <dd className="text-slate-500">Calculated at checkout</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Tax</dt>
            <dd className="text-slate-500">Configuration pending</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-200 pt-4 text-base">
            <dt className="font-semibold text-slate-950">Estimated total</dt>
            <dd className="font-bold text-slate-950">{formatCad(subtotalCents)}</dd>
          </div>
        </dl>
        <Link
          href="/checkout"
          className="btn-primary mt-6 h-12 w-full rounded-none px-5"
        >
          Continue to checkout
        </Link>
        <p className="mt-4 flex gap-2 text-xs leading-5 text-slate-500">
          <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
          Prices and inventory are revalidated on the server before Stripe opens.
        </p>
      </aside>
    </div>
  );
}
