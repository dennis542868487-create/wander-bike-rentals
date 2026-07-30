import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.wanderbike.ca";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/admin",
        "/operations",
        "/api/",
        "/auth",
      ],
    },
    /*
     * No `host` directive: it is a non-standard Yandex-only extension that
     * Google ignores. Canonicalisation is handled by the canonical tags and the
     * apex-to-www redirect.
     */
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
