"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ListingImage } from "@/lib/marketplace/types";

export function ListingPhotoManager({
  listingId,
  images,
}: {
  listingId: string;
  images: ListingImage[];
}) {
  const router = useRouter();
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (images.length === 0) return null;

  async function remove(imageId: string) {
    if (!window.confirm("Remove this photo?")) return;
    setRemoving(imageId);
    setError("");
    try {
      const response = await fetch(
        `/api/marketplace/listings/${listingId}/images/${imageId}`,
        { method: "DELETE" },
      );
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not remove photo.");
      router.refresh();
    } catch (removeError) {
      setError(
        removeError instanceof Error ? removeError.message : "Could not remove photo.",
      );
    } finally {
      setRemoving(null);
    }
  }

  return (
    <section className="mb-6 rounded-[0.9rem] border border-slate-200 bg-white p-6">
      <h2 className="font-bold text-slate-950">Current photos</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((image) => (
          <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 640px) 20vw, 45vw"
              className="object-cover"
            />
            <button
              type="button"
              disabled={removing === image.id}
              onClick={() => void remove(image.id)}
              aria-label={`Remove ${image.alt}`}
              className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-rose-700 shadow"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
    </section>
  );
}
