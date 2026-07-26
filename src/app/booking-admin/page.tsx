import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Booking Calendar",
  robots: { index: false, follow: false },
};

export default function BookingAdminPage() {
  redirect("/admin/rentals");
}
