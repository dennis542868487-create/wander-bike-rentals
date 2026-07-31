import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bike Rental & Marketplace FAQ",
  description:
    "Answers about the Wander Bike Rentals shop in Steveston, individual rental prices, repairs, Community Bikes, local pickup, and offline payment.",
  alternates: { canonical: "/faq" },
};

const shopFaqs = [
  [
    "Is the Wander Bike Rentals physical shop still operating?",
    "Yes. Wander Bike Rentals continues to operate at 12071 First Ave #101 in Steveston, Richmond. The shop is open daily from 9:00 AM to 10:00 PM, and the phone number is (778) 952-1389.",
  ],
  [
    "What does the Wander shop offer?",
    "The Steveston shop offers Wander-managed bike rentals, local bike sales, and quick repair for common issues. The Community Bike marketplace is an additional service, not a replacement for the shop.",
  ],
  [
    "Does every Wander rental have the same price?",
    "No. Each Wander bike has its own hourly and/or daily rental price, and some bikes also have an individual sale price. Open the specific listing for its current photos, fit, availability, and price.",
  ],
  [
    "Do you have kids bikes and bike trailers?",
    "Kids bikes and trailers are offered when a matching Wander listing is available. Check the individual collection page or call the shop to confirm the right size and current availability.",
  ],
  [
    "Are a helmet, lock, and basket included?",
    "Wander rentals come with a helmet, a lock, and a basket. Included items are still listed on each individual bike because equipment can vary, so check the listing — or call the shop if you need a specific helmet size or want to confirm before you come by.",
  ],
  [
    "Do I need photo ID or a deposit for a Wander rental?",
    "A valid government-issued photo ID is required for Wander rentals. No rental deposit is required.",
  ],
  [
    "Can I walk in for quick bike repair?",
    "Yes. You can visit the Steveston shop for common issues such as flat tires, brake adjustment, gear tuning, wheel rubbing, chain cleaning, and basic safety checks. Final service depends on inspection.",
  ],
] as const;

const marketplaceFaqs = [
  [
    "What is the difference between Wander Bikes and Community Bikes?",
    "Wander Bikes are listed and managed directly by the physical Wander shop. Community Bikes are published by local owners. The two collections stay on separate browse pages so ownership is always clear.",
  ],
  [
    "Does every bike have the same price?",
    "No. Every bike has its own hourly, daily, and/or sale price. Open the individual bike listing for its exact offer and price.",
  ],
  [
    "Can one bike be available for both rent and sale?",
    "Yes. An owner can choose rent only, sale only, or rent and sale for each individual bike.",
  ],
  [
    "Do I pay online?",
    "No. Wander does not collect marketplace payments. Send a request online, then inspect the bike and pay the owner in person after the request is accepted.",
  ],
  [
    "Do you ship or deliver bikes?",
    "No. All marketplace exchanges are local pickup. There is no Canada Post shipping, courier delivery, or online checkout.",
  ],
  [
    "Is it free to list a bike?",
    "Yes. Listing is free at this stage, and Wander does not take a transaction fee.",
  ],
  [
    "Do I need a separate owner account?",
    "No. The same account can request another person’s bike and publish your own bikes.",
  ],
  [
    "When does a rental become confirmed?",
    "Sending a request does not confirm it. The owner must accept it. After acceptance, the rider can see the private pickup details in the Community Bike Dashboard.",
  ],
  [
    "Why can’t I see the exact pickup address publicly?",
    "Only the general pickup area is public. The exact address and instructions are shown to the owner, Wander staff, and an accepted rider.",
  ],
  [
    "Do Community Bike listings wait for approval?",
    "No. New listings publish immediately. Sensitive text and high-risk image scores can create a private Site Admin signal, but automated checks never pause a listing or suspend an account.",
  ],
  [
    "What if I need help with a marketplace request?",
    "Use the Community Bike Dashboard to review its status first. For Wander-owned bikes or platform help, call (778) 952-1389.",
  ],
] as const;

const faqs = [...shopFaqs, ...marketplaceFaqs];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([question, answer]) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

export default function FaqPage() {
  return (
    <main className="bg-[var(--background)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="hero faq-hero relative isolate overflow-hidden border-b border-white/60">
        <Image
          src="/assets/faq-steveston-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="faq-hero-image -z-10 object-cover"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:min-h-[38rem] lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:px-8 lg:py-20">
          <div className="faq-hero-copy motion-rise">
            <div className="inline-flex rounded-full border border-white/80 bg-white/38 px-4 py-2 text-sm font-semibold text-teal-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(13,148,136,0.08)] backdrop-blur-xl">
              Shop + marketplace questions
            </div>
            <h1 className="mt-5 text-[2.65rem] font-bold leading-[1.03] tracking-[-0.045em] text-slate-950 sm:mt-7 sm:text-6xl">
              Quick answers before you call, visit, or send a request.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-700 sm:mt-6 sm:text-lg sm:leading-8">
              Start with the physical Wander shop, then check how individual
              Wander Bikes, Community Bikes, local pickup, and offline payment
              work on the new platform.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="tel:+17789521389" className="btn-brand w-full px-7 py-3.5 text-sm sm:w-auto">
                Call Now
              </a>
              <Link
                href="/location"
                className="hero-glass-button w-full px-7 py-3.5 text-sm sm:w-auto"
              >
                View Location
              </Link>
            </div>
          </div>
          <div className="faq-glass-panel motion-rise motion-rise-delay-1 p-5 text-slate-900 sm:p-9">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              FAQ overview
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              The shop is still here. The way you find a bike is broader.
            </h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600 sm:mt-7 sm:space-y-4 sm:text-base sm:leading-8">
              <p>
                Wander Bike Rentals continues to rent and sell its own bikes
                and provide quick repair from the Steveston shop.
              </p>
              <p>
                The marketplace adds a separate Community Bikes collection
                where local owners can list a bike for rent, sale, or both.
              </p>
            </div>
            <div className="liquid-glass-note mt-5 rounded-2xl p-4 text-sm leading-7 text-teal-950 sm:mt-7 sm:p-5">
              No shopping cart, shipping, or platform payment: requests happen
              online, while pickup and payment happen locally.
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        {[
          {
            title: "Wander Bike Rentals shop",
            description:
              "Location, hours, direct rental services, equipment, and quick repair.",
            items: shopFaqs,
          },
          {
            title: "Community marketplace",
            description:
              "Listings, reservation requests, pickup privacy, and offline transactions.",
            items: marketplaceFaqs,
          },
        ].map((group, index) => (
          <section key={group.title} className={index === 0 ? "" : "mt-14"}>
            <div className="grid gap-4 sm:grid-cols-[0.7fr_1.3fr] sm:items-end">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                {group.title}
              </h2>
              <p className="max-w-xl text-sm leading-7 text-slate-600">
                {group.description}
              </p>
            </div>
            <div className="mt-7 divide-y divide-slate-200 overflow-hidden border-y border-slate-200 bg-white">
              {group.items.map(([question, answer]) => (
                <details key={question} className="group px-5 py-5 sm:px-7 sm:py-6">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-950 marker:hidden">
                    {question}
                    <span className="shrink-0 text-xl leading-none text-teal-700 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/bikes" className="btn-primary">
            Find a Bike
          </Link>
          <Link href="/list-your-bike" className="btn-secondary">
            List Your Bike
          </Link>
          <Link href="/location" className="btn-quiet">
            Wander location
          </Link>
        </div>
      </section>
    </main>
  );
}
