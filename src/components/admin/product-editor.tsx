"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ImagePlus,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import type {
  AdminProductEditorValue,
  AdminProductImage,
  AdminProductVariant,
  AdminTaxonomyOption,
} from "@/lib/admin/product-types";

type VariantDraft = Omit<
  AdminProductVariant,
  | "optionValues"
  | "priceCents"
  | "compareAtPriceCents"
  | "costCents"
  | "weightGrams"
  | "lengthCm"
  | "widthCm"
  | "heightCm"
  | "initialOnHand"
  | "reorderPoint"
> & {
  optionsText: string;
  price: string;
  compareAtPrice: string;
  cost: string;
  weightGrams: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  initialOnHand: string;
  reorderPoint: string;
};

type EditorState = Omit<AdminProductEditorValue, "variants" | "tags"> & {
  tagsText: string;
  variants: VariantDraft[];
};

type ApiResponse = {
  error?: string;
  product?: {
    product_id?: number;
  };
};

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10 disabled:bg-slate-100";
const textareaClass =
  "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10";

function optionsToText(options: Record<string, string>) {
  return Object.entries(options)
    .map(([name, value]) => `${name}: ${value}`)
    .join(", ");
}

function variantToDraft(variant: AdminProductVariant): VariantDraft {
  return {
    id: variant.id,
    sku: variant.sku,
    barcode: variant.barcode,
    title: variant.title,
    optionsText: optionsToText(variant.optionValues),
    price: (variant.priceCents / 100).toFixed(2),
    compareAtPrice:
      variant.compareAtPriceCents === null
        ? ""
        : (variant.compareAtPriceCents / 100).toFixed(2),
    cost: variant.costCents === null ? "" : (variant.costCents / 100).toFixed(2),
    weightGrams: variant.weightGrams?.toString() ?? "",
    lengthCm: variant.lengthCm?.toString() ?? "",
    widthCm: variant.widthCm?.toString() ?? "",
    heightCm: variant.heightCm?.toString() ?? "",
    canadaPostEligible: variant.canadaPostEligible,
    taxCode: variant.taxCode,
    isActive: variant.isActive,
    sortOrder: variant.sortOrder,
    initialOnHand: variant.initialOnHand.toString(),
    onHand: variant.onHand,
    reserved: variant.reserved,
    available: variant.available,
    reorderPoint: variant.reorderPoint.toString(),
    allowBackorder: variant.allowBackorder,
  };
}

function blankVariant(sortOrder: number): VariantDraft {
  return {
    id: null,
    sku: "",
    barcode: "",
    title: "Default",
    optionsText: "",
    price: "0.00",
    compareAtPrice: "",
    cost: "",
    weightGrams: "",
    lengthCm: "",
    widthCm: "",
    heightCm: "",
    canadaPostEligible: false,
    taxCode: "",
    isActive: true,
    sortOrder,
    initialOnHand: "0",
    onHand: 0,
    reserved: 0,
    available: 0,
    reorderPoint: "0",
    allowBackorder: false,
  };
}

