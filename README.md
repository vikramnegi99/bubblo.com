# BUBBLO — bubble gifting store

**Live storefront:** https://vikramnegi99.github.io/bubblo.com/

## What is in this repository
- `index.html` — the complete, standalone BUBBLO storefront (hero, Bubble Mega Days offer, three
  products, gift experience, cart, COD checkout, order confirmation, tracking, admin, policies).
  It is served live by GitHub Pages and works on its own in any browser.
- `backend/` — Node + Express + SQLite API. Creates COD orders, manages products/settings/campaign,
  serves the admin API, and emails the store owner on every new order. **No OTP** — orders are
  confirmed manually by phone.
- `frontend/` — the React + Vite storefront and admin panel that talks to `backend/`.
- `render.yaml` — one-click backend deploy config (Render).
- `DEPLOY.md` — how to put the backend online and turn on owner email notifications.

> The static `index.html` and the React `frontend/` are two ways to run the same store. The static
> file is what GitHub Pages serves for a quick live link. The React app + backend is the full
> production setup with a real database and owner email notifications.

---

# BUBBLO — Full-Stack E-Commerce

> **Make Moments Magical.**
> Bubble wands, bubble guns and glow — a premium, mobile-first store for gifting and everyday fun.

BUBBLO is a complete, runnable full-stack e-commerce project:

- **Backend** — Node.js + Express + SQLite (`better-sqlite3`)
- **Storefront** — React + Vite (mobile-first)
- **Admin panel** — React (same app, mounted at `/admin`)

---

## ⚠️ There is NO OTP — orders are confirmed manually

BUBBLO **does not use OTP, SMS verification, or any SMS provider**. There is no
Firebase, Twilio or MSG91 integration, no OTP UI, no OTP API, no OTP database
field, no resend timer and no countdown.

Instead, BUBBLO uses a **manual confirmation workflow**:

1. The customer fills the checkout form and taps **PLACE COD ORDER**.
2. The order is **created immediately** (status `New Order`) — no verification step.
3. The store owner sees the order in the admin panel and taps **Call Customer**
   (a `tel:+91XXXXXXXXXX` link) to ring the customer.
4. The owner moves the order through the status pipeline
   (`Call Pending → Call Confirmed → Processing → …`).

This is intentional and is the single most important design decision in this project.
If you are looking for OTP code, it is deliberately absent everywhere.

---

## Project structure

```
bubblo-fullstack/
├── backend/                 Node + Express + SQLite API
│   ├── src/
│   │   ├── config/          env loader + Cloudinary asset manifest
│   │   ├── db/              schema.sql, connection, migrate, seed
│   │   ├── middleware/      auth (JWT), validation (zod), rate limit, errors
│   │   ├── routes/          public + admin routes
│   │   ├── services/        products, orders, campaign, settings, reviews,
│   │   │                    email (configurable COD owner notifications)
│   │   ├── utils/           phone, order id, pricing, whatsapp, logger
│   │   ├── validation/      zod schemas
│   │   ├── app.js           express app (helmet, CORS allow-list, routes)
│   │   └── server.js        entrypoint
│   ├── scripts/
│   │   ├── create-admin.js  create/update an admin account
│   │   └── smoke-test.js    end-to-end API test (proves no OTP)
│   └── .env.example
├── frontend/                React + Vite storefront + admin panel
│   ├── src/
│   │   ├── admin/           admin panel (login, dashboard, products, orders…)
│   │   ├── components/      header, footer, cards, cart drawer, home sections
│   │   ├── context/         store, cart, auth, toasts
│   │   ├── lib/             api client, formatting, SEO helpers
│   │   ├── pages/           home, product, checkout, confirmation, track…
│   │   └── styles/
│   ├── public/              robots.txt, sitemap.xml
│   └── .env.example
└── README.md
```

---

## Requirements

- **Node.js 18+** (tested on Node 20)
- npm
- No external services required to run locally (SQLite is a local file).

---

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env          # then edit .env (see below)
npm install

