#!/bin/bash
# Lints the three app packages across CircleCI's parallel containers.
#
# oxlint's native rules finish in about a second; nearly all of the lint time
# is the tailwindcss JS plugin, which costs a few milliseconds per file and
# runs single-threaded. Splitting the file list across containers is the only
# way to cut the wall time. Each package is linted from its own directory
# because the plugin resolves tailwindcss relative to the working directory.
set -euo pipefail

root=$(pwd)
files=$(mktemp)

# Mirror the ignorePatterns in .oxlintrc.json so the explicit file list does
# not pull in files the directory walk would skip.
git ls-files -- packages/shared packages/webapp packages/extension \
  | grep -E '\.(js|jsx|ts|tsx)$' \
  | grep -vE '\.d\.ts$|/dist/|^packages/webapp/(build|public)/|^packages/webapp/next\.config\.js$' \
  | circleci tests split --split-by=filesize > "$files"

echo "Linting $(wc -l < "$files") files on this container"

for pkg in shared webapp extension; do
  pkg_files=$(grep "^packages/$pkg/" "$files" | sed "s|^packages/$pkg/||" || true)
  [ -z "$pkg_files" ] && continue
  (cd "packages/$pkg" && echo "$pkg_files" | xargs "$root/node_modules/.bin/oxlint" --max-warnings 0)
done

# Formatting is cheap, so one container checks every file.
if [ "${CIRCLE_NODE_INDEX:-0}" = "0" ]; then
  "$root/node_modules/.bin/oxfmt" --check "packages/{shared,webapp,extension}/**/*.{js,jsx,ts,tsx}"
fi
