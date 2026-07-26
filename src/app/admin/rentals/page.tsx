import type { Metadata } from "next";
import BookingAdmin from "@/components/booking-admin";

export const metadata: Metadata = {
  title: "Rentals",
  robots: { index: false, follow: false },
};

export default function AdminRentalsPage() {
  return <BookingAdmin />;
}
