# Wander Bike sandbox acceptance record

This checklist is the evidence record for the commerce upgrade. A checked local
item proves only what the named command or inspection covers. Provider and
end-to-end items remain unchecked until they are exercised against Stripe test
mode, Canada Post sandbox, Resend, and the deployed Vercel application. Hosted
Supabase, protected-Preview, and browser smoke evidence is recorded separately
below.

Live Stripe keys and the Canada Post production host are explicitly outside this
acceptance run.

## Automated local evidence

- [x] `npm run lint`
- [x] `npm run test:unit` — 49 tests across pricing, fulfillment, validation,
      Canada Post request/response handling, and Stripe reconciliation
- [x] All migrations and `supabase/seed.sql` parse with `pgsql-parser`
- [x] `npm run build` — Next.js production build and TypeScript validation
- [x] `npm run test:e2e` — desktop Chrome, iPad, and Pixel 7 viewports
- [x] `npm audit --omit=dev` — zero production dependency vulnerabilities
- [x] Repository scan finds no supplied Stripe, Canada Post, Supabase, Resend, or
      webhook secrets in tracked changes

## Hosted Preview and Supabase evidence

- [x] The `ca-central-1` Supabase project is active, migrated, seeded, and linked
      to the protected Vercel Preview branch alias.
- [x] All 22 public tables have RLS enabled; client-mutatable table grants are
      absent, and privileged commerce functions are executable only by
      `service_role`.
- [x] Hosted storefront, shop, sandbox product, auth, booking, cart, checkout,
      robots, and sitemap routes return their expected content.
- [x] Cross-origin booking and merchant mutations return `403`; unauthenticated
      booking reads return `401`.
- [x] Hosted responses include CSP framing/object restrictions,
      `Permissions-Policy`, strict referrer policy, MIME sniffing protection,
      DNS prefetch control, `X-Frame-Options: DENY`, and Vercel HSTS.
- [x] Browser smoke confirms a two-unit cart totals `$178.00`, checkout fails
      closed behind the setup gate, Google is enabled, Apple is disabled as
      setup-needed, and no console warnings or errors are emitted.
- [x] The Google flow reaches Google's authorization endpoint and fails closed
      with `redirect_uri_mismatch`; the new Supabase callback still needs to be
      added in Google Cloud before sign-in can complete.

## Existing rental site and SEO

- [x] Existing rental, repair, guide, pricing, location, and booking routes still
      compile and render.
- [x] Browser tests cover core public pages without client exceptions.
- [x] Rental and commerce mutations reject cross-origin requests before auth.
- [x] The sitemap includes permanent commerce and repair pages while excluding
      sandbox product URLs.
- [ ] Create, update, and cancel a rental booking against the new Supabase
      project as a customer.
- [ ] Confirm the legacy staff rental calendar against the new hosted database.
- [ ] Crawl the deployed canonical domain and compare its important status codes,
      canonicals, robots directives, and sitemap with the pre-deploy site.

## Catalog, cart, checkout, and inventory

- [x] Product, variant, image, taxonomy, inventory, order, payment, shipment,
      refund, return, notification, setting, and audit schemas are migration
      backed.
- [x] Product and variant fulfillment eligibility covers pickup, local delivery,
      standard parcels, bicycle-size parcels, and special handling.
- [x] Cart quantity, search/filter behavior, and the disabled pre-setup checkout
      gate are browser tested on desktop, tablet, and mobile.
- [x] Checkout prices, shipping, and tax are recalculated on the server.
- [x] A client checkout request ID, database advisory lock, unique constraint,
      and Stripe idempotency key make identical checkout retries converge on one
      order and one Checkout Session.
- [x] Inventory reservations, sales, releases, refund restocks, adjustments, and
      ledger entries are implemented as database transactions.
- [ ] Exercise two concurrent hosted checkouts for the final unit and prove that
      only one reservation succeeds.
- [ ] Verify abandoned, expired, cancelled, and failed test checkouts release
      inventory.
- [ ] Verify successful payment converts the reservation exactly once.

## Stripe test mode

- [x] Hosted Checkout is hard-gated to `sk_test_` credentials and sandbox mode.
- [x] The success page is not trusted as payment confirmation.
- [x] Webhook signatures and test-mode events are verified before mutation.
- [x] Paid, pending, expired, asynchronous-failure, and refund events are
      idempotent in the database.
- [x] Webhooks can safely bind a Session when the provider response beats the
      initial database attachment.
- [x] Cron reconciliation checks Stripe before releasing a stale known Session.
- [x] A paid event cannot silently fulfill a cancelled order or an order whose
      tracked inventory reservation is missing.
- [ ] Create the deployed test webhook and save its signing secret in Vercel.
- [ ] Complete a successful test payment and confirm order/payment/inventory.
- [ ] Complete cancellation, expiry, and asynchronous failure tests.
- [ ] Replay the same verified webhook and prove no duplicate order, payment, or
      stock movement.
- [ ] Complete partial and full test refunds, including optional restock.

## Fulfillment and Canada Post sandbox

- [x] Pickup and configurable local-delivery eligibility and fees are
      server-validated.
- [x] Rate requests normalize Canadian postal codes and use server-resolved
      package weight and dimensions.
