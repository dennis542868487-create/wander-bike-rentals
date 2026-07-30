"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export function AdminSignOut({ nextPath = "/admin" }: { nextPath?: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await getSupabaseBrowser().auth.signOut();
        window.location.assign(`/auth?next=${encodeURIComponent(nextPath)}`);
      }}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
    >
      <LogOut aria-hidden="true" className="h-4 w-4" />
      {loading ? "Signing out" : "Sign out"}
    </button>
  );
}
