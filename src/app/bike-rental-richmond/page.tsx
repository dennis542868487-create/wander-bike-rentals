import type { Metadata } from "next";
import { LocalRentalLanding } from "@/components/marketplace/local-rental-landing";

export const metadata: Metadata = {
  title: {
    absolute: "Bike Rental Richmond, BC | Wander Bike Rentals",
  },
  description:
    "Rent a bike directly from Wander Bike Rentals in Steveston, Richmond, or browse separate local-owner listings. Prices and availability are set per bike.",
  alternates: { canonical: "/bike-rental-richmond" },
  openGraph: {
    title: "Bike Rental Richmond, BC | Wander Bike Rentals",
    description:
      "Browse Richmond bike rentals, reserve a specific bike, pick up locally, and pay in person.",
    url: "https://www.wanderbike.ca/bike-rental-richmond",
  },
};

const facts = [
  { label: "Service area", value: "Richmond, BC" },
  { label: "Pricing", value: "Set per bike" },
  { label: "Exchange", value: "Local pickup and payment" },
] as const;

const reasons = [
  {
    title: "Two clear collections",
    description:
      "Wander Bikes and Community Bikes stay on separate pages, so you always know who manages the listing.",
  },
  {
    title: "Real listing details",
    description:
      "Review the bike’s own photos, frame size, included items, availability, and pickup area before requesting.",
  },
  {
    title: "Made for local rides",
    description:
      "Look for a bike that fits waterfront paths, neighbourhood riding, or a longer Richmond route.",
  },
] as const;

export default function BikeRentalRichmondPage() {
  return (
    <LocalRentalLanding
      title="Bike Rental in Richmond"
      introduction="Wander Bike Rentals operates a physical shop in Steveston, Richmond. Choose the exact Wander bike you want, request it online, then confirm pickup with our team and pay in person."
      heroImage="/assets/west-dyke-ride.webp"
      heroImageAlt="Cyclists riding beside the Richmond waterfront"
      facts={facts}
      reasons={reasons}
      inventoryHeading="Wander bikes available for Richmond rides"
      inventoryIntroduction="These bikes are managed directly by the Wander shop. Prices and availability belong to each individual listing; Community Bikes remain in their own collection."
    />
  );
}
