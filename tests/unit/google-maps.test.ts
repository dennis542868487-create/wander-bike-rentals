import { describe, expect, it } from "vitest";
import { buildNearestTrailDirectionsUrl } from "@/lib/google-maps";

describe("buildNearestTrailDirectionsUrl", () => {
  it("builds Google Maps bicycle navigation from the current coordinates", () => {
    const url = new URL(buildNearestTrailDirectionsUrl(49.1264, -123.1819));

    expect(url.origin).toBe("https://www.google.com");
    expect(url.pathname).toBe("/maps/dir/");
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("origin")).toBe("49.126400,-123.181900");
    expect(url.searchParams.get("destination")).toBe(
      "bike trail near 49.126400,-123.181900",
    );
    expect(url.searchParams.get("travelmode")).toBe("bicycling");
    expect(url.searchParams.get("dir_action")).toBe("navigate");
  });
});
