# CLAUDE.md

## Project Overview

Ceramics is a Next.js 14 e-commerce store for handcrafted pottery. It uses TypeScript, Tailwind CSS, Prisma (SQLite), and Stripe for payments. There is a password-protected admin panel at `/admin`.

## Common Commands

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm test` — Run tests (Vitest)
- `npm run db:migrate` — Run Prisma migrations
- `npm run db:seed` — Seed the database
- `npm run db:studio` — Open Prisma Studio

## Key Directories

- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — Reusable React components
- `src/lib/` — Data access, auth, validation, Stripe helpers
- `prisma/` — Database schema, migrations, and seed script

## Git Workflow & Merge Conflicts

### Always rebase or merge main before pushing

Before pushing a feature branch, pull the latest main to catch conflicts early:

```bash
git fetch origin main
git merge origin/main
```

### Resolving merge conflicts

1. Run `git merge origin/main` (or rebase) and let Git identify conflicting files.
2. Open each conflicted file and look for `<<<<<<<`, `=======`, `>>>>>>>` markers.
3. Decide which version to keep (or combine both). Remove all conflict markers.
4. `git add <resolved-file>` and `git commit` to complete the merge.
5. Push the branch — the PR conflict warning on GitHub will clear.

### Preventing conflicts

- Keep feature branches short-lived; merge main into them frequently.
- Avoid reformatting or restructuring files that are also being changed on main.
- When both branches modify the same function, coordinate to avoid overlapping edits.

## Code Conventions

- Server components use `async` and fetch data directly via Prisma.
- Client components are marked with `"use client"` and handle interactivity.
- API routes validate input with Zod schemas from `src/lib/validation.ts`.
- Wrap data-fetching in server components with try-catch so a DB failure doesn't blank the entire page.
