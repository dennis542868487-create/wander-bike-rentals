import type { Metadata } from "next";
import { Suspense } from "react";
import { Bike, CalendarCheck, ListPlus } from "lucide-react";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

export default function AuthPage() {
  return (
    <main className="brand-grid-hero min-h-[78vh] px-4 py-9 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-8 sm:gap-10 lg:grid-cols-[1fr_0.82fr]">
        <div>
          <p className="text-sm font-bold text-teal-200">One free account</p>
          <h1 className="mt-3 text-[2.45rem] font-bold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl">
            Rent bikes and list your own.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
            Continue with Google or use your email. The same account works for
            riders, bike owners, and the Wander team.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              { icon: Bike, text: "Browse Wander and Community bikes" },
              { icon: CalendarCheck, text: "Track every request and pickup" },
              { icon: ListPlus, text: "Publish and manage your own listings" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-3 border-b border-white/15 py-3 text-sm font-semibold text-slate-100"
              >
                <item.icon className="h-5 w-5 text-teal-200" aria-hidden="true" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
        <Suspense
          fallback={<div className="h-[34rem] animate-pulse rounded-[2rem] bg-white" />}
        >
          <AuthForm />
        </Suspense>
      </div>
    </main>
  );
}
