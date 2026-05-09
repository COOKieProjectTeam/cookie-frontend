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

INPUT=$(cat)
_PY=""
_pycand=$(command -v python3 2>/dev/null || command -v python 2>/dev/null || true)
if [ -n "$_pycand" ] && printf '' | "$_pycand" -c "pass" >/dev/null 2>&1; then
  _PY="$_pycand"
fi
if [ -n "$_PY" ]; then
  FILE_PATH=$(printf '%s' "$INPUT" | "$_PY" -c \
    "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path',''))" \
    2>/dev/null || true)
else
  FILE_PATH=$(printf '%s' "$INPUT" \
    | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' \
    | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/' \
    | head -1 || true)
fi

if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

EXTENSION="${FILE_PATH##*.}"

case "$EXTENSION" in
  ts|tsx) ;;
  *) exit 0 ;;
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

# Skip files matched by .claude/hooks/lint-skip.txt (one glob pattern per line, # for comments).
SKIP_FILE="$ROOT/.claude/hooks/lint-skip.txt"
if [ -f "$SKIP_FILE" ]; then
  while IFS= read -r pattern || [ -n "$pattern" ]; do
    case "$pattern" in
      ''|\#*) continue ;;
    esac
    # Trim trailing whitespace / CR (handle CRLF line endings on Windows).
    pattern="${pattern%$'\r'}"
    pattern="${pattern%"${pattern##*[![:space:]]}"}"
    [ -z "$pattern" ] && continue
    # Unquoted $pattern so glob metacharacters expand as a pattern, not a literal.
    case "$FILE_PATH" in
      $pattern) exit 0 ;;
    esac
  done < "$SKIP_FILE"
fi

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

# On failure, surface only the diagnostics for THIS file.
# ESLint stylish formatter groups output as:
#   <abs path>
#     <line>:<col>  <level>  <message>  <rule>
#     ...
#   <next abs path>
#     ...
#   <summary lines>
# We extract just the block whose header matches our file (basename match,
# tolerating Windows backslash/forward-slash path differences) plus the trailing
# summary line ("X problems (Y errors, Z warnings)") for context.
if [ "$LINT_EXIT" -ne 0 ]; then
  BASENAME=$(basename "$FILE_PATH")
  FILTERED=$(printf '%s\n' "$LINT_OUTPUT" | awk -v target="$BASENAME" '
    BEGIN { in_block = 0 }
    # Header line: starts at column 0, contains the target basename, no leading space.
    /^[^[:space:]]/ {
      if (index($0, target) > 0) {
        in_block = 1
        print
        next
      } else {
        in_block = 0
      }
    }
    # Diagnostic lines: indented with leading whitespace.
    in_block && /^[[:space:]]/ { print; next }
    # Summary: capture "X problems (...)" line.
    /^[[:space:]]*✖?[[:space:]]*[0-9]+ problem/ { print }
  ')

  if [ -n "$FILTERED" ]; then
    echo "lint-on-save: ESLint reported issues in $FILE_PATH" >&2
    printf '%s\n' "$FILTERED" >&2
  else
    # Fallback: full output if filter pattern misses (e.g. JSON formatter, custom config).
    echo "lint-on-save: ESLint reported issues in $FILE_PATH (unfiltered)" >&2
    printf '%s\n' "$LINT_OUTPUT" >&2
  fi
fi

exit 0