import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CheckoutForm } from "@/components/commerce/checkout-form";
import {
  getCommerceStoreSettings,
} from "@/lib/commerce/settings";
import { getDefaultCommerceStoreSettings } from "@/lib/commerce/settings-defaults";
import { getServerEnvironment } from "@/lib/env";

export const metadata: Metadata = {
  title: "Secure Checkout",
  description: "Complete your Wander Bike test order with Stripe Checkout.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const environment = getServerEnvironment();
  const params = await searchParams;
  let storeSettings = getDefaultCommerceStoreSettings();
  try {
    storeSettings = await getCommerceStoreSettings();
  } catch {
    // Checkout stays safely disabled while the database is unavailable.
  }
  const checkoutEnabled = Boolean(
    environment.COMMERCE_SANDBOX_MODE &&
      storeSettings.sandboxMode &&
      storeSettings.checkoutEnabled &&
      environment.COMMERCE_CHECKOUT_ENABLED &&
      environment.NEXT_PUBLIC_SUPABASE_URL &&
      environment.SUPABASE_SECRET_KEY &&
      environment.STRIPE_SECRET_KEY?.startsWith("sk_test_"),
  );
  const checkoutSettings = {
    pickupEnabled: storeSettings.pickupEnabled,
    pickupInstructions: storeSettings.pickupInstructions,
    localDelivery: storeSettings.localDelivery,
    canadaPostEnabled: Boolean(
      storeSettings.canadaPostEnabled &&
        environment.CANADA_POST_USERNAME &&
        environment.CANADA_POST_PASSWORD,
    ),
    profile: storeSettings.profile,
    tax: storeSettings.tax,
  };

  return (
    <main className="min-h-[75vh] bg-[#fbfaf6] px-6 py-10 sm:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-sm text-slate-500"
        >
          <Link href="/shop" className="hover:text-teal-800">
            Shop
          </Link>
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
          <Link href="/cart" className="hover:text-teal-800">
            Cart
          </Link>
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
          <span className="text-slate-800">Checkout</span>
        </nav>
        <div className="mb-8 mt-5 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            Sandbox commerce
          </p>
          <h1 className="mt-3 font-[Georgia] text-4xl text-slate-950 sm:text-5xl">
            Checkout without surprises.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Every price, rate, and stock level is checked again on the server.
            This deployment remains in test mode; no real item is sold or shipped.
          </p>
        </div>
        <CheckoutForm
          checkoutEnabled={checkoutEnabled}
          checkoutSettings={checkoutSettings}
          cancelled={params.cancelled === "1"}
        />
      </div>
    </main>
  );
}
