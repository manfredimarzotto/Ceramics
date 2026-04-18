# Architecture Review — Ceramics

A blueprint document for replicating the Ceramics e-commerce store in a separate codebase. All claims are backed by file paths in the current repo.

---

## 1. High-Level Overview

### What the project does

Ceramics is a single-tenant e-commerce storefront for handcrafted pottery (bowls, vases, plates, mugs, planters). It supports the full purchase loop — browse catalog → cart → Stripe checkout → confirmation — and ships with a password-protected admin panel at `/admin` for product CRUD and order/fulfillment management.

### Who it's for

A small artisan business selling direct-to-customer without third-party marketplaces. The codebase is intentionally simple (single admin user, no multi-tenant concerns, no inventory counts beyond a boolean `inStock`) and aimed at a solo operator.

### Tech stack

Source: `package.json`.

| Layer | Choice | Version | Why (likely) |
|---|---|---|---|
| Framework | Next.js (App Router) | ^14.2.0 | One toolchain for SSR pages + API routes + middleware |
| Language | TypeScript | ^5.3.3 | Type safety end-to-end with Prisma's generated types |
| UI | React 18 | ^18.2.0 | Required by Next.js |
| Styling | Tailwind CSS | ^3.4.1 | Utility-first; no separate CSS files |
| ORM | Prisma | ^6.19.2 | Schema-first; generated client; migrations |
| Database | PostgreSQL (Supabase) | — | Free tier; pooled connection via PgBouncer |
| Payments | `stripe` (server) + `@stripe/stripe-js` (declared, unused) | ^14.14.0 / ^2.4.0 | Hosted Checkout — no PCI scope |
| Auth | `jose` (JWT, HS256) | ^6.2.1 | Edge-runtime compatible (Next.js middleware) |
| Validation | Zod | ^4.3.6 | Shared schemas for request bodies |
| Tests | Vitest + React Testing Library + jsdom | ^4.1.0 / ^16.3.2 / ^29.0.0 | Vite-style speed; React component tests |
| Tooling | `tsx`, `dotenv`, `autoprefixer`, `postcss` | — | Run TS scripts (seed); CSS pipeline |

### Deployment target

