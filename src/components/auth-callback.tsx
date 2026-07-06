"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const missingCodeError = !params.get("code") ? params.get("error_description") || "The sign-in link is invalid or has expired." : "";

  useEffect(() => {
    const code = params.get("code");
    const nextValue = params.get("next");
    const next = nextValue?.startsWith("/") && !nextValue.startsWith("//") ? nextValue : "/account/bookings";
    if (!code) return;
    void getSupabaseBrowser().auth.exchangeCodeForSession(code).then(({ error: authError }) => {
      if (authError) setError(authError.message);
      else router.replace(next);
    });
  }, [params, router]);

  if (error || missingCodeError) return <div className="rounded-[2rem] border border-rose-200 bg-white p-7 text-center shadow-xl"><h1 className="text-2xl font-bold text-slate-950">Sign-in did not finish</h1><p className="mt-3 text-sm leading-6 text-rose-700">{error || missingCodeError}</p><Link href="/auth" className="btn-primary mt-6 px-6 py-3">Try again</Link></div>;
  return <div className="rounded-[2rem] border border-teal-100 bg-white p-8 text-center shadow-xl"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700"/><h1 className="mt-5 text-xl font-bold text-slate-950">Finishing your sign-in…</h1></div>;
}
