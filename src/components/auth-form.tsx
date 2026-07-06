"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useGoogleAuth } from "@/hooks/use-google-auth";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/account/bookings";
}

export default function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { session, ready } = useAuthSession();
  const googleEnabled = useGoogleAuth();
  const [mode, setMode] = useState<"signin" | "signup">(searchParams.get("mode") === "signup" ? "signup" : "signin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const next = useMemo(() => safeNext(searchParams.get("next")), [searchParams]);

  async function signInWithGoogle() {
    setLoading(true);
    setError("");
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: authError } = await getSupabaseBrowser().auth.signInWithOAuth({
      provider: "google",
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

      <button type="button" onClick={() => void signInWithGoogle()} disabled={loading || !googleEnabled} className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-5 py-3.5 font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .9-3.4.9a5.8 5.8 0 0 1-5.5-4H3.2v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-4V7.4H3.2a10 10 0 0 0 0 9.2L6.5 14Z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.6 9.6 0 0 0 3.2 7.4L6.5 10A5.8 5.8 0 0 1 12 6Z"/></svg>
        {googleEnabled === false ? "Google sign-in — setup needed" : "Continue with Google"}
      </button>

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
