# Wander Bike Resend setup

Commerce email uses the existing durable notification outbox. Resend is the
delivery provider; it is separate from Supabase Auth email.

## 1. Verify a sending subdomain

1. In Resend, open **Domains** and add `mail.wanderbike.ca`.
2. Copy the exact SPF and DKIM records Resend supplies into the DNS provider for
   `wanderbike.ca`. Do not copy example record values from documentation.
3. Add DMARC when the domain provider and mailbox policy are ready.
4. Wait until Resend reports the domain as **Verified**.

A sending subdomain keeps transactional-email reputation separate from the
main website and existing staff mailboxes.

## 2. Create a scoped API key

1. Open **API Keys** in Resend.
2. Create a key named `Wander Bike Preview`.
3. Grant sending access only and scope it to `mail.wanderbike.ca` when that
   option is available.
4. Copy the key once and enter it directly in Vercel. Never paste it into chat,
   a source file, a screenshot, or Git.

## 3. Configure the protected Preview

Add these variables to the Vercel **Preview** environment for the commerce
branch:

```text
RESEND_API_KEY=<Resend key entered directly in Vercel>
EMAIL_FROM=Wander Bike <orders@mail.wanderbike.ca>
ORDER_NOTIFICATION_EMAIL=<merchant inbox>
```

Redeploy the Preview after saving the values. The Settings page should change
from `Transactional email environment incomplete` to the configured state.

## 4. Acceptance test

1. Place one sandbox order with a test recipient owned by the merchant.
2. Confirm the customer copy and merchant copy appear in Resend.
3. Confirm the matching `notification_outbox` rows become `sent` and retain a
   provider message ID.
4. Exercise **Resend notification** from the order detail page.
5. Simulate one provider failure, then confirm the scheduled retry sends once
   without creating a duplicate order or stock movement.
6. Render and deliver all 13 transactional templates before Production.

Do not enable Resend for Production until sender verification, policies, the
merchant inbox, and the full template test are complete.
