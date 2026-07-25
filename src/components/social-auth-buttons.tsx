"use client";

import type {
  SocialAuthAvailability,
  SocialAuthProvider,
} from "@/lib/supabase/oauth-providers";

type SocialAuthButtonsProps = {
  availability: SocialAuthAvailability;
  busy: boolean;
  onSelect: (provider: SocialAuthProvider) => void | Promise<void>;
  className?: string;
};

function providerLabel(
  provider: SocialAuthProvider,
  availability: boolean | null,
) {
  const name = provider === "google" ? "Google" : "Apple";
  if (availability === null) return `Checking ${name} sign-in…`;
  if (!availability) return `${name} sign-in — setup needed`;
  return `Continue with ${name}`;
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .9-3.4.9a5.8 5.8 0 0 1-5.5-4H3.2v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.5 14a6 6 0 0 1 0-4V7.4H3.2a10 10 0 0 0 0 9.2L6.5 14Z"
      />
      <path
        fill="#EA4335"
        d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.6 9.6 0 0 0 3.2 7.4L6.5 10A5.8 5.8 0 0 1 12 6Z"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M18.7 12.2c0-2.8 2.3-4.1 2.4-4.2a5.2 5.2 0 0 0-4.1-2.2c-1.7-.2-3.4 1-4.3 1-1 0-2.5-1-4-1-2.1 0-4 1.2-5.1 3.1-2.2 3.8-.6 9.4 1.6 12.5 1.1 1.5 2.3 3.2 4 3.1 1.6-.1 2.2-1 4.1-1s2.5 1 4.2 1c1.7 0 2.8-1.5 3.8-3.1 1.2-1.8 1.7-3.5 1.7-3.6-.1 0-3.3-1.3-3.3-5.6ZM15.9 4c.9-1.1 1.5-2.7 1.3-4-.1 0-1.7.1-2.9 1.3-1 1-1.6 2.5-1.4 3.9 1.2.1 2.2-.5 3-1.2Z" />
    </svg>
  );
}

export function SocialAuthButtons({
  availability,
  busy,
  onSelect,
  className = "",
}: SocialAuthButtonsProps) {
  return (
    <div className={`grid gap-3 ${className}`}>
      <button
        type="button"
        onClick={() => void onSelect("google")}
        disabled={busy || availability.google !== true}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-slate-300 bg-white px-5 py-3.5 font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleMark />
        {providerLabel("google", availability.google)}
      </button>
      <button
        type="button"
        onClick={() => void onSelect("apple")}
        disabled={busy || availability.apple !== true}
        className="flex w-full items-center justify-center gap-3 rounded-full border border-slate-950 bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <AppleMark />
        {providerLabel("apple", availability.apple)}
      </button>
    </div>
  );
}
