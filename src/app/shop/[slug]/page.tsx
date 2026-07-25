import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, LifeBuoy, Ruler, ShieldCheck, Wrench } from "lucide-react";
import { ProductPurchasePanel } from "@/components/commerce/product-purchase-panel";
import { getCatalogProductBySlug } from "@/lib/commerce/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/shop/${product.slug}` },
    robots: product.isSandboxProduct
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      url: `https://www.wanderbike.ca/shop/${product.slug}`,
      images: product.images[0] ? [{ url: product.images[0].src }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) notFound();

  const primaryImage = product.images[0];

  const productSchema = product.isSandboxProduct
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.shortDescription,
        image: product.images.map((image) => image.src),
        sku: product.variants[0]?.sku,
        brand: product.brand
          ? { "@type": "Brand", name: product.brand.name }
          : undefined,
        offers: product.variants[0]
          ? {
              "@type": "Offer",
              priceCurrency: "CAD",
              price: (product.variants[0].priceCents / 100).toFixed(2),
              availability: product.variants[0].isAvailable
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              url: `https://www.wanderbike.ca/shop/${product.slug}`,
            }
          : undefined,
      };

  return (
    <main className="bg-[#fbfaf6] pb-20 text-slate-900">
      {productSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      ) : null}

      <div className="mx-auto max-w-7xl px-6 py-6 sm:px-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/shop" className="transition hover:text-teal-800">
            Shop
          </Link>
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
          {product.category ? (
            <>
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="transition hover:text-teal-800"
              >
                {product.category.name}
              </Link>
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </>
          ) : null}
          <span className="truncate text-slate-700">{product.name}</span>
        </nav>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-14 sm:px-8 lg:grid-cols-[1.25fr_.85fr] lg:gap-14">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden bg-white">
            {primaryImage ? (
              <Image
                src={primaryImage.src}
                alt={primaryImage.alt}
                fill
                priority
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                Product image coming soon
              </div>
            )}
          </div>
          {product.images.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((image) => (
                <div key={image.id} className="relative aspect-square overflow-hidden bg-white">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="20vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-8 grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-3">
            {[
              {
                icon: Wrench,
                title: "Shop setup support",
                text: "Ask the Steveston team about assembly, fit, and compatible accessories.",
              },
              {
                icon: ShieldCheck,
                title: "Server-priced checkout",
                text: "Price and stock are rechecked on the server before Stripe opens.",
              },
              {
                icon: LifeBuoy,
                title: "Local help",
                text: "Call (778) 952-1389 if you need help choosing an option.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-[#edf8f5] p-5">
                <item.icon aria-hidden="true" className="h-5 w-5 text-teal-800" />
                <h2 className="mt-3 font-semibold text-slate-950">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
            {product.brand?.name ?? product.category?.name ?? "Wander Bike"}
          </p>
          <h1 className="mt-3 font-[Georgia] text-4xl leading-[1.08] text-slate-950 sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            {product.shortDescription}
          </p>
          <div className="mt-8">
            <ProductPurchasePanel product={product} />
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:px-8 lg:grid-cols-2">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              <Ruler aria-hidden="true" className="h-4 w-4" />
              Product details
            </p>
            <h2 className="mt-3 font-[Georgia] text-3xl text-slate-950">
              What to know before checkout
            </h2>
            <p className="mt-4 whitespace-pre-line leading-7 text-slate-600">
              {product.description}
            </p>
          </div>
          <dl className="divide-y divide-slate-200 border-y border-slate-200 text-sm">
            <div className="grid grid-cols-[9rem_1fr] gap-4 py-4">
              <dt className="font-semibold text-slate-800">SKU</dt>
              <dd className="text-slate-600">{product.variants[0]?.sku ?? "—"}</dd>
            </div>
            <div className="grid grid-cols-[9rem_1fr] gap-4 py-4">
              <dt className="font-semibold text-slate-800">Options</dt>
              <dd className="text-slate-600">
                {Object.entries(product.variants[0]?.optionValues ?? {})
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(" · ") || "Default"}
              </dd>
            </div>
            <div className="grid grid-cols-[9rem_1fr] gap-4 py-4">
              <dt className="font-semibold text-slate-800">Fulfillment</dt>
              <dd className="text-slate-600">
                {!product.requiresShipping
                  ? "No shipping required"
                  : [
                      product.variants.some((variant) => variant.pickupEligible)
                        ? "pickup"
                        : null,
                      product.variants.some(
                        (variant) => variant.localDeliveryEligible,
                      )
                        ? "local delivery"
                        : null,
                      product.variants.some(
                        (variant) => variant.canadaPostEligible,
                      )
                        ? "Canada Post"
                        : null,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Contact the shop"}
              </dd>
            </div>
            <div className="grid grid-cols-[9rem_1fr] gap-4 py-4">
              <dt className="font-semibold text-slate-800">Returns</dt>
              <dd className="text-slate-600">
                Review the{" "}
                <Link
                  href="/policies/returns"
                  className="font-semibold text-teal-800 underline underline-offset-4"
                >
                  return policy
                </Link>{" "}
                before checkout.
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
