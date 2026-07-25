# Wander Bike deployment and rollback

This runbook keeps payments and shipping in test mode. It does not authorize a
Stripe live key or the Canada Post production API.

## 1. Required merchant decisions

Before a real-customer launch, confirm:

- Store and shipping-origin address
- Business hours and pickup instructions
- Canadian sales provinces
- Local-delivery postal prefixes and fee
- Tax rates and whether tax is included in displayed prices
- Free/fixed shipping rules
- Actual bicycle and accessory package dimensions and weights
- Canada Post account type (`contract` or `non_contract`) and applicable IDs
- Customer-service and notification email
- Shipping, refund, privacy, terms, and return policies
- Initial owner/admin email

These values are managed at `/admin/settings`; they are not hard-coded into the
storefront.

## 2. Supabase

Create a new project in `ca-central-1`, then apply all migration files in
timestamp order. The test seed may be loaded only while
`COMMERCE_SANDBOX_MODE=true`.

CLI equivalent:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --include-all --include-seed
npx supabase config push --project-ref YOUR_PROJECT_REF
```

Configure the Auth URLs in `docs/AUTH_SETUP.md`, create the first administrator,
and verify:

- RLS is enabled on customer, order, inventory, and operational tables.
- `product-images` exists as the public product-image bucket.
- Browser code receives only the publishable key.
- `SUPABASE_SECRET_KEY` exists only in server/deployment environments.

## 3. Vercel environment

Set these for the intended Vercel environments. Secrets must be entered through
Vercel CLI or the dashboard, never committed.

| Variable | Sandbox value or purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Exact Preview URL during acceptance; canonical domain only for Production |
| `NEXT_PUBLIC_SUPABASE_URL` | New project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | New publishable key |
| `SUPABASE_SECRET_KEY` | Server-only new secret key |
| `COMMERCE_SANDBOX_MODE` | `true` |
| `COMMERCE_DEMO_CATALOG` | `true` during sandbox acceptance |
| `COMMERCE_CHECKOUT_ENABLED` | Start `false`; change to `true` only for test acceptance |
| `STRIPE_SECRET_KEY` | Stripe `sk_test_…` key |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for the deployed webhook |
| `CANADA_POST_USERNAME` | Canada Post sandbox API key/username |
| `CANADA_POST_PASSWORD` | Canada Post sandbox secret/password |
| `CANADA_POST_ACCOUNT_TYPE` | `contract` or `non_contract` |
| `CANADA_POST_CUSTOMER_NUMBER` | Account customer number |
| `CANADA_POST_MOBO_CUSTOMER_NUMBER` | Optional mailed-on-behalf-of number |
| `CANADA_POST_CONTRACT_ID` | Required for applicable contract shipments |
| `CANADA_POST_GROUP_ID` | Required when the account workflow uses a group |
| `CANADA_POST_API_BASE` | `https://ct.soa-gw.canadapost.ca` |
| `RESEND_API_KEY` | Resend server key |
| `EMAIL_FROM` | Verified sender, for example `Wander Bike <orders@domain>` |
| `ORDER_NOTIFICATION_EMAIL` | Fallback merchant notification address |
| `CRON_SECRET` | Long random secret for the commerce cron |

The database setting `commerce.checkout_enabled` is a second checkout gate.
Both it and the environment gate must be enabled for test checkout.

### Current Preview acceptance host

The protected branch alias used for sandbox acceptance is:

```text
https://wander-bike-rentals-git-co-75a04a-zyz18922182165-4022s-projects.vercel.app
```

Keep Vercel Standard Protection enabled. Use a short-lived, revocable Vercel
share link for reviewers rather than weakening project protection. Supabase,
the demo catalog, cart, and the non-provider API checks are connected on this
host. Stripe checkout, Canada Post labels, and transactional email remain
fail-closed until valid sandbox credentials are configured.

After the final documentation-only commit is deployed, use the last validated
CLI Preview as the rollback candidate:

```text
dpl_6b3kEp8Nodw7Ciao9jkdk9FMEYuv
https://wander-bike-rentals-nabzclby5-zyz18922182165-4022s-projects.vercel.app
```

## 4. Stripe test webhook

Create a test-mode webhook endpoint using the exact deployed host:

```text
https://YOUR_DEPLOYMENT_HOST/api/stripe/webhook
```

Subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.expired`
- `checkout.session.async_payment_failed`
- `refund.created`
- `refund.updated`
- `refund.failed`

Copy its signing secret to `STRIPE_WEBHOOK_SECRET`. Do not treat the browser
success redirect as payment confirmation; the application waits for verified
webhook reconciliation.

## 5. Deploy with Vercel CLI

From the repository root:

```bash
npm ci
npm run test:all
npx vercel pull --yes
npx vercel deploy
```

This creates a Preview deployment and does not change the production alias.
After sandbox acceptance and a separate production approval, use
`npx vercel deploy --prod`. Verify the exact URL returned by the CLI before
changing DNS or aliases.

## 6. Sandbox acceptance

Verify at desktop, tablet, and mobile widths:

1. Existing rental pages, booking, guides, location, and redirects.
2. Search/filter, variant selection, cart quantity, and guest checkout.
3. Stripe test success, cancellation, failure/expiry, and duplicate-webhook
   handling.
4. Inventory reservation, release, sale, adjustment, and low-stock display.
5. Pickup and eligible/ineligible local-delivery addresses.
6. Canada Post sandbox quote, multiple parcel labels, PDF download, tracking,
   and eligible void/refund flow.
7. Full and partial refunds plus return status updates.
8. Customer and merchant email events, including retry from the durable outbox.
9. Customer isolation, staff/admin authorization, and cross-origin mutation
   rejection.

Do not enable live Stripe or Canada Post credentials as part of this checklist.

## 7. Rollback

For an application regression:

```bash
npx vercel rollback PREVIOUS_DEPLOYMENT_URL_OR_ID --yes
```

For a commerce incident, also set `COMMERCE_CHECKOUT_ENABLED=false` immediately
and redeploy/restart the production environment. Keep Canada Post disabled in
`/admin/settings` if shipping is implicated.

Database migrations are forward-only. Do not manually drop commerce tables or
restore an old schema over new orders. Correct a migration with a reviewed new
migration; use a Supabase backup or point-in-time recovery only through an
explicit incident decision.
