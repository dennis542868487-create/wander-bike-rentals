import type { Metadata } from "next";
import BookingAdmin from "@/components/booking-admin";

export const metadata: Metadata = {
  title: "Booking Calendar",
  robots: { index: false, follow: false },
};

export default function BookingAdminPage() {
  return (
    <div className="fixed inset-0 z-[2147483647] overflow-y-auto bg-slate-100">
      <BookingAdmin />
    </div>
  );
}
