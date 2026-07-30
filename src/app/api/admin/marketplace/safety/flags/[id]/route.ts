import { NextResponse } from "next/server";
import { fieldErrorPayload } from "@/lib/marketplace/field-errors";
import { isSameOriginRequest } from "@/lib/http/security";
import { manageListing } from "@/lib/marketplace/listing-management-server";
import { safetyFlagActionSchema } from "@/lib/marketplace/schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
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
    const parsed = safetyFlagActionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(fieldErrorPayload(parsed.error), { status: 400 });
    }
    const { id } = await context.params;
    const supabase = getSupabaseAdmin();
    const { data: flag, error: flagError } = await supabase
      .from("marketplace_safety_flags")
      .select("id,listing_id,status,details")
      .eq("id", id)
      .maybeSingle();
    if (flagError || !flag) {
      return NextResponse.json({ error: "Safety signal not found." }, { status: 404 });
    }
    if (flag.status !== "open") {
      return NextResponse.json(
        { error: "This safety signal is already resolved." },
        { status: 409 },
      );
    }

    if (parsed.data.action === "pause_listing") {
      const managed = await manageListing({
        listingId: flag.listing_id,
        actorId: auth.user.id,
        update: {
          status: "paused",
          managementNote:
            parsed.data.note ??
            "Paused after Site Admin reviewed an automatic safety signal.",
        },
      });
      if (!managed.ok) {
        return NextResponse.json(
          { error: managed.error },
          { status: managed.status },
        );
      }
    }

    const status =
      parsed.data.action === "dismiss" ? "dismissed" : "actioned";
    const { data: updated, error } = await supabase
      .from("marketplace_safety_flags")
      .update({
        status,
        resolution_note:
          parsed.data.note ??
          (parsed.data.action === "dismiss"
            ? "Dismissed by Site Admin."
            : parsed.data.action === "pause_listing"
              ? "Site Admin paused the listing."
              : "Marked handled by Site Admin."),
        resolved_by: auth.user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "open")
      .select("id,status")
      .single();
    if (error || !updated) throw error;
    return NextResponse.json({ flag: updated });
  } catch (error) {
    console.error("Safety signal action failed", error);
    return NextResponse.json(
      { error: "Could not resolve this safety signal." },
      { status: 500 },
    );
  }
}
