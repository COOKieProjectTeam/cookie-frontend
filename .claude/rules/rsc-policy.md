---
paths:
  - "src/app/**"
  - "src/features/**/ui/**"
  - "src/entities/**/ui/**"
  - "src/shared/ui/**"
---

# RSC vs Client Components

Next.js 14 App Router. Default rendering is **React Server Component**. Add `'use client'` only when you genuinely need it. Do not blanket-mark every `page.tsx` / `layout.tsx`.

## When `'use client'` is required

Mark a component as client when ANY of these apply:

- **Hooks**: `useState`, `useEffect`, `useRef`, `useReducer`, `useContext`, custom hooks built on these.
- **Browser APIs**: `window`, `document`, `localStorage`, `sessionStorage`, `navigator`, `IntersectionObserver`, `ResizeObserver`, `matchMedia`.
- **Event handlers passed to DOM**: `onClick`, `onChange`, `onSubmit`, `onKeyDown`, etc. RSC cannot serialize functions to children.
- **Third-party client-only libraries**: TanStack Query hooks (`useQuery`, `useMutation`), Zustand stores, React Hook Form, Framer Motion, anything that calls `createContext` at module scope.
- **styled-components rendering**: works in RSC only via the `StyledComponentsRegistry` provider; styled tags themselves run on the client.

## Keep as RSC when

- The component only renders markup from props or server-fetched data.
- Data fetching uses `fetch` / server-only DAL calls inside the component (RSC can `await` directly — no `useEffect`).
- Static layout: headers, footers, server-rendered MDX / article content.

## Composition pattern (preferred)

Lift `'use client'` to the smallest leaf. A server `page.tsx` can render a client `<LoginForm />` while staying RSC itself. Push state and interactivity down — keep data fetching and shell up.

```tsx
// app/(auth)/login/page.tsx — RSC, no 'use client'
import { LoginForm } from '@/features/auth/ui/LoginForm'
export default function LoginPage() {
  return (
    <main>
      <LoginForm />
    </main>
  )
}

// features/auth/ui/LoginForm.tsx — client leaf
'use client'
import { useForm } from 'react-hook-form'
export function LoginForm() {
  /* ... */
}
```

## Anti-patterns (do NOT)

- Slap `'use client'` on every file "just in case" — kills server tree, bloats bundle, breaks streaming.
- Put `'use client'` on a `layout.tsx` that wraps the whole app for one client provider — wrap providers in a dedicated client component instead.
- Use `useEffect` to fetch data that could be fetched in RSC (`async function Page()` is fine in App Router).
- Mark a component client-only just because a child is — children handle their own boundary.

## Provider pattern

For app-wide providers (QueryClient, ThemeProvider, etc.), do NOT mark `app/layout.tsx` as client. Create a client wrapper:

```tsx
// shared/providers/AppProviders.tsx
'use client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'styled-components'
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </QueryClientProvider>
  )
}

// app/layout.tsx — stays RSC
import { AppProviders } from '@/shared/providers/AppProviders'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
```

## Decision shortcut

When unsure: start as RSC. The TS compiler and Next.js dev server surface the boundary errors immediately. Then add `'use client'` to the smallest unit that needs it.
