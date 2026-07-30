import { CalendarClock, HandCoins, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { ListingPhoto } from "@/components/marketplace/listing-photo";
import { RequestStatusBadge } from "@/components/marketplace/status-badge";
import { RequestActions } from "@/components/account/request-actions";
import { formatCad, formatDateTime } from "@/lib/marketplace/format";
import type { MarketplaceRequest } from "@/lib/marketplace/types";

export function RequestCard({
  request,
  viewer,
}: {
  request: MarketplaceRequest;
  viewer: "renter" | "owner" | "admin";
}) {
  const price =
    request.intent === "buy"
      ? formatCad(request.quotedSalePriceCents)
      : formatCad(request.quotedDailyCents) ??
        formatCad(request.quotedHourlyCents);

  return (
    <article className="overflow-hidden rounded-[0.9rem] border border-slate-200 bg-white">
      <div className="grid sm:grid-cols-[11rem_minmax(0,1fr)]">
        <Link
          href={`/bikes/${request.listing.slug}`}
          className="relative min-h-44 overflow-hidden bg-slate-100"
        >
          <ListingPhoto
            image={request.listing.images[0]}
            title={request.listing.title}
            sizes="(min-width: 640px) 11rem, 100vw"
          />
        </Link>
        <div className="min-w-0 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-teal-800">
                {request.intent === "rent" ? "RENTAL REQUEST" : "PURCHASE INQUIRY"}
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                <Link href={`/bikes/${request.listing.slug}`}>
                  {request.listing.title}
                </Link>
              </h2>
            </div>
            <RequestStatusBadge status={request.status} />
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            {request.intent === "rent" ? (
              <div className="flex gap-2">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
                <span>
                  {formatDateTime(request.startsAt)}
                  <br />
                  to {formatDateTime(request.endsAt)}
                </span>
              </div>
            ) : (
              <div className="flex gap-2">
                <HandCoins className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
                <span>{price} asking price</span>
              </div>
            )}
            <div className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />
              <span>{request.listing.pickupArea}</span>
            </div>
          </div>

          {viewer !== "renter" ? (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <span className="font-bold text-slate-900">{request.renterName}</span>
              <a href={`mailto:${request.renterEmail}`} className="flex items-center gap-1.5 hover:text-teal-800">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {request.renterEmail}
              </a>
              {request.renterPhone ? (
                <a href={`tel:${request.renterPhone}`} className="flex items-center gap-1.5 hover:text-teal-800">
                  <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                  {request.renterPhone}
                </a>
              ) : null}
            </div>
          ) : null}

          {request.message ? (
            <div className="mt-4 border-l-2 border-teal-200 pl-4">
              <p className="text-xs font-bold text-slate-500">MESSAGE</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                {request.message}
              </p>
            </div>
          ) : null}

          {request.responseNote ? (
            <div className="mt-4 rounded-xl bg-amber-50 p-3">
              <p className="text-xs font-bold text-amber-900">RESPONSE NOTE</p>
              <p className="mt-1 text-sm text-amber-950">{request.responseNote}</p>
            </div>
          ) : null}

          {request.pickupDetails ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-bold text-emerald-900">
                CONFIRMED PICKUP DETAILS
              </p>
              <p className="mt-2 text-sm font-semibold text-emerald-950">
                {request.pickupDetails.pickupAddress}
                {request.pickupDetails.postalCode
                  ? ` · ${request.pickupDetails.postalCode}`
                  : ""}
              </p>
              {request.pickupDetails.pickupInstructions ? (
                <p className="mt-1 text-sm leading-6 text-emerald-900">
                  {request.pickupDetails.pickupInstructions}
                </p>
              ) : null}
              <p className="mt-2 text-xs text-emerald-800">
                Keep this private. Payment happens in person.
              </p>
            </div>
          ) : null}

          <div className="mt-5 border-t border-slate-100 pt-4">
            <RequestActions
              requestId={request.id}
              status={request.status}
              viewer={viewer}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
