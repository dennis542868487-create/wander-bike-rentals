import type { Metadata } from "next";
import { BrowseListings } from "@/components/marketplace/browse-listings";
import { getPublicListings, isBikeType } from "@/lib/marketplace/data";

export const metadata: Metadata = {
  title: "Wander Bikes",
  description:
    "Browse bikes listed directly by Wander Bike for rental, sale, or both.",
  alternates: { canonical: "/bikes/wander" },
};

export default async function WanderBikesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    intent?: string;
    sort?: string;
  }>;
}) {
  const filters = await searchParams;
  const listings = await getPublicListings("wander", {
    query: filters.q,
    type: isBikeType(filters.type) ? filters.type : "all",
    intent:
      filters.intent === "rent" || filters.intent === "sale"
        ? filters.intent
        : "all",
    sort:
      filters.sort === "price_low" || filters.sort === "price_high"
        ? filters.sort
        : "newest",
  });

  return <BrowseListings source="wander" listings={listings} filters={filters} />;
}