- **Runtime**: Node.js 18+ (per README), with the Next.js middleware in `src/middleware.ts` running on the **Edge runtime** (the `jose` import implies this — `jose` works on Edge, where the Node `crypto` module used in the login route does not).
- **Hosting**: Per `CLAUDE.md`, must be a Node-capable host — Vercel (recommended), Netlify (with the Next.js adapter), Railway, or Render. **GitHub Pages will not work** (it's static-only and falls back to rendering `README.md`).
- **Database**: Supabase Postgres. `DATABASE_URL` is the pooled connection (port 6543, `pgbouncer=true`); `DIRECT_URL` is the direct connection (port 5432) used by Prisma for migrations.
- **CI/CD**: None. There is no `.github/workflows/` directory. Deployment is manual / platform-driven.

---

## 2. Directory and Module Structure

### Top-level layout

```
.
├── .claude/commands/        # Project-level slash commands for Claude Code
├── data/                    # Static JSON snapshots (not loaded at runtime)
├── prisma/                  # Schema, migrations, seed
├── public/images/           # 9 SVG product images
├── src/
│   ├── app/                 # Next.js App Router pages + API routes
│   ├── components/          # Reusable React components
│   ├── context/             # React context providers (cart)
│   ├── lib/                 # Server-side data access + helpers
│   ├── types/               # Shared TS interfaces
│   ├── __tests__/           # Vitest tests + setup
│   └── middleware.ts        # Edge middleware for /admin and /api auth
├── CLAUDE.md                # Project conventions for Claude Code agents
├── README.md
├── compounding.md           # NOT project content — see §9
├── next.config.js           # images.unoptimized = true
├── tailwind.config.ts       # Custom clay/kiln color palettes
├── tsconfig.json            # Path alias: "@/*" → "./src/*"
├── vitest.config.ts         # jsdom env, test glob, "@" alias
└── package.json
```

### `src/app/` (App Router)

| Path | Type | Purpose |
|---|---|---|
| `layout.tsx` | server | Root layout, mounts `CartProvider` + `ToastProvider`, renders `Navbar` + `Footer` |
| `page.tsx` | server | Home; calls `getFeaturedProducts()` directly via Prisma |
| `error.tsx`, `global-error.tsx` | client | Error boundaries (per-route + global) |
| `globals.css` | — | Tailwind directives only |
| `products/page.tsx` | client | Catalog with category filter / search / sort (in-memory) |
| `products/[id]/page.tsx` | client | Product detail; add to cart |
| `cart/page.tsx` | client | Cart review; renders `CartItemRow` + `CartSummary` |
| `checkout/success/page.tsx` | client | Reads `session_id`, calls `clearCart()` on mount |
| `admin/login/page.tsx` | client | Password form |
| `admin/layout.tsx` | client | Sidebar nav + logout |
| `admin/page.tsx` | client | Dashboard metrics (orders, revenue) |
| `admin/products/page.tsx` | client | Products table + create form |
| `admin/products/[id]/page.tsx` | client | Edit form |
| `admin/orders/page.tsx` | client | Orders list + status dropdown |

### `src/app/api/` (route handlers)

| Route | Methods | Auth | Notes |
|---|---|---|---|
| `admin/login/route.ts` | POST | public | Rate-limited; timing-safe compare; sets cookie |
| `admin/logout/route.ts` | POST | session | Clears cookie |
| `products/route.ts` | GET, POST | GET public; POST session | Zod-validated create |
| `products/[id]/route.ts` | GET, PUT, DELETE | GET public; mutations session | |
| `orders/route.ts` | GET, POST | session | POST is used by webhook (called via lib, not HTTP) |
| `orders/[id]/route.ts` | GET, PUT | session | PUT updates `status` |
| `checkout/route.ts` | POST | public | Server-side stock check; creates Stripe session |
| `webhook/route.ts` | POST | Stripe signature | Verifies HMAC; persists order |
| `seed/route.ts` | POST | session | Wipes + reseeds (admin convenience) |

### `src/components/`

`Navbar.tsx`, `HeroSection.tsx`, `ProductCard.tsx`, `CartItemRow.tsx`, `CartSummary.tsx`, `Toast.tsx`, `Footer.tsx`. `Toast.tsx` exports both the component and the `ToastProvider`/`useToast` context.

### `src/lib/`

| File | Responsibility |
|---|---|
| `db.ts` | Prisma client singleton (the `globalThis.__prisma` dev pattern) |
| `products.ts` | `getProducts`, `getProductById`, `getFeaturedProducts`, `getProductsByCategory`, `getCategories`, `searchProducts`, `createProduct`, `updateProduct`, `deleteProduct`, `mapProduct` |
| `orders.ts` | `getOrders`, `getOrderById`, `createOrder`, `updateOrderStatus`, `mapOrder` |
| `auth.ts` | `createSession()` (24h JWT), `verifySession()`, `getSession()` (reads cookie); exports `COOKIE_NAME` |
| `stripe.ts` | Stripe SDK init, pinned to API version `2023-10-16` |
| `validation.ts` | Zod schemas (product, order, checkout, login, status) |
| `rate-limit.ts` | In-memory `Map<key, {count, resetAt}>`; 5 attempts / 15 min window |

### `src/context/`

- `CartContext.tsx` — items array, `addItem` / `removeItem` / `updateQuantity` / `clearCart`, computed `totalItems` / `totalPrice`. Persists to `localStorage` key `"ceramics-cart"`.

### `src/types/index.ts`

Shared interfaces: `Product`, `CartItem`, `ShippingAddress`, `Order`. Order status union: `"pending" | "confirmed" | "shipped" | "delivered"` (must stay in sync with the Prisma `OrderStatus` enum).

### `prisma/`

`schema.prisma`, `seed.ts`, and two migrations (`20250101000000_init`, `20250101000001_enable_rls`).

### `data/`

`products.json` and `orders.json` — looks like a static export / backup. **Not imported anywhere in `src/`** — `seed.ts` defines its own product list inline. Treat these as historical artifacts.

### `.claude/commands/`

Project-scoped slash commands for Claude Code: `add-api-route.md`, `add-component.md`, `add-test.md`, `build.md`, `test.md`, `validate.md`. Skip when replicating unless you also use Claude Code.

### Conventions worth noting

- **Path alias**: `@/*` → `src/*` in both `tsconfig.json` and `vitest.config.ts`.
- **Server components fetch directly via Prisma** (e.g. `app/page.tsx`); client components fetch via `/api/*`. Don't mix.
- **The Order TS union and the Prisma `OrderStatus` enum are duplicated**, not derived — keep them aligned.
- **No `.github/workflows/`** — no CI, no automated tests on push.

---

## 3. Data Layer

### Database

PostgreSQL on Supabase. Two connection strings are required (`prisma/schema.prisma`):

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // pooled (PgBouncer, port 6543)
  directUrl = env("DIRECT_URL")     // direct (port 5432) — used by migrations
}
```

### Models

```prisma
enum OrderStatus { pending  confirmed  shipped  delivered }

