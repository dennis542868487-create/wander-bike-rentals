"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/commerce/cart-provider";

export function CartButton({ mobile = false }: { mobile?: boolean }) {
  const { itemCount, ready } = useCart();
  const count = ready ? itemCount : 0;

  return (
    <Link
      href="/cart"
      aria-label={`Cart with ${count} item${count === 1 ? "" : "s"}`}
      className={
        mobile
          ? "flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800"
          : "relative inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-800 transition hover:border-teal-300 hover:text-teal-800"
      }
    >
      <span className="inline-flex items-center gap-2">
        <ShoppingBag aria-hidden="true" className="h-4 w-4" />
        Cart
      </span>
      <span
        className="inline-flex min-w-5 items-center justify-center rounded-full bg-teal-700 px-1.5 py-0.5 text-[11px] font-bold text-white"
        aria-hidden="true"
      >
        {count}
      </span>
    </Link>
  );
}