function initialState(product?: AdminProductEditorValue | null): EditorState {
  if (product) {
    return {
      ...product,
      tagsText: product.tags.join(", "),
      variants: product.variants.map(variantToDraft),
    };
  }

  return {
    id: null,
    categoryId: null,
    brandId: null,
    slug: "",
    name: "",
    shortDescription: "",
    description: "",
    productType: "physical",
    status: "draft",
    tagsText: "",
    trackInventory: true,
    requiresShipping: true,
    seoTitle: "",
    seoDescription: "",
    variants: [blankVariant(0)],
    images: [],
  };
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function requiredNumber(value: string, label: string) {
  if (value.trim() === "") throw new Error(`${label} is required.`);
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${label} must be a number.`);
  return parsed;
}

function optionalNumber(value: string) {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error("One of the numeric values is invalid.");
  return parsed;
}

function dollarsToCents(value: string, label: string) {
  return Math.round(requiredNumber(value, label) * 100);
}

function optionalDollarsToCents(value: string) {
  const amount = optionalNumber(value);
  return amount === null ? null : Math.round(amount * 100);
}

function parseOptions(value: string) {
  const options: Record<string, string> = {};
  const entries = value
    .split(/,|\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  for (const entry of entries) {
    const separator = entry.indexOf(":");
    if (separator <= 0) {
      throw new Error('Variant options must use the format "Color: Black".');
    }
    const name = entry.slice(0, separator).trim();
    const optionValue = entry.slice(separator + 1).trim();
    if (!name || !optionValue) {
      throw new Error('Variant options must use the format "Color: Black".');
    }
    options[name] = optionValue;
  }
  return options;
}

export function ProductEditor({
  product,
  categories,
  brands,
}: {
  product?: AdminProductEditorValue | null;
  categories: AdminTaxonomyOption[];
  brands: AdminTaxonomyOption[];
}) {
  const router = useRouter();
  const [state, setState] = useState(() => initialState(product));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const isNew = state.id === null;
  const activeVariants = useMemo(
    () => state.variants.filter((variant) => variant.isActive).length,
    [state.variants],
  );

  function setField<K extends keyof EditorState>(field: K, value: EditorState[K]) {
    setState((current) => ({ ...current, [field]: value }));
  }

  function updateVariant(index: number, update: Partial<VariantDraft>) {
    setState((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...update } : variant,
      ),
    }));
  }

  function removeVariant(index: number) {
    setState((current) => {
      if (current.variants.length === 1) return current;
      return {
        ...current,
        variants: current.variants.filter((_, variantIndex) => variantIndex !== index),
      };
    });
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/admin/product-images", {
        method: "POST",
        body: formData,
      });
      const body = (await response.json()) as {
        error?: string;
        image?: AdminProductImage;
      };
      if (!response.ok || !body.image) {
        throw new Error(body.error ?? "The image could not be uploaded.");
      }

      const altText = file.name.replace(/\.[^.]+$/, "").replaceAll(/[-_]+/g, " ");
      setState((current) => ({
        ...current,
        images: [
          ...current.images,
          {
            ...body.image!,
            altText: altText || current.name || "Wander Bike product",
            sortOrder: current.images.length,
          },
        ],
      }));
    } catch (error) {
      setMessage({
        kind: "error",
        text: error instanceof Error ? error.message : "The image could not be uploaded.",
      });
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const variants = state.variants.map((variant, index) => ({
        id: variant.id,
        sku: variant.sku,
        barcode: variant.barcode,
        title: variant.title,
        optionValues: parseOptions(variant.optionsText),
        priceCents: dollarsToCents(variant.price, `Variant ${index + 1} price`),
        compareAtPriceCents: optionalDollarsToCents(variant.compareAtPrice),
        costCents: optionalDollarsToCents(variant.cost),
        weightGrams: optionalNumber(variant.weightGrams),
        lengthCm: optionalNumber(variant.lengthCm),
        widthCm: optionalNumber(variant.widthCm),
        heightCm: optionalNumber(variant.heightCm),
        canadaPostEligible: variant.canadaPostEligible,
        taxCode: variant.taxCode,
        isActive: variant.isActive,
        sortOrder: index,
        initialOnHand: Math.round(requiredNumber(variant.initialOnHand, "Initial stock")),
        reorderPoint: Math.round(requiredNumber(variant.reorderPoint, "Reorder point")),
        allowBackorder: variant.allowBackorder,
      }));

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: state.id,
          categoryId: state.categoryId,
          brandId: state.brandId,
          slug: state.slug,
          name: state.name,
          shortDescription: state.shortDescription,
          description: state.description,
          productType: state.productType,
          status: state.status,
          tags: state.tagsText
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          trackInventory: state.trackInventory,
          requiresShipping: state.requiresShipping,
          seoTitle: state.seoTitle,
          seoDescription: state.seoDescription,
          variants,
          images: state.images.map((image, index) => ({
            storagePath: image.storagePath,
            altText: image.altText,
            width: image.width,
            height: image.height,
            sortOrder: index,
          })),
        }),
      });
      const body = (await response.json()) as ApiResponse;
      if (!response.ok) throw new Error(body.error ?? "The product could not be saved.");

      const productId = body.product?.product_id ?? state.id;
      setMessage({ kind: "success", text: "Product saved." });
      if (productId) {
        router.push(`/admin/products/${productId}`);
        router.refresh();
      }
    } catch (error) {
      setMessage({
        kind: "error",
        text: error instanceof Error ? error.message : "The product could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-7 grid gap-6 xl:grid-cols-[1fr_22rem]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-950">Product details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
              Name
              <input
                required
                value={state.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setState((current) => ({
                    ...current,
                    name,
                    slug:
                      isNew && (!current.slug || current.slug === slugify(current.name))
                        ? slugify(name)
                        : current.slug,
                  }));
                }}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              URL slug
              <input
                required
                value={state.slug}
                onChange={(event) => setField("slug", slugify(event.target.value))}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Status
              <select
                value={state.status}
                onChange={(event) =>
                  setField("status", event.target.value as EditorState["status"])
                }
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
              Short description
              <textarea
                rows={2}
                maxLength={320}
                value={state.shortDescription}
                onChange={(event) => setField("shortDescription", event.target.value)}
                className={textareaClass}
              />
            </label>
            <label className="sm:col-span-2 text-sm font-semibold text-slate-700">
              Description
              <textarea
                rows={8}
                maxLength={20000}
                value={state.description}
                onChange={(event) => setField("description", event.target.value)}
                className={textareaClass}
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Variants</h2>
              <p className="mt-1 text-sm text-slate-500">
                {state.variants.length} total · {activeVariants} active
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setState((current) => ({
                  ...current,
                  variants: [
                    ...current.variants,
                    blankVariant(current.variants.length),
                  ],
                }))
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add variant
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {state.variants.map((variant, index) => (
              <fieldset
                key={variant.id ?? `new-${index}`}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <legend className="px-1 font-bold text-slate-900">
                    Variant {index + 1}
                  </legend>
                  <button
                    type="button"
                    disabled={state.variants.length === 1}
                    onClick={() => removeVariant(index)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 disabled:opacity-30"
                  >
                    <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
                {variant.id ? (
                  <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs text-slate-500">
                    Stock: {variant.onHand} on hand · {variant.reserved} reserved ·{" "}
                    {variant.available} available. Use Inventory to adjust existing stock.
                  </p>
                ) : null}
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="text-sm font-semibold text-slate-700">
                    SKU
                    <input
                      required
                      value={variant.sku}
                      onChange={(event) => updateVariant(index, { sku: event.target.value })}
                      className={inputClass}
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Variant title
                    <input
                      required
                      value={variant.title}
                      onChange={(event) =>
                        updateVariant(index, { title: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Barcode
                    <input
                      value={variant.barcode}
                      onChange={(event) =>
                        updateVariant(index, { barcode: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="sm:col-span-2 lg:col-span-3 text-sm font-semibold text-slate-700">
                    Options
                    <input
                      value={variant.optionsText}
                      onChange={(event) =>
                        updateVariant(index, { optionsText: event.target.value })
                      }
                      placeholder="Color: Black, Size: Medium"
                      className={inputClass}
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Price (CAD)
                    <input
                      required
                      inputMode="decimal"
                      value={variant.price}
                      onChange={(event) =>
                        updateVariant(index, { price: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Compare-at (CAD)
                    <input
                      inputMode="decimal"
                      value={variant.compareAtPrice}
                      onChange={(event) =>
                        updateVariant(index, { compareAtPrice: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Cost (CAD)
                    <input
                      inputMode="decimal"
                      value={variant.cost}
                      onChange={(event) =>
                        updateVariant(index, { cost: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Weight (g)
                    <input
                      inputMode="numeric"
                      value={variant.weightGrams}
                      onChange={(event) =>
                        updateVariant(index, { weightGrams: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                  {(["lengthCm", "widthCm", "heightCm"] as const).map((field) => (
                    <label key={field} className="text-sm font-semibold text-slate-700">
                      {field === "lengthCm"
                        ? "Length (cm)"
                        : field === "widthCm"
                          ? "Width (cm)"
                          : "Height (cm)"}
                      <input
                        inputMode="decimal"
                        value={variant[field]}
                        onChange={(event) =>
                          updateVariant(index, { [field]: event.target.value })
                        }
                        className={inputClass}
                      />
                    </label>
                  ))}
                  <label className="text-sm font-semibold text-slate-700">
                    {variant.id ? "Reorder point" : "Initial stock"}
                    <input
                      inputMode="numeric"
                      value={variant.id ? variant.reorderPoint : variant.initialOnHand}
                      onChange={(event) =>
                        updateVariant(
                          index,
                          variant.id
                            ? { reorderPoint: event.target.value }
                            : { initialOnHand: event.target.value },
                        )
                      }
                      className={inputClass}
                    />
                  </label>
                  {!variant.id ? (
                    <label className="text-sm font-semibold text-slate-700">
                      Reorder point
                      <input
                        inputMode="numeric"
                        value={variant.reorderPoint}
                        onChange={(event) =>
                          updateVariant(index, { reorderPoint: event.target.value })
                        }
                        className={inputClass}
                      />
                    </label>
                  ) : null}
                  <label className="text-sm font-semibold text-slate-700">
                    Tax code
                    <input
                      value={variant.taxCode}
                      onChange={(event) =>
                        updateVariant(index, { taxCode: event.target.value })
                      }
                      className={inputClass}
                    />
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap gap-5 text-sm">
                  <label className="flex items-center gap-2 font-medium">
                    <input
                      type="checkbox"
                      checked={variant.isActive}
                      onChange={(event) =>
                        updateVariant(index, { isActive: event.target.checked })
                      }
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 font-medium">
                    <input
                      type="checkbox"
                      checked={variant.canadaPostEligible}
                      onChange={(event) =>
                        updateVariant(index, {
                          canadaPostEligible: event.target.checked,
                        })
                      }
                    />
                    Canada Post eligible
                  </label>
                  <label className="flex items-center gap-2 font-medium">
                    <input
                      type="checkbox"
                      checked={variant.allowBackorder}
                      onChange={(event) =>
                        updateVariant(index, { allowBackorder: event.target.checked })
                      }
                    />
                    Allow backorder
                  </label>
                </div>
              </fieldset>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Images</h2>
              <p className="mt-1 text-sm text-slate-500">
                JPEG, PNG, WebP, or AVIF · maximum 8 MB
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold">
              {uploading ? (
                <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus aria-hidden="true" className="h-4 w-4" />
              )}
              {uploading ? "Uploading…" : "Upload image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={uploading}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadImage(file);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {state.images.map((image, index) => (
              <div
                key={image.storagePath}
                className="overflow-hidden rounded-2xl border border-slate-200"
              >
                <div
                  role="img"
                  aria-label={image.altText}
                  className="aspect-[4/3] bg-slate-100 bg-cover bg-center"
                  style={{ backgroundImage: `url("${image.publicUrl}")` }}
                />
                <div className="space-y-3 p-3">
                  <label className="text-xs font-semibold text-slate-600">
                    Alt text
                    <input
                      required
                      value={image.altText}
                      onChange={(event) =>
                        setState((current) => ({
                          ...current,
                          images: current.images.map((entry, imageIndex) =>
                            imageIndex === index
                              ? { ...entry, altText: event.target.value }
                              : entry,
                          ),
                        }))
                      }
                      className={inputClass}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setState((current) => ({
                        ...current,
                        images: current.images.filter(
                          (_, imageIndex) => imageIndex !== index,
                        ),
                      }))
                    }
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700"
                  >
                    <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                    Remove from product
                  </button>
                </div>
              </div>
            ))}
            {state.images.length === 0 ? (
              <div className="sm:col-span-2 rounded-2xl border border-dashed border-slate-300 px-5 py-12 text-center text-sm text-slate-500">
                No product images yet.
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-950">Search preview</h2>
          <div className="mt-5 grid gap-4">
            <label className="text-sm font-semibold text-slate-700">
              SEO title
              <input
                value={state.seoTitle}
                maxLength={180}
                onChange={(event) => setField("seoTitle", event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              SEO description
              <textarea
                rows={3}
                value={state.seoDescription}
                maxLength={320}
                onChange={(event) => setField("seoDescription", event.target.value)}
                className={textareaClass}
              />
            </label>
          </div>
        </section>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-bold text-slate-950">Organization</h2>
          <div className="mt-4 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Category
              <select
                value={state.categoryId ?? ""}
                onChange={(event) =>
                  setField(
                    "categoryId",
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
                className={inputClass}
              >
                <option value="">Uncategorized</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Brand
              <select
                value={state.brandId ?? ""}
                onChange={(event) =>
                  setField(
                    "brandId",
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
                className={inputClass}
              >
                <option value="">No brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Type
              <select
                value={state.productType}
                onChange={(event) => {
                  const productType = event.target
                    .value as EditorState["productType"];
                  setState((current) => ({
                    ...current,
                    productType,
                    trackInventory:
                      productType === "physical" ? current.trackInventory : false,
                    requiresShipping:
                      productType === "physical" ? current.requiresShipping : false,
                  }));
                }}
                className={inputClass}
              >
                <option value="physical">Physical</option>
                <option value="service">Service</option>
                <option value="gift_card">Gift card</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Tags
              <input
                value={state.tagsText}
                onChange={(event) => setField("tagsText", event.target.value)}
                placeholder="commuter, helmet, summer"
                className={inputClass}
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-bold text-slate-950">Fulfillment controls</h2>
          <div className="mt-4 space-y-3 text-sm">
            <label className="flex items-center gap-2 font-medium">
              <input
                type="checkbox"
                disabled={state.productType !== "physical"}
                checked={state.trackInventory}
                onChange={(event) => setField("trackInventory", event.target.checked)}
              />
              Track inventory
            </label>
            <label className="flex items-center gap-2 font-medium">
              <input
                type="checkbox"
                disabled={state.productType !== "physical"}
                checked={state.requiresShipping}
                onChange={(event) => setField("requiresShipping", event.target.checked)}
              />
              Requires shipping
            </label>
          </div>
        </section>

        {message ? (
          <p
            role="status"
            className={`rounded-xl px-4 py-3 text-sm ${
              message.kind === "success"
                ? "bg-emerald-50 text-emerald-800"
                : "bg-rose-50 text-rose-800"
            }`}
          >
            {message.text}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="h-4 w-4" />
          )}
          {saving ? "Saving…" : isNew ? "Create product" : "Save changes"}
        </button>
      </aside>
    </form>
  );
}
