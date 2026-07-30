import { Search, X } from "lucide-react";
import Link from "next/link";
import { UserAccessActions } from "@/components/admin/user-access-actions";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import { formatDateTime } from "@/lib/marketplace/format";
import { getAdminUsers } from "@/lib/marketplace/server-data";
import { getCurrentAdmin } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const staff = await getCurrentAdmin();
  if (!staff) return null;
  const filters = await searchParams;
  const users = await getAdminUsers(filters.q);
  const canManageRoles = staff.role === "admin";

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">Users</h1>
      <p className="mt-2 text-slate-600">
        One account can request bikes and publish listings.
      </p>
      <form className="mt-7 flex gap-3 rounded-[0.9rem] border border-slate-200 bg-white p-4">
        <label className="sr-only" htmlFor="user-search">Search users</label>
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            id="user-search"
            name="q"
            defaultValue={filters.q}
            className="market-input market-input-icon mt-0"
            placeholder="Search email or name"
          />
        </div>
        <button className="btn-primary">Search</button>
        {filters.q ? (
          <Link href="/admin/users" className="btn-quiet px-3" aria-label="Clear search">
            <X className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </form>
      {!canManageRoles ? (
        <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
          Staff can view users. Only administrators can change account roles.
        </p>
      ) : null}

      <div className="mt-5 hidden overflow-hidden rounded-[0.9rem] border border-slate-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Marketplace access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-950">{user.fullName || "No name"}</p>
                  <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                </td>
                <td className="px-5 py-4 text-slate-600">{user.phone || "—"}</td>
                <td className="px-5 py-4 text-xs text-slate-500">{formatDateTime(user.createdAt)}</td>
                <td className="px-5 py-4">
                  <UserRoleSelect userId={user.id} role={user.role} disabled={!canManageRoles || user.id === staff?.user.id || user.marketplaceAccessStatus === "suspended"} />
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${
                      user.marketplaceAccessStatus === "active"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-rose-50 text-rose-800"
                    }`}
                  >
                    {user.marketplaceAccessStatus}
                  </span>
                  {user.marketplaceAccessReason ? (
                    <p className="mt-2 max-w-xs text-xs text-slate-500">
                      {user.marketplaceAccessReason}
                    </p>
                  ) : null}
                  <div className="mt-2">
                    <UserAccessActions
                      userId={user.id}
                      status={user.marketplaceAccessStatus}
                      disabled={
                        !canManageRoles ||
                        user.id === staff?.user.id ||
                        user.role !== "customer"
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 space-y-3 md:hidden">
        {users.map((user) => (
          <article key={user.id} className="rounded-[0.9rem] border border-slate-200 bg-white p-5">
            <p className="font-bold text-slate-950">{user.fullName || "No name"}</p>
            <p className="mt-1 break-all text-sm text-slate-500">{user.email}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Phone</dt>
                <dd className="mt-1 text-slate-800">{user.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Joined</dt>
                <dd className="mt-1 text-slate-800">{formatDateTime(user.createdAt)}</dd>
              </div>
            </dl>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <UserRoleSelect userId={user.id} role={user.role} disabled={!canManageRoles || user.id === staff?.user.id || user.marketplaceAccessStatus === "suspended"} />
            </div>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Marketplace access
              </p>
              <p
                className={`mt-2 text-sm font-bold ${
                  user.marketplaceAccessStatus === "active"
                    ? "text-emerald-700"
                    : "text-rose-700"
                }`}
              >
                {user.marketplaceAccessStatus}
              </p>
              {user.marketplaceAccessReason ? (
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {user.marketplaceAccessReason}
                </p>
              ) : null}
              <div className="mt-3">
                <UserAccessActions
                  userId={user.id}
                  status={user.marketplaceAccessStatus}
                  disabled={
                    !canManageRoles ||
                    user.id === staff?.user.id ||
                    user.role !== "customer"
                  }
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
