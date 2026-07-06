import { NextResponse } from "next/server";
import { bookingStatuses, parseBookingInput } from "@/lib/booking-types";
import { getSupabaseAdmin, requireBookingAdmin } from "@/lib/supabase";

export async function PATCH(request: Request, context: RouteContext<"/api/booking-admin/bookings/[id]">) {
  try {
    const auth = await requireBookingAdmin(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = (await request.json()) as Record<string, unknown>;
    const parsed = parseBookingInput(body, { allowPast: true, allowLong: true });
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const status = typeof body.status === "string" && bookingStatuses.includes(body.status as never)
      ? body.status
      : null;
    if (!status) return NextResponse.json({ error: "Invalid booking status." }, { status: 400 });

    const { id } = await context.params;
    const { data, error } = await getSupabaseAdmin()
      .from("bookings")
      .update({ ...parsed.data, status })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ booking: data });
  } catch (error) {
    console.error("Booking update failed", error);
    return NextResponse.json({ error: "Could not update this booking." }, { status: 500 });
  }
}
