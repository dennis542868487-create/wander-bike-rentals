import Link from "next/link";
import { CalendarDays, PackageCheck } from "lucide-react";
import { AccountSignOut } from "@/components/account-sign-out";
import { getCurrentUser } from "@/lib/supabase/auth";

export default async function AccountPage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-[70vh] bg-[radial-gradient(circle_at_8%_5%,rgba(20,184,166,.18),transparent_34%),#f0fdf9] px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-5xl">
        {!user ? (
          <div className="rounded-[2rem] border border-teal-100 bg-white p-8 text-center shadow-sm">
            <h1 className="text-3xl font-bold text-slate-950">Your Wander Bike account</h1>
            <p className="mt-3 text-slate-600">
              Sign in to see rental bookings and shop orders linked to your account.
            </p>
            <Link href="/auth?next=/account" className="btn-primary mt-6 px-6 py-3">
              Sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[.18em] text-teal-700">
                  {user.email}
                </p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
                  My account
                </h1>
                <p className="mt-3 text-slate-600">
                  Rental and retail records stay separate, but live in one account.
                </p>
              </div>
              <AccountSignOut />
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <Link
                href="/account/orders"
                className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <PackageCheck className="h-7 w-7 text-teal-700" aria-hidden="true" />
                <h2 className="mt-5 text-2xl font-bold text-slate-950">Shop orders</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Review payment, fulfillment, tracking, and return status.
                </p>
              </Link>
              <Link
                href="/account/bookings"
                className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <CalendarDays className="h-7 w-7 text-teal-700" aria-hidden="true" />
                <h2 className="mt-5 text-2xl font-bold text-slate-950">
                  Rental bookings
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Review, change, or cancel eligible rental requests.
                </p>
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
