import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { breadcrumbSchema, jsonLd } from "@/lib/seo/structured-data";

const policies = {
  marketplace: {
    title: "Marketplace Terms",
    description:
      "Plain-language terms for using Wander Bike listings and reservation requests.",
    sections: [
      {
        heading: "What the platform provides",
        paragraphs: [
          "Wander Bike provides bike listings, account tools, and a request system. Wander-managed bikes and Community Bikes are shown as separate collections.",
          "For a Community Bike exchange, the bike owner and requester are responsible for confirming condition, fit, availability, pickup, and payment.",
        ],
      },
      {
        heading: "Listings and requests",
        paragraphs: [
          "Users must provide accurate listing and account information and may only list bikes they are authorized to rent or sell.",
          "Sending or accepting a request does not replace an in-person inspection. Either party should cancel if the bike, identity, timing, or exchange details do not match what was agreed.",
        ],
      },
      {
        heading: "Administrative action",
        paragraphs: [
          "Listings publish without manual pre-approval. Automated text and image signals may alert the Site Admin, but suspension, removal, blocking, and other enforcement decisions are made by an administrator.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy",
    description:
      "How Wander Bike uses account, listing, request, and safety information.",
    sections: [
      {
        heading: "Information used by the platform",
        paragraphs: [
          "The platform uses account information, listing content, uploaded images, reservation messages, and pickup details to provide marketplace functions.",
          "Google sign-in and email sign-in are the supported account methods. Public listings do not display private pickup addresses.",
        ],
      },
      {
        heading: "Safety and administration",
        paragraphs: [
          "Text rules and browser-based image screening may create private safety signals for the Site Admin. A signal is not an automatic ban or public accusation.",
          "Administrators may review account and listing activity when responding to a report, safety signal, support request, or suspected misuse.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "Contact Wander Bike if you need help with your account information or believe a listing or request contains personal information that should be removed.",
        ],
      },
    ],
  },
  "local-exchange": {
    title: "Local Pickup & Payment",
    description:
      "Wander Bike exchanges are arranged for local pickup and offline payment.",
    sections: [
      {
        heading: "No shipping or platform checkout",
        paragraphs: [
          "Wander Bike does not offer Canada Post shipping, delivery rates, a shopping cart, or online platform payment.",
          "The listing owner and requester arrange a local meeting. Payment is completed directly and offline after the requester has an opportunity to inspect the bike.",
        ],
      },
      {
        heading: "Before pickup",
        paragraphs: [
          "Confirm the bike, price, rental period or sale intent, included items, identification expectations, pickup time, and cancellation plan in advance.",
          "Private pickup details are shared only after a request is accepted. Use a public meeting place when appropriate.",
        ],
      },
      {
        heading: "At the exchange",
        paragraphs: [
          "Inspect the bike and confirm that it matches the listing before paying or riding. Do not continue if the condition or agreed terms are materially different.",
        ],
      },
    ],
  },
  safety: {
    title: "Marketplace Safety",
    description:
      "Practical safety guidance for local bike rentals and sales arranged through Wander Bike.",
    sections: [
      {
        heading: "Meet and inspect",
        paragraphs: [
          "Meet in a suitable public place when possible, tell someone where you are going, and inspect the bike before payment or use.",
          "Confirm brakes, tires, steering, frame condition, fit, and any included lock, helmet, basket, trailer hitch, battery, or charger.",
        ],
      },
      {
        heading: "Keep the request on the platform",
        paragraphs: [
          "Use the Wander request record to confirm the bike and intent. Be cautious if someone pressures you to pay in advance or changes the agreed bike, location, or price unexpectedly.",
        ],
      },
      {
        heading: "Reports and enforcement",
        paragraphs: [
          "Automated safety signals notify an administrator but do not automatically block a person or listing. The Site Admin decides whether to dismiss a signal, contact a user, pause a listing, suspend an account, or take another action.",
        ],
      },
    ],
  },
} as const;

type PolicyKey = keyof typeof policies;

const legacyPolicies: Record<string, PolicyKey> = {
  shipping: "local-exchange",
  refund: "marketplace",
  returns: "marketplace",
};

function isPolicyKey(value: string): value is PolicyKey {
  return value in policies;
}

export function generateStaticParams() {
  return Object.keys(policies).map((policy) => ({ policy }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ policy: string }>;
}): Promise<Metadata> {
  const { policy } = await params;
  const key = legacyPolicies[policy] ?? policy;
  if (!isPolicyKey(key)) return {};
  const item = policies[key];
  return {
    title: item.title,
    description: item.description,
    alternates: { canonical: `/policies/${key}` },
  };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ policy: string }>;
}) {
  const { policy } = await params;
  const legacyDestination = legacyPolicies[policy];
  if (legacyDestination) permanentRedirect(`/policies/${legacyDestination}`);
  if (!isPolicyKey(policy)) notFound();

  const item = policies[policy];

  return (
    <main className="min-h-[70vh] bg-[#f5f7f9] px-6 py-14 text-slate-900 sm:px-8 lg:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbSchema([
            { name: item.title, path: `/policies/${policy}` },
          ]),
        )}
      />
      <article className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-[-0.035em] text-slate-950 sm:text-5xl">
          {item.title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          {item.description}
        </p>
        <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200 bg-white px-6 sm:px-9">
          {item.sections.map((section) => (
            <section key={section.heading} className="py-8">
              <h2 className="text-xl font-bold text-slate-950">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-8 text-slate-600">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-4 text-sm font-bold">
          <Link href="/how-it-works" className="text-teal-800 hover:text-teal-950">
            How the marketplace works
          </Link>
          <Link href="/faq" className="text-teal-800 hover:text-teal-950">
            Read FAQ
          </Link>
          <a href="tel:+17789521389" className="text-teal-800 hover:text-teal-950">
            Contact Wander Bike
          </a>
        </div>
      </article>
    </main>
  );
}
