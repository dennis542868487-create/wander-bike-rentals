import type { MetadataRoute } from "next";
import { getCatalogProducts } from "@/lib/commerce/catalog";
import { getCommerceStoreSettings } from "@/lib/commerce/settings";

const baseUrl = "https://www.wanderbike.ca";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "",
    "/shop",
    "/booking",
    "/pricing",
    "/bike-rental-richmond",
    "/bike-rental-steveston",
    "/adult-bike-rental-richmond",
    "/kids-bike-rental-richmond",
    "/bike-trailer-rental-richmond",
    "/quick-bike-repair-richmond",
    "/location",
    "/faq",
    "/guides/best-places-to-bike-in-steveston",
    "/guides/family-bike-rental-richmond",
    "/guides/steveston-bike-ride-guide",
    "/guides/bike-trailer-rental-richmond-guide",
  ];

  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency:
      route === "" || route === "/shop"
        ? "weekly"
        : route.startsWith("/guides/")
          ? "monthly"
          : "monthly",
    priority:
      route === ""
        ? 1
        : route === "/shop"
          ? 0.9
          : route.startsWith("/guides/")
            ? 0.7
            : 0.8,
  }));

  const products = (await getCatalogProducts()).filter(
    (product) => !product.isSandboxProduct,
  );
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/shop/${encodeURIComponent(product.slug)}`,
    changeFrequency: "weekly",
    priority: 0.8,
    images: product.images.map((image) =>
      new URL(image.src, baseUrl).toString(),
    ),
  }));

  const policyEntries: MetadataRoute.Sitemap = [];
  try {
    const settings = await getCommerceStoreSettings();
    const policies = [
      ["shipping", settings.policies.shipping],
      ["refund", settings.policies.refund],
      ["returns", settings.policies.returns],
    ] as const;

    for (const [policy, content] of policies) {
      if (content.trim()) {
        policyEntries.push({
          url: `${baseUrl}/policies/${policy}`,
          changeFrequency: "yearly",
          priority: 0.4,
        });
      }
    }
  } catch {
    // A missing database must not break the public sitemap. Approved policy
    // URLs are added automatically after the commerce settings are available.
  }

  return [...staticEntries, ...productEntries, ...policyEntries];
}