model Product {
  id          String   @id @default(cuid())
  name        String
  description String
  price       Float
  image       String
  category    String
  inStock     Boolean  @default(true)
  featured    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([category])
  @@index([featured])
}

model Order {
  id              String      @id           // custom format: ORD-${Date.now()}
  total           Float
  customerEmail   String
  customerName    String
  shippingLine1   String
  shippingLine2   String?
  shippingCity    String
  shippingState   String
  shippingPostal  String
  shippingCountry String
  status          OrderStatus @default(pending)
  stripeSessionId String      @unique
  createdAt       DateTime    @default(now())
  items           OrderItem[]
  @@index([status])
  @@index([customerEmail])
}

model OrderItem {
  id        String @id @default(cuid())
  orderId   String
  productId String                       // NOT a foreign key — see §9
  name      String                       // snapshot of product name at purchase
  price     Float                        // snapshot of price at purchase
  quantity  Int
  order     Order  @relation(fields: [orderId], references: [id], onDelete: Cascade)
  @@index([orderId])
}
```

Notable design choices:

- **Order ID is `ORD-${Date.now()}`**, set in `src/lib/orders.ts:26`. Sortable, human-readable, but theoretically collision-prone.
- **Shipping address is denormalized** into seven columns on `Order`. No JSON, no separate table.
- **`OrderItem.productId` is a plain string**, not a FK relation. Combined with snapshotted `name` and `price`, this preserves historical orders even if a product is later deleted or repriced.
- **`stripeSessionId` is `@unique`**, which gives the webhook idempotency at the database layer (a duplicate webhook would throw on insert; currently the error is logged but not specifically handled).

### Migrations

Two migrations under `prisma/migrations/`:

1. `20250101000000_init` — Creates all three tables and indexes.
2. `20250101000001_enable_rls` — Enables RLS on all three tables to satisfy Supabase's security advisor:

```sql
ALTER TABLE "Product"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
```

No policies are defined — Prisma connects as the `postgres` superuser, which bypasses RLS. The migration's own comment makes this explicit. **If you ever connect from a non-superuser role, every query will return zero rows until policies are added.**

Per `CLAUDE.md` and PR #13, `prisma migrate deploy` was removed from the build script — migrations are applied manually via the Supabase SQL editor.

### Seed (`prisma/seed.ts`)

Run via `npm run db:seed` (which calls `npx tsx prisma/seed.ts`). It deletes everything (`OrderItem` → `Order` → `Product`) and inserts 8 hardcoded products across 5 categories (Bowls, Vases, Plates, Mugs, Planters). Also reachable as `POST /api/seed` for an authenticated admin.

### Caching, queues, external stores

- **None.** No Redis, no SQS, no in-process LRU. Next.js's data cache is not explicitly used (no `revalidatePath` / `revalidateTag` calls), so client pages refetch on each visit.
- **Browser localStorage** is the only client-side persistence — key `"ceramics-cart"` for the cart.
- `data/products.json` and `data/orders.json` exist but are **not loaded at runtime**; they appear to be a manual export.

---

## 4. Application Layer

### Bootstrapping

There is no custom server. The Next.js App Router boots `src/app/layout.tsx`, which mounts `CartProvider` and `ToastProvider` around `{children}`. Server components (e.g. `src/app/page.tsx`) do their data fetching at render time via direct Prisma calls; client components fetch via `/api/*` routes.

The Prisma client is a process-wide singleton with a dev-mode hot-reload guard:

```ts
// src/lib/db.ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

This avoids exhausting Postgres connections during dev recompiles.

### Routing surface

Page routes are listed in §2. API routes are REST-flavoured handlers, one file per resource:

- **Public**: `GET /api/products`, `GET /api/products/[id]`, `POST /api/checkout`, `POST /api/webhook`, `POST /api/admin/login`.
- **Session-protected**: everything else, enforced by middleware.

The webhook does **not** call `POST /api/orders` over HTTP — it imports `createOrder()` from `src/lib/orders.ts` directly. The HTTP `POST /api/orders` handler exists but is unused by current flows.

### Core domain logic

Lives in `src/lib/`:

- `products.ts` — thin Prisma wrappers + `mapProduct()` to keep the wire shape stable.
- `orders.ts` — same pattern + `mapOrder()` that flattens the `shippingLine1..shippingCountry` columns back into a nested `shippingAddress` object.
- `validation.ts` — Zod schemas, used at every API boundary that takes a request body.

Business rules are sparse and live at the call sites:

- **Free shipping over $100, else $9.99** — `src/app/api/checkout/route.ts:41`.
- **Server-side stock check** before creating a Stripe session — same file, lines 22–36.
- **24-hour admin session lifetime** — `src/lib/auth.ts:19`.
- **5 login attempts per IP per 15 minutes** — `src/lib/rate-limit.ts:3-4`.

### Middleware (`src/middleware.ts`)

Runs on the Edge runtime. Order of checks:

1. `/admin/login` — if already authenticated, redirect to `/admin`; else allow.
2. `/api/admin/login` — always allow.
3. `GET /api/products` (or `/api/products/...`) — allow.
4. Everything else under the matcher — verify the `admin-session` JWT cookie. On failure: 401 JSON for API routes, redirect to `/admin/login` for pages.

The matcher is **explicit allowlist of protected paths**, not a deny-by-default:

```ts
matcher: [
  "/admin/:path*", "/api/admin/:path*", "/api/seed",
  "/api/products", "/api/products/:path*",
  "/api/orders", "/api/orders/:path*",
]
```

A new protected route that you forget to add to the matcher will silently bypass auth.

### Auth flow

- **Login** (`src/app/api/admin/login/route.ts`):
  - Rate-limit by `x-forwarded-for`.
  - Zod-validate body.
  - Compare with `crypto.timingSafeEqual()` against `ADMIN_PASSWORD`. (Length-mismatch is short-circuited because `timingSafeEqual` requires equal-length buffers.)
  - On success, mint a `jose` JWT and set an `httpOnly`, `sameSite=lax`, `secure` (in prod) cookie with 24h `maxAge`.
- **Verify** (`src/lib/auth.ts`, `src/middleware.ts`): `jwtVerify(token, SECRET)` with HS256.
- **Logout** (`src/app/api/admin/logout/route.ts`): clears the cookie.

There is no user table, no roles beyond `{ role: "admin" }` in the JWT payload, and no refresh token. The fallback secret is the literal string `"ceramics-admin-secret-change-me"` — `auth.ts` warns at boot if `ADMIN_SESSION_SECRET` is unset.

### Background jobs / cron / workers

**None.** The only async-on-arrival path is the Stripe webhook.

---

## 5. Frontend

### Rendering strategy

The App Router is used in mixed mode:

- **Server components**: `src/app/layout.tsx`, `src/app/page.tsx`. The home page renders `getFeaturedProducts()` directly via Prisma in a `try/catch` so a DB outage degrades to an empty grid rather than blanking the page (this pattern is mandated in `CLAUDE.md`).
- **Client components** (`"use client"`): every other page. Catalog, product detail, cart, success, and the entire `/admin` tree fetch via `/api/*` on mount and manage local UI state.

There is **no SSG, no ISR, no `revalidate`** in the codebase. Catalog is effectively CSR after the initial server render of the layout shell.

### State management

Two React contexts; no Redux/Zustand/etc:

- **`CartContext`** (`src/context/CartContext.tsx`)
  - State: `items: CartItem[]`.
  - API: `addItem`, `removeItem`, `updateQuantity` (qty ≤ 0 removes), `clearCart`.
  - Derived: `totalItems`, `totalPrice`.
  - Hydrates from `localStorage["ceramics-cart"]` on mount; writes back on every change.
- **`ToastContext`** (`src/components/Toast.tsx`)
  - In-memory toast queue, auto-dismiss after 4s. `success | error | info` variants.

Per-page UI state (form drafts, "Added!" feedback on `ProductCard`) is local `useState`.

### Component architecture

- **Layout shell**: `Navbar` (with cart-count badge from `CartContext`) → page content → `Footer`.
- **Catalog**: `ProductCard` grid; filtering and sorting happen in-memory after a single fetch.
- **Cart**: `CartItemRow` (qty +/- and remove) + `CartSummary` (totals, "Proceed to Checkout").
- **Admin**: `admin/layout.tsx` adds a sidebar; CRUD forms are inline within the page components rather than extracted to dedicated components.

### Frontend → backend

- **Reads** use plain `fetch("/api/...")` with no abort controller, no timeout, no SWR/react-query.
- **Writes** are also bare `fetch` with `method: "POST" | "PUT" | "DELETE"` and JSON bodies.
- **Checkout** is a redirect: `POST /api/checkout` returns a Stripe-hosted URL, then the client does `window.location.href = data.url` (`src/components/CartSummary.tsx`). No Stripe Elements, no `@stripe/stripe-js` runtime usage despite the dependency being declared.
- No **Server Actions** are used anywhere — every mutation goes through a route handler.

---

## 6. Integrations and External Services

### Stripe

- **SDK init** (`src/lib/stripe.ts`): pinned to `apiVersion: "2023-10-16"`. Warns at boot if `STRIPE_SECRET_KEY` is missing but does not crash.
- **Checkout creation** (`src/app/api/checkout/route.ts`):
  - Builds `price_data` line items with USD, embeds `productId` in `product_data.metadata`.
  - Adds a separate `Shipping` line item when subtotal ≤ $100.
  - `shipping_address_collection.allowed_countries: ["US", "CA", "GB", "AU"]`.
  - `success_url` includes `{CHECKOUT_SESSION_ID}` placeholder; `cancel_url` returns to `/cart`.
- **Webhook** (`src/app/api/webhook/route.ts`):
  - Reads raw body via `await request.text()` (required for HMAC).
  - Verifies with `stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)`.
  - On `checkout.session.completed`: lists line items with `expand: ["data.price.product"]`, filters out the `Shipping` item by name, recovers `productId` from product metadata (falls back to the line-item id), and calls `createOrder()` with `status: "confirmed"`.
  - Returns `{ received: true }`.

```ts
event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "");
```

Idempotency relies on the unique `stripeSessionId` constraint at the DB level — duplicate deliveries would log a 500 but the constraint prevents double-orders.

### Supabase

Used purely as managed Postgres + the SQL editor. No Supabase Auth, no Storage, no Realtime — just `DATABASE_URL` (PgBouncer) and `DIRECT_URL` (direct).

### Environment variables

| Var | Where used | Purpose |
|---|---|---|
| `STRIPE_SECRET_KEY` | `src/lib/stripe.ts` | Server-side Stripe SDK |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | declared, **not referenced in source** | Reserved for client SDK if added |
| `STRIPE_WEBHOOK_SECRET` | `src/app/api/webhook/route.ts` | HMAC signing key |
| `NEXT_PUBLIC_BASE_URL` | `src/app/api/checkout/route.ts` | Builds Stripe success/cancel URLs |
| `ADMIN_PASSWORD` | `src/app/api/admin/login/route.ts` | Plaintext password compared with `timingSafeEqual` |
| `ADMIN_SESSION_SECRET` | `src/lib/auth.ts`, `src/middleware.ts` | JWT HS256 signing key |
| `DATABASE_URL` | `prisma/schema.prisma` | Pooled Postgres for queries |
| `DIRECT_URL` | `prisma/schema.prisma` | Direct Postgres for migrations |

There is **no secrets manager**. Locally `.env`, in production whatever the host provides (Vercel env vars, etc.).

### Other third parties

**None.** No email (Stripe sends its own receipt), no analytics, no error tracking (Sentry/Datadog), no LLM integrations, no feature flags.

---

## 7. Infrastructure and DevOps

### Build / package

- **Package manager**: npm (the `package-lock.json` is committed; no `pnpm-lock`/`yarn.lock`).
- **Bundler**: Next.js's built-in (Webpack via `next build`). No custom Webpack config.
- **CSS pipeline**: PostCSS + Tailwind + Autoprefixer (`postcss.config.js`, `tailwind.config.ts`).
- **Image handling**: `next.config.js` sets `images: { unoptimized: true }` — `next/image` is not doing transforms; SVGs are served as-is from `public/images/`.

### Scripts (`package.json`)

| Script | Effect |
|---|---|
| `dev` | `next dev` |
| `build` | `npx prisma generate && next build` (no `migrate deploy` — see PR #13 / §9) |
| `start` | `next start` |
| `lint` | `next lint` |
| `db:seed` | `npx tsx prisma/seed.ts` |
| `db:migrate` | `npx prisma migrate dev` |
| `db:studio` | `npx prisma studio` |
| `postinstall` | `npx prisma generate` (so the client exists immediately after install) |
| `test` | `vitest run` |
| `test:watch` | `vitest` |

### CI/CD

There is **no `.github/workflows/`** directory and no `Dockerfile`, `docker-compose.yml`, or IaC files (Terraform/Pulumi/CDK). Deployment is delegated to whichever Node-capable host you point at the repo. Migrations are run by hand against Supabase.

### Tests (`vitest.config.ts`)

```ts
{ environment: "jsdom", setupFiles: ["./src/__tests__/setup.ts"],
  include: ["src/__tests__/**/*.test.{ts,tsx}"] }
