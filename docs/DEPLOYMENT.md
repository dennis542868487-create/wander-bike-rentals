# Wander Bike deployment

## 1. Supabase

Apply chronological migrations from `supabase/migrations/`. For the linked
project:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --include-all
```

Verify:

- `bike_listings`, `bike_listing_images`, and the private pickup table exist.
- `marketplace_requests` has the accepted-rental overlap constraint.
- `marketplace_safety_flags`, `marketplace_sensitive_terms`, and the private
  staff allowlist exist.
- all marketplace tables have RLS enabled and forced.
- `bike-listing-images` exists with its file size and MIME restrictions.
- browser code receives only the publishable key.
- `SUPABASE_SECRET_KEY` exists only in server environments.

The marketplace migration intentionally does not drop legacy commerce tables.
Archive those only in a separately reviewed migration after a backup.

## 2. Authentication

Follow `docs/AUTH_SETUP.md`. Test both Google and email/password on the exact
deployment host. Confirm a normal customer cannot access `/operations` or
`/admin`, and a Wander operator can access `/operations` but not `/admin`.
Confirm the two allowlisted roles are granted only after Google sign-in.

## 3. Vercel environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Exact canonical or Preview origin |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe publishable key |
| `SUPABASE_SECRET_KEY` | Server-only trusted key |
| `RESEND_API_KEY` | Resend server key |
| `EMAIL_FROM` | Verified sender |
| `EMAIL_REPLY_TO` | Optional reply address |
| `MARKETPLACE_NOTIFICATION_EMAIL` | Site-admin safety and platform mailbox |
| `CRON_SECRET` | Long random token used by Vercel Cron |

There are no Stripe, shipping, Canada Post, tax, cart, or checkout variables.

## 4. Resend and scheduled work

Follow `docs/RESEND_SETUP.md`. `vercel.json` invokes
`/api/cron/marketplace` daily. The cron:

1. queues pickup reminders for accepted rentals starting in the next 24 hours;
2. claims pending/failed outbox rows with `SKIP LOCKED`;
3. sends through Resend using an idempotency key;
4. records success or schedules retry backoff.

## 5. Preview and production

```bash
npm ci
npm run lint
npm run test:unit
npm run build
npm run test:e2e
npx vercel deploy
```

Test the exact Preview URL before deploying production:

```bash
npx vercel deploy --prod
```

The deployment does not add real bike data automatically. Wander operators add
Wander bikes and their actual photos through `/operations`; community owners
use `/account`.

## 6. Rollback

For an application regression:

```bash
npx vercel rollback PREVIOUS_DEPLOYMENT_URL_OR_ID --yes
```

Database migrations are forward-only. Correct an issue with a reviewed new
migration or restore through an explicit backup/PITR decision; do not manually
drop marketplace or legacy tables during an application rollback.
