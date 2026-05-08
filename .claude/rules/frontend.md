---
paths:
  - "**/*.tsx"
  - "**/*.ts"
  - "src/features/**"
  - "src/entities/**"
  - "src/shared/ui/**"
  - "src/app/**"
---

# Frontend

## Stack (project-specific)

- **CSS**: styled-components 6 — ThemeProvider at `src/shared/ui/theme/`. All values via theme tokens.
- **Icons**: Lucide React
- **Architecture**: FSD-like — `features/` → `entities/` → `shared/` (ui/api/lib/config) → `stores/`. No cross-layer imports in reverse direction.
- **Rendering**: Next.js 14 App Router — RSC by default, `'use client'` only for browser APIs / hooks / styled-components. See policy below.

## RSC vs Client Components

App Router default is **React Server Component**. Add `'use client'` only when you genuinely need it. Do not blanket-mark every `page.tsx` / `layout.tsx`.

**`'use client'` is required when ANY of these apply:**

- Hooks: `useState`, `useEffect`, `useRef`, `useReducer`, `useContext`, custom hooks built on these.
- Browser APIs: `window`, `document`, `localStorage`, `sessionStorage`, `navigator`, `IntersectionObserver`, `ResizeObserver`, `matchMedia`.
- Event handlers passed to DOM: `onClick`, `onChange`, `onSubmit`, `onKeyDown`, etc. (RSC cannot serialize functions to children.)
- Third-party client-only libraries: TanStack Query hooks (`useQuery`, `useMutation`), Zustand stores, React Hook Form, Framer Motion, anything that calls `createContext` at module scope.
- styled-components rendering — works in RSC only via the `StyledComponentsRegistry` provider; styled tags themselves run on the client.

**Keep as RSC when:**

- The component only renders markup from props or server-fetched data.
- Data fetching uses `fetch`/server-only DAL calls inside the component (RSC can `await`).
- Static layout, headers, footers, server-rendered MDX/article content.

**Composition pattern (preferred):**

Lift `'use client'` to the smallest leaf. A server `page.tsx` can render a client `<LoginForm />` while staying RSC itself. Push state and interactivity down — keep data fetching and shell up.

```tsx
// app/(auth)/login/page.tsx — RSC, no 'use client'
import { LoginForm } from '@/features/auth/ui/LoginForm'
export default function LoginPage() {
  return <main><LoginForm /></main>
}

// features/auth/ui/LoginForm.tsx — client leaf
'use client'
import { useForm } from 'react-hook-form'
export function LoginForm() { /* ... */ }
```

**Anti-patterns (do NOT):**

- Slap `'use client'` on every file "just in case" — kills server tree, bloats bundle, breaks streaming.
- Put `'use client'` on a `layout.tsx` that wraps the whole app for one client provider — wrap providers in a dedicated client component instead.
- Use `useEffect` to fetch data that could be fetched in RSC (`async function Page()` is fine in App Router).
- Mark a component client-only just because a child is — children handle their own boundary.

When unsure: start as RSC. The TS compiler and Next.js dev server surface the boundary errors immediately, then add `'use client'` to the smallest unit that needs it.

## Design Tokens

Tokens live in `src/shared/ui/theme/theme.ts`. Never hardcode raw values in components — always use `${({ theme }) => theme.colors.primary[500]}` etc.

Required categories already defined: colors, typography, spacing, radii, shadows, breakpoints, zIndex.

## Component Framework

| Category | **Project choice** |
|---|---|
| CSS | **styled-components 6** |
| Primitives | none (implement from scratch) |
| Animation | CSS transitions only (via styled-components) |
| Charts | not yet decided |
| Icons | **Lucide React** |

Don't introduce competing libraries.

## Layout

- CSS Grid for 2D, Flexbox for 1D. Use `gap`, not margin hacks.
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- Desktop-first MVP (min 1024px); responsive at 768px and 320px.

## Accessibility (non-negotiable)

- All interactive elements keyboard-accessible.
- Images: meaningful `alt`. Decorative: `alt=""`.
- Form inputs: associated `<label>` or `aria-label`.
- Contrast: 4.5:1 normal text, 3:1 large text.
- Visible focus indicators. Never `outline: none` without replacement.
- `aria-live` for dynamic content. Respect `prefers-reduced-motion`.

## Performance

- Images via `next/image` with Yandex Object Storage domains.
- Animations: `transform` and `opacity` only.
- Large lists: virtualize at 100+ items.
- Bundle: never import whole library for one function.
