import { NextResponse } from "next/server";
import { getSupabaseAdmin, requireBookingAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const auth = await requireBookingAdmin(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const url = new URL(request.url);
    const from = new Date(url.searchParams.get("from") ?? "");
    const to = new Date(url.searchParams.get("to") ?? "");
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return NextResponse.json({ error: "Invalid calendar range." }, { status: 400 });
    }

    const { data, error } = await getSupabaseAdmin()
      .from("bookings")
      .select("*")
      .lt("starts_at", to.toISOString())
      .gt("ends_at", from.toISOString())
      .order("starts_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ bookings: data });
  } catch (error) {
    console.error("Booking calendar load failed", error);
    return NextResponse.json({ error: "Could not load bookings." }, { status: 500 });
  }
}
