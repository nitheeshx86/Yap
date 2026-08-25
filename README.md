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

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Operator setup: Razorpay webhook

Payments are settled two ways — the browser-side checkout `handler` callback
(`/api/razorpay/verify-payment`) and an async webhook
(`/api/razorpay/webhook`). Both call the same `settlePayment()` function
(`lib/yap/payments.js`) and are idempotent on `razorpay_payment_id`, so
whichever arrives first wins and the second is a no-op — this covers the case
where the user closes the tab right after paying.

To enable the webhook path:

1. Set `RAZORPAY_WEBHOOK_SECRET` in the environment (not currently in
   `.env.local` — generate one when you create the webhook in the dashboard).
2. In the Razorpay Dashboard → Settings → Webhooks, add an endpoint pointing
   at `https://<your-domain>/api/razorpay/webhook`.
3. Subscribe it to: `payment.captured`, `payment.failed`, `order.paid`,
   `refund.created`, `refund.processed`.
4. Use the secret Razorpay generates for that webhook as
   `RAZORPAY_WEBHOOK_SECRET` — it must match exactly, since the endpoint
   verifies `x-razorpay-signature` as HMAC-SHA256 over the raw request body.

Without this, the app still works via the handler-callback path alone, but a
payment that succeeds while the user is offline/tab-closed will not be
credited until they return and the handler fires (or you settle it manually).

## Database migration

Run `supabase/migrations/20260824074158_sessions_challenge_entitlements.sql`
against the project's Postgres database. It is additive only. If the
Supabase CLI is available: `npx supabase db push`. Otherwise, paste the file
contents directly into the Supabase Dashboard's SQL editor and run it once.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
