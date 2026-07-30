import type { Metadata } from "next";
import { LocalRentalLanding } from "@/components/marketplace/local-rental-landing";

export const metadata: Metadata = {
  title: "Bike Trailer Rental Richmond",
  description:
    "Check bike trailer rentals from Wander Bike Rentals in Steveston, Richmond. Review capacity, compatibility, included parts, price, and availability.",
  alternates: { canonical: "/bike-trailer-rental-richmond" },
  openGraph: {
    title: "Bike Trailer Rental Richmond | Wander Bike",
    description:
      "Find a bike trailer listing and confirm compatibility before local pickup.",
    url: "https://www.wanderbike.ca/bike-trailer-rental-richmond",
  },
};

const facts = [
  { label: "Check first", value: "Hitch and axle compatibility" },
  { label: "Listing details", value: "Capacity and parts included" },
  { label: "Exchange", value: "Local pickup and payment" },
] as const;

const reasons = [
  {
    title: "Confirm compatibility",
    description:
      "Ask the owner whether the included hitch works with your bike before agreeing to the pickup.",
  },
  {
    title: "Check capacity and condition",
    description:
      "Use the individual photos and description to review seating, weight guidance, straps, flag, and included hardware.",
  },
  {
    title: "Request the exact trailer",
    description:
      "Availability and price are attached to one listing, so there is no surprise substitution at pickup.",
  },
] as const;

export default function BikeTrailerRentalRichmondPage() {
  return (
    <LocalRentalLanding
      title="Bike trailer rentals in Richmond."
      introduction="Choose a specific trailer from the Wander shop, review its capacity and included parts, then confirm hitch compatibility and pickup details with our team."
      heroImage="/assets/trailer-bike.jpg"
      heroImageAlt="A family bike trailer available in Richmond"
      facts={facts}
      reasons={reasons}
      inventoryHeading="Current trailer rentals from Wander"
      inventoryIntroduction="Trailer availability changes by listing. Sale-only trailers are not shown in this rental collection."
      bikeTypes={["trailer"]}
    />
  );
}
