import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireStaff(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  const shipmentId = Number(id);
  if (!Number.isSafeInteger(shipmentId) || shipmentId <= 0) {
    return NextResponse.json({ error: "Invalid shipment." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const shipment = await supabase
    .from("shipments")
    .select("status, label_storage_path, orders!inner ( order_number )")
    .eq("id", shipmentId)
    .maybeSingle();
  if (
    shipment.error ||
    !shipment.data?.label_storage_path ||
    ["voided", "cancelled", "refunded"].includes(shipment.data.status)
  ) {
    return NextResponse.json({ error: "Label not found." }, { status: 404 });
  }

  const download = await supabase.storage
    .from("shipping-labels")
    .download(shipment.data.label_storage_path);
  if (download.error || !download.data) {
    return NextResponse.json({ error: "Label not found." }, { status: 404 });
  }

  const relation = Array.isArray(shipment.data.orders)
    ? shipment.data.orders[0]
    : shipment.data.orders;
  const orderNumber =
    relation && typeof relation.order_number === "string"
      ? relation.order_number.replace(/[^A-Za-z0-9-]/g, "")
      : String(shipmentId);

  return new Response(await download.data.arrayBuffer(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="wander-bike-${orderNumber}-label.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
