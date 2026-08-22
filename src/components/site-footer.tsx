import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_repeat(4,1fr)] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="overflow-hidden rounded-[1.2rem] border border-white/10 bg-white p-1 shadow-[0_14px_35px_rgba(15,23,42,0.18)]">
              <Image
                src="/favicon.png"
                alt="Wander Bike Rentals logo"
                width={96}
                height={96}
                unoptimized
                className="h-12 w-12 rounded-[0.95rem] bg-white object-contain"
              />
            </span>
            <div>
              <p className="font-bold text-white">Wander Bike Rentals</p>
              <p className="text-xs text-slate-400">Steveston · Richmond, BC</p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            A physical bike rental, bike sale, and quick repair shop in
            Steveston, plus a free local marketplace for Community Bikes.
          </p>
          <address className="mt-4 text-sm not-italic leading-6 text-slate-400">
            12071 First Ave #101
            <br />
            Richmond, BC V7E 3M1
            <br />
            Open daily 9:00 AM–10:00 PM
          </address>
          <a href="tel:+17789521389" className="btn-brand mt-5 px-5 text-sm">
            Call Now
          </a>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Marketplace</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>
              <Link className="hover:text-teal-300" href="/about-marketplace">
                About Marketplace
              </Link>
            </li>
            <li>
              <Link className="hover:text-teal-300" href="/bikes/wander">
                Wander Bikes
              </Link>
            </li>
            <li>
              <Link className="hover:text-teal-300" href="/bikes/community">
                Community Bikes
              </Link>
            </li>
            <li>
              <Link className="hover:text-teal-300" href="/list-your-bike">
                List Your Bike
              </Link>
            </li>
            <li>
              <Link className="hover:text-teal-300" href="/pricing">
                Pricing
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Local rentals</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>
              <Link className="hover:text-teal-300" href="/bike-rental-richmond">
                Bike Rental in Richmond
              </Link>
            </li>
            <li>
              <Link className="hover:text-teal-300" href="/bike-rental-steveston">
                Bike Rental in Steveston
              </Link>
            </li>
            <li>
              <Link className="hover:text-teal-300" href="/adult-bike-rental-richmond">
                Adult Bikes
              </Link>
            </li>
            <li>
              <Link className="hover:text-teal-300" href="/kids-bike-rental-richmond">
                Kids Bikes
              </Link>
            </li>
            <li>
              <Link className="hover:text-teal-300" href="/bike-trailer-rental-richmond">
                Bike Trailers
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Help & guides</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>
              <Link className="hover:text-teal-300" href="/about">
                About Wander Bike
              </Link>
            </li>
            <li>
              <Link className="hover:text-teal-300" href="/how-it-works">
                How It Works
              </Link>
            </li>
            <li>
              <Link className="hover:text-teal-300" href="/location">
                Location
              </Link>
            </li>
            <li>
              <Link className="hover:text-teal-300" href="/faq">
                FAQ
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-teal-300"
                href="/guides"
              >
                British Columbia Cycling Guides
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-teal-300"
                href="/guides/metro-vancouver-route-map"
              >
                Metro Vancouver Route Map
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-teal-300"
                href="/guides/richmond-bc-cycling-guide"
              >
                Cycling in Richmond, BC
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-teal-300"
                href="/guides/find-public-washroom-near-you"
              >
                Find a Public Washroom
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-teal-300"
                href="/guides/best-places-to-bike-in-steveston"
              >
                Best Places to Bike in Steveston
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-teal-300"
                href="/guides/family-bike-rental-richmond"
              >
                Family Bike Rentals in Richmond, BC
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold text-white">Policies</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>
              <Link className="hover:text-teal-300" href="/policies/marketplace">
                Marketplace Terms
              </Link>
            </li>
            <li>
              <Link className="hover:text-teal-300" href="/policies/privacy">
                Privacy
              </Link>
            </li>
            <li>
              <Link className="hover:text-teal-300" href="/policies/local-exchange">
                Pickup & Payment
              </Link>
            </li>
            <li>
              <Link className="hover:text-teal-300" href="/policies/safety">
                Safety
              </Link>
            </li>
            <li>
              <a className="hover:text-teal-300" href="tel:+17789521389">
                (778) 952-1389
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-6 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Wander Bike Rentals. Physical shop in
        Steveston, Richmond · Marketplace exchanges use local pickup and
        offline payment.
      </div>
    </footer>
  );
}
