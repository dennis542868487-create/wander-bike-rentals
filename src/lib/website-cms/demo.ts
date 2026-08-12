import "server-only";

import { cookies, headers } from "next/headers";

export const WEBSITE_CMS_DEMO_COOKIE = "wander_website_cms_demo";

function isLocalHostname(hostname: string) {
  const normalized = hostname.split(":")[0]?.toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1";
}

export async function isLocalWebsiteCmsDemo() {
  if (process.env.NODE_ENV !== "development") return false;

  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host") ?? "";
  return (
    isLocalHostname(host) &&
    cookieStore.get(WEBSITE_CMS_DEMO_COOKIE)?.value === "enabled"
  );
}
