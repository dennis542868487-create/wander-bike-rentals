import type { MetadataRoute } from "next";
import { getPublicListings } from "@/lib/marketplace/data";
import { getOptionalSupabasePublicConfig } from "@/lib/supabase/config";

const baseUrl = "https://www.wanderbike.ca";

export const revalidate = 3600;

/*
 * Real edit dates, hand-maintained.
 *
 * This used to be `lastModified: new Date()` on every route, which stamped all
 * two dozen URLs with the generation time and re-stamped them every hour under
 * `revalidate`. A lastmod that moves without the page changing is worse than no
 * lastmod: Google's documented response to timestamps it cannot trust is to
 * discount the field for the whole sitemap, so genuinely fresh pages lose the
 * signal too.
 *
 * Add a route here when you actually change it. A route with no entry ships
 * with no <lastmod>, which is a legitimate, honest sitemap — Google falls back
 * to its own crawl history.
 */
const GUIDES_PUBLISHED = "2026-06-15";

const lastModifiedByRoute: Record<string, string> = {
  "/guides/best-places-to-bike-in-steveston": GUIDES_PUBLISHED,
  "/guides/family-bike-rental-richmond": GUIDES_PUBLISHED,
  "/guides/steveston-bike-ride-guide": GUIDES_PUBLISHED,
  "/guides/bike-trailer-rental-richmond-guide": GUIDES_PUBLISHED,
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "",
    "/bikes",
    "/bikes/wander",
    "/bikes/community",
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
    "/policies/marketplace",
    "/policies/privacy",
    "/policies/local-exchange",
    "/policies/safety",
    "/guides/best-places-to-bike-in-steveston",
    "/guides/family-bike-rental-richmond",
    "/guides/steveston-bike-ride-guide",
    "/guides/bike-trailer-rental-richmond-guide",
  ];
  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => {
    const lastModified = lastModifiedByRoute[route];
    return {
      url: `${baseUrl}${route}`,
      ...(lastModified ? { lastModified: new Date(lastModified) } : {}),
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
    };
  });

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
