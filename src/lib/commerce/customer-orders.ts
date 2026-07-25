import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/auth";

type UnknownRecord = Record<string, unknown>;

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

export async function getCustomerOrderSummaries() {
  const user = await getCurrentUser();
  if (!user) return null;

  const result = await getSupabaseAdmin()
    .from("orders")
    .select(`
      public_id,
      order_number,
      status,
      payment_status,
      fulfillment_status,
      fulfillment_method,
      total_cents,
      refunded_total_cents,
      created_at,
      shipments (
        status,
        service_name,
        tracking_pin,
        tracking_url,
        package_details,
        created_at
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (result.error) throw new Error("Orders are unavailable.");
  return {
    user,
    orders: ((result.data ?? []) as UnknownRecord[]).map((row) => {
      const shipments = Array.isArray(row.shipments)
        ? ([...row.shipments] as UnknownRecord[]).sort((left, right) =>
            text(left.created_at).localeCompare(text(right.created_at)),
          )
        : [];
      return {
        publicId: text(row.public_id),
        orderNumber: text(row.order_number),
        status: text(row.status),
        paymentStatus: text(row.payment_status),
        fulfillmentStatus: text(row.fulfillment_status),
        fulfillmentMethod: text(row.fulfillment_method),
        totalCents: number(row.total_cents),
        refundedTotalCents: number(row.refunded_total_cents),
        createdAt: text(row.created_at),
        shipments: shipments
          .filter(
            (shipment) =>
              ![
                "cancelled",
                "voided",
                "refund_pending",
                "refunded",
                "exception",
              ].includes(text(shipment.status)),
          )
          .map((shipment) => {
            const packageDetails =
              shipment.package_details &&
              typeof shipment.package_details === "object"
                ? (shipment.package_details as UnknownRecord)
                : {};
            return {
              status: text(shipment.status),
              serviceName: text(shipment.service_name),
              trackingPin: text(shipment.tracking_pin),
              trackingUrl: text(shipment.tracking_url),
              packageNumber: number(packageDetails.packageNumber) || null,
            };
          }),
      };
    }),
  };
}
