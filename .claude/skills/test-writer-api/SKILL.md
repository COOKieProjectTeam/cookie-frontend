---
name: test-writer-api
description: Write tests for API client slices (Axios request fns, TanStack Query hooks) using MSW. Use right after /api-client generates a domain or when modifying entities/<domain>/api/* and lib/hooks.ts. Specialized counterpart to /test-writer.
argument-hint: "[domain-name]"
disable-model-invocation: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash(npm run test*)
  - Bash(npx vitest*)
---

Write Vitest + MSW tests for an API client slice. Knows the shape produced by `/api-client`: request functions, query keys, query/mutation hooks, MSW handlers.

If you need generic test coverage (UI components, utilities, business logic) use `/test-writer` instead.

## Inputs

- `$ARGUMENTS`: domain name. Example: `auth`, `recipes`, `products`.
- If empty: read `git diff --name-only` and infer from `src/entities/<domain>/api/*.ts`. If multiple, ASK.

## Step 1: Read the slice

For domain `<X>`, read these files (skip silently if absent):

- `src/entities/<X>/api/<X>.ts` — request functions
- `src/entities/<X>/api/queryKeys.ts` — key tuples
- `src/entities/<X>/lib/hooks.ts` — `useXxxQuery` / `useXxxMutation`
- `src/entities/<X>/model/schema.ts` — Zod schemas (use for fixtures)
- `src/mocks/handlers/<X>.ts` — MSW handlers (existing happy path; tests will OVERRIDE per case)
- `src/shared/api/axiosClient.ts` — confirm interceptor behavior (refresh on 401)

## Step 2: Set up the test infra (only if missing)

Check for an MSW Vitest harness. Required:

- `src/mocks/server.ts` exporting `setupServer(...handlers)` for Node (Vitest runs in Node).
- A `vitest.setup.ts` (or equivalent) wired in `vitest.config.ts` with:
  ```ts
  import { server } from './src/mocks/server'
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())
  ```
- A QueryClient wrapper for hook tests:
  ```ts
  // src/test-utils/queryWrapper.tsx
  export function createQueryWrapper() {
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    )
  }
  ```

If any are missing, propose creating them and ASK the user to confirm before writing.

## Step 3: Generate request-function tests

File: `src/entities/<X>/api/__tests__/<X>.test.ts`.

Per request function, write tests for:

- **Happy path** — handler returns valid body matching schema; assert returned data shape and that Zod parsed (no throw).
- **Schema drift** — handler returns malformed body (missing required field, wrong type); assert the function throws `ZodError`. This guards the contract.
- **Server error path** — handler returns 500; assert the function rejects.
- **422 / 400 validation** — assert error reaches caller (axios throws on non-2xx by default).
- **Query params** — assert outgoing request includes expected query string. Use `server.use(http.get(..., ({ request }) => { ... }))` to inspect.

Pattern:

```ts
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { getRecipes } from '../recipes'

describe('getRecipes', () => {
  it('returns parsed list on 200', async () => {
    server.use(
      http.get('/api/v1/recipes', () =>
        HttpResponse.json({ items: [{ id: '1', title: 'Borscht' }], total: 1, page: 1 })
      )
    )
    const result = await getRecipes({})
    expect(result.items).toHaveLength(1)
  })

  it('throws ZodError when response is malformed', async () => {
    server.use(
      http.get('/api/v1/recipes', () => HttpResponse.json({ wrong: 'shape' }))
    )
    await expect(getRecipes({})).rejects.toThrow()
  })

  it('forwards page param to query string', async () => {
    let capturedUrl = ''
    server.use(
      http.get('/api/v1/recipes', ({ request }) => {
        capturedUrl = request.url
        return HttpResponse.json({ items: [], total: 0, page: 2 })
      })
    )
    await getRecipes({ page: 2 })
    expect(capturedUrl).toContain('page=2')
  })
})
```

## Step 4: Generate hook tests

File: `src/entities/<X>/lib/__tests__/hooks.test.tsx`.

Per hook:

**Query hooks (`useXxxQuery`):**

- `isLoading` → `true` on initial render, `false` after resolve.
- `data` matches the parsed schema after success.
- `isError` + `error` set on server failure.
- `queryKey` invariant: re-render with same args reuses cache (no second fetch). Verify with handler call counter.

**Mutation hooks (`useXxxMutation`):**

- `mutate(input)` resolves with parsed response.
- `onSuccess` invalidates the right `queryKeys.*` prefix. Verify by spying on `queryClient.invalidateQueries` or by observing a paired `useQuery` re-fetch.
- Error path: server 422 → `isError` flips, `error` populated, NO invalidation.

Pattern:

```ts
import { renderHook, waitFor } from '@testing-library/react'
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'
import { createQueryWrapper } from '@/test-utils/queryWrapper'
import { useRecipes } from '../hooks'

it('useRecipes returns data on success', async () => {
  server.use(
    http.get('/api/v1/recipes', () =>
      HttpResponse.json({ items: [{ id: '1', title: 'X' }], total: 1, page: 1 })
    )
  )
  const { result } = renderHook(() => useRecipes({}), { wrapper: createQueryWrapper() })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data?.items[0].title).toBe('X')
})
```

## Step 5: Auth refresh path (only for slices that hit protected endpoints)

If the domain's endpoints require auth, add ONE integration test verifying the global 401 → refresh → retry flow:

- First call returns 401.
- `/api/v1/auth/refresh` returns new token.
- Original call retried with new Bearer; resolves 200.

Place under `src/entities/<X>/api/__tests__/<X>.refresh.test.ts`. This is one shared scenario per slice — not per endpoint.

## Step 6: Verify

- `npm run test -- --run src/entities/<X>` — confirm all green.
- Mutation test: temporarily change the request URL in source, rerun — at least one test must fail. If nothing fails, the test is asserting on mocks not behavior. Rewrite.
- Confirm coverage: each exported request fn has ≥ 3 tests (happy + drift + error), each hook has ≥ 2 tests (loading→success, error).

## Output

- Test files placed in `__tests__/` next to the source.
- Brief summary: count per file, scenarios covered, any uncovered branches with reason.

## Rules

- Never mock `axiosClient` directly — go through MSW. The interceptor (refresh on 401) is part of the contract.
- Never assert against MSW handler internals — assert on hook/function output.
- Reset handlers between tests (`server.resetHandlers()` in `afterEach`); don't leak state.
- Use schema-derived fixtures — handler bodies must satisfy the Zod schema or the parse will fail and obscure the test intent.
- One assertion per test where reasonable. Split combined cases.
- If `/api-client` hasn't run yet for this domain, STOP and tell the user to run it first.
