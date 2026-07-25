import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CartView } from "@/components/commerce/cart-view";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your Wander Bike shopping cart before checkout.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <main className="min-h-[70vh] bg-[#fbfaf6] px-6 py-10 sm:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/shop" className="hover:text-teal-800">
            Shop
          </Link>
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
          <span className="text-slate-800">Cart</span>
        </nav>
        <div className="mb-8 mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Your selection
          </p>
          <h1 className="mt-3 font-[Georgia] text-4xl text-slate-950 sm:text-5xl">
            Shopping cart
          </h1>
        </div>
        <CartView />
      </div>
    </main>
  );
}
