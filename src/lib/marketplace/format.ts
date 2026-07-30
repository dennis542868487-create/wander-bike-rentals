import type {
  BikeListing,
  BikeType,
  ListingSource,
  OfferMode,
  RequestStatus,
} from "@/lib/marketplace/types";

export function formatCad(cents: number | null) {
  if (cents === null) return null;
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function primaryListingPrice(listing: BikeListing) {
  if (listing.rentalDailyCents !== null) return listing.rentalDailyCents;
  if (listing.rentalHourlyCents !== null) return listing.rentalHourlyCents;
  return listing.salePriceCents ?? Number.MAX_SAFE_INTEGER;
}

export function offerModeLabel(mode: OfferMode) {
  return {
    rent: "Rent only",
    sale: "For sale",
    rent_sale: "Rent or buy",
  }[mode];
}

export function bikeTypeLabel(type: BikeType) {
  return {
    cruiser: "Cruiser",
    hybrid: "Hybrid",
    mountain: "Mountain",
    road: "Road",
    electric: "Electric",
    kids: "Kids",
    cargo: "Cargo",
    folding: "Folding",
    trailer: "Trailer",
    other: "Other",
  }[type];
}

export function sourceLabel(source: ListingSource) {
  return source === "wander" ? "Wander Bike" : "Community owner";
}

export function requestStatusLabel(status: RequestStatus) {
  return {
    pending: "Pending",
    accepted: "Accepted",
    declined: "Declined",
    cancelled: "Cancelled",
    completed: "Completed",
    no_show: "No-show",
  }[status];
}

export function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Vancouver",
  }).format(new Date(value));
}

export function listingPriceLines(listing: BikeListing) {
  const lines: Array<{ label: string; value: string }> = [];
  const hourly = formatCad(listing.rentalHourlyCents);
  const daily = formatCad(listing.rentalDailyCents);
  const sale = formatCad(listing.salePriceCents);

  if (hourly) lines.push({ label: "hour", value: hourly });
  if (daily) lines.push({ label: "day", value: daily });
  if (sale) lines.push({ label: "buy", value: sale });
  return lines;
}
