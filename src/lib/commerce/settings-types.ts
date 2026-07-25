export const canadianProvinceCodes = [
  "BC",
  "AB",
  "SK",
  "MB",
  "ON",
  "QC",
  "NB",
  "NS",
  "PE",
  "NL",
  "YT",
  "NT",
  "NU",
] as const;

export type CanadianProvinceCode = (typeof canadianProvinceCodes)[number];

export const storeDayKeys = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type StoreDayKey = (typeof storeDayKeys)[number];

export type StoreHoursDay = {
  day: StoreDayKey;
  closed: boolean;
  open: string;
  close: string;
};

export type StoreProfileSettings = {
  displayName: string;
  phone: string;
  customerEmail: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: CanadianProvinceCode;
  postalCode: string;
  country: "CA";
};

export type ShippingOriginSettings = {
  company: string;
  contact: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: CanadianProvinceCode;
  postalCode: string;
  country: "CA";
};

export type LocalDeliverySettings = {
  enabled: boolean;
  feeCents: number;
  postalCodePrefixes: string[];
};

export type ShippingRuleSettings = {
  freeShippingThresholdCents: number | null;
  fixedCanadaPostFeeCents: number | null;
};

export type ManualTaxRate = {
  province: CanadianProvinceCode;
  label: string;
  rateBps: number;
  appliesToShipping: boolean;
};

export type TaxSettings = {
  provider: "manual";
  enabled: boolean;
  registrationNumber: string;
  rates: ManualTaxRate[];
};

export type CommerceStoreSettings = {
  sandboxMode: boolean;
  checkoutEnabled: boolean;
  profile: StoreProfileSettings;
  hours: {
    timezone: "America/Vancouver";
    note: string;
    days: StoreHoursDay[];
  };
  pickupEnabled: boolean;
  pickupInstructions: string;
  salesProvinces: CanadianProvinceCode[];
  localDelivery: LocalDeliverySettings;
  canadaPostEnabled: boolean;
  shippingOrigin: ShippingOriginSettings;
  shippingRules: ShippingRuleSettings;
  tax: TaxSettings;
  notificationEmail: string;
  policies: {
    shipping: string;
    refund: string;
    returns: string;
  };
};

export type PublicCheckoutSettings = Pick<
  CommerceStoreSettings,
  | "pickupEnabled"
  | "pickupInstructions"
  | "localDelivery"
  | "canadaPostEnabled"
  | "profile"
  | "tax"
>;
