# Wander Bike authentication setup

## What is already implemented

- Public visitors can browse every marketing page without an account.
- Customers must sign in before submitting a booking.
- Customers can view, edit, and cancel only their own bookings at `/account/bookings`.
- Staff use `/booking-admin`. A signed-in account must also have the `staff` or `admin` database role.
- Email/password registration and sign-in use Supabase Auth.
- Google sign-in uses the same accounts and role checks as email sign-in.

## Supabase URL configuration

Open **Supabase Dashboard → Authentication → URL Configuration**.

- Site URL: `https://wanderbike.ca`
- Redirect URLs:
  - `https://wanderbike.ca/auth/callback`
  - `http://localhost:3000/auth/callback`

Email confirmation is enabled. Supabase sends the confirmation email and returns the customer to the callback URL.

## Enable Google sign-in

Creating a Google OAuth client does not require a paid Google Cloud API.

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Open **APIs & Services → OAuth consent screen** and configure an External app.
4. Open **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
5. Choose **Web application**.
6. Add this exact **Authorized redirect URI**:

   `https://vasdytokidqkoakhbeau.supabase.co/auth/v1/callback`

7. Copy the Google Client ID and Client secret.
8. Open **Supabase Dashboard → Authentication → Providers → Google**.
9. Enable Google, paste the Client ID and Client secret, and save.

The website checks Supabase's provider settings automatically. The Google button becomes active after the provider is enabled; no code change is required.

## Create customer and staff accounts

Customer accounts are created from `/auth`. New accounts receive the `customer` role automatically.

Staff can use either email/password or Google. First let the employee create/sign in to their account once, then grant access with the Supabase SQL Editor:

```sql
update public.profiles
set role = 'staff', updated_at = now()
where email = 'employee@example.com';
```

Use `admin` instead of `staff` only for owners who should have the highest application role.

To remove staff access:

```sql
update public.profiles
set role = 'customer', updated_at = now()
where email = 'employee@example.com';
```

The staff calendar is intentionally not linked from the public navigation. Enter it directly at:

`https://wanderbike.ca/booking-admin`

Knowing that URL is not enough to gain access; the server verifies the Supabase session and role on every admin API request.

## Production email delivery

Supabase's built-in email provider is sufficient for initial confirmation testing. Before higher-volume production use, configure a custom SMTP provider under **Authentication → Email** for branded messages and dependable delivery.
