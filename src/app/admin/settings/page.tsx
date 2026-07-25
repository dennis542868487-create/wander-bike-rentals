import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { getCommerceStoreSettings } from "@/lib/commerce/settings";
import { getServerEnvironment } from "@/lib/env";
import { getCurrentStaff } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [settings, staff] = await Promise.all([
    getCommerceStoreSettings(),
    getCurrentStaff(),
  ]);
  const environment = getServerEnvironment();
  const ratesConfigured = Boolean(
    environment.COMMERCE_SANDBOX_MODE &&
    environment.CANADA_POST_ENVIRONMENT === "test" &&
    environment.CANADA_POST_API_KEY &&
    environment.CANADA_POST_API_SECRET,
  );
  const labelsConfigured = Boolean(
    ratesConfigured &&
    environment.CANADA_POST_ACCOUNT_TYPE &&
    environment.CANADA_POST_CUSTOMER_NUMBER &&
    (environment.CANADA_POST_ACCOUNT_TYPE !== "contract" ||
      (environment.CANADA_POST_CONTRACT_ID &&
        environment.CANADA_POST_GROUP_ID)),
  );

  return (
    <div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
          Store operations
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Settings
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          These settings control checkout, pickup, delivery, carrier pricing,
          taxes, notifications, and customer policies. Secret credentials stay
          in the deployment environment and are never shown here.
        </p>
      </div>

      <StoreSettingsForm
        initialSettings={settings}
        canEdit={staff?.role === "admin"}
        environmentStatus={{
          sandboxMode: environment.COMMERCE_SANDBOX_MODE,
          checkoutGateConfigured: Boolean(
            environment.COMMERCE_CHECKOUT_ENABLED &&
            environment.STRIPE_SECRET_KEY?.startsWith("sk_test_"),
          ),
          canadaPostRatesConfigured: ratesConfigured,
          canadaPostLabelsConfigured: labelsConfigured,
          emailConfigured: Boolean(
            environment.RESEND_API_KEY && environment.EMAIL_FROM,
          ),
        }}
      />
    </div>
  );
}
