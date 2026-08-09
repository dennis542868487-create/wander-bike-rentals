export function buildNearestTrailDirectionsUrl(
  latitude: number,
  longitude: number,
) {
  const origin = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", `bike trail near ${origin}`);
  url.searchParams.set("travelmode", "bicycling");
  url.searchParams.set("dir_action", "navigate");
  return url.toString();
}

export function buildNearestTrailSearchUrl(cityName?: string) {
  const url = new URL("https://www.google.com/maps/search/");
  url.searchParams.set("api", "1");
  url.searchParams.set(
    "query",
    cityName
      ? `bike trails near ${cityName}, British Columbia`
      : "bike trails near me",
  );
  return url.toString();
}
