"use client";

import { LoaderCircle, Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  AdminBrand,
  AdminCategory,
} from "@/lib/admin/product-types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const blankCategory: AdminCategory = {
  id: 0,
  parentId: null,
  slug: "",
  name: "",
  description: "",
  sortOrder: 0,
  isActive: true,
};

const blankBrand: AdminBrand = {
  id: 0,
  slug: "",
  name: "",
  description: "",
  websiteUrl: "",
  isActive: true,
};

export function CatalogTaxonomyManager({
  initialCategories,
  initialBrands,
}: {
  initialCategories: AdminCategory[];
  initialBrands: AdminBrand[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [brands, setBrands] = useState(initialBrands);
  const [newCategory, setNewCategory] = useState(blankCategory);
  const [newBrand, setNewBrand] = useState(blankBrand);
  const [savingKey, setSavingKey] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function save(
    key: string,
    payload:
      | ({ kind: "category" } & AdminCategory)
      | ({ kind: "brand" } & AdminBrand),
  ) {
    setSavingKey(key);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/taxonomies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          id: payload.id || null,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "The catalog setting could not be saved.");
      }
      setMessage(
        `${payload.kind === "category" ? "Category" : "Brand"} saved.`,
      );
      if (!payload.id) {
        if (payload.kind === "category") setNewCategory(blankCategory);
        else setNewBrand(blankBrand);
      }
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The catalog setting could not be saved.",
      );
    } finally {
      setSavingKey("");
    }
  }

  return (
    <div className="mt-7 grid gap-7">
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          {error}
        </div>
      ) : null}
      {message ? (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {message}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-950">Categories</h2>
          <p className="mt-1 text-sm text-slate-500">
            Categories drive storefront filters and product organization.
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {[...categories, newCategory].map((category, index) => {
            const isNew = index === categories.length;
            const key = isNew ? "category-new" : `category-${category.id}`;
            return (
              <div
                key={key}
                className={`grid gap-3 p-5 xl:grid-cols-[1fr_1fr_1fr_7rem_8rem_auto] ${
                  isNew ? "bg-teal-50/40" : ""
                }`}
              >
                <label className="text-xs font-semibold text-slate-600">
                  Name
                  <input
                    value={category.name}
                    onChange={(event) => {
                      const update = {
                        ...category,
                        name: event.target.value,
                        slug:
                          category.slug || slugify(event.target.value),
                      };
                      if (isNew) setNewCategory(update);
                      else
                        setCategories((current) =>
                          current.map((item) =>
                            item.id === category.id ? update : item,
                          ),
                        );
                    }}
                    className="booking-input"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Slug
                  <input
                    value={category.slug}
                    onChange={(event) => {
                      const update = {
                        ...category,
                        slug: slugify(event.target.value),
                      };
                      if (isNew) setNewCategory(update);
                      else
                        setCategories((current) =>
                          current.map((item) =>
                            item.id === category.id ? update : item,
                          ),
                        );
                    }}
                    className="booking-input"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Parent
                  <select
                    value={category.parentId ?? ""}
                    onChange={(event) => {
                      const update = {
                        ...category,
                        parentId: event.target.value
                          ? Number(event.target.value)
                          : null,
                      };
                      if (isNew) setNewCategory(update);
                      else
                        setCategories((current) =>
                          current.map((item) =>
                            item.id === category.id ? update : item,
                          ),
                        );
                    }}
                    className="booking-input"
                  >
                    <option value="">Top level</option>
                    {categories
                      .filter((candidate) => candidate.id !== category.id)
                      .map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Sort
                  <input
                    type="number"
                    value={category.sortOrder}
                    onChange={(event) => {
                      const update = {
                        ...category,
                        sortOrder: Number(event.target.value) || 0,
                      };
                      if (isNew) setNewCategory(update);
                      else
                        setCategories((current) =>
                          current.map((item) =>
                            item.id === category.id ? update : item,
                          ),
                        );
                    }}
                    className="booking-input"
                  />
                </label>
                <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={category.isActive}
                    onChange={(event) => {
                      const update = {
                        ...category,
                        isActive: event.target.checked,
                      };
                      if (isNew) setNewCategory(update);
                      else
                        setCategories((current) =>
                          current.map((item) =>
                            item.id === category.id ? update : item,
                          ),
                        );
                    }}
                    className="accent-teal-700"
                  />
                  Active
                </label>
                <button
                  type="button"
                  disabled={
                    savingKey === key || !category.name || !category.slug
                  }
                  onClick={() =>
                    save(key, { kind: "category", ...category })
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-xl bg-slate-950 px-4 text-sm font-bold text-white disabled:opacity-50"
                >
                  {savingKey === key ? (
                    <LoaderCircle
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin"
                    />
                  ) : isNew ? (
                    <Plus aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <Save aria-hidden="true" className="h-4 w-4" />
                  )}
                  {isNew ? "Add" : "Save"}
                </button>
                <label className="text-xs font-semibold text-slate-600 xl:col-span-6">
                  Description
                  <input
                    value={category.description}
                    onChange={(event) => {
                      const update = {
                        ...category,
                        description: event.target.value,
                      };
                      if (isNew) setNewCategory(update);
                      else
                        setCategories((current) =>
                          current.map((item) =>
                            item.id === category.id ? update : item,
                          ),
                        );
                    }}
                    className="booking-input"
                  />
                </label>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-950">Brands</h2>
          <p className="mt-1 text-sm text-slate-500">
            Brands appear in filters and on product detail pages.
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {[...brands, newBrand].map((brand, index) => {
            const isNew = index === brands.length;
            const key = isNew ? "brand-new" : `brand-${brand.id}`;
            return (
              <div
                key={key}
                className={`grid gap-3 p-5 xl:grid-cols-[1fr_1fr_1.4fr_8rem_auto] ${
                  isNew ? "bg-teal-50/40" : ""
                }`}
              >
                <label className="text-xs font-semibold text-slate-600">
                  Name
                  <input
                    value={brand.name}
                    onChange={(event) => {
                      const update = {
                        ...brand,
                        name: event.target.value,
                        slug: brand.slug || slugify(event.target.value),
                      };
                      if (isNew) setNewBrand(update);
                      else
                        setBrands((current) =>
                          current.map((item) =>
                            item.id === brand.id ? update : item,
                          ),
                        );
                    }}
                    className="booking-input"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Slug
                  <input
                    value={brand.slug}
                    onChange={(event) => {
                      const update = {
                        ...brand,
                        slug: slugify(event.target.value),
                      };
                      if (isNew) setNewBrand(update);
                      else
                        setBrands((current) =>
                          current.map((item) =>
                            item.id === brand.id ? update : item,
                          ),
                        );
                    }}
                    className="booking-input"
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Website
                  <input
                    type="url"
                    value={brand.websiteUrl}
                    onChange={(event) => {
                      const update = {
                        ...brand,
                        websiteUrl: event.target.value,
                      };
                      if (isNew) setNewBrand(update);
                      else
                        setBrands((current) =>
                          current.map((item) =>
                            item.id === brand.id ? update : item,
                          ),
                        );
                    }}
                    className="booking-input"
                  />
                </label>
                <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={brand.isActive}
                    onChange={(event) => {
                      const update = {
                        ...brand,
                        isActive: event.target.checked,
                      };
                      if (isNew) setNewBrand(update);
                      else
                        setBrands((current) =>
                          current.map((item) =>
                            item.id === brand.id ? update : item,
                          ),
                        );
                    }}
                    className="accent-teal-700"
                  />
                  Active
                </label>
                <button
                  type="button"
                  disabled={savingKey === key || !brand.name || !brand.slug}
                  onClick={() => save(key, { kind: "brand", ...brand })}
                  className="inline-flex h-11 items-center justify-center gap-2 self-end rounded-xl bg-slate-950 px-4 text-sm font-bold text-white disabled:opacity-50"
                >
                  {savingKey === key ? (
                    <LoaderCircle
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin"
                    />
                  ) : isNew ? (
                    <Plus aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <Save aria-hidden="true" className="h-4 w-4" />
                  )}
                  {isNew ? "Add" : "Save"}
                </button>
                <label className="text-xs font-semibold text-slate-600 xl:col-span-5">
                  Description
                  <input
                    value={brand.description}
                    onChange={(event) => {
                      const update = {
                        ...brand,
                        description: event.target.value,
                      };
                      if (isNew) setNewBrand(update);
                      else
                        setBrands((current) =>
                          current.map((item) =>
                            item.id === brand.id ? update : item,
                          ),
                        );
                    }}
                    className="booking-input"
                  />
                </label>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
