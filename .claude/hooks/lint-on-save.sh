#!/bin/bash
# Auto-lints TS/TSX files after Claude edits them.
# PostToolUse hook for Edit|Write. Runs AFTER format-on-save.
# Silent on success. Output goes to stderr only on failure so the
# hook contributes zero tokens on the green path.
#
# Strategy:
#   - Only lint .ts / .tsx (skip plain .js, .json, configs).
#   - Skip node_modules, build output, generated files.
#   - Use `next lint --fix --file <path>` because the project script is `next lint`.
#   - Fall back to `npx eslint --fix` if next lint is unavailable.
#   - Non-zero ESLint exit (= unfixable error) is surfaced to Claude via stderr,
#     so the next turn can address it. We do NOT block the edit (exit 0 always).

if ! command -v jq >/dev/null 2>&1; then
  exit 0
fi

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

EXTENSION="${FILE_PATH##*.}"

case "$EXTENSION" in
  ts|tsx) ;;
  *) exit 0 ;;
esac

# Skip files that ESLint should not see.
case "$FILE_PATH" in
  *node_modules/*|*.next/*|*dist/*|*build/*|*coverage/*) exit 0 ;;
  *.d.ts) exit 0 ;;
  *.gen.ts|*.generated.ts|*.gen.tsx|*.generated.tsx) exit 0 ;;
esac

find_project_root() {
  local dir="$PWD"
  while [ "$dir" != "/" ]; do
    if [ -f "$dir/package.json" ] || [ -d "$dir/.git" ]; then
      echo "$dir"
      return
    fi
    dir=$(dirname "$dir")
  done
  echo "$PWD"
}

ROOT=$(find_project_root)

# Require an ESLint config to run anything.
HAS_ESLINT_CONFIG=false
for cfg in .eslintrc .eslintrc.json .eslintrc.js .eslintrc.cjs .eslintrc.yml .eslintrc.yaml eslint.config.js eslint.config.mjs eslint.config.cjs; do
  if [ -f "$ROOT/$cfg" ]; then
    HAS_ESLINT_CONFIG=true
    break
  fi
done

if [ "$HAS_ESLINT_CONFIG" = false ]; then
  exit 0
fi

# Prefer next lint when this is a Next.js project (catches Next-specific rules).
LINT_OUTPUT=""
LINT_EXIT=0

if [ -f "$ROOT/node_modules/.bin/next" ] && grep -q '"next"' "$ROOT/package.json" 2>/dev/null; then
  LINT_OUTPUT=$(cd "$ROOT" && npx --no-install next lint --fix --file "$FILE_PATH" 2>&1)
  LINT_EXIT=$?
elif [ -f "$ROOT/node_modules/.bin/eslint" ]; then
  LINT_OUTPUT=$(cd "$ROOT" && npx --no-install eslint --fix "$FILE_PATH" 2>&1)
  LINT_EXIT=$?
else
  exit 0
fi

# On failure, surface the lint output to Claude so it can react.
if [ "$LINT_EXIT" -ne 0 ]; then
  echo "lint-on-save: ESLint reported issues in $FILE_PATH" >&2
  echo "$LINT_OUTPUT" >&2
fi

exit 0
