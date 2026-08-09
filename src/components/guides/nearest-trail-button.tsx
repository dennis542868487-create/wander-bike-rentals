"use client";

import { LoaderCircle, Navigation } from "lucide-react";
import { useId, useState } from "react";
import { buildNearestTrailDirectionsUrl } from "@/lib/google-maps";

type LocateState =
  | { status: "idle" }
  | { status: "locating" }
  | { status: "error"; message: string };

function geolocationErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) {
    return "Location access was blocked. Enable it in your browser and try again.";
  }
  if (error.code === error.TIMEOUT) {
    return "Your location took too long to load. Please try again.";
  }
  return "We could not find your location. Please check your device settings and try again.";
}

export function NearestTrailButton({ cityName }: { cityName: string }) {
  const [state, setState] = useState<LocateState>({ status: "idle" });
  const statusId = useId();
  const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `bike trails near ${cityName}, British Columbia`,
  )}`;

  const findNearestTrail = () => {
    if (!("geolocation" in navigator)) {
      setState({
        status: "error",
        message: "This browser does not support automatic location.",
      });
      return;
    }

    setState({ status: "locating" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        window.location.assign(
          buildNearestTrailDirectionsUrl(coords.latitude, coords.longitude),
        );
      },
      (error) => {
        setState({ status: "error", message: geolocationErrorMessage(error) });
      },
      {
        enableHighAccuracy: false,
        maximumAge: 5 * 60 * 1000,
        timeout: 10 * 1000,
      },
    );
  };

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
