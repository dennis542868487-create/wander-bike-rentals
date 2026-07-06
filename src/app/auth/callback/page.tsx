import type { Metadata } from "next";
import { Suspense } from "react";
import AuthCallback from "@/components/auth-callback";

export const metadata: Metadata = { title: "Finishing Sign In", robots: { index: false, follow: false } };

export default function AuthCallbackPage() {
  return <main className="flex min-h-[70vh] items-center justify-center bg-[#f0fdf9] p-6"><Suspense fallback={<p>Loading…</p>}><AuthCallback /></Suspense></main>;
}
