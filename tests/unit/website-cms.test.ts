import { describe, expect, it } from "vitest";
import {
  homeContentDefaults,
  mergeWebsiteContent,
  websitePageDefinitions,
} from "@/lib/website-cms/config";
import { validateWebsiteContent } from "@/lib/website-cms/schemas";

describe("website CMS", () => {
  it("keeps Website pages separate from Marketplace operations", () => {
    const labels = websitePageDefinitions.map((page) => page.label);

    expect(labels).toContain("Home");
    expect(labels).toContain("About");
    expect(labels).not.toContain("Listings");
    expect(labels).not.toContain("Requests");
    expect(labels).not.toContain("Inventory");
  });

  it("merges stored values over locked defaults and ignores unknown keys", () => {
    expect(
      mergeWebsiteContent(homeContentDefaults, {
        "hero.heading": "A new homepage headline",
        "styles.fontFamily": "Comic Sans",
      }),
    ).toMatchObject({
      "hero.heading": "A new homepage headline",
      "hero.primaryLabel": "Find a Bike",
    });

    expect(
      mergeWebsiteContent(homeContentDefaults, {
        "styles.fontFamily": "Comic Sans",
      }),
    ).not.toHaveProperty("styles.fontFamily");
  });

  it("accepts content-only updates with safe links and images", () => {
    const parsed = validateWebsiteContent("home", {
      ...homeContentDefaults,
      "hero.heading": "Steveston rides start here",
      "hero.primaryHref": "/bikes",
      "hero.imageSrc": "https://example.com/steveston.webp",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects unsafe links and unsupported style controls", () => {
    expect(
      validateWebsiteContent("home", {
        ...homeContentDefaults,
        "hero.primaryHref": "javascript:alert(1)",
      }).success,
    ).toBe(false);

    expect(
      validateWebsiteContent("home", {
        ...homeContentDefaults,
        "styles.fontSize": "80px",
      }).success,
    ).toBe(false);
  });

  it("supports every core Website page with a locked content model", () => {
    expect(websitePageDefinitions.every((page) => page.editable)).toBe(true);
    expect(
      websitePageDefinitions.every(
        (page) => page.sections.length > 0 && Object.keys(page.defaults).length > 0,
      ),
    ).toBe(true);

    for (const page of websitePageDefinitions) {
      expect(validateWebsiteContent(page.slug, page.defaults).success).toBe(
        true,
      );
    }
  });
});
