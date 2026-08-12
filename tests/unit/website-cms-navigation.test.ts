import { describe, expect, it } from "vitest";
import {
  genericWebsitePageDefinitions,
  websiteCmsNavigation,
} from "@/lib/website-cms/generic-pages";
import { getGuides } from "@/lib/guides/master-guide-data";

describe("website CMS navigation", () => {
  it("includes every published destination guide as an editable Website page", () => {
    const guidesGroup = websiteCmsNavigation.find(
      (item) => item.kind === "group" && item.id === "guides",
    );
    expect(guidesGroup?.kind).toBe("group");
    if (!guidesGroup || guidesGroup.kind !== "group") return;

    const cmsGuideSlugs = new Set(
      guidesGroup.sections
        .flatMap((section) => section.links)
        .map((link) => link.cmsSlug)
        .filter(Boolean),
    );
    for (const guide of getGuides()) {
      expect(cmsGuideSlugs.has(`guides-${guide.slug}`)).toBe(true);
    }
  });

  it("gives every generic page a locked text schema and preview bindings", () => {
    for (const page of genericWebsitePageDefinitions) {
      expect(page.editable).toBe(true);
      expect(page.sections.length).toBeGreaterThan(0);
      expect(page.sections.flatMap((section) => section.fields).length).toBe(
        page.renderBindings?.length,
      );
      expect(Object.keys(page.defaults).length).toBe(
        page.renderBindings?.length,
      );
    }
  });
});
