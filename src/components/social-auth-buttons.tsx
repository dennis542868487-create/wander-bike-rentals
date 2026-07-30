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
  availability: boolean | null,
) {
  if (availability === null) return "Checking Google sign-in…";
  if (!availability) return "Google sign-in — setup needed";
  return "Continue with Google";
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
        {providerLabel(availability.google)}
      </button>
    </div>
  );
}
