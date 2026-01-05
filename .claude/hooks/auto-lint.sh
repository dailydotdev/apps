#!/bin/bash
# Auto-lint TypeScript files after edits
# Runs eslint --fix on the edited file for fast, single-file linting

set -euo pipefail

input_data=$(cat)
file_path=$(echo "$input_data" | jq -r '.tool_input.file_path // empty')

# Skip if no file path or not a TypeScript file
if [[ -z "$file_path" ]] || [[ ! "$file_path" =~ \.(ts|tsx)$ ]]; then
  exit 0
fi

# Only lint if file exists (skip for failed writes)
if [[ ! -f "$file_path" ]]; then
  exit 0
fi

# Run eslint fix on the single file (suppress errors to avoid blocking)
cd "$CLAUDE_PROJECT_DIR" && pnpm eslint --fix "$file_path" 2>/dev/null || true

exit 0
