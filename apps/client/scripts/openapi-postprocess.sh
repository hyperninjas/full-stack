#!/usr/bin/env sh
# Post-process each generated file: format with Prettier and fix with ESLint
FILE_PATH="$1"
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Prefer local binaries
if command -v pnpm >/dev/null 2>&1; then
  pnpm prettier --log-level silent --write "$FILE_PATH" >/dev/null 2>&1 || true
  pnpm eslint --fix "$FILE_PATH" >/dev/null 2>&1 || true
else
  npx --yes prettier --log-level silent --write "$FILE_PATH" >/dev/null 2>&1 || true
  npx --yes eslint --fix "$FILE_PATH" >/dev/null 2>&1 || true
fi
