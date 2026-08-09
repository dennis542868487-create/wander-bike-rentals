import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Geist, Geist_Mono } from "next/font/google";
import ChatbaseWidget from "@/components/chatbase-widget";
import { EnglishValidationMessages } from "@/components/forms/english-validation";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { PublicOnly } from "@/components/public-only";
import Reveal from "@/components/reveal";
import SiteHeader from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
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
  metadataBase: new URL("https://www.wanderbike.ca"),
  title: {
    default: "Wander Bike Rentals | Steveston, Richmond",
    template: "%s | Wander Bike Rentals",
  },
  description:
    "Bike rentals, local sales, and quick repair in Steveston, a Community Bike marketplace, and 160 cycling guides across British Columbia.",
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Wander Bike Rentals | Steveston, Richmond",
    description:
      "Rent or buy from the Wander shop, browse Community Bikes, or plan a ride with 160 British Columbia cycling guides.",
    url: "https://www.wanderbike.ca",
    siteName: "Wander Bike Rentals",
    locale: "en_CA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f0fdf9] text-slate-900">
        <div className="min-h-screen">
          <EnglishValidationMessages />
          <Reveal />
          <PublicOnly>
            <SiteHeader />
          </PublicOnly>
          {children}
          <PublicOnly>
            <SiteFooter />
            <MobileActionBar />
          </PublicOnly>
        </div>
        <PublicOnly>
          <ChatbaseWidget />
        </PublicOnly>
      </body>
      <GoogleAnalytics gaId="G-15E3M7B9XV" />
    </html>
  );
}
