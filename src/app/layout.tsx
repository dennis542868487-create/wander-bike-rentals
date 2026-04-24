import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://wander-bike-rentals.vercel.app"),
  title: {
    default: "Bike Rentals in Steveston, Richmond | Wander Bike Rentals",
    template: "%s | Wander Bike Rentals",
  },
  description:
    "Wander Bike Rentals offers adult bikes, kids bikes, and trailer rentals in Steveston, Richmond. Helmet and lock included.",
  keywords: [
    "bike rental Richmond",
    "bike rental Steveston",
    "bicycle rental Richmond",
    "kids bike rental Richmond",
    "bike trailer rental Richmond",
    "rent a bike Richmond",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bike Rentals in Steveston, Richmond | Wander Bike Rentals",
    description:
      "Adult bikes, kids bikes, and trailer rentals in Steveston, Richmond. Helmet and lock included.",
    url: "https://wander-bike-rentals.vercel.app",
    siteName: "Wander Bike Rentals",
    locale: "en_CA",
    type: "website",
  },
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/bike-rental-richmond", label: "Richmond" },
  { href: "/bike-rental-steveston", label: "Steveston" },
  { href: "/kids-bike-rental-richmond", label: "Kids Bikes" },
  { href: "/bike-trailer-rental-richmond", label: "Trailers" },
  { href: "/location", label: "Location" },
  { href: "/faq", label: "FAQ" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[radial-gradient(circle_at_top,#ecfdf5_0%,#f8fafc_24%,#ffffff_60%)] text-slate-900">
        <div className="min-h-screen">
          <header className="sticky top-0 z-50 border-b border-white/70 bg-white/85 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-lg font-bold text-white shadow-[0_12px_30px_rgba(15,118,110,0.28)]">
                  W
                </div>
                <div>
                  <Link href="/" className="text-lg font-bold tracking-tight text-slate-950">
                    Wander Bike Rentals
                  </Link>
                  <p className="text-xs text-slate-500">Steveston, Richmond</p>
                </div>
              </div>

              <nav className="flex flex-wrap gap-2 text-sm font-medium text-slate-600">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full px-4 py-2 transition hover:bg-teal-50 hover:text-teal-700"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>

          {children}

          <footer className="border-t border-slate-200/80 bg-slate-950 text-slate-300">
            <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 text-sm lg:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-lg font-bold text-white">
                    W
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">Wander Bike Rentals</p>
                    <p className="text-xs text-slate-400">Local bike rentals in Steveston, Richmond</p>
                  </div>
                </div>
                <p className="mt-5 max-w-md leading-7 text-slate-400">
                  Adult bikes, kids bikes, and trailers with helmet and lock included.
                  Built to help local riders and visitors get the details they need fast.
                </p>
              </div>
              <div>
                <p className="font-semibold text-white">Contact</p>
                <ul className="mt-4 space-y-3 text-slate-400">
                  <li>12071 First Ave #101, Richmond, BC V7E 3M1</li>
                  <li>(778) 952-1389</li>
                  <li>Open, closes 18:00</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-white">Quick Links</p>
                <ul className="mt-4 space-y-3 text-slate-400">
                  <li><Link className="transition hover:text-white" href="/bike-rental-richmond">Bike Rental Richmond</Link></li>
                  <li><Link className="transition hover:text-white" href="/bike-rental-steveston">Bike Rental Steveston</Link></li>
                  <li><Link className="transition hover:text-white" href="/location">Location</Link></li>
                  <li><Link className="transition hover:text-white" href="/faq">FAQ</Link></li>
                </ul>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
