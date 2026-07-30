"use client";

import { Camera, CheckCircle2, DollarSign, MapPin, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { DateField } from "@/components/forms/date-field";
import { FieldError } from "@/components/forms/field-error";
import { FieldHint } from "@/components/forms/field-hint";
import { useBlockedSubmitMessage } from "@/components/forms/use-blocked-submit";
import { useFieldErrors } from "@/components/forms/use-field-errors";
import { useFieldLengths } from "@/components/forms/use-field-lengths";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { bikeTypeLabel } from "@/lib/marketplace/format";
import { scanBikePhotos } from "@/lib/marketplace/image-safety-client";
import {
  bikeTypes,
  type ListingSource,
  type OfferMode,
} from "@/lib/marketplace/types";
import type { EditableListing } from "@/lib/marketplace/server-data";

function dollars(cents: number | null) {
  return cents === null ? "" : (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
}

function cents(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0
    ? Math.round(amount * 100)
    : undefined;
}

const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/**
 * Schema field → the input that carries it, so a rejected save highlights the
 * field the server complained about instead of only filling the banner.
 */
const inputNameBySchemaField: Record<string, string> = {
  title: "title",
  shortDescription: "short_description",
  description: "description",
  bikeType: "bike_type",
  brand: "brand",
  model: "model",
  frameSize: "frame_size",
  condition: "condition",
  offerMode: "offer_mode",
  rentalHourlyCents: "rental_hourly",
  rentalDailyCents: "rental_daily",
  salePriceCents: "sale_price",
  minimumRentalHours: "minimum_rental_hours",
  pickupArea: "pickup_area",
  pickupAddress: "pickup_address",
  postalCode: "postal_code",
  pickupInstructions: "pickup_instructions",
  city: "city",
  province: "province",
  availableFrom: "available_from",
  availableUntil: "available_until",
  availabilitySummary: "availability_summary",
  rentalRules: "rental_rules",
  includedItems: "included_items",
};

function toInputErrors(fieldErrors: Record<string, string> | undefined) {
  if (!fieldErrors) return {};
  const mapped: Record<string, string> = {};
  for (const [schemaField, message] of Object.entries(fieldErrors)) {
    const inputName = inputNameBySchemaField[schemaField];
    if (inputName) mapped[inputName] = message;
  }
  return mapped;
}

export function ListingForm({
  userId,
  isStaff,
  initial,
  requestedSource = "community",
  returnTo = "/account/bikes",
  lockSource = false,
}: {
  userId: string;
  isStaff: boolean;
  initial?: EditableListing;
  requestedSource?: ListingSource;
  returnTo?: string;
  lockSource?: boolean;
}) {
  const router = useRouter();
  const listing = initial?.listing;
  const canManagePhotos =
    !listing ||
    listing.ownerId === userId ||
    (isStaff && listing.source === "wander");
  const [offerMode, setOfferMode] = useState<OfferMode>(
    listing?.offerMode ?? "rent",
  );
  const [source, setSource] = useState<ListingSource>(
    listing?.source ?? (isStaff ? requestedSource : "community"),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const liveErrors = useFieldErrors(formRef);
  const lengths = useFieldLengths(formRef);
  /*
   * A live browser message wins when there is one, but an empty live entry must
   * not clear a server message: `useFieldErrors` records "" for every field the
   * browser considers valid, and the fields the server rejects are exactly the
   * ones the browser let through. Server messages are dropped per field in
   * `clearServerError` once that field is edited.
   */
  const fieldErrors: Record<string, string> = { ...serverErrors };
  for (const [name, message] of Object.entries(liveErrors)) {
    if (message) fieldErrors[name] = message;
  }

  function clearServerError(event: FormEvent<HTMLFormElement>) {
    const target = event.target;
    if (
      !(target instanceof HTMLInputElement) &&
      !(target instanceof HTMLSelectElement) &&
      !(target instanceof HTMLTextAreaElement)
    ) {
      return;
    }
    const key = target.dataset.fieldName || target.name;
    setServerErrors((current) => {
      if (!key || !(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  useBlockedSubmitMessage(formRef, (message) => {
    setSaved(false);
    setError(`This listing is not published yet. ${message}`);
  });

  async function uploadPhotos(
    listingId: string,
    title: string,
    files: File[],
    scanResultsPromise: Promise<
      Awaited<ReturnType<typeof scanBikePhotos>>
    >,
  ) {
    if (files.length === 0) return;
    const supabase = getSupabaseBrowser();
    const uploadedPaths: string[] = [];
    try {
      const images = [];
      for (const [index, file] of files.entries()) {
        const extension = imageExtensions[file.type];
        if (!extension || file.size > 4 * 1024 * 1024) {
          throw new Error(
            "Each photo must be JPEG, PNG, WebP, or AVIF and no larger than 4 MB.",
          );
        }
        const storagePath = `${userId}/${listingId}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("bike-listing-images")
          .upload(storagePath, file, {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          });
        if (uploadError) throw uploadError;
        uploadedPaths.push(storagePath);
        images.push({
          storagePath,
          alt: `${title} photo ${index + 1}`,
          width: null,
          height: null,
          sortOrder: (listing?.images.length ?? 0) + index,
        });
      }
      const response = await fetch(
        `/api/marketplace/listings/${listingId}/images`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ images }),
        },
      );
      const payload = (await response.json()) as {
        error?: string;
        images?: Array<{ id: string; storage_path: string }>;
      };
      if (!response.ok) throw new Error(payload.error ?? "Could not attach photos.");

      const scanResults = await scanResultsPromise.catch(() => []);
      const imageByPath = new Map(
        (payload.images ?? []).map((image) => [image.storage_path, image]),
      );
      await Promise.allSettled(
        uploadedPaths.map(async (storagePath, index) => {
          const image = imageByPath.get(storagePath);
          const predictions = scanResults[index];
          if (!image || !predictions) return;
          await fetch(
            `/api/marketplace/listings/${listingId}/images/${image.id}/safety-signal`,
            {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ predictions }),
            },
          );
        }),
      );
    } catch (uploadError) {
      if (uploadedPaths.length > 0) {
        await supabase.storage
          .from("bike-listing-images")
          .remove(uploadedPaths);
      }
      throw uploadError;
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    setServerErrors({});
    const form = new FormData(event.currentTarget);
    const files = form
      .getAll("photos")
      .filter((value): value is File => value instanceof File && value.size > 0);
    const payload = {
      source,
      title: form.get("title"),
      shortDescription: form.get("short_description"),
      description: form.get("description"),
      bikeType: form.get("bike_type"),
      brand: form.get("brand"),
      model: form.get("model"),
      frameSize: form.get("frame_size"),
      condition: form.get("condition"),
      offerMode,
      rentalHourlyCents: cents(form.get("rental_hourly")),
      rentalDailyCents: cents(form.get("rental_daily")),
      salePriceCents: cents(form.get("sale_price")),
      minimumRentalHours: form.get("minimum_rental_hours"),
      pickupArea: form.get("pickup_area"),
      pickupAddress: form.get("pickup_address"),
      postalCode: form.get("postal_code"),
      pickupInstructions: form.get("pickup_instructions"),
      city: form.get("city"),
      province: form.get("province"),
      approximateLatitude: form.get("approximate_latitude"),
      approximateLongitude: form.get("approximate_longitude"),
      availableFrom: form.get("available_from"),
      availableUntil: form.get("available_until"),
      availabilitySummary: form.get("availability_summary"),
      rentalRules: form.get("rental_rules"),
      includedItems: String(form.get("included_items") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      if (!canManagePhotos && files.length > 0) {
        throw new Error("You do not have access to add photos to this listing.");
      }
      if (files.length + (listing?.images.length ?? 0) > 8) {
        throw new Error("A listing can have up to 8 photos.");
      }
      for (const file of files) {
        if (!imageExtensions[file.type] || file.size > 4 * 1024 * 1024) {
          throw new Error(
            "Each photo must be JPEG, PNG, WebP, or AVIF and no larger than 4 MB.",
          );
        }
      }
      const scanResultsPromise = scanBikePhotos(files).catch(() => []);
      const response = await fetch(
        listing
          ? `/api/marketplace/listings/${listing.id}`
          : "/api/marketplace/listings",
        {
          method: listing ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json()) as {
        error?: string;
        fieldErrors?: Record<string, string>;
        listing?: { id: string };
      };
      if (!response.ok || !result.listing) {
        const mapped = toInputErrors(result.fieldErrors);
        setServerErrors(mapped);
        const [firstName] = Object.keys(mapped);
        if (firstName) {
          const field = formRef.current?.querySelector<HTMLElement>(
            `[name="${firstName}"], [data-field-name="${firstName}"]`,
          );
          field?.scrollIntoView({ block: "center", behavior: "smooth" });
          field?.focus({ preventScroll: true });
        }
        throw new Error(result.error ?? "Could not save this listing.");
      }
      setSaved(true);
      try {
        await uploadPhotos(
          result.listing.id,
          String(form.get("title") ?? "Bike"),
          files,
          scanResultsPromise,
        );
      } catch {
        router.push(
          `${returnTo}?saved=1&photos=failed`,
        );
        return;
      }
      router.push(`${returnTo}?saved=1`);
      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save this listing.",
      );
    } finally {
      setBusy(false);
    }
  }

  const canRent = offerMode === "rent" || offerMode === "rent_sale";
  const canSell = offerMode === "sale" || offerMode === "rent_sale";

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      onInput={clearServerError}
      onChange={clearServerError}
      className="space-y-6"
    >
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-8">
        <div className="flex items-center gap-3">
          <BikeIcon />
          <div>
            <p className="text-xs font-bold text-teal-800">STEP 1</p>
            <h2 className="text-xl font-bold text-slate-950">Describe this bike</h2>
          </div>
        </div>
        {isStaff && !lockSource ? (
          <label className="field-label mt-6 max-w-sm">
            Listing collection
            <select
              value={source}
              onChange={(event) => setSource(event.target.value as ListingSource)}
              className="market-select"
            >
              <option value="community">Community Bikes</option>
              <option value="wander">Wander Bikes</option>
            </select>
          </label>
        ) : isStaff ? (
          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
            Collection: {source === "wander" ? "Wander Bikes" : "Community Bikes"}
          </div>
        ) : (
          <div className="mt-6 rounded-xl bg-teal-50 p-4 text-sm text-teal-900">
            This Community Bike listing publishes immediately. Automatic
            checks can notify Site Admin, but they never pause it on their own.
          </div>
        )}
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="field-label sm:col-span-2">
            Listing title
            <input
              name="title"
              required
              minLength={3}
              maxLength={120}
              defaultValue={listing?.title ?? ""}
              className="market-input"
              placeholder="e.g. Medium hybrid bike with rear rack"
            />
            <FieldHint length={lengths.title} min={3} max={120} />
            <FieldError message={fieldErrors.title} />
          </label>
          <label className="field-label">
            Bike type
            <select
              name="bike_type"
              required
              defaultValue={listing?.bikeType ?? "hybrid"}
              className="market-select"
            >
              {bikeTypes.map((type) => (
                <option key={type} value={type}>
                  {bikeTypeLabel(type)}
                </option>
              ))}
            </select>
                      <FieldError message={fieldErrors.bike_type} />
          </label>
          <label className="field-label">
            Condition
            <select
              name="condition"
              defaultValue={listing?.condition ?? "good"}
              className="market-select"
            >
              <option value="new">New</option>
              <option value="like_new">Like new</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </label>
          <label className="field-label">
            Brand <span className="font-normal text-slate-400">(optional)</span>
            <input
              name="brand"
              maxLength={80}
              defaultValue={listing?.brand ?? ""}
              className="market-input"
            />
            <FieldHint length={lengths.brand} max={80} optional />
            <FieldError message={fieldErrors.brand} />
          </label>
          <label className="field-label">
            Model <span className="font-normal text-slate-400">(optional)</span>
            <input
              name="model"
              maxLength={100}
              defaultValue={listing?.model ?? ""}
              className="market-input"
            />
            <FieldHint length={lengths.model} max={100} optional />
            <FieldError message={fieldErrors.model} />
          </label>
          <label className="field-label">
            Frame size / rider fit{" "}
            <span className="font-normal text-slate-400">(optional)</span>
            <input
              name="frame_size"
              maxLength={60}
              defaultValue={listing?.frameSize ?? ""}
              className="market-input"
              placeholder="e.g. Medium · 5′5″–5′10″"
            />
            <FieldHint length={lengths.frame_size} max={60} optional />
            <FieldError message={fieldErrors.frame_size} />
          </label>
          <label className="field-label">
            Included items{" "}
            <span className="font-normal text-slate-400">(optional)</span>
            <input
              name="included_items"
              defaultValue={listing?.includedItems.join(", ") ?? ""}
              className="market-input"
              placeholder="Helmet, lock, basket"
            />
            <FieldHint optional>
              Separate items with commas · up to 20 items, 80 characters each
            </FieldHint>
            <FieldError message={fieldErrors.included_items} />
          </label>
          <label className="field-label sm:col-span-2">
            Short summary{" "}
            <span className="font-normal text-slate-400">(optional)</span>
            <input
              name="short_description"
              maxLength={240}
              defaultValue={listing?.shortDescription ?? ""}
              className="market-input"
              placeholder="One sentence shown in browse results"
            />
            <FieldHint length={lengths.short_description} max={240} optional />
            <FieldError message={fieldErrors.short_description} />
          </label>
          <label className="field-label sm:col-span-2">
            Full description
            <textarea
              name="description"
              required
              minLength={20}
              maxLength={5000}
              defaultValue={listing?.description ?? ""}
              className="market-textarea"
              placeholder="Describe fit, maintenance, ride feel, and anything a rider should know."
            />
            <FieldHint length={lengths.description} min={20} max={5000} />
            <FieldError message={fieldErrors.description} />
          </label>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
            <DollarSign className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold text-teal-800">STEP 2</p>
            <h2 className="text-xl font-bold text-slate-950">
              Set this bike’s own prices
            </h2>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { value: "rent", label: "Rent only" },
            { value: "sale", label: "Sell only" },
            { value: "rent_sale", label: "Rent or sell" },
          ].map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-xl border p-4 text-sm font-bold ${
                offerMode === option.value
                  ? "border-teal-600 bg-teal-50 text-teal-950"
                  : "border-slate-200 text-slate-700"
              }`}
            >
              <input
                type="radio"
                name="offer_mode"
                value={option.value}
                checked={offerMode === option.value}
                onChange={() => setOfferMode(option.value as OfferMode)}
                className="mr-2 accent-teal-700"
              />
              {option.label}
            </label>
          ))}
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {canRent ? (
            <>
              <label className="field-label">
                Hourly price (CAD)
                <input
                  name="rental_hourly"
                  type="number"
                  min="0.01"
                  max="1000000"
                  step="0.01"
                  defaultValue={dollars(listing?.rentalHourlyCents ?? null)}
                  className="market-input"
                  placeholder="12"
                />
                <FieldHint>$0.01–$1,000,000 · fill in this or the daily price</FieldHint>
                <FieldError message={fieldErrors.rental_hourly} />
              </label>
              <label className="field-label">
                Daily price (CAD)
                <input
                  name="rental_daily"
                  type="number"
                  min="0.01"
                  max="1000000"
                  step="0.01"
                  defaultValue={dollars(listing?.rentalDailyCents ?? null)}
                  className="market-input"
                  placeholder="45"
                />
                <FieldHint>$0.01–$1,000,000 · fill in this or the hourly price</FieldHint>
                <FieldError message={fieldErrors.rental_daily} />
              </label>
              <label className="field-label">
                Minimum rental (hours)
                <input
                  name="minimum_rental_hours"
                  type="number"
                  min="1"
                  max="168"
                  step="1"
                  required
                  defaultValue={listing?.minimumRentalHours ?? 1}
                  className="market-input"
                />
                <FieldHint>Whole hours, 1–168 (one week)</FieldHint>
                <FieldError message={fieldErrors.minimum_rental_hours} />
              </label>
            </>
          ) : (
            <input type="hidden" name="minimum_rental_hours" value="1" />
          )}
          {canSell ? (
            <label className="field-label">
              Sale price (CAD)
              <input
                name="sale_price"
                type="number"
                min="0.01"
                max="1000000"
                step="0.01"
                required
                defaultValue={dollars(listing?.salePriceCents ?? null)}
                className="market-input"
                placeholder="450"
              />
              <FieldHint>Required to sell · $0.01–$1,000,000</FieldHint>
              <FieldError message={fieldErrors.sale_price} />
            </label>
          ) : null}
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-500">
          These prices belong only to this bike. Wander does not charge the
          rider, process the payment, or take a marketplace fee.
        </p>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold text-teal-800">STEP 3</p>
            <h2 className="text-xl font-bold text-slate-950">
              Pickup and availability
            </h2>
          </div>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="field-label">
            Public pickup area
            <input
              name="pickup_area"
              required
              minLength={2}
              maxLength={120}
              defaultValue={listing?.pickupArea ?? ""}
              className="market-input"
              placeholder="e.g. Steveston Village"
            />
            <FieldHint length={lengths.pickup_area} min={2} max={120} />
            <FieldError message={fieldErrors.pickup_area} />
          </label>
          <label className="field-label">
            City
            <input
              name="city"
              required
              minLength={2}
              maxLength={100}
              defaultValue={listing?.city ?? "Richmond"}
              className="market-input"
            />
            <FieldHint length={lengths.city} min={2} max={100} />
            <FieldError message={fieldErrors.city} />
          </label>
          <label className="field-label">
            Province
            <input
              name="province"
              required
              minLength={2}
              maxLength={80}
              defaultValue={listing?.province ?? "BC"}
              className="market-input"
            />
            <FieldHint length={lengths.province} min={2} max={80} />
            <FieldError message={fieldErrors.province} />
          </label>
          <label className="field-label">
            Postal code <span className="font-normal text-slate-400">(private)</span>
            <input
              name="postal_code"
              maxLength={20}
              defaultValue={initial?.privateDetails?.postalCode ?? ""}
              className="market-input"
              autoComplete="postal-code"
            />
            <FieldHint length={lengths.postal_code} max={20} optional />
            <FieldError message={fieldErrors.postal_code} />
          </label>
          <label className="field-label sm:col-span-2">
            Exact pickup address <span className="font-normal text-teal-700">(kept private until accepted)</span>
            <input
              name="pickup_address"
              required
              minLength={5}
              maxLength={240}
              defaultValue={initial?.privateDetails?.pickupAddress ?? ""}
              className="market-input"
              autoComplete="street-address"
              placeholder="e.g. 12040 4th Ave, Richmond BC"
            />
            <FieldHint length={lengths.pickup_address} min={5} max={240} />
            <FieldError message={fieldErrors.pickup_address} />
          </label>
          <label className="field-label">
            Available from <span className="font-normal text-slate-400">(optional)</span>
            <DateField
              name="available_from"
              defaultValue={listing?.availableFrom ?? ""}
            />
            <FieldHint optional>Format YYYY-MM-DD</FieldHint>
            <FieldError message={fieldErrors.available_from} />
          </label>
          <label className="field-label">
            Available until <span className="font-normal text-slate-400">(optional)</span>
            <DateField
              name="available_until"
              defaultValue={listing?.availableUntil ?? ""}
            />
            <FieldHint optional>Must be on or after the available-from date</FieldHint>
            <FieldError message={fieldErrors.available_until} />
          </label>
          <label className="field-label sm:col-span-2">
            Public availability summary{" "}
            <span className="font-normal text-slate-400">(optional)</span>
            <input
              name="availability_summary"
              maxLength={240}
              defaultValue={listing?.availabilitySummary ?? ""}
              className="market-input"
              placeholder="e.g. Weekdays after 4 PM · flexible weekends"
            />
            <FieldHint length={lengths.availability_summary} max={240} optional />
            <FieldError message={fieldErrors.availability_summary} />
          </label>
          <label className="field-label sm:col-span-2">
            Private pickup instructions{" "}
            <span className="font-normal text-slate-400">(optional)</span>
            <textarea
              name="pickup_instructions"
              maxLength={1000}
              defaultValue={initial?.privateDetails?.pickupInstructions ?? ""}
              className="market-textarea min-h-24"
              placeholder="Meeting point, buzzer, or contact instructions shown only after acceptance."
            />
            <FieldHint length={lengths.pickup_instructions} max={1000} optional />
            <FieldError message={fieldErrors.pickup_instructions} />
          </label>
          <label className="field-label sm:col-span-2">
            Rules and owner notes{" "}
            <span className="font-normal text-slate-400">(optional)</span>
            <textarea
              name="rental_rules"
              maxLength={2000}
              defaultValue={listing?.rentalRules ?? ""}
              className="market-textarea min-h-24"
              placeholder="ID requirements, permitted use, or anything the rider should know."
            />
            <FieldHint length={lengths.rental_rules} max={2000} optional />
            <FieldError message={fieldErrors.rental_rules} />
          </label>
          <input
            type="hidden"
            name="approximate_latitude"
            value={listing?.approximateLatitude ?? ""}
          />
          <input
            type="hidden"
            name="approximate_longitude"
            value={listing?.approximateLongitude ?? ""}
          />
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
            <Camera className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold text-teal-800">STEP 4</p>
            <h2 className="text-xl font-bold text-slate-950">Add bike photos</h2>
          </div>
        </div>
        {canManagePhotos ? (
          <>
            <label className="mt-6 block cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center focus-within:border-teal-600 focus-within:ring-3 focus-within:ring-teal-700/12">
              <Camera className="mx-auto h-7 w-7 text-teal-700" aria-hidden="true" />
              <span className="mt-3 block text-sm font-bold text-slate-950">
                Choose up to {8 - (listing?.images.length ?? 0)} photos
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                JPEG, PNG, WebP, or AVIF · maximum 4 MB each
              </span>
              {/*
                The browser labels the native file button in its own UI
                language, so the real control is visually hidden and this
                English button and file list stand in for it.
              */}
              <input
                name="photos"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                onChange={(event) =>
                  setPhotoNames(
                    Array.from(event.target.files ?? []).map((file) => file.name),
                  )
                }
                className="sr-only"
              />
              <span className="btn-secondary mt-4 inline-flex px-5 py-2 text-sm">
                Browse photos
              </span>
              <span className="mt-3 block text-xs text-slate-600">
                {photoNames.length === 0
                  ? "No photos selected yet"
                  : `${photoNames.length} selected · ${photoNames.join(", ")}`}
              </span>
            </label>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              You can save the listing without photos and add the real bike images
              later from Edit Listing.
            </p>
          </>
        ) : (
          <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            Only the listing owner can add or remove photos. Staff can still
            correct the listing details when authorized.
          </p>
        )}
      </section>

      <div className="flex flex-col-reverse gap-3 rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-2 text-sm text-slate-600">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
          <span>
            New listings publish immediately. Text and image signals only
            notify Site Admin; enforcement is always a manual decision.
          </span>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="btn-primary w-full shrink-0 px-6 sm:w-auto"
        >
          {busy
            ? "Saving…"
            : listing
              ? "Save changes"
              : source === "wander"
                ? "Publish Wander bike"
                : "Publish bike"}
        </button>
      </div>
      {saved ? (
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          Listing saved. Finishing photos…
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function BikeIcon() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <circle cx="6" cy="17" r="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="18" cy="17" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="m6 17 4-8h3l5 8M9 11h7M9 17h5l-4-8-2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
