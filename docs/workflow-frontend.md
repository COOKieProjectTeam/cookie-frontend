# Workflow для cookie-frontend

Инструкция по работе с Claude Code в этом репозитории: какие агенты, скиллы, хуки и правила настроены и как их собирать в единый цикл фичи.

Стек: **Next.js 14 + React 18 + TypeScript 5 + styled-components 6 + Axios + TanStack Query + RHF + Zod + MSW + Vitest + RTL**.

> **Главное условие:** открывать VS Code в корне `cookie-frontend` (не `COOK/`). Иначе `.claude/settings.json` не подхватывается, hooks не цепляются, skills не видны.

## 1. Что лежит в `.claude/`

### Agents (`.claude/agents/`)

| Агент | Назначение |
|---|---|
| `frontend-designer` | UI / верстка / дизайн-токены / темы. Под FSD: `features/`, `entities/`, `shared/ui/` |
| `code-reviewer` | Общий ревью изменений |
| `security-reviewer` | XSS, CSP, токены, secrets в bundle |
| `performance-reviewer` | Re-renders, bundle size, RSC vs client |
| `doc-reviewer` | README, комментарии, JSDoc |

### Skills (`.claude/skills/<name>/SKILL.md`, вызов как `/<name>`)

| Скилл | Что делает |
|---|---|
| `/api-client` | Генерит Axios-клиент + Zod-схемы + TanStack Query hooks + MSW handlers под swagger домен |
| `/test-writer` | Vitest + RTL под изменённые файлы (UI, утилиты, бизнес-логика) |
| `/test-writer-api` | Специализированный test-writer для API slices: request fns, hooks, schema drift через MSW |
| `/tdd` | Red → green → refactor цикл |
| `/pr-review` | Параллельный прогон reviewer-агентов |
| `/refactor` | Безопасный рефактор без смены поведения |
| `/debug-fix` | Гипотеза → repro → фикс |
| `/explain` | Объяснение участка кода |
| `/ship` | git status → commit → push → PR (с подтверждением на каждом шаге) |

### Hooks (`.claude/hooks/`)

| Хук | Триггер | Что делает |
|---|---|---|
| `protect-files.sh` | PreToolUse Edit/Write | Блок Edit/Write на `.env*`, `*.pem`, `*.key`, `next.config.*` без явного approve |
| `scan-secrets.sh` | PreToolUse Edit/Write | Ловит хардкод токенов / API ключей |
| `warn-large-files.sh` | PreToolUse Edit/Write | Отстреливает попытку коммитить `.next/`, `node_modules/`, `dist/` |
| `block-dangerous-commands.sh` | PreToolUse Bash | Режет `rm -rf`, `git push --force` в main, `npm publish` |
| `format-on-save.sh` | PostToolUse Edit/Write | `prettier --write` после каждой правки |
| `lint-on-save.sh` | PostToolUse Edit/Write | `next lint --fix --file <path>` для `.ts` / `.tsx` после prettier |
| `session-start.sh` | SessionStart | Подгружает контекст в начале сессии |
| `notify.sh` | Notification | Системные уведомления |

### Rules (`.claude/rules/`, автозагрузка в контекст)

| Файл | Что внутри |
|---|---|
| `protected-main.md` | `main` защищён, только PR |
| `sot-and-issues.md` | SoT — repo `architecture`, формат GitHub issue |
| `frontend.md` | FSD-слои, App Router, дизайн-токены |
| `rsc-policy.md` | RSC vs `'use client'` — когда нужен, композиция, провайдеры, антипаттерны |
| `code-quality.md`, `error-handling.md`, `security.md`, `testing.md` | Поперечные правила |

### Permissions (`settings.json`, allow без подтверждения)

`npm run dev|build|test|lint|format`, `npm install`, `npx vitest`, весь `git *`, `gh pr|issue|run`. Всё остальное — спросит.

`Read/Write/Edit` на `.env*`, `*.pem`, `*.key`, `secrets/**` — **deny**.

## 2. Workflow на реальном примере

