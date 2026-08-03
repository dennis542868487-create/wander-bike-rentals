import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/http/security";
import {
  deleteManagedListing,
  manageListing,
} from "@/lib/marketplace/listing-management-server";
import { listingManagementSchema } from "@/lib/marketplace/schemas";
import { requireAdmin } from "@/lib/supabase/auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const parsed = listingManagementSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid listing update." }, { status: 400 });
    }
    const { id } = await context.params;
    const result = await manageListing({
      listingId: id,
      actorId: auth.user.id,
      update: parsed.data,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json({ listing: result.listing });
  } catch (error) {
    console.error("Admin listing management failed", error);
    return NextResponse.json(
      { error: "Could not update this listing." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { id } = await context.params;
    const result = await deleteManagedListing({ listingId: id });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }
    return NextResponse.json({
      ok: true,
      deletedListing: result.deletedListing,
    });
  } catch (error) {
    console.error("Admin listing deletion failed", error);
    return NextResponse.json(
      { error: "Could not permanently delete this bike listing." },
      { status: 500 },
    );
  }
}
