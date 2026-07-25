import "server-only";

import { getServerEnvironment } from "@/lib/env";

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const requestOrigin = new URL(request.url).origin;
  const configuredUrl = getServerEnvironment().NEXT_PUBLIC_SITE_URL;
  const configuredOrigin = configuredUrl
    ? new URL(configuredUrl).origin
    : requestOrigin;

  return origin === requestOrigin || origin === configuredOrigin;
}

export function requestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null;
}
