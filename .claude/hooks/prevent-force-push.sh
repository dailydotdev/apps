#!/bin/bash
# Prevent force push commands

set -euo pipefail

input_data=$(cat)
cmd=$(echo "$input_data" | jq -r '.tool_input.command // empty')

if [[ -z "$cmd" ]]; then
  exit 0
fi

if [[ "$cmd" =~ git\ push.*(-f|--force) ]]; then
  echo "Force push is not allowed" >&2
  exit 2
fi

exit 0
