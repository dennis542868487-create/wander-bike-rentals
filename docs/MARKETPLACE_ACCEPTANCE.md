# Marketplace acceptance checklist

## Public marketplace

- Header has Find a Bike, List Your Bike, and account access only.
- `/bikes/wander` contains only Wander listings.
- `/bikes/community` contains active community listings and is separate from
  the Wander catalog.
- Each bike shows only its own hourly, daily, and/or sale price.
- Rent-only, sale-only, and rent-or-sale listings render correctly.
- No cart, checkout, online payment, shipping, or delivery language appears.
- Public pages never show an exact owner pickup address.

## Account

- Google and email/password are the only sign-in methods.
- The same account can send requests and publish bikes.
- Community listings publish immediately without pre-approval.
- Photo upload enforces type, size, owner folder, and eight-photo limits.
- Owners can accept/decline requests and complete the local exchange.
- Riders can cancel eligible requests.
- Accepted riders can see pickup details; other riders cannot.

## Three workspaces

- Normal customers use `/account` for rentals, their bikes, incoming/outgoing
  requests, and profile settings.
- Wander operators use `/operations` for Wander bikes, requests, and pickups.
- Site administrators use `/admin` for platform listings, users, safety
  signals, and email.
- Normal customers cannot access `/operations` or `/admin`.
- Wander operators cannot access `/admin` and cannot manage community bikes.
- Mobile navigation has a visible close control, closes with Escape, locks body
  scroll, and is absent from the focus order when closed.
- Listing, request, user, and email views use mobile cards instead of a wide
  horizontal table.
- Filters have clear empty states and a clear/reset action.
- Only site administrators can manually pause listings, suspend marketplace
  access, dismiss safety signals, or mark them handled.
- Administrators cannot suspend or demote themselves in the UI.

## Safety

- Sensitive-text rules create an administrator signal and do not block
  publishing.
- Browser-local NSFWJS image checks create an administrator signal above the
  configured thresholds and do not block publishing.
- No signal automatically pauses a listing, rejects a submission, or suspends
  an account.
- Image checks are advisory and bypassable; the UI does not describe them as a
  complete content-safety guarantee.

## Data and notifications

- Two accepted rental requests cannot overlap for the same bike.
- An accepted purchase inquiry reserves the listing; completion marks it sold.
- Exact pickup data remains in the private details table.
- Resend events cover listing publication, safety signals, request
  creation/status, cancellation, and pickup reminders.
- Failed emails remain in the durable outbox and can be retried.
- Cross-origin mutations return 403 before authentication.

## Viewports

Run the public, account, and admin flows at desktop, tablet, and Pixel-sized
mobile widths. Confirm there is no unexpected horizontal page overflow and all
primary controls are at least 44 pixels tall.
