# Wander Bike authentication setup

## Access model

- Public visitors can browse rental and shop pages without an account.
- Guest checkout is supported.
- Signed-in customers can manage only their own rental requests and view only
  their own sales orders.
- `staff` can perform day-to-day order and inventory work.
- `admin` is required for higher-risk catalog taxonomy and store-setting changes.
- Every protected page and mutation is checked on the server; knowing an admin
  URL is not authorization.

## Supabase URL configuration

In **Supabase Dashboard → Authentication → URL Configuration**, set the
production site URL to the chosen canonical domain and allow all callbacks used
by the project:

- `https://www.wanderbike.ca/auth/callback`
- `https://wanderbike.ca/auth/callback`
- `https://wander-bike-rentals-git-co-75a04a-zyz18922182165-4022s-projects.vercel.app/auth/callback`
- `http://localhost:3000/auth/callback`

The exact protected branch alias above is the sandbox-acceptance callback. Add
other Vercel preview callbacks only when a specific deployment needs
authentication. Avoid a broad redirect wildcard.

Choose whether email confirmation is required in the Supabase dashboard. The
application supports both configurations and completes PKCE sessions at
`/auth/callback`.

## Google and Apple sign-in

Both buttons use the Supabase PKCE flow and return through `/auth/callback`.
They stay disabled until the corresponding provider is enabled in the hosted
Supabase project.

### Google

The sandbox project uses this authorized redirect URI:

```text
https://gvuaitmjpenggvosshqm.supabase.co/auth/v1/callback
```

Enable Google under **Supabase Dashboard → Authentication → Providers** and
store the Google secret there, not in this repository.

The Google Cloud project `wander-bike-booking-auth` now includes that callback
on the `Wander Bike Supabase Auth` web client, and Google is enabled in the new
Supabase project. A real hosted sign-in completed on the protected Preview,
created the expected profile, and returned through `/auth/callback`.

### Apple

The sandbox identity is configured with:

- Team ID: `3Y33Y8TYG6`
- primary App ID: `ca.wanderbike.auth`
- Services ID / OAuth client ID: `ca.wanderbike.auth.web`
- signing Key ID: `DF56T8CQLD`
- website domain: `gvuaitmjpenggvosshqm.supabase.co`
- return URL:
  `https://gvuaitmjpenggvosshqm.supabase.co/auth/v1/callback`

The generated Apple client secret is stored only in Supabase and expires on
January 20, 2027. Rotate it before that date and retain the one-time-download
`.p8` key securely outside the repository. Register the eventual Wander Bike
sending domain with Apple's private email relay before sending transactional
email to hidden Apple relay addresses. The real hosted flow reaches Apple's
authorization page with the expected Services ID and callback; completing the
password or Passkey prompt remains a manual acceptance step.

## Create the first administrator

1. Register the owner through `/auth` and sign in once so the profile exists.
2. Run the following in the Supabase SQL editor, replacing the email:

```sql
update public.profiles
set role = 'admin', updated_at = now()
where lower(email) = lower('owner@example.com');
```

Confirm that exactly one intended row changed. Additional employees normally
receive `staff`:

```sql
update public.profiles
set role = 'staff', updated_at = now()
where lower(email) = lower('employee@example.com');
```

To revoke access, change the role back to `customer`.

The first protected-Preview administrator is
`zyz18922182165@gmail.com`. Its Google-created profile was promoted to `admin`
and the consolidated merchant console was verified.

The consolidated merchant console is `/admin`. The legacy rental calendar at
`/booking-admin` remains role-protected for continuity.

## Production email

Supabase Auth email and commerce transaction email are separate:

- Configure custom SMTP in Supabase before relying on high-volume Auth email.
- Configure Resend with `RESEND_API_KEY` and a verified `EMAIL_FROM` domain for
  order and fulfillment messages.
