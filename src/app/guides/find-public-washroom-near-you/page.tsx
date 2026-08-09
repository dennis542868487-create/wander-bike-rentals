import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  MapPin,
  Navigation,
  ShieldCheck,
} from "lucide-react";

const findWashroomUrl = "https://www.findwashroom.com/";

export const metadata: Metadata = {
  title: {
    absolute: "Find a Public Washroom Near You in Canada | Wander Bike",
  },
  description:
    "A practical cycling guide to using FindWashroom.com to locate nearby public washrooms across Canada and open directions from your current location.",
  alternates: { canonical: "/guides/find-public-washroom-near-you" },
  openGraph: {
    title: "Find a Public Washroom Near You in Canada | Wander Bike",
    description:
      "Use your location to find covered public washrooms, review practical details and open directions during a ride.",
    url: "https://www.wanderbike.ca/guides/find-public-washroom-near-you",
    type: "article",
  },
};

const steps = [
  {
    title: "Open FindWashroom.com",
    text: "Tap the button below. You do not need to install an app or create an account.",
  },
  {
    title: "Allow location access",
    text: "Your current location is used to sort covered washrooms by straight-line distance. FindWashroom says that location is not stored.",
  },
  {
    title: "Choose a stop and open directions",
    text: "Review the closest options first, check the available notes, then tap a listing to continue to walking directions.",
  },
] as const;

export default function FindPublicWashroomGuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Find a public washroom near you",
    description:
      "A practical guide to using FindWashroom.com during a bicycle ride in Canada.",
    dateModified: "2026-08-08",
    mainEntityOfPage:
      "https://www.wanderbike.ca/guides/find-public-washroom-near-you",
    author: {
      "@type": "Organization",
      name: "Wander Bike",
      url: "https://www.wanderbike.ca",
    },
  };

  return (
    <main className="bg-white text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        <header className="border-b border-slate-200">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-[1.4fr_0.6fr] lg:items-center lg:gap-14 lg:py-24">
            <div>
              <Link
                href="/guides"
                className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"
              >
                <span aria-hidden="true">←</span>
                All guides
              </Link>
              <h1 className="mt-7 max-w-4xl text-[2.55rem] font-bold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-7xl lg:tracking-[-0.06em]">
                Find a public washroom near you
              </h1>
              <div className="mt-7 h-1 w-16 bg-teal-600" />
              <p className="mt-7 max-w-3xl text-base leading-7 text-slate-600 sm:text-xl sm:leading-8">
                A washroom stop should not become the hardest part of a bike
                ride. FindWashroom.com can use your location to show the closest
                covered options first and help you open directions.
              </p>
              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <a
                  href={findWashroomUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="editorial-button editorial-button-primary"
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Find the nearest washroom
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
                <span className="text-xs leading-5 text-slate-500">
                  Opens FindWashroom.com
                </span>
              </div>
            </div>

            <dl className="border-y border-teal-300 py-7 lg:border-y-0 lg:border-l lg:py-4 lg:pl-12">
              <div className="border-b border-slate-200 pb-6">
                <dt className="text-sm font-semibold text-slate-500">
                  Canada coverage
                </dt>
                <dd className="mt-2 text-5xl font-semibold tracking-[-0.06em] text-teal-700">
                  13
                </dd>
                <dd className="mt-2 text-sm leading-6 text-slate-600">
                  Provinces and territories
                </dd>
              </div>
              <div className="pt-6">
                <dt className="text-sm font-semibold text-slate-500">
                  Growing next
                </dt>
                <dd className="mt-2 font-bold text-slate-950">
                  United States
                </dd>
                <dd className="mt-2 text-sm leading-6 text-slate-600">
                  Coverage is expanding beyond Canada.
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 lg:py-20">
          <aside className="h-fit border-y border-teal-300 py-6 lg:sticky lg:top-32">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              Quick link
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              When you need to go now, open the locator and allow location
              access.
            </p>
            <a
              href={findWashroomUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 border-b border-teal-600 pb-1 text-sm font-bold text-slate-950 hover:text-teal-800"
            >
              Open FindWashroom
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </aside>

          <div className="min-w-0 lg:border-l lg:border-teal-200 lg:pl-12">
            <section>
              <h2 className="text-[1.7rem] font-bold leading-tight tracking-[-0.045em] sm:text-4xl">
                How to find the closest covered washroom
              </h2>
              <ol className="mt-8 border-t border-teal-200">
                {steps.map((step, index) => (
                  <li
                    key={step.title}
                    className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 border-b border-teal-200 py-6 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-7"
                  >
                    <span className="text-3xl font-light tracking-[-0.06em] text-teal-700 sm:text-5xl">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-950 sm:text-xl">
                        {step.title}
                      </h3>
                      <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
                        {step.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="border-b border-slate-200 py-10 sm:py-12">
              <h2 className="text-[1.7rem] font-bold leading-tight tracking-[-0.045em] sm:text-4xl">
                Check the details before you ride over
              </h2>
              <div className="mt-7 grid gap-8 md:grid-cols-2 md:gap-10">
                <div>
                  <Navigation
                    className="h-6 w-6 text-teal-700"
                    aria-hidden="true"
                  />
                  <h3 className="mt-4 text-xl font-bold">Hours and access</h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">
                    Check listed hours, seasonal notes, and wheelchair-access
                    information. A location can still be closed or temporarily
                    unavailable when you arrive.
                  </p>
                </div>
                <div>
                  <ShieldCheck
                    className="h-6 w-6 text-teal-700"
                    aria-hidden="true"
                  />
                  <h3 className="mt-4 text-xl font-bold">Know the source</h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">
                    FindWashroom identifies public-source listings and labels
                    possible customer washrooms separately when public options
                    are scarce.
                  </p>
                </div>
              </div>
            </section>

            <section className="py-10 sm:py-12">
              <h2 className="text-[1.7rem] font-bold leading-tight tracking-[-0.045em] sm:text-4xl">
                A useful mid-ride habit
              </h2>
              <p className="mt-4 max-w-4xl text-base leading-7 text-slate-600 sm:text-[1.02rem] sm:leading-8">
                Search before the need becomes urgent, especially on long dyke,
                greenway, or park rides. Keep enough battery for directions,
                secure your bike before entering a facility, and choose an
                accessible option when anyone in your group needs one.
              </p>
              <p className="mt-5 text-sm leading-6 text-slate-500">
                Service details referenced from{" "}
                <a
                  href={findWashroomUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-teal-700 underline decoration-teal-300 underline-offset-4"
                >
                  FindWashroom.com
                </a>
                . Always verify the latest listing information before relying
                on a location.
              </p>
            </section>
          </div>
        </div>
      </article>

      <section className="border-y border-white/10 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              Ready to find a washroom?
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">
              Allow location access on FindWashroom.com to sort covered options
              from closest to farthest.
            </p>
          </div>
          <a
            href={findWashroomUrl}
            target="_blank"
            rel="noreferrer"
            className="editorial-button editorial-button-dark"
          >
            Find a washroom now
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}
