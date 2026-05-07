# cookie-frontend (COOKie)

Корень репозитория — **Next.js** клиент проекта COOKie (org [COOKieProjectTeam](https://github.com/COOKieProjectTeam)).

## Команды

```bash
npm run dev     # dev-сервер :3000
npm run build   # production-сборка
npm run test    # vitest
npm run lint    # eslint
npm run format  # prettier --write
```

## Читать первым

1. [.claude/rules/protected-main.md](rules/protected-main.md) — **`main`** защищённая ветка: ветка → push → **PR → `main`**; в PR указать связь с **issue** (`Closes` / `Refs #N`).
2. [.claude/rules/sot-and-issues.md](rules/sot-and-issues.md) — источники правды и формат задач.
3. Канон UI и стека: репозиторий [architecture](https://github.com/COOKieProjectTeam/architecture) — `docs/technical/tech-stack.md` и `docs/requirements/FRS.md`.

## Архитектура

FSD-слои: `features/` → `entities/` → `shared/` → `stores/`. Не пропускать слои.

## Ключевые решения

- **Стили**: styled-components 6, ThemeProvider — `src/shared/ui/theme/`
- **Auth**: Axios interceptors, без NextAuth — access token in-memory + HttpOnly refresh cookie
- **API contract**: swagger бэкенда; dev — MSW на `/api/v1/*`
- **Спецификация и задачи**: репозиторий [architecture](https://github.com/COOKieProjectTeam/architecture) + GitHub Project [`COOKieProjectTeam/projects/2`](https://github.com/orgs/COOKieProjectTeam/projects/2)

## Dev / качество перед PR

- **MSW ↔ реальный API:** в разработке мокируется только префикс `/api/v1/*`; при включении живого backend задайте `NEXT_PUBLIC_API_BASE_URL` в `.env.local`. После правок конфигурации проверять и мок-сценарии, и хит реального swagger.
- **Маршруты:** только Next.js App Router, страницы и layouts в `src/app/`; не смешивать с legacy `pages/` без явной задачи.
- **Проверки локально перед PR:** `npm run lint` → `npm run build` → `npm test`; при ошибках сборки чинить перед отправкой в ревью.

## Организационная доска

- Единый org Projects **«cookie»**, workflow добавления новых issue: [github-project-cookie](https://github.com/COOKieProjectTeam/architecture/blob/main/docs/process/github-project-cookie.md).
