import type { Metadata } from "next";
import { LocalRentalLanding } from "@/components/marketplace/local-rental-landing";

export const metadata: Metadata = {
  title: "Adult Bike Rental Richmond",
  description:
    "Rent an adult bike directly from Wander Bike Rentals in Steveston, Richmond. Compare each Wander bike’s photos, fit, price, and availability.",
  alternates: { canonical: "/adult-bike-rental-richmond" },
  openGraph: {
    title: "Adult Bike Rental Richmond | Wander Bike",
    description:
      "Find a specific adult bike, reserve online, pick up locally, and pay in person.",
    url: "https://www.wanderbike.ca/adult-bike-rental-richmond",
  },
};

const facts = [
  { label: "Good for", value: "Visitors and local riders" },
  { label: "Fit details", value: "Shown per listing" },
  { label: "Pricing", value: "Different for every bike" },
] as const;

const reasons = [
  {
    title: "Choose by ride style",
    description:
      "Compare cruisers, hybrids, mountain bikes, road bikes, e-bikes, and other adult options as they become available.",
  },
  {
    title: "Check the actual fit",
    description:
      "Use the listed frame size and owner notes instead of assuming one adult bike works for everyone.",
  },
  {
    title: "Rent, buy, or compare both",
    description:
      "A listing may be rental-only, sale-only, or available either way. The offer is always visible before you request.",
  },
] as const;

export default function AdultBikeRentalRichmondPage() {
  return (
    <LocalRentalLanding
      title="Adult bike rentals in Richmond with the details up front."
      introduction="Choose an adult bike managed directly by the Wander Bike Rentals shop. Each listing shows its own photos, price, availability, and pickup details before you contact our team."
      heroImage="/assets/bikes-row.jpg"
      heroImageAlt="A row of adult Wander bikes prepared for local riders"
      facts={facts}
      reasons={reasons}
      inventoryHeading="Current adult rentals from Wander"
      inventoryIntroduction="These are individual bikes from the Wander shop, not a fixed-price category. Open a listing for the complete price and pickup details."
      bikeTypes={[
        "cruiser",
        "hybrid",
        "mountain",
        "road",
        "electric",
        "cargo",
        "folding",
        "other",
      ]}
    />
  );
}
