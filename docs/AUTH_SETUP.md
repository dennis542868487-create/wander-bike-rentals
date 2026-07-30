# Wander Bike authentication

## Supported sign-in methods

The application intentionally exposes only:

- Google OAuth
- Email and password

Do not enable or add Apple, Facebook, phone, or other provider buttons without
a new product decision. The same normal account can request bikes and publish
community listings.

## Supabase URL configuration

In **Supabase Dashboard → Authentication → URL Configuration**, set the
production site URL to the canonical domain and allow only the callbacks that
are actually used:

```text
https://www.wanderbike.ca/auth/callback
https://wanderbike.ca/auth/callback
https://*-zyz18922182165-4022s-projects.vercel.app/**
http://localhost:3000/**
http://127.0.0.1:3000/**
http://localhost:3100/**
http://127.0.0.1:3100/**
```

The Vercel pattern is constrained to this account slug and supports generated
Preview deployment hostnames. Keep production callbacks exact.

The application uses PKCE. Email confirmation may be required or disabled in
the Supabase dashboard; both paths return through `/auth/callback`.

## Google

Use this OAuth redirect URI in the Google Cloud web client:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

Enable Google in **Supabase Dashboard → Authentication → Providers** and keep
the Google client secret in Supabase, never in this repository.

## Email

Email/password signup uses Supabase Auth email confirmation when confirmation
is enabled. Configure a custom SMTP provider before depending on production
Auth email volume. Supabase Auth email is separate from marketplace event email
sent through Resend.

## Wander operator and site administrator roles

The marketplace migration contains a private allowlist for the three Google
accounts approved for privileged access:

- `zys1389@gmail.com` → Wander Bike operator (`staff`) and `/operations`
- `dennis18922182165@gmail.com` → Wander Bike operator (`staff`) and `/operations`
- `zyz18922182165@gmail.com` → site administrator (`admin`) and `/admin`

Role synchronization requires the Supabase Auth identity to report Google as a
provider. Signing in with email/password using the same email address does not
grant a privileged role. After applying the migration, sign in with Google and
confirm the role in `public.profiles`.

Role authorization always comes from `public.profiles` and the private
allowlist, never from user-editable auth metadata. A site administrator can
change ordinary user roles in the UI, but only administrators can manage
platform access and staff cannot enter `/admin`.
