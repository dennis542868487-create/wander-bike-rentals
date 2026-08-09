import type { MetadataRoute } from "next";
import { getGuides } from "@/lib/guides/master-guide-data";
import { getPublicListings } from "@/lib/marketplace/data";
import { getOptionalSupabasePublicConfig } from "@/lib/supabase/config";

const baseUrl = "https://www.wanderbike.ca";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "",
    "/about",
    "/bikes",
    "/bikes/wander",
    "/bikes/community",
    "/about-marketplace",
    "/booking",
    "/pricing",
    "/list-your-bike",
    "/how-it-works",
    "/bike-rental-richmond",
    "/bike-rental-steveston",
    "/adult-bike-rental-richmond",
    "/kids-bike-rental-richmond",
    "/bike-trailer-rental-richmond",
    "/quick-bike-repair-richmond",
    "/location",
    "/faq",
    "/guides",
    "/guides/find-public-washroom-near-you",
    "/policies/marketplace",
    "/policies/privacy",
    "/policies/local-exchange",
    "/policies/safety",
    "/guides/best-places-to-bike-in-steveston",
    "/guides/family-bike-rental-richmond",
    "/guides/steveston-bike-ride-guide",
    "/guides/bike-trailer-rental-richmond-guide",
    ...getGuides().map((guide) => guide.url),
  ];
  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency:
      route === "" || route.startsWith("/bikes") ? "weekly" : "monthly",
    priority:
      route === ""
        ? 1
        : route.startsWith("/bikes")
          ? 0.9
          : route.startsWith("/guides/")
            ? 0.65
            : 0.75,
  }));

  if (!getOptionalSupabasePublicConfig()) return staticEntries;
  const [wander, community] = await Promise.all([
    getPublicListings("wander"),
    getPublicListings("community"),
  ]);
  const listingEntries: MetadataRoute.Sitemap = [...wander, ...community].map(
    (listing) => ({
      url: `${baseUrl}/bikes/${encodeURIComponent(listing.slug)}`,
      lastModified: new Date(listing.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
      images: listing.images.map((image) => image.src),
    }),
  );
  return [...staticEntries, ...listingEntries];
}
