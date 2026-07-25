import { NextResponse } from "next/server";
import { parseBookingInput } from "@/lib/booking-types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/auth";

async function ownedEditableBooking(request: Request, id: string) {
  const auth = await requireUser(request);
  if (!auth.ok) return { response: NextResponse.json({ error: auth.error }, { status: auth.status }) };

  const { data, error } = await getSupabaseAdmin()
    .from("bookings")
    .select("*")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .single();

  if (error || !data) {
    return { response: NextResponse.json({ error: "Booking not found." }, { status: 404 }) };
  }
  if (["completed", "cancelled"].includes(data.status) || new Date(data.starts_at) <= new Date()) {
    return { response: NextResponse.json({ error: "This booking can no longer be changed online. Please call us." }, { status: 409 }) };
  }
  return { booking: data, user: auth.user };
}

export async function PATCH(request: Request, context: RouteContext<"/api/bookings/[id]">) {
  try {
    const { id } = await context.params;
    const owned = await ownedEditableBooking(request, id);
    if (owned.response) return owned.response;

    const parsed = parseBookingInput(await request.json());
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const { data, error } = await getSupabaseAdmin()
      .from("bookings")
      .update({ ...parsed.data, status: "pending" })
      .eq("id", id)
      .eq("user_id", owned.user.id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ booking: data });
  } catch (error) {
    console.error("Customer booking update failed", error);
    return NextResponse.json({ error: "Could not update this booking." }, { status: 500 });
  }
}
export async function DELETE(request: Request, context: RouteContext<"/api/bookings/[id]">) {
  try {
    const { id } = await context.params;
    const owned = await ownedEditableBooking(request, id);
    if (owned.response) return owned.response;

    const { data, error } = await getSupabaseAdmin()
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("user_id", owned.user.id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ booking: data });
  } catch (error) {
    console.error("Customer booking cancellation failed", error);
    return NextResponse.json({ error: "Could not cancel this booking." }, { status: 500 });
  }
}
