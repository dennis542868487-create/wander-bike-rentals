import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { guestAccessMatches } from "@/lib/commerce/guest-access";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/auth";

type UnknownRecord = Record<string, unknown>;

export type OrderDetails = {
  publicId: string;
  orderNumber: string;
  email: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  fulfillmentMethod: string;
  currency: string;
  subtotalCents: number;
  shippingTotalCents: number;
  taxTotalCents: number;
  totalCents: number;
  shippingAddress: UnknownRecord | null;
  shippingServiceCode: string | null;
  stripeCheckoutSessionId: string | null;
  createdAt: string;
  paidAt: string | null;
  items: Array<{
    id: number;
    sku: string;
    productName: string;
    variantTitle: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
  }>;
  shipment: {
    status: string;
    serviceName: string | null;
    trackingPin: string | null;
    trackingUrl: string | null;
  } | null;
  returns: Array<{
    returnNumber: string;
    status: string;
    reason: string;
    resolution: string | null;
    createdAt: string;
  }>;
};

function asNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object"
    ? (value as UnknownRecord)
    : null;
}

function guestTokenFromCookie(cookieValue: string | undefined, publicId: string) {
  if (!cookieValue) return null;
  const separator = cookieValue.indexOf(".");
  if (separator < 1) return null;
  const cookiePublicId = cookieValue.slice(0, separator);
  const token = cookieValue.slice(separator + 1);
  return cookiePublicId === publicId && token ? token : null;
}

export const getOrderForViewer = cache(
  async (publicId: string): Promise<OrderDetails | null> => {
    const supabase = getSupabaseAdmin();
    const [orderResult, user, cookieStore] = await Promise.all([
      supabase
        .from("orders")
        .select(`
          id,
          public_id,
          order_number,
          user_id,
          email,
          customer_first_name,
          customer_last_name,
          status,
          payment_status,
          fulfillment_status,
          fulfillment_method,
          currency,
          subtotal_cents,
          shipping_total_cents,
          tax_total_cents,
          total_cents,
          shipping_address,
          shipping_service_code,
          stripe_checkout_session_id,
          guest_access_token_hash,
          created_at,
          paid_at
        `)
        .eq("public_id", publicId)
        .maybeSingle(),
      getCurrentUser(),
      cookies(),
    ]);

    if (orderResult.error || !orderResult.data) return null;
    const order = orderResult.data as UnknownRecord;
    const viewerOwnsOrder =
      typeof order.user_id === "string" && order.user_id === user?.id;
    const guestToken = guestTokenFromCookie(
      cookieStore.get("wb_guest_order_access")?.value,
      publicId,
    );
    const guestHasAccess =
      guestToken &&
      typeof order.guest_access_token_hash === "string" &&
      guestAccessMatches(guestToken, order.guest_access_token_hash);

    if (!viewerOwnsOrder && !guestHasAccess) return null;

    const orderId = asNumber(order.id);
    const [itemsResult, shipmentResult, returnsResult] = await Promise.all([
      supabase
        .from("order_items")
        .select(
          "id, sku, product_name, variant_title, quantity, unit_price_cents, line_total_cents",
        )
        .eq("order_id", orderId)
        .order("id", { ascending: true }),
      supabase
        .from("shipments")
        .select("status, service_name, tracking_pin, tracking_url")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("returns")
        .select("return_number, status, reason, resolution, created_at")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false }),
    ]);

    if (itemsResult.error || returnsResult.error) return null;
    const itemRows = (itemsResult.data ?? []) as UnknownRecord[];
    const shipment = shipmentResult.data as UnknownRecord | null;

    return {
      publicId: String(order.public_id),
      orderNumber: String(order.order_number),
      email: String(order.email),
      customerName: `${String(order.customer_first_name)} ${String(
        order.customer_last_name,
      )}`,
      status: String(order.status),
      paymentStatus: String(order.payment_status),
      fulfillmentStatus: String(order.fulfillment_status),
      fulfillmentMethod: String(order.fulfillment_method),
      currency: String(order.currency),
      subtotalCents: asNumber(order.subtotal_cents),
      shippingTotalCents: asNumber(order.shipping_total_cents),
      taxTotalCents: asNumber(order.tax_total_cents),
      totalCents: asNumber(order.total_cents),
      shippingAddress: asRecord(order.shipping_address),
      shippingServiceCode:
        typeof order.shipping_service_code === "string"
          ? order.shipping_service_code
          : null,
      stripeCheckoutSessionId:
        typeof order.stripe_checkout_session_id === "string"
          ? order.stripe_checkout_session_id
          : null,
      createdAt: String(order.created_at),
      paidAt: typeof order.paid_at === "string" ? order.paid_at : null,
      items: itemRows.map((item) => ({
        id: asNumber(item.id),
        sku: String(item.sku),
        productName: String(item.product_name),
        variantTitle: String(item.variant_title),
        quantity: asNumber(item.quantity),
        unitPriceCents: asNumber(item.unit_price_cents),
        lineTotalCents: asNumber(item.line_total_cents),
      })),
      shipment: shipment
        ? {
            status: String(shipment.status),
            serviceName:
              typeof shipment.service_name === "string"
                ? shipment.service_name
                : null,
            trackingPin:
              typeof shipment.tracking_pin === "string"
                ? shipment.tracking_pin
                : null,
            trackingUrl:
              typeof shipment.tracking_url === "string"
                ? shipment.tracking_url
                : null,
          }
        : null,
      returns: ((returnsResult.data ?? []) as UnknownRecord[]).map((entry) => ({
        returnNumber: String(entry.return_number),
        status: String(entry.status),
        reason: String(entry.reason),
        resolution:
          typeof entry.resolution === "string" ? entry.resolution : null,
        createdAt: String(entry.created_at),
      })),
    };
  },
);