```

Two test files:

- `src/__tests__/validation.test.ts` — exercises every Zod schema in `src/lib/validation.ts`: valid bodies, missing fields, out-of-range numbers, bad enum values.
- `src/__tests__/cart.test.tsx` — `CartContext` behaviour: add, increment, dedupe by id, remove, qty-zero removes, `clearCart`, hook-outside-provider error.

There are **no integration tests** (no test DB, no Stripe mock), **no e2e tests** (no Playwright/Cypress), and **no API route tests**. The `setup.ts` only imports `@testing-library/jest-dom`.

---

## 8. Data Flow Walkthroughs

### A) Browse → Cart → Stripe Checkout → Order

1. **Catalog render**: `src/app/products/page.tsx` (client) `fetch("/api/products")` →
   `src/app/api/products/route.ts` `GET` → `getProducts()` in `src/lib/products.ts` →
   `prisma.product.findMany()` → JSON back to the client → `ProductCard` grid.
2. **Add to cart**: `ProductCard` calls `useCart().addItem(product)` (`src/context/CartContext.tsx`).
   Cart state is mutated in memory and persisted to `localStorage["ceramics-cart"]`.
3. **Checkout click**: `CartSummary` (`src/components/CartSummary.tsx`) does
   `fetch("/api/checkout", { method: "POST", body: JSON.stringify({ items }) })`.
4. **Server validation + Stripe session**: `src/app/api/checkout/route.ts`:
   - `checkoutSchema.safeParse(body)` (Zod).
   - `prisma.product.findMany({ where: { id: { in: productIds } } })` → bail with 400 if any `inStock === false`.
   - Compute `shippingCost = subtotal > 100 ? 0 : 9.99`.
   - `stripe.checkout.sessions.create({ ... })` → returns `{ url }`.
5. **Client redirect**: `window.location.href = data.url` — user is now on Stripe's hosted checkout.
6. **Payment + webhook**: Stripe POSTs `checkout.session.completed` to `/api/webhook`:
   - `src/app/api/webhook/route.ts` verifies HMAC.
   - `stripe.checkout.sessions.listLineItems(session.id, { expand: ["data.price.product"] })`.
   - Filter out the `Shipping` line item by name.
   - `createOrder({ ..., status: "confirmed", stripeSessionId: session.id })` →
     `src/lib/orders.ts` → `prisma.order.create({ data: { id: 'ORD-${Date.now()}', items: { create: [...] } } })`.
7. **Customer landing**: Stripe redirects to `/checkout/success?session_id=...`.
   `src/app/checkout/success/page.tsx` calls `clearCart()` on mount and shows a confirmation.

### B) Admin Login → Create Product → Storefront update

1. **Login form**: `src/app/admin/login/page.tsx` POSTs `{ password }` to `/api/admin/login`.
2. **Server**: `src/app/api/admin/login/route.ts`:
   - `checkRateLimit('login:${ip}')` (5/15min).
   - `loginSchema.safeParse(body)`.
   - `timingSafeEqual(Buffer.from(input), Buffer.from(ADMIN_PASSWORD))`.
   - On success: `createSession()` (24h JWT) → set `admin-session` cookie.
3. **Redirect to `/admin`**: `src/middleware.ts` sees a valid cookie on subsequent requests, allows through.
4. **Admin opens "Products"**: `src/app/admin/products/page.tsx` (client) fetches `GET /api/products` (public) and renders the table.
5. **Submit "Add Product"**: form POSTs JSON to `/api/products` →
   `src/app/api/products/route.ts` POST handler → `createProductSchema.safeParse(body)` → `createProduct(data)` in `src/lib/products.ts` → `prisma.product.create({ data })` → 201 with mapped product.
6. **Storefront sees it**: any visitor reloading `/products` triggers a fresh `fetch("/api/products")`, which now includes the new row. There is no cache to invalidate.

### C) Stripe Webhook → Order Status Updates

1. **Stripe → us**: `POST /api/webhook` with raw JSON body and `Stripe-Signature` header.
2. **Verify + dispatch**: `src/app/api/webhook/route.ts` calls `stripe.webhooks.constructEvent(...)`. On bad signature → 400.
3. **`checkout.session.completed` handler**: builds the order items as in flow A, calls `createOrder({ status: "confirmed", ... })`.
4. **Admin updates status**: `src/app/admin/orders/page.tsx` shows a `<select>` per order; changing it issues `PUT /api/orders/{id}` with `{ status }`.
5. **Server update**: `src/app/api/orders/[id]/route.ts` (PUT) → `updateOrderStatusSchema.safeParse(body)` → `updateOrderStatus(id, status)` in `src/lib/orders.ts` → `prisma.order.update({ where: { id }, data: { status } })` → returns the mapped order. UI refetches and re-renders.

There is no notification fan-out — no email to the customer about shipping, no webhook out, nothing.

---

## 9. Replication Blueprint

### Phased rebuild

1. **Skeleton** — `create-next-app` (App Router, TypeScript, Tailwind), commit `tsconfig` with the `@/*` alias, set up the `clay`/`kiln` Tailwind palette, drop in `Navbar`/`Footer`/`globals.css`.
2. **Database + types** — provision Supabase, add Prisma with the three models above, write the init migration, add `src/lib/db.ts` singleton, generate the client, write `src/types/index.ts`.
3. **Public catalog** — `getProducts/getById/getFeatured` in `src/lib/products.ts`, the home server component, `/products` and `/products/[id]` client pages, `ProductCard`. Seed the DB so you can see something.
4. **Cart loop** — `CartContext` with localStorage persistence, `/cart` page, `CartItemRow`, `CartSummary`, `Toast` system. End-to-end: add, increment, remove, clear.
5. **Stripe checkout** — `src/lib/stripe.ts`, `POST /api/checkout` (with stock check + shipping calc), `/checkout/success`, then `POST /api/webhook` with HMAC verification and order persistence. Test with the Stripe CLI (`stripe listen --forward-to ...`).
6. **Admin** — Zod schemas in `src/lib/validation.ts`, JWT helpers in `src/lib/auth.ts`, rate limiter in `src/lib/rate-limit.ts`, `src/middleware.ts` matcher, `/admin/login` + `/admin/*` pages, products + orders CRUD routes.
7. **Tests + hardening** — Vitest config, schema tests, cart tests, RLS migration, env-var checks.

### Minimum viable slice

Phases 1–3 plus a hardcoded "Buy" button that opens a Stripe-hosted checkout for one product is enough to validate the core loop (browse → pay → see order in DB). Cart and admin can come second.

### Non-obvious decisions to copy on purpose

- **Edge middleware uses `jose`, the login route uses Node `crypto`** — this split is deliberate. Don't try to consolidate them.
- **Product snapshots on `OrderItem`** (`name`, `price`, no FK) — the right call for an e-commerce store. Keep it.
- **`stripeSessionId` unique constraint** is your idempotency key for Stripe redelivery. Keep it.
- **`mapProduct` / `mapOrder`** wrappers stabilise the API response shape against schema changes. Worth keeping even though they look like boilerplate.
- **Rate-limit + timing-safe compare on login** — small, cheap, and prevents the two most likely brute-force vectors. Copy verbatim.

### Things to adapt rather than copy

- **In-memory rate limiter** (`src/lib/rate-limit.ts`) does not survive restarts and is per-instance. Fine for a single VM, useless on serverless with multiple cold starts. Replace with Upstash Redis / Vercel KV if you deploy to Vercel.
- **No CI workflow** — add at minimum a job that runs `npm test` and `next build` on PRs. The current setup makes it possible to merge code that doesn't compile.
- **24h JWT with no refresh** is a UX papercut for an admin-only app, but easy to extend later. Don't bother with refresh tokens until you have more than one user.
- **`images.unoptimized: true`** loses Next.js image optimisation. If you replace SVGs with raster product photos, flip this back on and configure `images.remotePatterns`.
- **Admin password as a single env var** is fine for a sole proprietor; if you'll have more than one admin, replace with a real users table and bcrypt/argon2 hashes.
- **No email** — Stripe sends a receipt, but a "your order has shipped" email almost certainly belongs in this app. Plug in Resend/Postmark.
- **`data/products.json` and `data/orders.json`** — delete; they're unused and will rot.
- **Plain `fetch` everywhere** — works, but no loading deduplication, no retries, no abort. SWR or react-query would be a small upgrade.

### Gotchas you'll likely hit on the first pass

- **`compounding.md` at the repo root is not project documentation** — it's a Zscaler proxy block page that someone saved into the repo by mistake. Ignore it; don't copy it.
- **`build` no longer runs `prisma migrate deploy`** (PR #13). The author chose to apply migrations manually via the Supabase SQL editor because they were producing duplicate-table errors during builds. If you re-add `migrate deploy` to your build, you'll need to manage that yourself.
- **RLS is enabled with no policies.** This works only because Prisma uses the `postgres` superuser. Switching to a less-privileged role (which Supabase recommends for production) will break every query until you write policies.
- **`OrderStatus` is duplicated** between the Prisma enum (`prisma/schema.prisma`) and the TS union in `src/types/index.ts`. Keep them aligned, or generate one from the other.
- **Middleware matcher is an allowlist.** Adding a new protected route without updating the matcher silently leaves it open.
- **Webhook reads `await request.text()` before parsing**, because Stripe HMAC verification needs the raw body. If you swap in `request.json()` you'll silently break signature verification.
- **`crypto.timingSafeEqual` requires equal-length buffers** — that's why the login route does the explicit length check first; it isn't redundant.
- **Stock check is a boolean only.** There's no quantity tracking. If a customer buys "the last bowl", nothing decrements.
- **No webhook for `checkout.session.expired` or `payment_intent.payment_failed`** — sessions that don't complete leave no trace in your DB. Probably acceptable; flagging because it surprised me.
- **`@stripe/stripe-js` is in `dependencies` but never imported.** Safe to drop unless you plan to add Stripe Elements.
- **`postinstall` runs `prisma generate`.** If you fork into an environment without `DATABASE_URL` set, install will succeed (generate doesn't need a live DB) — but a stale generated client can mislead. Re-run after schema edits.
- **No `.gitignore` entry for `.env.local`** is needed because Next.js convention is honoured by the existing `.gitignore`. Verify before committing secrets.

---

*Compiled from a full read of `src/`, `prisma/`, config files, and the migration history. Where I couldn't determine intent from code alone, I've flagged it inline rather than guessed.*
