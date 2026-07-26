import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
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
    <AdminShell email={user.email ?? "Wander Bike staff"} role={staff.role}>
      {children}
    </AdminShell>
  );
}
