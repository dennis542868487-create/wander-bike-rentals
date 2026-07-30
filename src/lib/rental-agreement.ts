export type RentalAgreementMode = "community" | "wander";

export type RentalAgreementData = {
  mode: RentalAgreementMode;
  providerName: string;
  providerContact: string;
  preparedBy: string;
  renterFirstName: string;
  renterLastName: string;
  renterPhone: string;
  renterEmail: string;
  photoIdType: string;
  photoIdNumber: string;
  rentalStart: string;
  expectedReturn: string;
  bikeDescription: string;
  adultBikeQuantity: number;
  kidBikeQuantity: number;
  trailerQuantity: number;
  signingCapacity: "self" | "guardian" | "group";
  signerLegalName: string;
  includesMinors: boolean;
  notes: string;
  signedAt: string;
  signatureDataUrl: string;
};

export type RentalAgreementClause = {
  title: string;
  body: string;
};

function cleanText(value: string, fallback: string) {
  const cleaned = value.trim().replace(/\s+/g, " ");
  return cleaned || fallback;
}

export function rentalAgreementModeLabel(mode: RentalAgreementMode) {
  return mode === "wander" ? "Wander Bike rental" : "Community bike rental";
}

export function buildRentalAgreementClauses(
  mode: RentalAgreementMode,
  providerName: string,
): RentalAgreementClause[] {
  const provider = cleanText(
    providerName,
    mode === "wander" ? "Wander Bike Rentals" : "the rental provider",
  );
  const marketplaceNotice =
    mode === "community"
      ? " I understand that Wander Bike provides the marketplace only and is not the bike owner, rental provider, or a party to this offline rental transaction."
      : "";

  return [
    {
      title: "Acknowledgement of Risk",
      body:
        "I understand that cycling involves risks, including accidents, falls, collisions, road hazards, equipment failure, and weather conditions that may result in injury, death, or property damage. I voluntarily accept all risks associated with using the rental equipment.",
    },
    {
      title: "Release of Liability",
      body: `I release and discharge ${provider}, its owners, employees, and agents from liability for injury, damage, or loss arising from the use of the rental equipment, except where prohibited by law.${marketplaceNotice}`,
    },
    {
      title: "Equipment Responsibility",
      body:
        "I agree to use the bicycle and any related equipment safely, follow all local traffic laws, and return all equipment in good condition.",
    },
    {
      title: "Loss or Damage",
      body:
        "I accept full responsibility for any lost, stolen, or damaged equipment during the rental period. Any repair or replacement costs will be arranged and paid directly between the renter and the rental provider offline. Wander Bike does not process these payments.",
    },
    {
      title: "Group Signing",
      body:
        "If I am signing on behalf of multiple riders, I confirm that I have authority to sign for my group and that all riders agree to these terms.",
    },
    {
      title: "Minors",
      body:
        "If I am signing for a minor, I confirm that I am the minor's legal guardian and accept responsibility for the minor.",
    },
    {
      title: "Governing Law",
      body:
        "This agreement is governed by the laws of British Columbia, Canada.",
    },
  ];
}

export function rentalAgreementFilename(data: RentalAgreementData) {
  const renter = `${data.renterFirstName}-${data.renterLastName}`
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const date = data.rentalStart.slice(0, 10) || data.signedAt.slice(0, 10);
  return `bike-rental-agreement-${renter || "renter"}-${date || "signed"}.pdf`;
}

export function signingCapacityLabel(
  capacity: RentalAgreementData["signingCapacity"],
) {
  if (capacity === "guardian") return "Parent or legal guardian";
  if (capacity === "group") return "Authorized group representative";
  return "Renter signing for themself";
}

export function formatAgreementDateTime(value: string) {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
