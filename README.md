This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Booking and account setup

The public booking form lives at `/booking`. Customers sign in at `/auth` and
manage their own requests at `/account/bookings`. The private staff calendar
lives at `/booking-admin` and requires a `staff` or `admin` role.

1. Create a Supabase project and run `supabase/schema.sql` in its SQL Editor.
2. Configure Supabase Auth redirect URLs and optional Google OAuth.
3. Copy `.env.example` to `.env.local` and add the Supabase values. Keep the
   secret key server-only.
4. Add the same variables to the Vercel project.

Public visitors can only submit requests through the server route. The bookings
table has RLS enabled and grants no direct access to browser roles.

See `docs/AUTH_SETUP.md` for the exact Google callback URL, staff-role commands,
and the private staff entry URL.
