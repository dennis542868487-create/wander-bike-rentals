"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function AdminSignOut() {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      aria-label={loading ? "Signing out" : "Sign out"}
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await getSupabaseBrowser().auth.signOut();
        window.location.assign("/auth?next=/admin");
      }}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-50"
    >
      <LogOut aria-hidden="true" className="h-4 w-4" />
      <span className="hidden sm:inline">{loading ? "Signing out" : "Sign out"}</span>
    </button>
  );
}
