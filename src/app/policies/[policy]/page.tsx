import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCommerceStoreSettings } from "@/lib/commerce/settings";

const policyNames = {
  shipping: "Shipping policy",
  refund: "Refund policy",
  returns: "Return policy",
} as const;

type PolicyKey = keyof typeof policyNames;

function policyKey(value: string): value is PolicyKey {
  return value in policyNames;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ policy: string }>;
}): Promise<Metadata> {
  const { policy } = await params;
  if (!policyKey(policy)) return {};
  return {
    title: policyNames[policy],
    description: `${policyNames[policy]} for Wander Bike sales orders.`,
  };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ policy: string }>;
}) {
  const { policy } = await params;
  if (!policyKey(policy)) notFound();

  const settings = await getCommerceStoreSettings();
  const content =
    policy === "shipping"
      ? settings.policies.shipping
      : policy === "refund"
        ? settings.policies.refund
        : settings.policies.returns;

  return (
    <main className="min-h-[70vh] bg-[#fbfaf6] px-6 py-14 sm:px-8">
      <article className="mx-auto max-w-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
          Wander Bike commerce
        </p>
        <h1 className="mt-3 font-[Georgia] text-4xl text-slate-950">
          {policyNames[policy]}
        </h1>
        {content ? (
          <div className="mt-7 whitespace-pre-wrap text-base leading-8 text-slate-700">
            {content}
          </div>
        ) : (
          <div className="mt-7 border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
            This policy is awaiting merchant approval during sandbox setup. No
            production sale is enabled.
          </div>
        )}
        <p className="mt-8 text-sm text-slate-500">
          Questions? Call{" "}
          <a
            href={`tel:${settings.profile.phone.replace(/[^\d+]/g, "")}`}
            className="font-semibold text-teal-800 underline"
          >
            {settings.profile.phone}
          </a>
          .
        </p>
        <Link
          href="/shop"
          className="mt-7 inline-flex text-sm font-semibold text-teal-800 underline"
        >
          Return to the shop
        </Link>
      </article>
    </main>
  );
}
