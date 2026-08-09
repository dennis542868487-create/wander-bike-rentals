"use client";

import { useCallback, useMemo, useState } from "react";
import {
  buildNearestTrailDirectionsUrl,
  buildNearestTrailSearchUrl,
} from "@/lib/google-maps";

export type LocateState =
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

export function useNearestTrail({
  cityName,
  useFallbackOnError = false,
}: {
  cityName?: string;
  useFallbackOnError?: boolean;
} = {}) {
  const [state, setState] = useState<LocateState>({ status: "idle" });
  const fallbackUrl = useMemo(
    () => buildNearestTrailSearchUrl(cityName),
    [cityName],
  );

  const findNearestTrail = useCallback(() => {
    if (!("geolocation" in navigator)) {
      if (useFallbackOnError) {
        window.location.assign(fallbackUrl);
        return;
      }

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
        if (useFallbackOnError) {
          window.location.assign(fallbackUrl);
          return;
        }

        setState({
          status: "error",
          message: geolocationErrorMessage(error),
        });
      },
      {
        enableHighAccuracy: false,
        maximumAge: 5 * 60 * 1000,
        timeout: 10 * 1000,
      },
    );
  }, [fallbackUrl, useFallbackOnError]);

  return { fallbackUrl, findNearestTrail, state };
}
