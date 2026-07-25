import { NextResponse } from "next/server";
import {
  createCanadaPostShipment,
  getCanadaPostLabelArtifact,
  getCanadaPostLabelCost,
  type CanadaPostLink,
  type CanadaPostShipmentAddress,
} from "@/lib/canada-post/client";
import { shippingLabelRequestSchema } from "@/lib/admin/schemas";
import { CommerceError, publicCommerceError } from "@/lib/commerce/errors";
import { scheduleNotificationDelivery } from "@/lib/email/schedule";
import { addressSchema, normalizeCanadianPostalCode } from "@/lib/commerce/schemas";
import { getServerEnvironment } from "@/lib/env";
import { getCommerceStoreSettings } from "@/lib/commerce/settings";
import { isSameOriginRequest } from "@/lib/http/security";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/supabase/auth";

export const runtime = "nodejs";

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function number(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const auth = await requireStaff(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  const orderId = Number(id);
  if (!Number.isSafeInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Invalid order." }, { status: 400 });
  }

  let shipmentId: number | null = null;
  try {
    const body: unknown = await request.json();
    const parsed = shippingLabelRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid package details." },
        { status: 400 },
      );
    }

    const environment = getServerEnvironment();
    if (
      !environment.COMMERCE_SANDBOX_MODE ||
      !environment.CANADA_POST_ACCOUNT_TYPE ||
      !environment.CANADA_POST_USERNAME ||
      !environment.CANADA_POST_PASSWORD ||
      !environment.CANADA_POST_CUSTOMER_NUMBER
    ) {
      throw new CommerceError(
        "Canada Post sandbox label settings are incomplete. Add the account type and customer details first.",
        "CANADA_POST_LABEL_CONFIGURATION_REQUIRED",
        503,
      );
    }

    const settings = await getCommerceStoreSettings();
    if (!settings.canadaPostEnabled) {
      throw new CommerceError(
        "Canada Post is disabled in store settings.",
        "CANADA_POST_NOT_ENABLED",
        422,
      );
    }

    const supabase = getSupabaseAdmin();
    const orderResult = await supabase
      .from("orders")
      .select(`
        id,
        public_id,
        order_number,
        customer_first_name,
        customer_last_name,
        phone,
        payment_status,
        fulfillment_method,
        shipping_address,
        shipping_service_code,
        shipping_total_cents,
        shipping_quotes ( service_name )
      `)
      .eq("id", orderId)
      .maybeSingle();

    if (orderResult.error || !orderResult.data) {
      throw new CommerceError("Order not found.", "ORDER_NOT_FOUND", 404);
    }
    const order = orderResult.data as UnknownRecord;
    const addressResult = addressSchema.safeParse(order.shipping_address);
    if (!addressResult.success) {
      throw new CommerceError(
        "The order does not have a valid Canadian delivery address.",
        "INVALID_SHIPPING_ADDRESS",
        422,
      );
    }

    const quoteRelation = Array.isArray(order.shipping_quotes)
      ? record(order.shipping_quotes[0])
      : record(order.shipping_quotes);
    const serviceCode = text(order.shipping_service_code);
    const serviceName = text(quoteRelation.service_name) || serviceCode;
    const packageDetails = {
      packageNumber: parsed.data.package.packageNumber,
      packageCount: parsed.data.package.packageCount,
      weightKg: parsed.data.package.weightKg,
      lengthCm: parsed.data.package.lengthCm,
      widthCm: parsed.data.package.widthCm,
      heightCm: parsed.data.package.heightCm,
    };
    const prepared = await supabase.rpc("commerce_prepare_canada_post_shipment", {
      p_order_id: orderId,
      p_idempotency_key: parsed.data.idempotencyKey,
      p_package_details: packageDetails,
      p_actor_user_id: auth.user.id,
    });
    if (prepared.error) {
      const conflict = prepared.error.code === "23505";
      throw new CommerceError(
        conflict
          ? "This order already has an active Canada Post shipment."
          : "The order is not eligible for a Canada Post label.",
        conflict ? "SHIPMENT_ALREADY_EXISTS" : "SHIPMENT_NOT_ELIGIBLE",
        conflict ? 409 : 422,
      );
    }

    const preparedData = record(prepared.data);
    let shipment = record(preparedData.shipment);
    shipmentId = number(shipment.id);
    if (!shipmentId) {
      throw new CommerceError(
        "The shipment reservation could not be read.",
        "SHIPMENT_PREPARE_FAILED",
        503,
      );
    }

    if (text(shipment.status) === "label_created" && text(shipment.label_storage_path)) {
      return NextResponse.json(
        { shipment, duplicate: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    let labelLink: CanadaPostLink;
    let priceLink: CanadaPostLink | null = null;
    if (text(shipment.provider_shipment_id) && text(shipment.label_artifact_url)) {
      labelLink = {
        rel: "label",
        href: text(shipment.label_artifact_url),
        mediaType: "application/pdf",
      };
    } else if (preparedData.status === "duplicate") {
      throw new CommerceError(
        "A label request is already in progress. Keep this request ID and reconcile it before trying again.",
        "SHIPMENT_RECONCILIATION_REQUIRED",
        409,
      );
    } else {
      const address = addressResult.data;
      const destination: CanadaPostShipmentAddress = {
        name: `${text(order.customer_first_name)} ${text(
          order.customer_last_name,
        )}`.trim(),
        phone: text(order.phone) || undefined,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || undefined,
        city: address.city,
        province: address.province,
        postalCode: normalizeCanadianPostalCode(address.postalCode),
        country: "CA",
      };
      const providerShipment = await createCanadaPostShipment({
        orderNumber: text(order.order_number),
        customerRequestId: text(shipment.customer_request_id),
        serviceCode,
        serviceName,
        sender: settings.shippingOrigin,
        destination,
        package: packageDetails,
      });

      const recorded = await supabase.rpc("commerce_record_canada_post_shipment", {
        p_shipment_id: shipmentId,
        p_provider_shipment_id: providerShipment.shipmentId,
        p_provider_self_url: providerShipment.selfLink?.href ?? "",
        p_provider_refund_url: providerShipment.refundLink?.href ?? "",
        p_label_artifact_url: providerShipment.labelLink.href,
        p_tracking_pin: providerShipment.trackingPin,
        p_service_name: providerShipment.serviceName,
        p_actor_user_id: auth.user.id,
      });
      if (recorded.error) {
        throw new CommerceError(
          "Canada Post created a label, but its references could not be saved. Do not create another label.",
          "SHIPMENT_RECONCILIATION_REQUIRED",
          503,
        );
      }
      shipment = record(recorded.data);
      labelLink = providerShipment.labelLink;
      priceLink = providerShipment.priceLink;
    }

    const [labelBytes, providerCost] = await Promise.all([
      getCanadaPostLabelArtifact(labelLink),
      getCanadaPostLabelCost(priceLink),
    ]);
    const labelStoragePath = `orders/${text(order.public_id)}/shipments/${shipmentId}.pdf`;
    const upload = await supabase.storage
      .from("shipping-labels")
      .upload(labelStoragePath, labelBytes, {
        cacheControl: "private, max-age=0",
        contentType: "application/pdf",
        upsert: true,
      });
    if (upload.error) {
      throw new CommerceError(
        "The Canada Post label exists, but its private PDF could not be stored.",
        "LABEL_STORAGE_FAILED",
        503,
      );
    }

    const finalized = await supabase.rpc("commerce_finalize_canada_post_shipment", {
      p_shipment_id: shipmentId,
      p_label_storage_path: labelStoragePath,
      p_label_cost_cents: providerCost ?? number(order.shipping_total_cents),
      p_actor_user_id: auth.user.id,
    });
    if (finalized.error) {
      throw new CommerceError(
        "The label PDF was stored but the order could not be finalized.",
        "SHIPMENT_RECONCILIATION_REQUIRED",
        503,
      );
    }

    scheduleNotificationDelivery();

    return NextResponse.json(
      { shipment: record(record(finalized.data).shipment), duplicate: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (
      shipmentId &&
      error instanceof CommerceError &&
      error.code === "CANADA_POST_SHIPMENT_REJECTED"
    ) {
      await getSupabaseAdmin().rpc("commerce_fail_canada_post_shipment", {
        p_shipment_id: shipmentId,
        p_failure_code: error.code,
        p_actor_user_id: auth.user.id,
      });
    }
    const response = publicCommerceError(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
