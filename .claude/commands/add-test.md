Write tests for `$ARGUMENTS`.

Follow the existing test patterns in `src/__tests__/`:
- Place test files in `src/__tests__/` with a `.test.ts` or `.test.tsx` extension
- Use Vitest (`describe`, `it`, `expect`) and `@testing-library/react` for component tests
- Use the `@/` path alias for imports
- Cover happy paths, edge cases, and error handling
- Run `npm test` after writing to verify they pass
