import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://wander-bike-rentals.vercel.app";
  const routes = [
    "",
    "/bike-rental-richmond",
    "/bike-rental-steveston",
    "/kids-bike-rental-richmond",
    "/bike-trailer-rental-richmond",
    "/location",
    "/faq",
    "/guides/best-places-to-bike-in-steveston",
    "/guides/family-bike-rental-richmond",
    "/guides/steveston-bike-ride-guide",
    "/guides/bike-trailer-rental-richmond-guide",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.startsWith("/guides/") ? 0.7 : 0.8,
  }));
}