npm run migrate               # create the SQLite schema
npm run seed                  # insert the 3 products, settings, inactive campaign
npm run create-admin          # create your admin login

npm run dev                   # http://localhost:4000
```

`npm run create-admin` reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`, or you
can pass them directly:

```bash
node scripts/create-admin.js you@example.com 'a-strong-password' "Store Owner"
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

The Vite dev server proxies `/api` to the backend (see `vite.config.js`), so no
CORS configuration is needed for local development.

- Storefront: <http://localhost:5173>
- Admin panel: <http://localhost:5173/admin>

---

## Environment variables

### backend/.env

| Variable | Purpose |
|---|---|
| `PORT` | API port (default `4000`) |
| `NODE_ENV` | `development` / `production` |
| `CORS_ORIGINS` | Comma-separated browser origins allowed to call the API |
| `DATABASE_FILE` | SQLite file path (default `./data/bubblo.sqlite`) |
| `JWT_SECRET` | **Required in production.** Long random string (`openssl rand -hex 48`) |
| `JWT_EXPIRES_IN` | Admin session length (default `12h`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used only by `npm run create-admin` |
| `RATE_LIMIT_*` | Rate limiting window/max |
| `SITE_URL` | Public site URL |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud account (default `acqrwkcn`) |
| `OWNER_EMAIL` | Store owner address that receives new-order alerts (default `mrvickybusines@gmail.com`) |
| `EMAIL_PROVIDER` | `smtp` \| `resend` \| `sendgrid` \| `console` (default `console`) |
| `EMAIL_PROVIDER_API_KEY` | API key for the selected HTTP provider (`resend` / `sendgrid`) |
| `EMAIL_FROM` | "From" address on the alert, e.g. `BUBBLO Orders <no-reply@bubblo.store>` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_SECURE` | SMTP connection (only used when `EMAIL_PROVIDER=smtp`) |

There are **no OTP / SMS provider variables** — that is by design. Email
credentials live **only** in `.env` and are never sent to the browser.

### frontend/.env

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | API base URL (leave empty to use the dev proxy) |
| `VITE_API_PROXY` | Backend target for the dev proxy |
| `VITE_SITE_URL` | Public site URL (canonical/OG/sitemap) |
| `VITE_CLOUDINARY_CLOUD` | Cloudinary cloud account |

**No secrets are hardcoded anywhere.** `.env` files are git-ignored; only
`.env.example` files are committed.

---

## Database, migrations & seed

- **Schema** — `backend/src/db/schema.sql`
  Tables: `admins`, `products`, `orders`, `order_events`, `settings`,
  `campaign`, `campaign_products`, `reviews`.
  There is **no OTP table**.
- **Migrate** — `npm run migrate` (idempotent). `npm run migrate -- --fresh`
  drops the database first (dev only).
- **Seed** — `npm run seed` inserts the 3 products, default settings and an
  **inactive** campaign. No reviews are seeded (the storefront shows an honest
  empty state). `npm run reset` = fresh migrate + seed.

### The three products

| # | Slug | Name | Price | MRP | Discount | Tag |
|---|---|---|---|---|---|---|
| 1 | `lotus-bubble-wand` | LED Lotus Flower Bubble Wand | ₹999 | ₹1,499 | 33% OFF | Glow + Bubbles |
| 2 | `automatic-bubble-gun` | Automatic Bubble Gun | ₹349 | ₹599 | 42% OFF | Maximum Bubble Fun |
| 3 | `fairy-butterfly-bubble-wand` | LED Fairy / Butterfly Bubble Wand | ₹1,250 | ₹1,999 | 37% OFF | Gift-Worthy Magic |

MRP, price and discount are **admin-configurable**. A discount is only shown on
the storefront when it is *truthful* (MRP strictly greater than price). Each
product has an independent **visibility toggle**.

---

## Cloudinary image manifest

All product imagery is served from Cloudinary (cloud account **`acqrwkcn`**).

