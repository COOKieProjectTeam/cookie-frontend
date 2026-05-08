---
name: api-client
description: Generate Axios client modules + Zod schemas + TanStack Query hooks for a backend endpoint group, plus matching MSW handlers for dev/test. Use when adding a new domain (auth, recipes, products, orders, etc.) that talks to the backend.
argument-hint: "<domain> [swagger-path-or-url]"
disable-model-invocation: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash(npm run lint*)
  - Bash(npm run test*)
  - Bash(npx vitest*)
---

Generate a complete client slice for a backend endpoint group: types, schemas, request functions, query/mutation hooks, MSW handlers. Mirror of backend `/api-designer` — backend produces controllers + DTOs, this skill consumes them.

## Inputs

- `$ARGUMENTS` form: `<domain> [swagger-source]`. Examples: `auth`, `recipes ./swagger.json`, `products https://api-dev.cookie.test/swagger/v1/swagger.json`.
- Domain becomes the FSD slice name: `src/entities/<domain>/` and (when actions live in features) `src/features/<domain>-*/`.
- If swagger source omitted: ASK the user for the spec. If a recent `swagger.json` is checked into the repo, prefer that.

## Step 1: Read context

- Read `src/shared/api/axiosClient.ts` — use this client, do NOT create a second axios instance.
- Read `src/shared/api/QueryProvider.tsx` — confirm TanStack Query is wired.
- Glob existing `src/entities/*/api/*.ts` to match conventions (file naming, type exports, query-key shape).
- Read the swagger source. Pull only the paths/schemas that match the domain prefix (e.g. `/api/v1/recipes/*` for `recipes`).

## Step 2: Propose layout

Before writing, propose the file plan and **ASK the user to confirm**:

```
src/entities/<domain>/
├── api/
│   ├── <domain>.ts           # request functions (axios calls)
│   ├── queryKeys.ts          # ['<domain>', ...] tuples for cache invalidation
│   └── index.ts              # re-exports
├── model/
│   ├── schema.ts             # Zod schemas mirrored from swagger
│   ├── types.ts              # `z.infer<typeof ...>` exports
│   └── index.ts
└── lib/
    └── hooks.ts              # useXxxQuery / useXxxMutation wrappers

src/mocks/handlers/<domain>.ts  # MSW handlers for the same endpoints
```

Adjust if the project already has different conventions. Do not introduce a competing structure.

## Step 3: Generate Zod schemas

For every DTO in the swagger group:

- Map types: `string` → `z.string()`, `string($date-time)` → `z.string().datetime()`, `integer` → `z.number().int()`, `format: uuid` → `z.string().uuid()`, `nullable: true` → `.nullable()`, optional fields → `.optional()`, enums → `z.enum([...])`.
- Mirror required/optional from the spec exactly.
- Export both schema and inferred type:
  ```ts
  export const RecipeSchema = z.object({ ... })
  export type Recipe = z.infer<typeof RecipeSchema>
  ```
- Validate response bodies with `.parse()` in the request function (fail fast on contract drift).

## Step 4: Request functions

- Use `axiosClient` from `src/shared/api/axiosClient.ts`. Never `axios.create` again.
- One function per endpoint. Signature: `(args) => Promise<ParsedResponse>`.
- Pass query params via `params:`, bodies via second arg. Never concat URLs by hand for params.
- Parse responses with the matching Zod schema before returning.
- Throw on non-2xx — let the global response interceptor handle 401/refresh.

```ts
import { axiosClient } from '@/shared/api/axiosClient'
import { RecipeSchema, RecipeListSchema, type CreateRecipeInput } from '../model/schema'

export async function getRecipes(params: { page?: number; tag?: string }) {
  const { data } = await axiosClient.get('/api/v1/recipes', { params })
  return RecipeListSchema.parse(data)
}

export async function createRecipe(input: CreateRecipeInput) {
  const { data } = await axiosClient.post('/api/v1/recipes', input)
  return RecipeSchema.parse(data)
}
```

## Step 5: Query keys

Centralize so invalidation is type-safe:

```ts
export const recipesKeys = {
  all: ['recipes'] as const,
  list: (params: { page?: number; tag?: string }) => [...recipesKeys.all, 'list', params] as const,
  detail: (id: string) => [...recipesKeys.all, 'detail', id] as const,
}
```

## Step 6: Hooks

Wrap requests with `useQuery` / `useMutation`. Mutations invalidate the relevant key prefix.

```ts
export function useRecipes(params: { page?: number; tag?: string }) {
  return useQuery({
    queryKey: recipesKeys.list(params),
    queryFn: () => getRecipes(params),
  })
}

export function useCreateRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createRecipe,
    onSuccess: () => qc.invalidateQueries({ queryKey: recipesKeys.all }),
  })
}
```

## Step 7: MSW handlers

For every request function, write a handler in `src/mocks/handlers/<domain>.ts`:

- Match the same path and method.
- Return shape that satisfies the Zod schema (so MSW dev mode and tests don't fail parse).
- Cover happy path + at least one error path (401 / 422 / 500) per endpoint.
- Re-use schema-derived fixtures when possible.

```ts
import { http, HttpResponse } from 'msw'

export const recipesHandlers = [
  http.get('/api/v1/recipes', () => HttpResponse.json({ items: [], total: 0, page: 1 })),
  http.post('/api/v1/recipes', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: 'mock-id', ...body }, { status: 201 })
  }),
]
```

Register in `src/mocks/handlers/index.ts` (create if missing).

## Step 8: Verify

- Run `npm run lint` — fix any new warnings introduced by generated code.
- Write 1 happy-path test per request function under `src/entities/<domain>/api/__tests__/<domain>.test.ts` using MSW.
- Run `npm run test -- --run` and confirm green.

## Hand-off to other skills

- For UI screens consuming these hooks: hand off to `frontend-designer` agent.
- For broader test coverage (hooks states, error UX): `/test-writer`.
- Before commit: `/pr-review` then `/ship`.

## Rules

- Never duplicate `axios.create` — single client owns interceptors and refresh flow.
- Never bypass Zod parsing on responses; that is the contract guard.
- Never put fetch logic inside React components; always go through hooks → request fns.
- MSW handlers must mirror real endpoints 1:1 — drift causes tests to lie.
- If swagger and code disagree, flag the discrepancy. Do NOT silently "fix" the schema.
- If `$ARGUMENTS` is empty, ASK for domain name and swagger source. Do not guess.
