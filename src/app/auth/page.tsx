import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign In or Create an Account",
  description: "Sign in to book and manage your Wander Bike rental requests.",
  robots: { index: false, follow: false },
};

export default function AuthPage() {
  return (
    <main className="relative isolate overflow-hidden px-6 py-14 sm:py-20">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(20,184,166,.24),transparent_35%),radial-gradient(circle_at_90%_85%,rgba(14,165,233,.16),transparent_38%)]" />
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_.82fr] lg:items-center">
        <div className="hero-anim">
          <p className="text-sm font-semibold uppercase tracking-[.2em] text-teal-700">Your Wander Bike account</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Book faster. Keep every ride in one place.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">Create a free account to request a rental, review upcoming rides, make changes, or cancel online.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {["Book adult bikes, kids bikes, and trailers", "Update your request before pickup", "See confirmation status at a glance"].map((item, index) => <div key={item} className="flex items-center gap-3 rounded-2xl border border-teal-100 bg-white/75 p-4 shadow-sm"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">{index + 1}</span><span className="text-sm font-semibold text-slate-800">{item}</span></div>)}
          </div>
        </div>
        <div className="hero-anim hero-d2"><Suspense fallback={<div className="h-[34rem] animate-pulse rounded-[2rem] bg-white/70" />}><AuthForm /></Suspense></div>
      </div>
    </main>
  );
}
