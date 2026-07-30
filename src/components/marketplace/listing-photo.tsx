import { Bike } from "lucide-react";
import Image from "next/image";
import type { ListingImage } from "@/lib/marketplace/types";

export function ListingPhoto({
  image,
  title,
  priority = false,
  sizes = "(min-width: 1024px) 34vw, 100vw",
}: {
  image?: ListingImage;
  title: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (!image) {
    return (
      <div className="flex h-full min-h-52 items-center justify-center bg-[linear-gradient(145deg,#e8f2f2,#d7e5e8)] text-teal-800">
        <div className="text-center">
          <Bike className="mx-auto h-10 w-10" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold">Photo coming soon</p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={image.src}
      alt={image.alt || title}
      fill
      sizes={sizes}
      priority={priority}
      /* Transform only, 300ms: the bare `transition` shorthand dragged every
         animatable property along at 500ms, and half a second to travel 2% read
         as a drift rather than a response. */
      className="object-cover transition-transform duration-300 ease-[var(--ease-ui)] group-hover:scale-[1.02]"
    />
  );
}
