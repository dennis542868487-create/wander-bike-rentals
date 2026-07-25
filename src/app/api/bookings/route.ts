import { NextResponse } from "next/server";
import { parseBookingInput } from "@/lib/booking-types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/supabase/auth";

export async function GET(request: Request) {
  try {
    const auth = await requireUser(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { data, error } = await getSupabaseAdmin()
      .from("bookings")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("starts_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ bookings: data });
  } catch (error) {
    console.error("Customer bookings load failed", error);
    return NextResponse.json({ error: "Could not load your bookings." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireUser(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = (await request.json()) as Record<string, unknown>;

    // Quietly accept bot submissions without writing customer data.
    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const parsed = parseBookingInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const { error } = await getSupabaseAdmin().from("bookings").insert({
      ...parsed.data,
      user_id: auth.user.id,
    });
    if (error) {
      console.error("Booking insert failed", error.message);
      return NextResponse.json({ error: "We could not save your request. Please call us at (778) 952-1389." }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Booking request failed", error);
    return NextResponse.json({ error: "Booking is not configured yet. Please call us at (778) 952-1389." }, { status: 503 });
  }
}
