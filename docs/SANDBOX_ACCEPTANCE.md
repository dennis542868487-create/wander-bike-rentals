# Wander Bike sandbox acceptance record

This checklist is the evidence record for the commerce upgrade. A checked local
item proves only what the named command or inspection covers. Hosted Supabase,
protected-Preview, Stripe test, Canada Post Test-app, and browser evidence is
recorded separately below. Resend and the final manual Apple authorization
remain intentionally incomplete.

Live Stripe keys and the Canada Post production host are explicitly outside this
acceptance run.

## Automated local evidence

- [x] `npm run lint`
- [x] `npm run test:unit` — 81 tests across pricing, fulfillment, validation,
      Canada Post request/response handling, Stripe reconciliation, signed
      Stripe webhook routing, notification templates/outbox, and commerce Cron
      authorization
- [x] All migrations and `supabase/seed.sql` parse with `pgsql-parser`
- [x] `npm run build` — Next.js production build and TypeScript validation
- [x] `npm run test:e2e` — 21 checks across desktop Chrome, iPad, and Pixel 7
      viewports, including self-referential canonical and Open Graph URLs
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
- [x] The Supabase public Auth settings endpoint reports Google, Apple, and email
      enabled after both OAuth callbacks and provider credentials were
      configured.
- [x] Repeat the protected-Preview browser smoke after the provider/environment
      deployment and complete a real Google sign-in.
- [ ] Complete the final Apple password or Passkey authorization step. The
      hosted flow already reaches Apple's page with the expected Services ID
      and Supabase callback.

## Existing rental site and SEO

- [x] Existing rental, repair, guide, pricing, location, and booking routes still
      compile and render.
- [x] Browser tests cover core public pages without client exceptions.
- [x] Rental and commerce mutations reject cross-origin requests before auth.
- [x] The sitemap includes permanent commerce and repair pages while excluding
      sandbox product URLs.
- [x] Create, update, and cancel a rental booking against the new Supabase
      project as a customer.
- [x] Confirm and edit the same booking in the legacy staff rental calendar
      against the new hosted database.
- [x] Crawl 15 important routes on the deployed canonical domain and protected
      Preview: all return `200`. The Preview normalizes canonicals, robots host,
      sitemap host, and Open Graph URLs to the final redirect target
      `https://www.wanderbike.ca`; all four guide pages now self-canonicalize.
      The sitemap preserves the 14 existing URLs and adds only `/shop` and
      `/quick-bike-repair-richmond`.

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
- [x] Execute a hosted staff `+1` inventory adjustment, verify the immutable
      ledger and audit path, then execute `-1` to restore the test stock to 5.
- [x] Exercise every commerce `RETURNS TABLE` function, including the
      notification claim path inside a rolled-back transaction; checkout,
      refund, inventory, and outbox calls complete without output-column
      ambiguity.
- [x] Exercise two concurrent hosted checkouts for the final unit and prove that
      only one reservation succeeds.
- [x] Verify a cancelled Stripe return keeps the cart, then expire the open
      Session and confirm the signed webhook cancels the order and releases all
      reserved inventory.
- [x] Verify successful payment converts the reservation exactly once.

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
- [x] Create the deployed test webhook for all required events and save its
      signing secret in the protected Vercel Preview branch.
- [x] Complete a successful test payment and confirm order/payment/inventory.
- [x] Complete cancellation and provider expiry tests.
- [x] Route a cryptographically signed `checkout.session.async_payment_failed`
      fixture through the verified webhook handler, and exercise the hosted
      atomic failure RPC against a real open Session. The order changed to
      cancelled/failed, its one reservation was released, the inventory ledger
      and failure notification each gained one row, and replay returned
      `duplicate`.
- [ ] Complete a provider-generated asynchronous payment failure after the
      Stripe sandbox account is activated and ACSS/PAD becomes available.
      The current CA/CAD sandbox reports `charges_enabled=false`; ACSS is
      unavailable, and real Checkout Sessions currently expose only card,
      Affirm, Klarna, and Link.
