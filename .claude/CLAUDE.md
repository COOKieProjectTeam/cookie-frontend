# cookie-frontend (COOKie)

Корень репозитория — **Next.js** клиент проекта COOKie (org [COOKieProjectTeam](https://github.com/COOKieProjectTeam)).

## Читать первым

1. [.claude/rules/protected-main.md](rules/protected-main.md) — **`main`** защищённая ветка: ветка → push → **PR → `main`**; в PR указать связь с **issue** (`Closes` / `Refs #N`).
2. [.claude/rules/sot-and-issues.md](rules/sot-and-issues.md) — источники правды и формат задач.
3. Канон UI и стека: `Knowledge/Development/Projects/COOKie/architecture/technical/tech-stack.md` и `requirements/FRS.md` в Obsidian vault.

## Коротко

- Ветки и PR см. [.claude/rules/protected-main.md](rules/protected-main.md): не пушить в `main` напрямую.
- Спецификация в **vault**; issues — структура из `.github/ISSUE_TEMPLATE/task.yml`.
- Контракт API: swagger бэкенда; dev — **MSW** на `/api/v1/*` согласно tech-stack.
- Зеркало/диаграммы: репозиторий [architecture](https://github.com/COOKieProjectTeam/architecture).

### Dev / качество перед PR

- **MSW ↔ реальный API:** в разработке мокируется только префикс **`/api/v1/*`**; при включении живого backend задайте `NEXT_PUBLIC_*`/`NEXT_PUBLIC_API_BASE_URL` в **`.env.local`** (образец — **`.env.example`** в корне репо). После правок конфигурации проверять и мок-сценарии, и хит реального swagger.
- **Маршруты:** только **Next.js App Router**, страницы и layouts в **`src/app/`**; не смешивать с legacy `pages/` без явной задачи на миграцию.
- **Проверки локально перед PR:** `npm run lint` → `npm run build` (включает typecheck сборки Next) → `npm test`; при ошибках сборки править перед отправкой ревью.

### Организационная доска

- Единый org Projects **«cookie»**, workflow добавления новых issue: см. [github-project-cookie](https://github.com/COOKieProjectTeam/architecture/blob/main/docs/process/github-project-cookie.md).
