"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useSocialAuth } from "@/hooks/use-social-auth";
import { SocialAuthButtons } from "@/components/social-auth-buttons";
import type { SocialAuthProvider } from "@/lib/supabase/oauth-providers";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export default function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session, ready } = useAuthSession();
  const socialAuth = useSocialAuth();
  const [mode, setMode] = useState<"signin" | "signup">(searchParams.get("mode") === "signup" ? "signup" : "signin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const next = useMemo(() => safeNext(searchParams.get("next")), [searchParams]);

  async function signInWithProvider(provider: SocialAuthProvider) {
    setLoading(true);
    setError("");
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: authError } = await getSupabaseBrowser().auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    try {
      if (mode === "signup") {
        const fullName = String(form.get("full_name"));
        const { data, error: authError } = await getSupabaseBrowser().auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (authError) throw authError;
        if (data.session) router.replace(next);
        else setMessage("Check your email to confirm your account, then return here to sign in.");
      } else {
        const { error: authError } = await getSupabaseBrowser().auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.replace(next);
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Could not continue.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return <div className="h-[28rem] animate-pulse rounded-[2rem] bg-white/70" />;

  if (session) {
    return (
      <div className="rounded-[2rem] border border-teal-100 bg-white p-7 text-center shadow-[0_24px_70px_rgba(15,23,42,.1)] sm:p-9">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-2xl">✓</div>
        <h2 className="mt-5 text-2xl font-bold text-slate-950">You’re already signed in</h2>
        <p className="mt-2 text-sm text-slate-500">{session.user.email}</p>
        <Link href={next} className="btn-brand mt-6 w-full px-6 py-3.5">Continue</Link>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,.11)] sm:p-8">
      <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1">
        {(["signin", "signup"] as const).map((item) => (
          <button key={item} type="button" onClick={() => { setMode(item); setError(""); setMessage(""); }} className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${mode === item ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
            {item === "signin" ? "Sign in" : "Create account"}
          </button>
        ))}
      </div>

      <SocialAuthButtons
        availability={socialAuth}
        busy={loading}
        onSelect={signInWithProvider}
        className="mt-6"
      />

      <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-slate-200"/><span className="text-xs font-semibold uppercase tracking-[.16em] text-slate-400">or email</span><span className="h-px flex-1 bg-slate-200"/></div>

      <form onSubmit={submit}>
        {mode === "signup" && <label className="block text-sm font-semibold text-slate-700">Full name<input name="full_name" required autoComplete="name" className="booking-input" placeholder="Your full name" /></label>}
        <label className={`${mode === "signup" ? "mt-4" : ""} block text-sm font-semibold text-slate-700`}>Email<input name="email" required type="email" autoComplete="email" className="booking-input" placeholder="you@example.com" /></label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">Password<input name="password" required type="password" minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} className="booking-input" placeholder="At least 8 characters" /></label>
        {message && <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800">{message}</p>}
        {error && <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-700">{error}</p>}
        <button disabled={loading} className="btn-brand mt-6 w-full px-6 py-3.5 disabled:opacity-60">{loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
      </form>
      <p className="mt-5 text-center text-xs leading-5 text-slate-500">By continuing, you agree to use your account for booking and rental communication.</p>
    </div>
  );
}
