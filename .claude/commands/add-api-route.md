Create a new API route at `src/app/api/$ARGUMENTS/route.ts`.

Follow the existing patterns in this codebase:
- Add Zod validation schemas to `src/lib/validation.ts` for request body validation
- Use `schema.safeParse()` and return 400 with error details on failure
- Import the Prisma client from `@/lib/db`
- Wrap handler logic in try-catch, returning 500 on unexpected errors
- Use `NextResponse.json()` for all responses
- Add appropriate TypeScript types
