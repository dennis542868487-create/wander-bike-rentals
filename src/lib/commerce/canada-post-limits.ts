export const canadaPostDomesticParcelLimits = {
  maximumWeightKg: 30,
  maximumDimensionCm: 200,
  maximumLengthPlusGirthCm: 300,
} as const;

export type CanadaPostParcelDimensions = {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
};

export function normalizeCanadaPostParcelDimensions(
  parcel: CanadaPostParcelDimensions,
) {
  const [lengthCm, widthCm, heightCm] = [
    parcel.lengthCm,
    parcel.widthCm,
    parcel.heightCm,
  ].sort((left, right) => right - left);

  return {
    weightKg: parcel.weightKg,
    lengthCm,
    widthCm,
    heightCm,
  };
}

export function canadaPostParcelLimitViolation(
  parcel: CanadaPostParcelDimensions,
) {
  const normalized = normalizeCanadaPostParcelDimensions(parcel);
  const values = [
    normalized.weightKg,
    normalized.lengthCm,
    normalized.widthCm,
    normalized.heightCm,
  ];

  if (values.some((value) => !Number.isFinite(value) || value <= 0)) {
    return "Package weight and dimensions must be positive numbers.";
  }
  if (
    normalized.weightKg >
    canadaPostDomesticParcelLimits.maximumWeightKg
  ) {
    return `Canada Post parcels cannot exceed ${canadaPostDomesticParcelLimits.maximumWeightKg} kg.`;
  }
  if (
    normalized.lengthCm >
    canadaPostDomesticParcelLimits.maximumDimensionCm
  ) {
    return `No Canada Post parcel dimension can exceed ${canadaPostDomesticParcelLimits.maximumDimensionCm} cm.`;
  }
  if (
    normalized.lengthCm +
      2 * (normalized.widthCm + normalized.heightCm) >
    canadaPostDomesticParcelLimits.maximumLengthPlusGirthCm
  ) {
    return `Canada Post parcel length plus girth cannot exceed ${canadaPostDomesticParcelLimits.maximumLengthPlusGirthCm} cm.`;
  }
  return null;
}
