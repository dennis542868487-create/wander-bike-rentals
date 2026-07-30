# Resend setup

Marketplace event email uses Resend and the PostgreSQL
`marketplace_notification_outbox`. Supabase Auth confirmation email remains a
separate Supabase SMTP concern.

## Required variables

```text
RESEND_API_KEY
EMAIL_FROM
MARKETPLACE_NOTIFICATION_EMAIL
CRON_SECRET
```

`EMAIL_REPLY_TO` is optional. `EMAIL_FROM` must use a domain verified in
Resend. `MARKETPLACE_NOTIFICATION_EMAIL` receives platform and safety-signal
alerts for the site administrator.

Configure the variables in every Vercel environment that is expected to send
email. A Preview configuration does not automatically configure Production.

## Delivery

Application mutations insert durable outbox rows first. When Resend is
configured, Next.js `after()` attempts immediate delivery. The daily
`/api/cron/marketplace` route handles retries and pickup reminders.

Site administrators can inspect and retry failed messages at `/admin/email`.
Provider errors are stored in `last_error`; API keys and message content are
never displayed there.

## Verification

1. Submit a community listing and confirm it is active immediately.
2. Confirm the owner publication acknowledgement enters the outbox.
3. Trigger a safe test text signal and confirm the site-admin alert enters the
   outbox without pausing the listing.
4. Send a rental request and accept it.
5. Confirm the rider receives the accepted email and private pickup details
   appear only inside their account.
6. Force one safe test failure, then retry it from `/admin/email`.
