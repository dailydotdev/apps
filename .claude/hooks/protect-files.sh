#!/bin/bash
# Prevent modification of sensitive files that should be edited manually
# Exit code 2 blocks the tool and shows the message to Claude

set -euo pipefail

input_data=$(cat)
file_path=$(echo "$input_data" | jq -r '.tool_input.file_path // empty')

if [[ -z "$file_path" ]]; then
  exit 0
fi

# Protected patterns for apps monorepo
protected_patterns=(
  "pnpm-lock.yaml"
  ".env"
  ".git/"
  "node_modules/"
  ".next/"
  "dist/"
)

for pattern in "${protected_patterns[@]}"; do
  if [[ "$file_path" == *"$pattern"* ]]; then
    echo "Protected file: $file_path - this file should be edited manually" >&2
    exit 2
  fi
done

exit 0
