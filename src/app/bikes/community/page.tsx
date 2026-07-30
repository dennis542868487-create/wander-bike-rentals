import type { Metadata } from "next";
import { BrowseListings } from "@/components/marketplace/browse-listings";
import { getPublicListings, isBikeType } from "@/lib/marketplace/data";

export const metadata: Metadata = {
  title: "Community Bikes",
  description:
    "Browse bikes listed by local owners for rental, sale, or both.",
  alternates: { canonical: "/bikes/community" },
};

export default async function CommunityBikesPage({
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
  const listings = await getPublicListings("community", {
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

  return (
    <BrowseListings source="community" listings={listings} filters={filters} />
  );
}
