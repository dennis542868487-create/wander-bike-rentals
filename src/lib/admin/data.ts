import "server-only";

import { cache } from "react";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type UnknownRecord = Record<string, unknown>;

export type AdminOrderSummary = {
  id: number;
  publicId: string;
  orderNumber: string;
  customerName: string;
  email: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  fulfillmentMethod: string;
  totalCents: number;
  refundedTotalCents: number;
  createdAt: string;
};

export type AdminDashboard = {
  counts: {
    newOrders: number;
    awaitingShipment: number;
    awaitingPickup: number;
    paymentAnomalies: number;
    lowStock: number;
    upcomingRentals: number;
  };
  revenue24hCents: number;
  revenue30dCents: number;
  recentOrders: AdminOrderSummary[];
  lowStock: Array<{
    variantId: number;
    sku: string;
    productName: string;
    available: number;
    reorderPoint: number;
  }>;
  upcomingBookings: Array<{
    id: string;
    customerName: string;
    startsAt: string;
    adultBikes: number;
    kidsBikes: number;
    trailers: number;
    status: string;
  }>;
};

function asNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function firstRelation(value: unknown): UnknownRecord | null {
  if (Array.isArray(value)) return (value[0] as UnknownRecord | undefined) ?? null;
  return value && typeof value === "object" ? (value as UnknownRecord) : null;
}

function mapOrder(row: UnknownRecord): AdminOrderSummary {
  return {
    id: asNumber(row.id),
    publicId: String(row.public_id),
    orderNumber: String(row.order_number),
    customerName: `${String(row.customer_first_name)} ${String(
      row.customer_last_name,
    )}`,
    email: String(row.email),
    status: String(row.status),
    paymentStatus: String(row.payment_status),
    fulfillmentStatus: String(row.fulfillment_status),
    fulfillmentMethod: String(row.fulfillment_method),
    totalCents: asNumber(row.total_cents),
    refundedTotalCents: asNumber(row.refunded_total_cents),
    createdAt: String(row.created_at),
  };
}

const orderSummarySelect = `
  id,
  public_id,
  order_number,
  customer_first_name,
  customer_last_name,
  email,
  status,
  payment_status,
  fulfillment_status,
  fulfillment_method,
  total_cents,
  refunded_total_cents,
  created_at
`;

export const getAdminDashboard = cache(async (): Promise<AdminDashboard> => {
  const supabase = getSupabaseAdmin();
  const now = Date.now();
  const since24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const since30d = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  const next48h = new Date(now + 48 * 60 * 60 * 1000).toISOString();

  const [
    newOrders,
    awaitingShipment,
    awaitingPickup,
    paymentAnomalies,
    revenueOrders,
    recentOrders,
    inventory,
    upcomingBookings,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since24h),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("fulfillment_status", ["reserved", "preparing", "ready_to_ship"])
      .in("payment_status", ["paid", "partially_refunded"]),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("fulfillment_status", "ready_for_pickup"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("payment_status", ["pending", "failed"]),
    supabase
      .from("orders")
      .select("total_cents, refunded_total_cents, paid_at")
      .gte("paid_at", since30d)
      .in("payment_status", ["paid", "partially_refunded", "refunded"])
      .limit(1000),
    supabase
      .from("orders")
      .select(orderSummarySelect)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("inventory_levels")
      .select(`
        variant_id,
        available,
        reorder_point,
        product_variants!inner (
          sku,
          products!inner ( name )
        )
      `)
      .limit(500),
    supabase
      .from("bookings")
      .select(
        "id, customer_name, starts_at, adult_bikes, kids_bikes, trailers, status",
      )
      .gte("starts_at", new Date(now).toISOString())
      .lte("starts_at", next48h)
      .in("status", ["pending", "confirmed"])
      .order("starts_at", { ascending: true })
      .limit(12),
  ]);

  const queryErrors = [
    newOrders.error,
    awaitingShipment.error,
    awaitingPickup.error,
    paymentAnomalies.error,
    revenueOrders.error,
    recentOrders.error,
    inventory.error,
    upcomingBookings.error,
  ].filter(Boolean);
  if (queryErrors.length > 0) {
    throw new Error("Admin dashboard data is unavailable.");
  }

  const revenueRows = (revenueOrders.data ?? []) as UnknownRecord[];
  const revenue24hCents = revenueRows
    .filter((row) => typeof row.paid_at === "string" && row.paid_at >= since24h)
    .reduce(
      (total, row) =>
        total + asNumber(row.total_cents) - asNumber(row.refunded_total_cents),
      0,
    );
  const revenue30dCents = revenueRows.reduce(
    (total, row) =>
      total + asNumber(row.total_cents) - asNumber(row.refunded_total_cents),
    0,
  );
  const lowStockRows = ((inventory.data ?? []) as UnknownRecord[])
    .filter((row) => asNumber(row.available) <= asNumber(row.reorder_point))
    .map((row) => {
      const variant = firstRelation(row.product_variants);
      const product = firstRelation(variant?.products);
      return {
        variantId: asNumber(row.variant_id),
        sku: String(variant?.sku ?? ""),
        productName: String(product?.name ?? "Unknown product"),
        available: asNumber(row.available),
        reorderPoint: asNumber(row.reorder_point),
      };
    })
    .sort((left, right) => left.available - right.available);

  return {
    counts: {
      newOrders: newOrders.count ?? 0,
      awaitingShipment: awaitingShipment.count ?? 0,
      awaitingPickup: awaitingPickup.count ?? 0,
      paymentAnomalies: paymentAnomalies.count ?? 0,
      lowStock: lowStockRows.length,
      upcomingRentals: upcomingBookings.data?.length ?? 0,
    },
    revenue24hCents,
    revenue30dCents,
    recentOrders: ((recentOrders.data ?? []) as UnknownRecord[]).map(mapOrder),
    lowStock: lowStockRows.slice(0, 10),
    upcomingBookings: ((upcomingBookings.data ?? []) as UnknownRecord[]).map(
      (booking) => ({
        id: String(booking.id),
        customerName: String(booking.customer_name),
        startsAt: String(booking.starts_at),
        adultBikes: asNumber(booking.adult_bikes),
        kidsBikes: asNumber(booking.kids_bikes),
        trailers: asNumber(booking.trailers),
        status: String(booking.status),
      }),
    ),
  };
});

