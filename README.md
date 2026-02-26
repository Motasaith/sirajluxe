# Siraj Luxe — Premium E-Commerce Store

A full-featured Next.js 14 e-commerce platform for UK premium goods, built with the App Router, TypeScript, MongoDB, Stripe, and Clerk.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | MongoDB Atlas (Mongoose 9) |
| Auth | Clerk |
| Payments | Stripe (GBP) |
| Email | Brevo SMTP (nodemailer) |
| Media | Vercel Blob |
| Animations | Framer Motion |
| Analytics | PostHog |
| Live Chat | Crisp + Hugo AI |
| Deployment | Vercel |

## Getting Started

```bash
# Install dependencies (legacy peer deps required for React 18 + framer-motion)
npm install --legacy-peer-deps

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file with:

### Required (app won't function without these)

```env
MONGODB_URI=               # MongoDB Atlas connection string
STRIPE_SECRET_KEY=         # Stripe secret key (sk_live_ or sk_test_)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # Stripe publishable key
CLERK_SECRET_KEY=          # Clerk secret key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=   # Clerk publishable key
BLOB_READ_WRITE_TOKEN=     # Vercel Blob read/write token
```

### Required for Production (webhook verification)

```env
STRIPE_WEBHOOK_SECRET=     # Stripe webhook signing secret (whsec_...)
CLERK_WEBHOOK_SECRET=      # Clerk webhook signing secret
```

### Recommended

```env
SMTP_HOST=                 # Brevo SMTP host (smtp-relay.brevo.com)
SMTP_USER=                 # Brevo SMTP login
SMTP_PASS=                 # Brevo SMTP password
ADMIN_EMAIL=               # Admin email for contact form notifications
NEXT_PUBLIC_SITE_URL=      # Production URL (e.g. https://sirajluxe.com)
NEXT_PUBLIC_CRISP_WEBSITE_ID=  # Crisp live chat website ID
NEXT_PUBLIC_POSTHOG_KEY=   # PostHog project API key
NEXT_PUBLIC_POSTHOG_HOST=  # PostHog API host
```

## Features

- **Storefront**: Hero, featured products, categories, testimonials, newsletter
- **Shop**: Search, sort, filter, grid/list views, pagination
- **Product Pages**: Image zoom, reviews, related products, stock alerts, wishlist
- **Cart & Checkout**: Stripe Checkout, coupon codes, dynamic shipping rates
- **User Accounts**: Order history, wishlist, profile (via Clerk)
- **Blog**: CMS-managed posts with SEO metadata
- **Contact**: Form with rate limiting and email notifications
- **Admin Dashboard**: Products, orders, customers, reviews, coupons, blog, analytics, site editor (CMS), settings
- **SEO**: Sitemap, robots.txt, JSON-LD, Open Graph, meta tags
- **Security**: CSP headers, rate limiting, input sanitization, CSRF protection
- **Performance**: Image optimization, lazy loading, code splitting

## Admin Dashboard

Access at `/admin` (requires admin role in Clerk).

## Deployment

Deploy to Vercel:

```bash
vercel --prod
```

---

## ⚠️ Skipped for Now (Required for Production)

The following items are **skipped during development/testing** with the Vercel free domain but **must be configured before going live** with a custom domain:

### 1. Clerk Production Instance
- **What**: Clerk is currently using **TEST keys** (`sk_test_`, `pk_test_`)
- **Why skipped**: Production Clerk requires a verified custom domain
- **Action needed**:
  1. Create a Clerk **production instance** at [clerk.com](https://clerk.com)
  2. Add your custom domain and verify DNS
  3. Replace `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` with production keys (`sk_live_`, `pk_live_`)
  4. Update the CSP `script-src` and `connect-src` in `next.config.mjs` to use your production Clerk domain instead of `*.clerk.accounts.dev`

### 2. Clerk Webhook Secret (`CLERK_WEBHOOK_SECRET`)
- **What**: Verifies that incoming Clerk webhook requests are authentic
- **Why skipped**: Clerk webhooks require a public URL (not localhost)
- **Action needed**:
  1. In the Clerk Dashboard → Webhooks, add an endpoint: `https://yourdomain.com/api/webhooks/clerk`
  2. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
  3. Copy the signing secret and set `CLERK_WEBHOOK_SECRET` in your env vars

### 3. Stripe Webhook Secret (`STRIPE_WEBHOOK_SECRET`)
- **What**: Verifies that incoming Stripe webhook events are authentic
- **Why skipped**: Requires a public URL for Stripe to send events to
- **Action needed**:
  1. In Stripe Dashboard → Developers → Webhooks, add endpoint: `https://yourdomain.com/api/webhooks/stripe`
  2. Subscribe to events: `checkout.session.completed`, `charge.refunded`, `payment_intent.payment_failed`, `charge.dispute.created`
  3. Copy the signing secret (`whsec_...`) and set `STRIPE_WEBHOOK_SECRET` in your env vars
- **Risk if skipped in production**: Orders won't be created, inventory won't decrement, customers won't receive order confirmation emails

### 4. Stripe Environment Alignment
- **What**: Clerk is using TEST keys but Stripe is using LIVE keys
- **Action needed**: Once Clerk production keys are set, both services will be in production mode. During development, you can use Stripe TEST keys (`sk_test_`) instead

### 5. Content Security Policy (CSP) — Clerk Domain
- **What**: The CSP currently allows `*.clerk.accounts.dev` (development Clerk domain)
- **Action needed**: When switching to production Clerk, update `next.config.mjs` CSP directives:
  - `script-src`: Replace `https://*.clerk.accounts.dev` with your production Clerk frontend API domain
  - `connect-src`: Replace `https://*.clerk.accounts.dev` with the same

### 6. `NEXT_PUBLIC_SITE_URL`
- **What**: Used for sitemap, canonical URLs, JSON-LD, and OG tags
- **Action needed**: Set to your production domain (e.g. `https://sirajluxe.com`)

---

## Production Checklist

- [ ] Custom domain configured on Vercel
- [ ] Clerk production instance created and keys replaced
- [ ] Clerk webhook endpoint added and `CLERK_WEBHOOK_SECRET` set
- [ ] Stripe webhook endpoint added and `STRIPE_WEBHOOK_SECRET` set
- [ ] Stripe and Clerk both using production/live keys
- [ ] CSP updated for production Clerk domain
- [ ] `NEXT_PUBLIC_SITE_URL` set to production URL
- [ ] SMTP credentials configured for transactional emails
- [ ] Google Search Console verified and sitemap submitted
- [ ] SSL/HTTPS confirmed (Vercel handles this automatically)

## License

Private — All rights reserved.