The single source of truth is **`backend/src/config/cloudinary.js`**. It maps each
product slug to its hero image and gallery, using the exact public IDs, and
builds delivery URLs:

```
https://res.cloudinary.com/acqrwkcn/image/upload/f_auto,q_auto,w_800/<public_id>.jpg
```

Responsive variants use `w_600` / `w_1200` (see `buildSrcSet`), and every `<img>`
in the storefront uses `loading="lazy"` (except the hero, which is prioritised).

> **Rules enforced in code**
> - Collection *page* URLs are never used as an `<img src>` — only delivery URLs.
> - Assets are **never mixed between products**. Product 1's collection contains a
>   butterfly image that belongs **only** to product 3; the admin API rejects any
>   attempt to attach it to product 1 (`asset_mismatch`).

| Product | Hero public_id | Gallery public_ids |
|---|---|---|
| lotus-bubble-wand | `file_000000000888821194c4ce42bfed7d24` | `file_0000000017308208a5855b5ee68fdfad`, `file_0000000055908211becd645686892190`, `file_000000000888821194c4ce42bfed7d24` |
| automatic-bubble-gun | `file_000000002f94820889ce9296fd1838e3` | `file_000000002f94820889ce9296fd1838e3`, `file_000000009c58820898f11758e9b312c2`, `file_00000000eb6882118927549965131b14` |
| fairy-butterfly-bubble-wand | `file_00000000e62882118326d5fff23e310c` | `file_00000000e62882118326d5fff23e310c`, `file_00000000c88c8211acca0f122f930bf3`, `file_00000000c0d482119e80da247b5c2563` |

---

## API overview

Public (`/api`):

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/products` | Visible products |
| GET | `/api/products/:slug` | Product + approved reviews |
| GET | `/api/campaign` | Storefront-safe campaign view |
| GET | `/api/settings` | Public settings |
| POST | `/api/orders` | **Create a COD order immediately (no OTP)** |
| POST | `/api/orders/track` | Track by order id + mobile |
| POST | `/api/reviews` | Submit a review (pending moderation) |

Admin (`/api/admin`, JWT protected except login):

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/login` | Email + password → JWT |
| GET | `/api/admin/me` | Current admin |
| GET / PATCH | `/api/admin/products` · `/products/:slug` | Full product CRUD |
| GET | `/api/admin/products/assets` | Cloudinary manifest |
| GET | `/api/admin/orders` | List / search / filter |
| PATCH | `/api/admin/orders/:orderId/status` | Change status |
| GET / PUT | `/api/admin/settings` | Store settings |
| GET / PUT | `/api/admin/campaign` | Campaign settings |
| GET / PATCH / DELETE | `/api/admin/reviews` | Review moderation |
| GET | `/api/admin/summary` | Sales summary |

### Order status pipeline

`New Order → Call Pending → Call Confirmed → Processing → Shipped → Out for Delivery → Delivered → Cancelled`

When an order is moved to **Delivered**, its payment status becomes **Paid**.

### Phone numbers

The customer enters **only the 10 digits** (the `+91` prefix is fixed in the UI).
The server stores the number normalized as `+91XXXXXXXXXX` and rejects anything
that is not exactly 10 digits starting with 6–9. The admin panel displays it as
`+91 98765 43210` and exposes a `tel:+91XXXXXXXXXX` **Call Customer** link.

---

## Owner email notifications (COD orders)

When a customer places a COD order, BUBBLO emails the store owner
(`OWNER_EMAIL`, default **`mrvickybusines@gmail.com`**) so they can call and
confirm it.

- **When** — the notification is sent after `POST /api/orders` succeeds.
- **How** — it runs **in the background**. The HTTP response is returned
  immediately; the email is never awaited.
- **Failure is safe** — if sending fails, the order is **still created and
  returned as success**. The failure is logged server-side only (for admin
  troubleshooting) and the email status is **never** returned to the client.