export async function getAdminOrders(filters: {
  status?: string;
  fulfillment?: string;
  query?: string;
}) {
  const supabase = getSupabaseAdmin();
  let request = supabase
    .from("orders")
    .select(orderSummarySelect)
    .order("created_at", { ascending: false })
    .limit(250);

  if (filters.status && filters.status !== "all") {
    request = request.eq("payment_status", filters.status);
  }
  if (filters.fulfillment && filters.fulfillment !== "all") {
    request = request.eq("fulfillment_status", filters.fulfillment);
  }

  const result = await request;
  if (result.error) throw new Error("Orders are unavailable.");
  const mapped = ((result.data ?? []) as UnknownRecord[]).map(mapOrder);
  const query = filters.query?.trim().toLowerCase();
  if (!query) return mapped;

  return mapped.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.email.toLowerCase().includes(query),
  );
}

export const getAdminOrder = cache(async (orderId: number) => {
  const supabase = getSupabaseAdmin();
  const [
    order,
    items,
    payments,
    refunds,
    shipments,
    returns,
    audit,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("*, shipping_quotes ( service_name, package_details )")
      .eq("id", orderId)
      .maybeSingle(),
    supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .order("id", { ascending: true }),
    supabase
      .from("payments")
      .select("*")
      .eq("order_id", orderId)
      .order("id", { ascending: false }),
    supabase
      .from("refunds")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false }),
    supabase
      .from("shipments")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false }),
    supabase
      .from("returns")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false }),
    supabase
      .from("audit_log")
      .select("id, actor_user_id, action, before_state, after_state, metadata, created_at")
      .eq("entity_type", "order")
      .eq("entity_id", String(orderId))
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  if (order.error || !order.data) return null;
  const errors = [
    items.error,
    payments.error,
    refunds.error,
    shipments.error,
    returns.error,
    audit.error,
  ].filter(Boolean);
  if (errors.length > 0) throw new Error("Order details are unavailable.");

  return {
    order: order.data as UnknownRecord,
    items: (items.data ?? []) as UnknownRecord[],
    payments: (payments.data ?? []) as UnknownRecord[],
    refunds: (refunds.data ?? []) as UnknownRecord[],
    shipments: (shipments.data ?? []) as UnknownRecord[],
    returns: (returns.data ?? []) as UnknownRecord[],
    audit: (audit.data ?? []) as UnknownRecord[],
  };
});
