import type { Metadata } from "next";
import BookingForm from "@/components/booking-form";

export const metadata: Metadata = {
  title: "Book a Bike Rental",
  description: "Request adult bikes, kids bikes, or bike trailers from Wander Bike Rentals in Steveston, Richmond.",
  alternates: { canonical: "/booking" },
  openGraph: {
    title: "Book a Bike Rental | Wander Bike Rentals",
    description: "Choose your rental date, time, and bikes online.",
    url: "https://wanderbike.ca/booking",
  },
};

export default function BookingPage() {
  return (
    <main className="pb-20 text-slate-900">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(20,184,166,0.35),transparent_42%),radial-gradient(circle_at_85%_85%,rgba(14,165,233,0.2),transparent_46%),linear-gradient(135deg,#0f172a_0%,#052e2b_52%,#0b3b39_100%)]" />
        <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">Online booking</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">Plan your Steveston ride.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              Tell us when you are riding and how many adult bikes, kids bikes, or trailers you need. We will confirm availability with you shortly.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[0.72fr_1.28fr] lg:px-8 lg:py-16">
        <aside className="lg:pt-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Before you book</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">A simple request, then a human confirmation.</h2>
          <div className="mt-7 space-y-4">
            {[
              ["1", "Choose your time", "Select a pickup date and your preferred pickup and return times."],
              ["2", "Choose your rentals", "Add the number of adult bikes, kids bikes, and trailers you need."],
              ["3", "We confirm", "Our team checks availability and follows up by phone or email."],
            ].map(([number, title, copy]) => (
              <div key={number} className="flex gap-4 rounded-2xl border border-teal-100 bg-white/70 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">{number}</span>
                <div><p className="font-semibold text-slate-950">{title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{copy}</p></div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-slate-200">
            <p className="font-semibold text-white">Need help right away?</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Call us daily between 9:00 AM and 10:00 PM.</p>
            <a href="tel:+17789521389" className="mt-4 inline-block font-semibold text-teal-300">(778) 952-1389 →</a>
          </div>
        </aside>
        <BookingForm />
      </section>
    </main>
  );
}
