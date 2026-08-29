export type RentalRequestStatus = Readonly<{
  enabled: boolean;
  reason: string;
}>;

export const RENTAL_REQUEST_STATUS: RentalRequestStatus = {
  enabled: false,
  reason: "需要更新",
};

export function rentalRequestUnavailableMessage(
  status: RentalRequestStatus = RENTAL_REQUEST_STATUS,
) {
  return `Rental requests are temporarily paused. Reason: ${status.reason}`;
}
