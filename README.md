# COOKie Frontend

Next.js 14 frontend application for COOKie recipe platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **State Management**:
  - Zustand (global client state)
  - TanStack Query v5 (server state)
- **Styling**: TailwindCSS + Custom Components
- **Forms**: React Hook Form + Zod
- **Auth**: NextAuth.js v5
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library
- **Date Utils**: date-fns
- **UI Primitives**: Headless UI (for complex components)

## Prerequisites

- Node.js 20.x LTS
- npm 10.x or higher
- Access to backend API (ASP.NET Core 8)

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
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- OAuth credentials (Yandex, VK)

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Vitest
- `npm run test:ui` - Run tests with UI
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (main)/            # Main app (recipes, profile)
│   ├── admin/             # Admin panel
│   └── api/               # API routes (NextAuth)
├── components/
│   ├── ui/                # Base UI components
│   ├── recipes/           # Recipe-specific components
│   ├── layout/            # Layout components
│   ├── forms/             # Form components
│   └── common/            # Shared components
├── hooks/
│   └── api/               # TanStack Query hooks
├── lib/
│   ├── api/               # API client & services
│   ├── utils.ts           # Utility functions
│   └── queryClient.ts     # TanStack Query config
├── stores/                # Zustand stores
├── schemas/               # Zod validation schemas
├── types/                 # TypeScript types
└── tests/                 # Test setup & mocks
```

## Architecture Documentation

For detailed architecture and technical specifications, see:

- [Frontend Stack](https://github.com/COOKAITeam/architecture/blob/main/docs/technical/FRONTEND_STACK.md)
- [Folder Structure](https://github.com/COOKAITeam/architecture/blob/main/docs/technical/FRONTEND_FOLDER_STRUCTURE.md)
- [Project Backlog](https://github.com/COOKAITeam/architecture/blob/main/docs/planning/PROJECT_BACKLOG.md)
- [Multi-Repo Workflow](https://github.com/COOKAITeam/architecture/blob/main/docs/guides/MULTI_REPO_WORKFLOW.md)
- [Git Workflow](https://github.com/COOKAITeam/architecture/blob/main/docs/guides/git_workflow.md)

## Related Repositories

- [Architecture](https://github.com/COOKAITeam/architecture) - Documentation & specs
- [Backend](https://github.com/COOKAITeam/cookie-backend) - ASP.NET Core 8 API

## Development Workflow

### Creating Features

1. Check backlog in architecture repo for task details
2. Create issue in this repo linking to architecture backlog
3. Create feature branch: `git checkout -b feature/recipe-cards`
4. Implement feature following architecture specs
5. Create PR with reference to architecture docs
6. Update architecture docs if design changes

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

Implements COOKAITeam/architecture#FRONT-XXX
Closes #YY
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Docker Development

```bash
# Build and run with Docker Compose
docker-compose up

# Rebuild after dependency changes
docker-compose up --build
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui
```

## Code Style

- Use functional components with TypeScript
- Follow ESLint and Prettier configurations
- Use absolute imports with `@/` alias
- Keep components small and focused
- Co-locate tests with components

## Contributing

1. Follow the [Git Workflow Guide](https://github.com/COOKAITeam/architecture/blob/main/docs/guides/git_workflow.md)
2. Always link PRs to architecture docs
3. Ensure tests pass before pushing
4. Update documentation if needed

## License

Proprietary - COOKie Team
