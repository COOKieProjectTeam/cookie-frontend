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
