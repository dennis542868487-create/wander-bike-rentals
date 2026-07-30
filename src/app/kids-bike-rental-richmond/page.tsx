import type { Metadata } from "next";
import { LocalRentalLanding } from "@/components/marketplace/local-rental-landing";

export const metadata: Metadata = {
  title: "Kids Bike Rental Richmond",
  description:
    "Check kids bike rentals from the Wander Bike Rentals shop in Steveston, Richmond. Review the exact bike’s size, photos, price, and availability.",
  alternates: { canonical: "/kids-bike-rental-richmond" },
  openGraph: {
    title: "Kids Bike Rental Richmond | Wander Bike",
    description:
      "Find a correctly sized kids bike and arrange a local Richmond pickup.",
    url: "https://www.wanderbike.ca/kids-bike-rental-richmond",
  },
};

const facts = [
  { label: "Most important", value: "Check rider and wheel size" },
  { label: "Availability", value: "Shown by individual bike" },
  { label: "Exchange", value: "Adult-arranged local pickup" },
] as const;

const reasons = [
  {
    title: "Size before style",
    description:
      "Check the listed wheel or frame size and confirm the fit with the owner before pickup.",
  },
  {
    title: "See the actual bike",
    description:
      "Photos and condition belong to the exact bike being requested, not a generic model image.",
  },
  {
    title: "Plan a family route",
    description:
      "Choose quieter local paths and an appropriate distance for the youngest rider in the group.",
  },
] as const;

export default function KidsBikeRentalRichmondPage() {
  return (
    <LocalRentalLanding
      title="Find the right kids bike in Richmond."
      introduction="Wander’s kids bikes vary by size, condition, and availability. Open the individual shop listing, confirm the fit with our team, and arrange pickup with an adult."
      heroImage="/assets/garry-point-park.jpg"
      heroImageAlt="A family-friendly riding area at Garry Point Park in Richmond"
      facts={facts}
      reasons={reasons}
      inventoryHeading="Current kids bike rentals from Wander"
      inventoryIntroduction="The Wander shop manages every bike shown here. If no bike is shown, there is not a matching shop listing live right now; Community Bikes remain separate."
      bikeTypes={["kids"]}
    />
  );
}
