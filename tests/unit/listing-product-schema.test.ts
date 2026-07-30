import { describe, expect, it } from "vitest";
import { listingProductSchema } from "@/lib/seo/structured-data";
import type { BikeListing } from "@/lib/marketplace/types";

type Offer = {
  price?: string;
  availability: string;
  seller?: { "@id": string };
  priceSpecification?: { price: string; unitCode: string };
};

type ProductSchema = {
  "@type": string;
  itemCondition: string;
  brand?: { "@type": string; name: string };
  model?: string;
  image?: string[];
  offers?: Offer[];
};

const base: BikeListing = {
  id: "abc-123",
  ownerId: "o1",
  source: "wander",
  slug: "cruiser-blue",
  title: "Blue Cruiser",
  shortDescription: "An easy beach cruiser.",
  description: "Long description",
  bikeType: "cruiser",
  brand: "Norco",
  model: "Scene",
  frameSize: "M",
  condition: "good",
  offerMode: "rent_sale",
  rentalHourlyCents: 1200,
  rentalDailyCents: 4500,
  salePriceCents: 32000,
  currency: "CAD",
  minimumRentalHours: 2,
  pickupArea: "Steveston",
  city: "Richmond",
  province: "BC",
  approximateLatitude: null,
  approximateLongitude: null,
  availableFrom: null,
  availableUntil: null,
  availabilitySummary: null,
  rentalRules: null,
  includedItems: [],
  status: "active",
  featured: false,
  managementNote: null,
  publishedAt: null,
  createdAt: "",
  updatedAt: "",
  images: [
    {
      id: "i1",
      src: "https://example.test/a.jpg",
      storagePath: null,
      alt: "a",
      width: null,
      height: null,
      sortOrder: 0,
    },
  ],
};

function build(overrides: Partial<BikeListing> = {}) {
  return listingProductSchema({ ...base, ...overrides }) as ProductSchema;
}

describe("listingProductSchema", () => {
  it("converts cents to dollars across sale, daily, and hourly offers", () => {
    const schema = build();
    expect(schema["@type"]).toBe("Product");
    expect(schema.offers).toHaveLength(3);
    expect(schema.offers?.[0].price).toBe("320.00");
    expect(schema.offers?.[1].priceSpecification).toMatchObject({
      price: "45.00",
      unitCode: "DAY",
    });
    expect(schema.offers?.[2].priceSpecification).toMatchObject({
      price: "12.00",
      unitCode: "HUR",
    });
    expect(schema.brand).toEqual({ "@type": "Brand", name: "Norco" });
    expect(schema.itemCondition).toBe("https://schema.org/UsedCondition");
  });

  it("names the shop as seller only for Wander-owned stock", () => {
    expect(build().offers?.[0].seller).toEqual({
      "@id": "https://www.wanderbike.ca/#business",
    });
    expect(build({ source: "community" }).offers?.[0].seller).toBeUndefined();
  });

  it("drops rental offers on a sale-only listing and marks sold stock", () => {
    const schema = build({ offerMode: "sale", status: "sold" });
    expect(schema.offers).toHaveLength(1);
    expect(schema.offers?.[0].availability).toBe("https://schema.org/SoldOut");
  });

  it("omits optional fields instead of emitting empty ones", () => {
    const schema = build({ brand: null, model: null, images: [] });
    expect(schema).not.toHaveProperty("brand");
    expect(schema).not.toHaveProperty("model");
    expect(schema).not.toHaveProperty("image");
  });
});
