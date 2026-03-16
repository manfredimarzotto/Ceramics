# Ceramics

A full-featured e-commerce store for handcrafted ceramic pottery and artisan homeware, built with Next.js.

## About

Ceramics is an online storefront that connects customers with handcrafted pottery — bowls, vases, plates, mugs, and planters. The project aims to provide a clean, modern shopping experience with a complete purchase flow (browsing, cart, Stripe checkout) and a built-in admin panel for managing products and orders.

It serves as a production-ready foundation for small artisan businesses looking to sell directly to customers without relying on third-party marketplaces.

## Features

**Storefront**
- Product catalog with category filtering, search, and sorting
- Individual product detail pages
- Shopping cart with localStorage persistence
- Stripe-powered checkout with shipping address collection
- Order confirmation page

**Admin Panel** (`/admin`)
- Password-protected dashboard with JWT session auth
- Product management — create, edit, and delete products
- Order management — view orders and update fulfillment status
- Revenue and order metrics overview

**Technical**
- Input validation on all API routes (Zod)
- SQLite database via Prisma ORM
- Toast notification system for user feedback
- Responsive design with a custom Tailwind CSS color palette
- Test suite with Vitest (validation schemas and cart logic)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite via Prisma |
| Payments | Stripe |
| Auth | JWT sessions (jose) |
| Validation | Zod |
| Testing | Vitest, React Testing Library |

## Getting Started

### Prerequisites

- Node.js 18+
- A Stripe account (for payment processing)

### Installation

```bash
git clone https://github.com/manfredimarzotto/Ceramics.git
cd Ceramics
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key (starts with `sk_test_`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (starts with `pk_test_`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_BASE_URL` | Your app URL (default `http://localhost:3000`) |
| `ADMIN_PASSWORD` | Password for the admin panel |
| `ADMIN_SESSION_SECRET` | Random string used to sign session tokens |
| `DATABASE_URL` | SQLite database path (default `file:./dev.db`) |

### Database Setup

```bash
npx prisma migrate dev    # Create the database and run migrations
npm run db:seed            # Populate with sample products
```

### Run

```bash
npm run dev                # Start development server at http://localhost:3000
```

### Other Commands

```bash
npm run build              # Production build
npm test                   # Run test suite
npm run test:watch         # Run tests in watch mode
npm run db:studio          # Open Prisma Studio to browse data
```

## Project Structure

```
src/
├── app/                   # Next.js pages and API routes
│   ├── admin/             # Admin dashboard, products, orders
│   ├── api/               # REST API endpoints
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Order confirmation
│   └── products/          # Product catalog and detail pages
├── components/            # Reusable UI components
├── context/               # React Context (cart state)
├── lib/                   # Data access, auth, validation, Stripe
└── types/                 # TypeScript interfaces
prisma/
├── schema.prisma          # Database schema
├── migrations/            # Migration history
└── seed.ts                # Database seed script
```

## License

This project is provided as-is for educational and commercial use.
