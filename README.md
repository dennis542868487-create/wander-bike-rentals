# Wander Bike Rentals

Wander Bike is a single Next.js website for bike rentals, retail, repair
information, customer accounts, and merchant operations. Commerce is
sandboxed by default: the repository must not capture live payments or buy
production shipping labels until the merchant explicitly approves go-live.

## What is included

- Existing rental, repair, guide, location, and SEO pages
- Rental requests and customer booking history
- Product catalog, variants, sortable images, search, filters, cart, and guest checkout
- Per-variant pickup/delivery eligibility plus standard, large, and special packing rules
- Atomic inventory reservations and a merchant-visible immutable inventory ledger
- Stripe-hosted Checkout, verified webhooks, and full or partial refunds
- Store pickup, configurable local delivery, and Canada Post sandbox shipping
- Multi-package labels, PDFs, tracking, voids, and refund requests
- Customer order status and account order history
- Role-protected merchant dashboard for orders, catalog, stock, and settings
- Durable Resend notification outbox with Vercel Cron retries
- Supabase Auth, PostgreSQL migrations, Storage, RLS, and server-side role checks

## Stack

- Next.js 16 App Router and React 19
- Supabase PostgreSQL, Auth, and Storage
- Stripe Checkout in test mode
- Canada Post REST/XML APIs in sandbox
- Resend transactional email
- Vercel hosting and Cron

Use Node.js `>=22`. Next.js 16 supports Node 20.9+, but the current Supabase
JavaScript client no longer supports Node 20. Install and run locally:

```bash
npm install
cp .env.example .env.local
npm run dev
```

The site is available at `http://localhost:3000`.

## Supabase

The chronological files in `supabase/migrations/` are the only schema source of
truth. `supabase/schema.sql` is a legacy pointer and must not be run as a
standalone schema.

For a local Supabase stack:

```bash
npx supabase start
npx supabase db reset
```

For a new linked cloud project:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --include-all --include-seed
```

The seed is deliberately marked `[TEST]` and enables only the sandbox catalog.
Do not load it into a live customer catalog.

## Safety gates

All three conditions are required before Stripe Checkout can open:

- `COMMERCE_SANDBOX_MODE=true`
- `COMMERCE_CHECKOUT_ENABLED=true`
- `commerce.checkout_enabled=true` in merchant settings

Keep `COMMERCE_CHECKOUT_ENABLED=false` until Supabase migrations, the Stripe
test webhook, and sandbox order reconciliation have been verified. Canada Post
uses its sandbox host by default and independently requires
`fulfillment.canada_post_enabled=true`.

## Verification

```bash
npm run lint
npm run test:unit
npm run build
npm run test:e2e
```

`npm run test:e2e` exercises production-rendered desktop Chrome and a Pixel 7
viewport. `npm run test:all` runs the full sequence.

## Operations and deployment

- Authentication and first-admin setup: `docs/AUTH_SETUP.md`
- Environment, sandbox validation, Vercel CLI deployment, and rollback:
  `docs/DEPLOYMENT.md`
- Requirement-by-requirement evidence and pending hosted checks:
  `docs/SANDBOX_ACCEPTANCE.md`

Never commit `.env.local`, Supabase secret keys, Stripe secrets, Canada Post
credentials, Resend keys, or webhook signing secrets.
