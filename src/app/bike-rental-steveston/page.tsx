import type { Metadata } from "next";
import { LocalRentalLanding } from "@/components/marketplace/local-rental-landing";

export const metadata: Metadata = {
  title: {
    absolute: "Bike Rental Steveston, Richmond | Wander Bike Rentals",
  },
  description:
    "Rent a bike from the Wander Bike Rentals shop in Steveston, Richmond. Browse individual Wander bikes, reserve online, and pay at local pickup.",
  alternates: { canonical: "/bike-rental-steveston" },
  openGraph: {
    title: "Bike Rental Steveston, Richmond | Wander Bike Rentals",
    description:
      "Choose a bike for Steveston Village, Garry Point, and nearby dyke routes.",
    url: "https://www.wanderbike.ca/bike-rental-steveston",
  },
};

const facts = [
  { label: "Starting area", value: "Steveston Village" },
  { label: "Nearby rides", value: "Garry Point and the dykes" },
  { label: "Exchange", value: "Local pickup and payment" },
] as const;

const reasons = [
  {
    title: "Start near the waterfront",
    description:
      "Choose a pickup area that makes sense for Steveston Village, Garry Point Park, or the West Dyke.",
  },
  {
    title: "Check fit before requesting",
    description:
      "Frame size, bike type, availability, and included gear are shown on the individual listing.",
  },
  {
    title: "No generic rental package",
    description:
      "Every bike has its own photos and price, so the request always refers to a specific bike.",
  },
] as const;

export default function BikeRentalStevestonPage() {
  return (
    <LocalRentalLanding
      title="Bike Rental in Steveston"
      introduction="Wander Bike Rentals continues to serve riders from its Steveston shop. Choose a specific Wander bike for the waterfront, request it online, and confirm pickup directly with our team."
      heroImage="/assets/fishermans-wharf.webp"
      heroImageAlt="The Steveston waterfront near Fisherman’s Wharf"
      facts={facts}
      reasons={reasons}
      inventoryHeading="Wander bikes for Steveston pickup"
      inventoryIntroduction="The Wander shop manages every bike in this section. Open a listing to see its exact rental price, fit, offer type, and current availability."
      bikeTypes={["cruiser", "hybrid", "kids", "trailer"]}
    />
  );
}
