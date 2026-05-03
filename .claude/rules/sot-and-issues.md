# Источники правды и GitHub Issues (frontend)

## Канон текста требований

Ведущая копия: **Obsidian** — `Knowledge/Development/Projects/COOKie/`. Детали UI — **FRS** и tech-stack. Не дублировать полные тексты спеки в issues.

## Формат issue

Заголовок: `[S1|…] UI: …`. Секции как в vault `process/github-issue-format.md`; форма — `.github/ISSUE_TEMPLATE/task.yml`.

**Trace:** FR + `Vault:` (путь к заметке, напр. `Knowledge/Development/Projects/COOKie/requirements/FRS.md §…`).

**Companion:** при вертикали указывать issue в `cookie-backend`.

## Pull Request

- **`main`** защищён: только ветка + **PR**. См. `.claude/rules/protected-main.md`.
- В описании PR — ссылка на **issue** (`Refs`/`Closes #NN`).

## Стек (сверка)

Канон: **Next.js 14**, **React 18**, **TS 5**, TanStack Query, Zustand, styled-components, RHF + Zod, Axios, MSW — см. `architecture/technical/tech-stack.md` в vault.
