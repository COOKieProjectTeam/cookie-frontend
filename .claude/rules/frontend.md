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
- **Rendering**: Next.js 14 App Router — RSC by default, `'use client'` only when needed. Full policy in [`rsc-policy.md`](rsc-policy.md).

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
