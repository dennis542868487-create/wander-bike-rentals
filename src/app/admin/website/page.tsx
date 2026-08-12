import type { Metadata } from "next";
import { WebsiteManager } from "@/components/admin/website-manager";
import {
  getWebsitePageDefinition,
  websitePageDefinitions,
} from "@/lib/website-cms/config";
import {
  websiteCmsNavigation,
  websiteCmsOtherPages,
  getGenericWebsitePageDefinition,
} from "@/lib/website-cms/generic-pages";
import { getWebsitePageForAdmin } from "@/lib/website-cms/server";
import { isLocalWebsiteCmsDemo } from "@/lib/website-cms/demo";

export const metadata: Metadata = {
  title: "Website Manager",
};

export const dynamic = "force-dynamic";

export default async function WebsiteManagerPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const requestedSlug = (await searchParams).page ?? "home";
  const pageDefinition =
    getWebsitePageDefinition(requestedSlug) ??
    getGenericWebsitePageDefinition(requestedSlug) ??
    websitePageDefinitions[0];
  const document = await getWebsitePageForAdmin(pageDefinition.slug);
  if (!document) return null;
  const demoMode = await isLocalWebsiteCmsDemo();

  return (
    <WebsiteManager
      key={pageDefinition.slug}
      demoMode={demoMode}
      navigation={websiteCmsNavigation}
      otherPages={websiteCmsOtherPages}
      pageDefinition={pageDefinition}
      initialDocument={document}
    />
  );
}