**Sprint 01, задача [FE#9](https://github.com/COOKieProjectTeam/cookie-frontend/issues/9): экраны login/register + сессия (FR-US-001).**

### Шаг 1. API-клиент

```
Ты:  /api-client auth ./swagger.json
```

`/api-client` читает swagger, предлагает структуру:

```
src/entities/auth/
├── api/auth.ts          # Axios calls через axiosClient
├── api/queryKeys.ts     # invalidation keys
├── model/schema.ts      # Zod схемы из swagger
├── model/types.ts       # z.infer экспорты
└── lib/hooks.ts         # useLogin / useRegister / useRefresh

src/mocks/handlers/auth.ts  # MSW handlers под те же эндпоинты
```

Подтверждаешь — генерирует. Hooks на запись:
- `prettier` форматирует
- `lint-on-save` пробегает `next lint --fix`
- `scan-secrets` сработал бы если бы случайно утёк токен

### Шаг 2. UI

```
Ты:  /frontend-designer login и register экраны.
     Использовать useLogin / useRegister из entities/auth.
     RHF + Zod, ошибки валидации inline, серверные ошибки — toast
```

Агент выдаёт:
- `src/app/(auth)/login/page.tsx` — RSC (без `'use client'`)
- `src/app/(auth)/register/page.tsx` — RSC
- `src/features/auth/ui/LoginForm.tsx` — клиентский leaf
- `src/features/auth/ui/RegisterForm.tsx` — клиентский leaf
- Стили только через токены `src/shared/ui/theme/`

Композиция по правилу из `frontend.md`: `'use client'` только на формах, не на страницах.

### Шаг 3. Тесты

API slice:

```
Ты:  /test-writer-api auth
```

- `auth.ts` — happy path, schema drift (ZodError), 401/422/500, query params
- `useLogin` / `useRegister` / `useRefresh` — loading→success, error path, invalidation
- 401 → refresh → retry интеграция (один раз на slice)

UI:

```
Ты:  /test-writer
```

- `LoginForm` — render, submit happy path, validation per field, loading, server error toast
- `RegisterForm` — то же самое

### Шаг 4. Ревью

```
Ты:  /pr-review
```

Запускает `code-reviewer`, `security-reviewer`, `performance-reviewer` параллельно. Сводный отчёт:

```
## PR Review: feature/auth-screens

src/features/auth/ui/LoginForm.tsx:34:
  [perf] Inline object on Controller rules — re-render каждый ввод (fix: useMemo)

src/entities/auth/api/auth.ts:18:
  [sec] Access-token логируется в console.error (fix: убрать или маскировать)

src/app/(auth)/login/page.tsx:1:
  [code] 'use client' стоит, но компонент не использует hooks
         → можно RSC, форму вынести в client leaf
```

Чинишь замечания.

### Шаг 5. Локальные проверки и shipping

```bash
npm run lint
npm run build
npm test
```

```
Ты:  /ship "feat: add login/register screens (FR-US-001)"
```

`/ship` показывает diff, предлагает файлы для стейджа, пишет commit message по стилю репо, пушит, создаёт PR с `Refs #9`. На каждом шаге подтверждение.

`block-dangerous-commands.sh` заблокирует `push --force` или push в `main`.

## 3. Чем frontend отличается от backend workflow

| Аспект | Backend (.NET) | Frontend (Next.js) |
|---|---|---|
| Дизайн-агент | `api-designer` (DTO, controllers, MediatR) | `frontend-designer` (UI, токены, FSD) |
| Клиент-генератор | swagger → controllers | `/api-client` swagger → Axios + Zod + hooks |
| Format hook | `dotnet format` | `prettier --write` |
| Lint hook | `dotnet build` warnings | `next lint --fix` |
| Тест-стек | xUnit + WebAppFactory | Vitest + RTL + MSW |
| Boundary mock | mock DbContext / Identity | MSW на `/api/v1/*` |
| Артефакты | OpenAPI spec | bundle size, RSC/client разметка |
| Слои | Clean Architecture (API→App→Domain→Infra) | FSD (app→features→entities→shared) |
| Performance focus | EF Core N+1, async/await | re-renders, useMemo, dynamic imports |
| Дополнительная политика | — | RSC vs `'use client'` (frontend.md) |

## 4. Полезные ссылки

- Канон стека: [architecture/docs/architecture/technical/tech-stack.md](https://github.com/COOKieProjectTeam/architecture/blob/main/docs/architecture/technical/tech-stack.md)
- Требования: [architecture/docs/requirements/FRS.md](https://github.com/COOKieProjectTeam/architecture/blob/main/docs/requirements/FRS.md)
- Формат issue: [architecture/docs/process/github-issue-format.md](https://github.com/COOKieProjectTeam/architecture/blob/main/docs/process/github-issue-format.md)
- Org Project: [COOKieProjectTeam/projects/2](https://github.com/orgs/COOKieProjectTeam/projects/2)
