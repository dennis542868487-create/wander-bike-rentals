import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSignOut } from "@/components/admin/admin-sign-out";
import { getCurrentStaff, getCurrentUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: {
    default: "Operations",
    template: "%s | Wander Bike Operations",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, staff] = await Promise.all([getCurrentUser(), getCurrentStaff()]);
  if (!user) redirect("/auth?next=/admin");

  if (!staff) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-700">
            Access denied
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">
            Staff role required
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {user.email} is signed in, but this account has not been granted a
            staff or admin role in Supabase.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/" className="btn-secondary px-5 py-3">
              Public site
            </Link>
            <AdminSignOut />
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/admin">
            <p className="font-bold tracking-tight text-slate-950">Wander Bike</p>
            <p className="text-xs text-slate-500">Commerce operations · Sandbox</p>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">{user.email}</p>
              <p className="text-xs capitalize text-slate-500">{staff.role}</p>
            </div>
            <AdminSignOut />
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[14rem_1fr]">
        <aside className="border-b border-slate-200 bg-white lg:min-h-[calc(100vh-65px)] lg:border-b-0 lg:border-r">
          <AdminNav />
        </aside>
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
