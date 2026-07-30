import { NextResponse } from "next/server";
import { fieldErrorPayload } from "@/lib/marketplace/field-errors";
import { isSameOriginRequest } from "@/lib/http/security";
import { manageListing } from "@/lib/marketplace/listing-management-server";
import { listingManagementSchema } from "@/lib/marketplace/schemas";
import { requireStaff } from "@/lib/supabase/auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const auth = await requireStaff(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const parsed = listingManagementSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(fieldErrorPayload(parsed.error), { status: 400 });
    }
    const { id } = await context.params;
    const result = await manageListing({
      listingId: id,
      actorId: auth.user.id,
      update: parsed.data,
      allowedSource: "wander",
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json({ listing: result.listing });
  } catch (error) {
    console.error("Wander listing management failed", error);
    return NextResponse.json(
      { error: "Could not update this Wander Bike." },
      { status: 500 },
    );
  }
}