- [x] The 30 kg, 2 m per-side, and 3 m length-plus-girth limits match Canada
      Post's [domestic parcel restrictions](https://www.canadapost-postescanada.ca/cpc/en/support/articles/parcel-services-shipping-in-canada/size-and-weight-restrictions.page)
      and are enforced in catalog, cart, label, and database validation.
- [x] Provider errors, no-rate results, oversize/special products, and stale
      quotes fail closed.
- [x] Shipment creation validates Canada Post field limits and domestic service
      codes.
- [x] Initial requests and provider artifact URLs are hard-restricted to the
      official Canada Post sandbox HTTPS origin.
- [x] Label bytes must contain a plausible PDF signature and minimum length and
      cannot exceed the private bucket's 10 MB limit.
- [x] Shipment creation, cancellation, void, and refund uncertainty preserves
      idempotency state for reconciliation instead of inviting duplicate labels.
- [x] Multi-parcel numbering and stable package count are database-enforced.
- [ ] Obtain an actual Canada Post sandbox quote and save the selected quote.
- [ ] Create one accessory label and one separate large-item/bicycle label.
- [ ] Download and print the private PDF through the staff-only endpoint.
- [ ] Verify saved service, cost, shipment reference, and all tracking numbers.
- [ ] Exercise the account-appropriate void or refund path.
- [ ] Confirm pickup/local-delivery fallback when the sandbox returns no rate.

## Merchant console and customer access

- [x] Google and Apple buttons share the same PKCE callback and fail closed
      unless Supabase reports the provider as enabled.
- [x] Google is enabled in the new hosted Supabase project without committing
      its client secret; Apple remains disabled until its developer credentials
      are supplied.
- [x] The deployed auth page exposes the expected Google, Apple, and email
      states without client errors.
- [x] All merchant pages and mutations require a server-verified staff/admin
      profile role.
- [x] Order details consolidate payment, fulfillment, shipping, refund, return,
      tracking, notes, and notification actions.
- [x] Catalog, variants, images, taxonomy, fulfillment profiles, inventory
      adjustments, and inventory ledger are manageable from the console.
- [x] Store profile, hours, sales provinces, pickup, local delivery, taxes,
      shipping rules, notification address, and policies are configurable.
- [x] Data API column grants keep product cost, internal order notes, guest-token
      hashes, Stripe references, and provider artifact links out of customer
      queries.
- [ ] Create the first hosted admin and confirm an ordinary customer receives
      `403` from every merchant mutation tested.
- [ ] Complete common merchant workflows at desktop, tablet, and mobile widths.
- [ ] Confirm one customer cannot read another customer's booking or order.
- [ ] Confirm guest access works only with the matching order cookie.
- [ ] Complete Google and Apple provider logins on the deployed domain and
      confirm profile creation, callback routing, sign-out, and repeat sign-in.

## Notifications

- [x] A durable outbox and retry/claim lifecycle covers payment confirmation,
      payment failure, cancellation, preparation, pickup, tracking, shipping,
      delivery, refunds, and return updates.
- [x] Notification payloads are escaped before HTML rendering.
- [x] Merchant copies and manual resend actions are supported.
- [ ] Configure Resend, a verified sender, and the merchant inbox.
- [ ] Deliver every template to test recipients and verify retry behavior.
- [ ] Verify the Vercel Cron authorization and one scheduled invocation.

## Deployment and rollback

- [x] The Vercel project is linked and configured for Next.js on Node.js 24.
- [x] The GitHub remote is authenticated with repository admin access.
- [x] Commerce defaults to sandbox and checkout disabled.
- [x] The deployment and forward-only database rollback runbook is documented.
- [x] Create and migrate the new `ca-central-1` Supabase project, load the
      sandbox catalog, and run the hosted database advisors.
- [x] Push the completed implementation branch to GitHub.
- [ ] Configure all sandbox environment variables without exposing values.
- [x] Configure Supabase, sandbox feature flags, the stable Preview site URL,
      Canada Post sandbox base URL, and the cron secret without exposing values.
- [x] Deploy with Vercel CLI, keep the deployment target as Preview, and inspect
      the terminal deployment result.
- [x] Run hosted page, API-origin, auth-state, security-header, cart, checkout
      gate, and RLS/grant smoke checks.
- [ ] Run Stripe, Canada Post, email, complete OAuth, admin, and full hosted
      end-to-end acceptance checks after their external configuration is ready.
- [ ] Record the final Preview deployment and its immediately previous rollback
      target after the last application change is deployed.

## Required merchant inputs

- Valid Stripe test secret and the deployed test-webhook signing secret
- Add `https://gvuaitmjpenggvosshqm.supabase.co/auth/v1/callback` to the Google
  OAuth client's authorized redirect URIs
- Apple Developer Team ID, App ID, Services ID, signing Key ID, and `.p8` key
- Valid Canada Post sandbox API key/secret, account type, and Customer Number;
  Contract ID, Group ID, and MOBO Customer Number when applicable
- Initial admin email
- Resend API key, verified sender, and merchant notification inbox
- Business hours, pickup instructions, sales provinces, local-delivery postal
  prefixes and fee
- Approved tax rules and customer-facing policies
- Actual sellable-product weights, parcel dimensions, and fulfillment
  eligibility
