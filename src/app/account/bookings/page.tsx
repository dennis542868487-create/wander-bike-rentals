import type { Metadata } from "next";
import MyBookings from "@/components/my-bookings";

export const metadata: Metadata = { title: "My Bookings", robots: { index: false, follow: false } };

export default function MyBookingsPage() {
  return <main className="relative isolate min-h-[70vh] overflow-hidden px-6 py-12 sm:py-16"><div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_8%_5%,rgba(20,184,166,.18),transparent_34%),#f0fdf9]"/><div className="mx-auto max-w-5xl"><MyBookings /></div></main>;
}
