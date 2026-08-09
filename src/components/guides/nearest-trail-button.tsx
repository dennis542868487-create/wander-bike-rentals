"use client";

import { LoaderCircle, Navigation } from "lucide-react";
import { useId } from "react";
import { useNearestTrail } from "@/hooks/use-nearest-trail";

export function NearestTrailButton({ cityName }: { cityName: string }) {
  const { fallbackUrl, findNearestTrail, state } = useNearestTrail({ cityName });
  const statusId = useId();

  return (
    <div className="w-full sm:w-auto">
      <button
        type="button"
        onClick={findNearestTrail}
        disabled={state.status === "locating"}
        aria-describedby={state.status === "idle" ? undefined : statusId}
        aria-busy={state.status === "locating"}
        className="editorial-button editorial-button-primary min-h-11 w-full disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        {state.status === "locating" ? (
          <span className="animate-spin" aria-hidden="true">
            <LoaderCircle className="h-4 w-4" />
          </span>
        ) : (
          <Navigation className="h-4 w-4" aria-hidden="true" />
        )}
        {state.status === "locating"
          ? "Finding your location…"
          : "Navigate to nearest trail"}
      </button>

      {state.status === "error" ? (
        <p
          id={statusId}
          role="status"
          className="mt-2 max-w-sm text-xs leading-5 text-slate-500"
        >
          {state.message}{" "}
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noreferrer"
            className="font-bold text-teal-700 underline decoration-teal-300 underline-offset-2"
          >
            Search Google Maps instead.
          </a>
        </p>
      ) : null}

      {state.status === "locating" ? (
        <p id={statusId} role="status" className="sr-only">
          Finding your location and preparing Google Maps bicycle directions.
        </p>
      ) : null}
    </div>
  );
}
