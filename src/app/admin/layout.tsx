import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminSignOut } from "@/components/admin/admin-sign-out";
import {
  COMMUNITY_DASHBOARD_LABEL,
  PLATFORM_DASHBOARD_LABEL,
} from "@/lib/marketplace/workspace-labels";
import { getCurrentAdmin, getCurrentUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: {
    default: PLATFORM_DASHBOARD_LABEL,
    template: `%s | ${PLATFORM_DASHBOARD_LABEL}`,
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, admin] = await Promise.all([getCurrentUser(), getCurrentAdmin()]);
  if (!user) redirect("/auth?next=/admin");
  if (!admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
        <div className="w-full max-w-md rounded-[0.9rem] bg-white p-8 text-center shadow-2xl">
          <p className="text-xs font-bold text-rose-700">ACCESS DENIED</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">
            {PLATFORM_DASHBOARD_LABEL} access required
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {user.email} is signed in, but this account is not the website
            administrator.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/account" className="btn-secondary">
              {COMMUNITY_DASHBOARD_LABEL}
            </Link>
            <AdminSignOut />
          </div>
        </div>
      </main>
    );
  }
  return (
    <AdminShell email={user.email ?? ""} role="admin">
      {children}
    </AdminShell>
  );
}
