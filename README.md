# Wander Bike Marketplace

Wander Bike is a free local bike marketplace for Richmond, BC. Wander can list
its own bikes and signed-in community members can list theirs. Every bike has
independent photos, availability, and pricing and can be offered for rental,
sale, or both.

The platform does not process payments or arrange shipping. A rider sends a
request, the owner accepts or declines, and both parties complete pickup,
inspection, and payment in person.

## Product structure

- `/bikes/wander` — bikes listed by the Wander team
- `/bikes/community` — bikes listed by local owners
- `/bikes/[slug]` — bike details and rent/buy request
- `/list-your-bike` — listing introduction
- `/account` — customer workspace for renting and listing
- `/operations` — Wander Bike inventory, requests, and pickup operations
- `/admin` — site administration, safety signals, users, and email

These are three separate responsive workspaces. A normal account can both rent
and list bikes. Wander operators manage only Wander-owned bikes and related
requests. Site administrators manage platform access, safety signals, and
system operations.

## Stack

- Next.js 16 App Router and React 19
- Supabase PostgreSQL, Auth, Storage, and RLS
- Google OAuth and email/password authentication
- Resend with a durable PostgreSQL outbox
- Vercel hosting and a daily notification cron

Use Node.js `>=22`:

```bash
npm install
cp .env.example .env.local
npm run dev
```

When Supabase variables are absent, public pages use clearly local demo
listings so visual development remains possible. Authenticated mutations never
fall back to demo storage or data.

## Database

Migration files in `supabase/migrations/` are the schema source of truth:

```bash
npx supabase start
npx supabase db reset
```

The marketplace migration is additive. Legacy commerce tables remain in the
historical migration chain and existing database until a separate backup and
archival decision is approved; the current application does not read or write
them.

Community listings publish immediately. Text rules and the browser-local
NSFWJS image classifier can create advisory safety signals for the site
administrator, but never hide a listing, reject it, or suspend an account
automatically. Only a site administrator can take those actions manually.
Exact pickup addresses are stored separately and shown only to the owner,
authorized Wander operators or administrators, and an accepted rider.

## Verification

```bash
npm run lint
npm run test:unit
npm run build
npm run test:e2e
```

See:

- `docs/AUTH_SETUP.md`
- `docs/RESEND_SETUP.md`
- `docs/DEPLOYMENT.md`
- `docs/MARKETPLACE_ACCEPTANCE.md`

Never commit `.env.local`, Supabase secret keys, Resend keys, OAuth secrets, or
cron secrets.
