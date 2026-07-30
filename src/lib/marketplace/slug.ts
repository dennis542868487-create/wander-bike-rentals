export function slugifyListingTitle(value: string) {
  const base = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 88);
  return base.length >= 2 ? base : "bike";
}

export function uniqueListingSlug(title: string) {
  return `${slugifyListingTitle(title)}-${crypto.randomUUID().slice(0, 8)}`;
}
