import Link from "next/link";
import { GOOGLE_BUSINESS_URL } from "@/lib/seo/wander-business";

type Review = {
  name: string;
  initial: string;
  text: string;
};

/*
 * Points at the place record itself, not a maps search for the shop's name. A
 * search URL can land on a competitor or a disambiguation list, and it is the
 * same URL the business entity declares in sameAs — those two should agree.
 */
const GOOGLE_REVIEWS_URL = GOOGLE_BUSINESS_URL;

const reviews: Review[] = [
  {
    name: "Marq Nguyen",
    initial: "M",
    text: "My girlfriend and I rented bikes from Wander Bike Rentals and had an amazing experience. The bikes were in great condition, comfortable, and made it easy for us to explore all of Steveston and even ride all the way to the airport and back. The rental process was simple, and the staff were friendly and helpful.",
  },
  {
    name: "Jaykay L",
    initial: "J",
    text: "The owner was very gracious, helpful, and understanding. Rates are fair and my daughter had a blast with the bike ride! They were very flexible with catering to us. I’ll definitely come see them again if I’m showing some friends around the Steveston area.",
  },
  {
    name: "Casiano Beltran",
    initial: "C",
    text: "Owners were very nice. The bikes were maintained and they have very fair rental rates. We will rent again when we come back to Steveston.",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          viewBox="0 0 20 20"
          className="h-[1.125rem] w-[1.125rem] fill-amber-400"
          aria-hidden="true"
        >
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.77l-5.2 2.73.99-5.79-4.21-4.1 5.82-.85L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

function GoogleG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.98 21.98 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  );
}

export default function ReviewsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-18">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Reviews
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            What local riders say about us
          </h2>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <GoogleG className="h-7 w-7" />
          <div>
            <Stars />
            <p className="mt-1 text-xs font-medium text-slate-500">
              Reviews from Google
            </p>
          </div>
        </div>
      </div>

      <div className="mobile-card-rail -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
        {reviews.map((review) => (
          <figure
            key={review.name}
            className="flex h-full min-w-[84vw] snap-center flex-col rounded-[2rem] border border-[var(--card-border)] bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.09)] sm:p-7 md:min-w-0"
          >
            <div className="flex items-center justify-between">
              <Stars />
              <GoogleG className="h-5 w-5" />
            </div>
            <blockquote className="mt-4 flex-1 text-sm leading-7 text-slate-600">
              “{review.text}”
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand)]">
                {review.initial}
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  {review.name}
                </span>
                <span className="block text-xs text-slate-500">via Google</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm"
        >
          <GoogleG className="h-[1.125rem] w-[1.125rem]" />
          Read more reviews on Google
        </Link>
      </div>
    </section>
  );
}