- **Subject** — exactly `New COD Order — BUBBLO #BB-XXXXXX`.
- **Body** — a professional, mobile-readable HTML email (with a plain-text
  fallback) containing: order id, date/time, customer name, mobile
  (`+91 95280 97342` format), email (if given), full delivery address
  (house/street, landmark, pincode, city, state), a line-item table (product,
  variant, quantity, MRP, discount, selling price), shipping, final total,
  payment method (**Cash on Delivery**) and order status (**New Order / Call
  Pending**).

### Providers

The provider is chosen purely from the environment via `EMAIL_PROVIDER`:

| `EMAIL_PROVIDER` | Transport | Credentials it reads |
|---|---|---|
| `console` *(default)* | Logs the email server-side. No credentials needed. | — |
| `smtp` | Any SMTP server via **nodemailer** | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE` |
| `resend` | **Resend** HTTP API | `EMAIL_PROVIDER_API_KEY` |
| `sendgrid` | **SendGrid** v3 API | `EMAIL_PROVIDER_API_KEY` |

### Switching providers

1. Open `backend/.env`.
2. Set `EMAIL_PROVIDER` to `smtp`, `resend` or `sendgrid`.
3. Fill in only that provider's credentials (above) and a valid `EMAIL_FROM`.
4. Restart the backend. To go back to the safe default, set
   `EMAIL_PROVIDER=console` (or leave it unset) — no credentials required.

> `console` is the **safe fallback**: with no provider configured (or an
> unknown value), the app logs the notification and everything still works.
> Credentials are read **only** from the environment — there is **no email
> logic in the browser** and no secret is ever sent to the frontend.

---

## Campaign logic (no fake countdowns)

A campaign carries a **start** (`campaign_start`) and **end** (`campaign_end`)
datetime. `GET /api/campaign` reports whether the campaign is currently active
— i.e. `now` sits between the start and end (`isActive` / `active: true`). A
banner, the **"Limited Time"** label and a countdown appear on the storefront
**only** when the campaign is active **and** has a real end date in the future.
When it is inactive or has ended, the API returns `active: false` and the
frontend renders **no banner, no "Limited Time" label and no countdown**,
showing normal pricing instead. A countdown is never invented or auto-reset.

---

## Admin order actions

The admin orders table returns full order details (id, customer name, phone,
email, full address, landmark, pincode, city, state, product, variant,
quantity, price, discount, total, payment method, order status, created
date/time) and offers two one-tap actions:

- **Call Customer** — a `tel:+91XXXXXXXXXX` link.
- **WhatsApp Customer** — a `https://wa.me/91XXXXXXXXXX?text=…` link with a
  pre-filled, URL-encoded order-confirmation message.

---

## SEO

- Homepage title: **“BUBBLO — Bubble Gifts, Fun & Magical Moments”**
- Per-product titles, e.g. **“LED Lotus Flower Bubble Wand | BUBBLO”**
- JSON-LD: `Product` + `Offer`, `Organization`, `FAQPage`
- Open Graph + Twitter card tags, canonical links
- `frontend/public/sitemap.xml` and `robots.txt`

---

## Security

- `helmet` security headers
- CORS **allow-list** (only configured origins)
- `zod` validation on every write endpoint
- Admin auth: **bcrypt** password hashes + **JWT**
- Rate limiting (global, order creation, admin login)
- **No secrets in code** — everything comes from environment variables

---

## Verifying the build

Backend (proves 3 products seed, an order is created **without OTP**, the
owner-email notification never blocks the order, tracking works, and
Delivered ⇒ Paid):

```bash
cd backend
npm run migrate && npm run seed
node scripts/smoke-test.js
```

With no `EMAIL_PROVIDER` set, the console fallback logs the new-order email and
`POST /api/orders` still returns **201 success** — email never fails an order.

Frontend production build:

```bash
cd frontend
npm run build
```

---

## Notes

- Prices are in **INR (₹)**.
- The storefront shows an honest review empty state (“Your review could be the
  first.”) until a real review is approved. No fake reviews, no fake scarcity,
  no invented specifications.
