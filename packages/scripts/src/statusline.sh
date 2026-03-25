#!/usr/bin/env bash
# Superset statusline script for Claude Code
#
# Displays agent metrics in the terminal statusline and sends telemetry
# to Superset's API for per-agent tracking in the dashboard.
#
# Configuration (environment variables):
#   SUPERSET_API_KEY  - Your Superset API key (sk_live_...)
#   SUPERSET_API_URL  - API base URL (default: https://api.superset.sh)
#
# Claude Code settings.json:
#   {
#     "statusLine": {
#       "type": "command",
#       "command": "/path/to/statusline.sh"
#     }
#   }

set -euo pipefail

# Read JSON from stdin (Claude Code sends statusline data here)
INPUT=$(cat)

# --- Display portion (synchronous, fast) ---
COST=$(echo "$INPUT" | jq -r '.cost.total_cost_usd // 0')
CTX=$(echo "$INPUT" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)
MODEL=$(echo "$INPUT" | jq -r '.model.display_name // "unknown"')
AGENT=$(echo "$INPUT" | jq -r '.agent.name // empty')
LINES_ADD=$(echo "$INPUT" | jq -r '.cost.total_lines_added // 0')
LINES_REM=$(echo "$INPUT" | jq -r '.cost.total_lines_removed // 0')
IN_TOK=$(echo "$INPUT" | jq -r '.context_window.total_input_tokens // 0')
OUT_TOK=$(echo "$INPUT" | jq -r '.context_window.total_output_tokens // 0')

# Format token count for display (e.g. 150000 -> 150k)
format_tokens() {
  local n=$1
  if [ "$n" -ge 1000000 ]; then
    printf "%.1fM" "$(echo "$n / 1000000" | bc -l)"
  elif [ "$n" -ge 1000 ]; then
    printf "%.0fk" "$(echo "$n / 1000" | bc -l)"
  else
    printf "%s" "$n"
  fi
}

IN_DISPLAY=$(format_tokens "$IN_TOK")
OUT_DISPLAY=$(format_tokens "$OUT_TOK")

# Build context bar
if [ "$CTX" -ge 80 ]; then
  CTX_COLOR="\033[31m" # Red
elif [ "$CTX" -ge 60 ]; then
  CTX_COLOR="\033[33m" # Yellow
else
  CTX_COLOR="\033[32m" # Green
fi
RESET="\033[0m"

if [ -n "$AGENT" ]; then
  printf "%s | %s | \$%.4f | ${CTX_COLOR}ctx:%s%%${RESET} | %s/%s tok | +%s/-%s" \
    "$AGENT" "$MODEL" "$COST" "$CTX" "$IN_DISPLAY" "$OUT_DISPLAY" "$LINES_ADD" "$LINES_REM"
else
  printf "%s | \$%.4f | ${CTX_COLOR}ctx:%s%%${RESET} | %s/%s tok | +%s/-%s" \
    "$MODEL" "$COST" "$CTX" "$IN_DISPLAY" "$OUT_DISPLAY" "$LINES_ADD" "$LINES_REM"
fi

# --- Telemetry portion (background, fire-and-forget) ---
API_KEY="${SUPERSET_API_KEY:-}"
API_URL="${SUPERSET_API_URL:-https://api.superset.sh}"

if [ -z "$API_KEY" ]; then
  exit 0
fi

# Send telemetry in background so it doesn't block the statusline
curl -s -X POST "${API_URL}/api/telemetry" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$INPUT" \
  --max-time 5 \
  >/dev/null 2>&1 &

exit 0
