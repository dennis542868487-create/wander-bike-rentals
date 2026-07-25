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
- `http://localhost:3000/auth/callback`

Add a Vercel preview callback only when a specific preview deployment needs
authentication. Avoid a broad redirect wildcard.

Choose whether email confirmation is required in the Supabase dashboard. The
application supports both configurations and completes PKCE sessions at
`/auth/callback`.

## Optional Google sign-in

Create a Google OAuth web client and use this authorized redirect URI, replacing
the placeholder with the new project reference:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

Enable Google under **Supabase Dashboard → Authentication → Providers** and
store the Google secret there, not in this repository.

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

The consolidated merchant console is `/admin`. The legacy rental calendar at
`/booking-admin` remains role-protected for continuity.

## Production email

Supabase Auth email and commerce transaction email are separate:

- Configure custom SMTP in Supabase before relying on high-volume Auth email.
- Configure Resend with `RESEND_API_KEY` and a verified `EMAIL_FROM` domain for
  order and fulfillment messages.
