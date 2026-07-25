import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav
        aria-label="Account"
        className="border-b border-teal-100 bg-white/80 px-6 backdrop-blur"
      >
        <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto py-3">
          <Link
            href="/account"
            className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50"
          >
            Overview
          </Link>
          <Link
            href="/account/orders"
            className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50"
          >
            Shop orders
          </Link>
          <Link
            href="/account/bookings"
            className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50"
          >
            Rental bookings
          </Link>
        </div>
      </nav>
      {children}
    </>
  );
}
