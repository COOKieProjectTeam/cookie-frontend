# COOKie Frontend

Next.js 14 frontend application for COOKie recipe platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router, RSC by default)
- **Language**: TypeScript 5.x (strict mode)
- **State Management**:
  - Zustand (global client state)
  - TanStack Query v5 (server state)
- **Styling**: styled-components 6 + ThemeProvider (design tokens, light/dark)
- **Forms**: React Hook Form + Zod
- **Auth**: Axios interceptors — access token in-memory + HttpOnly refresh cookie
- **HTTP Client**: Axios
- **API Mocking**: MSW v2 (intercepts `/api/v1/*` in dev)
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **Date Utils**: date-fns
- **Linting / Format**: ESLint (`next/core-web-vitals`) + Prettier
- **Pre-commit**: husky + lint-staged

## Prerequisites

- Node.js 20.x LTS
- npm 10.x or higher
- Backend API (ASP.NET Core 8) **or** MSW mocks enabled in dev

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

| Variable | Purpose | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:5000` |
| `NEXT_PUBLIC_API_TIMEOUT` | Axios timeout (ms) | `10000` |
| `NEXT_PUBLIC_USE_MSW` | Enable API mocks in dev | `true` / `false` |

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Vitest (watch mode)
- `npm run test -- --run` - Single test run (CI)
- `npm run test:ui` - Run tests with UI inspector
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (main)/            # Main app (recipes, profile, favorites)
│   └── admin/             # Admin panel
├── features/              # Business features (auth, recipe-search, meal-plan, …)
├── entities/              # Domain entities: Recipe, User, MealPlan — models + API + UI cards
├── shared/
│   ├── api/               # Axios client, QueryProvider
│   ├── ui/                # Base UI primitives (Button, Input, …) + theme/tokens
│   ├── lib/               # Utilities, hooks
│   └── config/            # Environment constants
├── stores/                # Zustand stores
└── tests/                 # Global test setup, MSW handlers
```

FSD layer rule: imports go down only (`features` → `entities` → `shared`).

## Architecture Documentation

For detailed architecture and technical specifications, see:

- [Tech Stack](https://github.com/COOKieProjectTeam/architecture/blob/main/docs/architecture/technical/tech-stack.md)
- [FRS](https://github.com/COOKieProjectTeam/architecture/blob/main/docs/requirements/FRS.md)
- [GitHub Project Process](https://github.com/COOKieProjectTeam/architecture/blob/main/docs/process/github-project-cookie.md)

## Related Repositories

- [Architecture](https://github.com/COOKieProjectTeam/architecture) - Documentation & specs
- [Backend](https://github.com/COOKieProjectTeam/cookie-backend) - ASP.NET Core 8 API

## Docker Development

```bash
# Build and run with Docker Compose
docker compose up

# Rebuild after dependency changes
docker compose up --build
```

## Testing

```bash
# Run all tests in watch mode
npm test

# Single run (CI)
npm test -- --run

# Run tests with UI inspector
npm run test:ui
```

## GitHub Projects v2 («cookie»)

Единый org backlog: https://github.com/orgs/COOKieProjectTeam/projects/2

Авто-добавление новой issue на доску включается workflow **Add issue to COOK org project** (файл из раздела «Автоматизация» в [github-project-cookie](https://github.com/COOKieProjectTeam/architecture/blob/main/docs/process/github-project-cookie.md)) плюс репозиторный секрет **`ADD_TO_PROJECT_PAT`**.

## License

Proprietary - COOKie Team
