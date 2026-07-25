import {
  storeDayKeys,
  type CommerceStoreSettings,
} from "@/lib/commerce/settings-types";

export const defaultCommerceStoreSettings: CommerceStoreSettings = {
  sandboxMode: true,
  checkoutEnabled: false,
  profile: {
    displayName: "Wander Bike Rentals",
    phone: "+1 778 952 1389",
    customerEmail: "",
    addressLine1: "12071 First Ave",
    addressLine2: "#101",
    city: "Richmond",
    province: "BC",
    postalCode: "V7E3M1",
    country: "CA",
  },
  hours: {
    timezone: "America/Vancouver",
    note: "",
    days: storeDayKeys.map((day) => ({
      day,
      closed: false,
      open: "09:00",
      close: "22:00",
    })),
  },
  pickupEnabled: true,
  pickupInstructions:
    "Wait for the ready-for-pickup email, then bring your order number to the Steveston store.",
  salesProvinces: ["BC"],
  localDelivery: {
    enabled: false,
    feeCents: 0,
    postalCodePrefixes: [],
  },
  canadaPostEnabled: false,
  shippingOrigin: {
    company: "Wander Bike Rentals",
    contact: "Wander Bike",
    phone: "+1 778 952 1389",
    addressLine1: "12071 First Ave",
    addressLine2: "#101",
    city: "Richmond",
    province: "BC",
    postalCode: "V7E3M1",
    country: "CA",
  },
  shippingRules: {
    freeShippingThresholdCents: null,
    fixedCanadaPostFeeCents: null,
  },
  tax: {
    provider: "manual",
    enabled: false,
    registrationNumber: "",
    rates: [],
  },
  notificationEmail: "",
  policies: {
    shipping: "",
    refund: "",
    returns: "",
  },
};

export function getDefaultCommerceStoreSettings(): CommerceStoreSettings {
  return structuredClone(defaultCommerceStoreSettings);
}
