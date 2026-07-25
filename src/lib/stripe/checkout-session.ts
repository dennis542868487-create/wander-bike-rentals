import "server-only";

import type Stripe from "stripe";

export function getStripePaymentIntentId(session: Stripe.Checkout.Session) {
  if (typeof session.payment_intent === "string") return session.payment_intent;
  return session.payment_intent?.id ?? null;
}

export function getStripeCheckoutOrderId(session: Stripe.Checkout.Session) {
  const metadataOrderId = Number(session.metadata?.order_id);
  const referenceOrderId = Number(session.client_reference_id);
  if (
    !Number.isSafeInteger(metadataOrderId) ||
    metadataOrderId <= 0 ||
    !Number.isSafeInteger(referenceOrderId) ||
    referenceOrderId !== metadataOrderId
  ) {
    return null;
  }
  return metadataOrderId;
}

export function stripeCheckoutSnapshot(session: Stripe.Checkout.Session) {
  return {
    id: session.id,
    clientReferenceId: session.client_reference_id,
    paymentIntentId: getStripePaymentIntentId(session),
    paymentStatus: session.payment_status,
    status: session.status,
    amountTotal: session.amount_total,
    currency: session.currency,
    metadata: session.metadata,
  };
}
