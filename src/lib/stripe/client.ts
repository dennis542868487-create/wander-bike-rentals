import "server-only";

import Stripe from "stripe";
import { requireServerEnvironment } from "@/lib/env";
import { CommerceError } from "@/lib/commerce/errors";

let stripeClient: Stripe | undefined;

export function getStripeClient() {
  if (stripeClient) return stripeClient;

  const environment = requireServerEnvironment("STRIPE_SECRET_KEY");
  if (!environment.COMMERCE_SANDBOX_MODE || !environment.STRIPE_SECRET_KEY.startsWith("sk_test_")) {
    throw new CommerceError(
      "Only Stripe test mode is enabled for this deployment.",
      "LIVE_PAYMENTS_DISABLED",
      503,
    );
  }

  stripeClient = new Stripe(environment.STRIPE_SECRET_KEY, {
    apiVersion: "2026-06-24.dahlia",
    appInfo: {
      name: "Wander Bike Commerce",
      version: "1.0.0",
    },
  });

  return stripeClient;
}