- [x] Replay the same verified webhook and prove no duplicate order, payment, or
      stock movement.
- [x] Complete a full test refund with inspected-item restock and confirm
      `refund.created` and `refund.updated` webhook reconciliation.
- [x] Complete a separate partial test refund, verify the intermediate
      `partially_refunded` state, then refund the balance and restore stock.

## Fulfillment and Canada Post sandbox

- [x] Pickup and configurable local-delivery eligibility and fees are
      server-validated.
- [x] Rate requests normalize Canadian postal codes and use server-resolved
      package weight and dimensions.
- [x] The client uses the April 2026 Developer Portal REST/JSON API, OAuth 2.0
      client credentials, bounded token caching, and a single refresh on `401`;
      the obsolete XML/Basic Auth client and dependency were removed.
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
- [x] Obtain a real Test-app OAuth token and direct rating quote from the current
      Canada Post API.
- [x] Create a direct Test-app shipment and receive a sandbox shipment ID,
      tracking PIN, label, price, and resource links without billing.
- [x] Obtain and save a selected Canada Post quote through the hosted checkout.
- [x] Create an accessory label through the merchant console.
- [ ] Create a separate large-item/bicycle label.
- [x] Download the private PDF through the staff-only endpoint. Unauthenticated
      access returned `401`, an authenticated customer returned `403`, and an
      administrator received the expected 55,371-byte `%PDF-` document.
- [ ] Physically print the downloaded sandbox label.
- [x] Verify the private bucket contains a 55,371-byte `application/pdf` label
      and saved service, cost, shipment reference, and tracking number.
- [x] Exercise the account-appropriate sandbox void path and confirm its audit
      event.
- [x] Confirm carrier failures add no shipping charge and expose only safe
      alternatives. An empty provider result returns
      `CANADA_POST_NO_RATES`; the hosted out-of-region check stayed disabled for
      payment, offered contact, and switched successfully to free pickup. The
      local-delivery action appears only when the merchant enables an eligible
      delivery area.

## Merchant console and customer access

- [x] Google and Apple buttons share the same PKCE callback and fail closed
      unless Supabase reports the provider as enabled.
- [x] Google and Apple are enabled in the new hosted Supabase project without
      committing either provider secret.
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
- [x] Create the first hosted admin, complete Google login, and verify the
      merchant order, refund, return, label, inventory, and rental-calendar
      workflows.
- [x] Confirm a real short-lived customer JWT receives `403` from all 15
      merchant mutation routes, plus the staff-only label read. The temporary
      identity was deleted after the matrix.
- [x] Complete the merchant overview and sales-order workflow at desktop,
      tablet, and mobile widths in authenticated Chrome. Navigation remains
      usable, the order filters stack at narrow widths, the wide table scrolls
      inside its own container, a mobile order-number filter returned exactly
      one row, and the console remained clear.
- [x] Confirm one customer cannot read another customer's booking or order.
      Order RLS returned zero of four non-owned orders, the profile query
      returned only the caller, and another user's booking PATCH/DELETE both
      returned `404`.
- [x] Confirm guest access works only with the matching order cookie; missing
      and mismatched cookies both receive `404`.
- [x] Complete Google provider login on the deployed domain and confirm profile
      creation, callback routing, and merchant authorization.
- [ ] Complete Apple authorization, sign-out, and repeat-sign-in checks.

## Notifications

- [x] A durable outbox and retry/claim lifecycle covers payment confirmation,
      payment failure, cancellation, preparation, pickup, tracking, shipping,
      delivery, refunds, and return updates.
- [x] Notification payloads are escaped before HTML rendering.
- [x] Merchant copies and manual resend actions are supported.
- [x] Render all 13 notification templates in HTML and plain text, reject an
      unknown template, restrict tracking links to HTTPS, preserve a stable
      provider idempotency key, and return simulated provider failures to the
      durable queue.
