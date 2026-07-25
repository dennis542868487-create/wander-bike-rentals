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

## Google and Apple sign-in

Both buttons use the Supabase PKCE flow and return through `/auth/callback`.
They stay disabled until the corresponding provider is enabled in the hosted
Supabase project.

### Google

Create a Google OAuth web client and use this authorized redirect URI,
replacing the placeholder with the new project reference:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

Enable Google under **Supabase Dashboard → Authentication → Providers** and
store the Google secret there, not in this repository.

The supplied Google credential file has the expected web-client fields, but its
saved redirect URI points at a different Supabase project. Update the OAuth
client in Google Cloud after the new project exists; editing the downloaded JSON
file alone does not change Google's configuration.

### Apple

Sign in with Apple for this website requires an active Apple Developer Program
membership and:

- the 10-character Team ID
- a primary App ID with the Sign in with Apple capability enabled
- a Services ID for the website
- the signing Key ID and its one-time-download `.p8` private key

Configure the Services ID website domain as the new project's
`YOUR_PROJECT_REF.supabase.co` hostname and its return URL as:

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

The Services ID is the Apple client ID. The Team ID, Key ID, Services ID, and
`.p8` key are used to generate the client secret stored only in Supabase. Apple
OAuth client secrets expire after six months, so schedule rotation and retain
the `.p8` file securely. Register the Wander Bike sending domain with Apple's
private email relay before sending transactional email to hidden Apple relay
addresses.

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
