import { NextResponse } from "next/server";
import { shipmentCancellationSchema } from "@/lib/admin/schemas";
import { cancelCanadaPostShipment } from "@/lib/canada-post/client";
import { CommerceError, publicCommerceError } from "@/lib/commerce/errors";
import { isSameOriginRequest } from "@/lib/http/security";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/supabase/auth";

export const runtime = "nodejs";

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
  const shipmentId = Number(id);
  if (!Number.isSafeInteger(shipmentId) || shipmentId <= 0) {
    return NextResponse.json({ error: "Invalid shipment." }, { status: 400 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = shipmentCancellationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message ??
            "Enter VOID and a refund contact email.",
        },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdmin();
    const shipmentResult = await supabase
      .from("shipments")
      .select(
        "id, provider, is_sandbox, status, provider_self_url, provider_refund_url",
      )
      .eq("id", shipmentId)
      .maybeSingle();
    if (
      shipmentResult.error ||
      !shipmentResult.data ||
      shipmentResult.data.provider !== "canada_post" ||
      !shipmentResult.data.is_sandbox
    ) {
      throw new CommerceError(
        "Canada Post sandbox shipment not found.",
        "SHIPMENT_NOT_FOUND",
        404,
      );
    }
    if (
      ["voided", "refund_pending", "refunded"].includes(
        shipmentResult.data.status,
      )
    ) {
      return NextResponse.json(
        { shipment: shipmentResult.data, duplicate: true },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (!["label_created", "ready"].includes(shipmentResult.data.status)) {
      throw new CommerceError(
        "Only an unused label can be voided or refunded.",
        "SHIPMENT_CANNOT_BE_CANCELLED",
        422,
      );
    }

    const providerResult = await cancelCanadaPostShipment({
      selfUrl: shipmentResult.data.provider_self_url ?? "",
      refundUrl: shipmentResult.data.provider_refund_url ?? "",
      email: parsed.data.email,
    });
    const finalized = await supabase.rpc(
      "commerce_finish_canada_post_cancellation",
      {
        p_shipment_id: shipmentId,
        p_outcome: providerResult.status,
        p_service_ticket_id: providerResult.serviceTicketId ?? "",
        p_actor_user_id: auth.user.id,
      },
    );
    if (finalized.error) {
      throw new CommerceError(
        "Canada Post accepted the cancellation, but local records need reconciliation. Do not submit it again.",
        "SHIPMENT_RECONCILIATION_REQUIRED",
        503,
      );
    }

    return NextResponse.json(
      { shipment: finalized.data, duplicate: false },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const response = publicCommerceError(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
