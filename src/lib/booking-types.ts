export const bookingStatuses = ["pending", "confirmed", "completed", "cancelled"] as const;

export type BookingStatus = (typeof bookingStatuses)[number];

export type Booking = {
  id: string;
  user_id: string;
  customer_name: string;
  phone: string;
  email: string;
  starts_at: string;
  ends_at: string;
  adult_bikes: number;
  kids_bikes: number;
  trailers: number;
  notes: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
};

export type BookingInput = Pick<
  Booking,
  | "customer_name"
  | "phone"
  | "email"
  | "starts_at"
  | "ends_at"
  | "adult_bikes"
  | "kids_bikes"
  | "trailers"
  | "notes"
>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanQuantity(value: unknown) {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity >= 0 && quantity <= 20 ? quantity : -1;
}

export function parseBookingInput(value: unknown, options: { allowPast?: boolean; allowLong?: boolean } = {}):
  | { ok: true; data: BookingInput }
  | { ok: false; error: string } {
  if (!value || typeof value !== "object") return { ok: false, error: "Invalid booking details." };

  const raw = value as Record<string, unknown>;
  const customer_name = cleanText(raw.customer_name, 100);
  const phone = cleanText(raw.phone, 40);
  const email = cleanText(raw.email, 160).toLowerCase();
  const notes = cleanText(raw.notes, 1000) || null;
  const adult_bikes = cleanQuantity(raw.adult_bikes);
  const kids_bikes = cleanQuantity(raw.kids_bikes);
  const trailers = cleanQuantity(raw.trailers);
  const startsAt = new Date(String(raw.starts_at ?? ""));
  const endsAt = new Date(String(raw.ends_at ?? ""));

  if (customer_name.length < 2) return { ok: false, error: "Please enter your full name." };
  if (phone.length < 7) return { ok: false, error: "Please enter a valid phone number." };
  if (!emailPattern.test(email)) return { ok: false, error: "Please enter a valid email address." };
  if ([adult_bikes, kids_bikes, trailers].some((item) => item < 0)) {
    return { ok: false, error: "Each rental quantity must be between 0 and 20." };
  }
  if (adult_bikes + kids_bikes + trailers < 1) {
    return { ok: false, error: "Please choose at least one bike or trailer." };
  }
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return { ok: false, error: "Please choose a valid rental date and time." };
  }
  if (endsAt <= startsAt) return { ok: false, error: "Return time must be after pickup time." };
  if (!options.allowPast && startsAt.getTime() < Date.now() - 5 * 60_000) {
    return { ok: false, error: "Pickup time cannot be in the past." };
  }
  if (!options.allowLong && endsAt.getTime() - startsAt.getTime() > 7 * 24 * 60 * 60_000) {
    return { ok: false, error: "Online requests can be up to 7 days long. Please call for longer rentals." };
  }

  return {
    ok: true,
    data: {
      customer_name,
      phone,
      email,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      adult_bikes,
      kids_bikes,
      trailers,
      notes,
    },
  };
}