- [ ] Configure Resend, a verified sender, and the merchant inbox.
- [ ] Deliver every template to test recipients and verify retry behavior.
- [x] Verify missing and incorrect Cron bearer credentials are rejected before
      Stripe, database, or notification side effects; verify the authorized
      maintenance path invokes all three services. The hosted Preview returned
      `401` for missing/incorrect credentials; after rotating the branch secret,
      the correct credential entered maintenance and then returned `500`
      because Resend is intentionally not configured.
- [ ] Observe one automatic Vercel Cron invocation after a Production
      deployment is explicitly approved. [Vercel does not schedule Cron Jobs
      for Preview deployments](https://vercel.com/docs/cron-jobs/quickstart).

## Deployment and rollback

- [x] The Vercel project is linked and configured for Next.js on Node.js 24.
- [x] The GitHub remote is authenticated with repository admin access.
- [x] Commerce defaults to sandbox and checkout disabled.
- [x] The deployment and forward-only database rollback runbook is documented.
- [x] Create and migrate the new `ca-central-1` Supabase project, load the
      sandbox catalog, and run the hosted database advisors.
- [x] Push the completed implementation branch to GitHub.
- [ ] Configure the remaining Resend sandbox variables without exposing values.
- [x] Configure Stripe and Canada Post Test-app branch environment variables
      without exposing values.
- [x] Configure Supabase, sandbox feature flags, the stable Preview site URL,
      Canada Post Test-app API base, and the cron secret without exposing
      values.
- [x] Deploy with Vercel CLI, keep the deployment target as Preview, and inspect
      the terminal deployment result.
- [x] Run hosted page, API-origin, auth-state, security-header, cart, checkout
      gate, and RLS/grant smoke checks.
- [x] Run Stripe payment/refund, Canada Post quote/label/void, Google OAuth,
      admin, return, inventory, and rental hosted end-to-end acceptance checks.
- [ ] Run Resend delivery and final Apple authorization checks after their
      remaining external inputs are ready.
- [x] Record the stable protected Preview acceptance host and the last validated
      CLI Preview (`dpl_2iAK5fzvUMi1ijEw1Qw6B6uAKnVA`) as the rollback
      candidate for the final acceptance deployment.

## Remaining merchant inputs

- Resend API key, verified sender, and merchant notification inbox
- Business hours, pickup instructions, sales provinces, local-delivery postal
  prefixes and fee
- Approved tax rules and customer-facing policies
- Actual sellable-product weights, parcel dimensions, and fulfillment
  eligibility
- Stripe account activation/business verification before a provider-generated
  ACSS/PAD asynchronous-failure acceptance run
- A Supabase Pro plan before enabling leaked-password protection for
  password-based accounts. The security advisor is otherwise clear;
  unused-index notices are expected on this new sandbox project.

## Hosted transaction evidence

- Test order `WB-260725-001000` captured and then refunded CAD 124.70.
- Test order `WB-260725-001001` captured CAD 178.00, entered a verified
  CAD 89.00 partial-refund state, then refunded the remaining CAD 89.00 and
  restored its two units to sellable stock.
- Cancelling and expiring test order `WB-260725-001002` processed one signed
  `checkout.session.expired` event and released its two reserved units.
- Two simultaneous three-unit checkouts against five available units produced
  exactly one `201` and one `409`; expiring the accepted Session returned the
  inventory to five available units.
- Test order `WB-260725-001004` exercised the asynchronous-failure state
  transition against a real open Stripe Session: one reservation was released,
  inventory returned to five, one failure notification was queued, and replay
  was idempotent. The provider-generated event remains gated by Stripe account
  activation.
- Replaying the signed `checkout.session.completed` event left one order, one
  payment, one sale ledger entry, and one integration-event row.
- The completed return restored the test helmet inventory from 4 to 5 with zero
  reserved units.
- A staff adjustment moved the USB light from 5 to 6 and back to 5, with both
  changes preserved in the inventory ledger.
- Canada Post quote `DOM.RP` was saved, one sandbox label was stored privately,
  and the unused label was voided.
- Rental booking creation, customer edit, admin confirmation, and customer
  cancellation all completed against the hosted `ca-central-1` project.
