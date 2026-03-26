#!/usr/bin/env bash
# Superset statusline script for Claude Code
#
# Displays agent metrics in the terminal and writes telemetry
# to the local Superset SQLite database for per-agent tracking.
#
# Dependencies: jq, sqlite3
#
# Configuration:
#   SUPERSET_HOME - Override Superset home directory (default: ~/.superset)
#
# Claude Code settings.json:
#   {
#     "statusLine": {
#       "type": "command",
#       "command": "/path/to/statusline.sh"
#     }
#   }

set -euo pipefail

SUPERSET_HOME="${SUPERSET_HOME:-${HOME}/.superset}"
DB_PATH="${SUPERSET_HOME}/local.db"

# Read JSON from stdin (Claude Code sends statusline data here)
INPUT=$(cat)

# --- Display portion (synchronous, fast) ---
if command -v jq &>/dev/null; then
  COST=$(echo "$INPUT" | jq -r '.cost.total_cost_usd // 0')
  CTX=$(echo "$INPUT" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)
  MODEL=$(echo "$INPUT" | jq -r '.model.display_name // "unknown"')
  AGENT=$(echo "$INPUT" | jq -r '.agent.name // empty')
  IN_TOK=$(echo "$INPUT" | jq -r '.context_window.total_input_tokens // 0')
  OUT_TOK=$(echo "$INPUT" | jq -r '.context_window.total_output_tokens // 0')
  LINES_ADD=$(echo "$INPUT" | jq -r '.cost.total_lines_added // 0')
  LINES_REM=$(echo "$INPUT" | jq -r '.cost.total_lines_removed // 0')

  # Format token count (e.g. 150000 -> 150k)
  format_tokens() {
    local n=$1
    if [ "$n" -ge 1000000 ] 2>/dev/null; then
      printf "%.1fM" "$(echo "$n / 1000000" | bc -l 2>/dev/null || echo 0)"
    elif [ "$n" -ge 1000 ] 2>/dev/null; then
      printf "%.0fk" "$(echo "$n / 1000" | bc -l 2>/dev/null || echo 0)"
    else
      printf "%s" "$n"
    fi
  }

  IN_DISPLAY=$(format_tokens "$IN_TOK")
  OUT_DISPLAY=$(format_tokens "$OUT_TOK")

  # Color-code context usage
  if [ "$CTX" -ge 80 ] 2>/dev/null; then
    CTX_COLOR="\033[31m" # Red
  elif [ "$CTX" -ge 60 ] 2>/dev/null; then
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
fi

# --- Telemetry portion (background, fire-and-forget) ---
# Bail if db doesn't exist or tools are missing
if [ ! -f "$DB_PATH" ] || ! command -v sqlite3 &>/dev/null || ! command -v jq &>/dev/null; then
  exit 0
fi

# Throttle: only write every 5 seconds
THROTTLE_FILE="${SUPERSET_HOME}/.telemetry-last-write"
NOW=$(date +%s)
if [ -f "$THROTTLE_FILE" ]; then
  LAST=$(cat "$THROTTLE_FILE" 2>/dev/null || echo 0)
  if [ $((NOW - LAST)) -lt 5 ] 2>/dev/null; then
    exit 0
  fi
fi

# Write to SQLite in background
(
  echo "$NOW" > "$THROTTLE_FILE"

  SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
  [ -z "$SESSION_ID" ] && exit 0

  # Generate UUID
  ID=$(cat /proc/sys/kernel/random/uuid 2>/dev/null || uuidgen 2>/dev/null || python3 -c "import uuid; print(uuid.uuid4())" 2>/dev/null || echo "unknown")
  NOW_MS=$((NOW * 1000))

  # Extract all fields as tab-separated values
  read -r AGENT_NAME MODEL_ID MODEL_DISPLAY_NAME \
    TOTAL_COST TOTAL_DURATION TOTAL_API_DURATION \
    LINES_ADDED LINES_REMOVED \
    INPUT_TOKENS OUTPUT_TOKENS CTX_SIZE USED_PCT \
    CUR_INPUT CUR_OUTPUT CACHE_CREATE CACHE_READ \
    FIVE_HOUR SEVEN_DAY \
    CURRENT_DIR PROJECT_DIR VERSION EXCEEDS_200K TRANSCRIPT \
    <<< "$(echo "$INPUT" | jq -r '[
      (.agent.name // ""),
      (.model.id // ""),
      (.model.display_name // ""),
      (.cost.total_cost_usd // ""),
      (.cost.total_duration_ms // ""),
      (.cost.total_api_duration_ms // ""),
      (.cost.total_lines_added // ""),
      (.cost.total_lines_removed // ""),
      (.context_window.total_input_tokens // ""),
      (.context_window.total_output_tokens // ""),
      (.context_window.context_window_size // ""),
      (.context_window.used_percentage // ""),
      (.context_window.current_usage.input_tokens // ""),
      (.context_window.current_usage.output_tokens // ""),
      (.context_window.current_usage.cache_creation_input_tokens // ""),
      (.context_window.current_usage.cache_read_input_tokens // ""),
      (.rate_limits.five_hour.used_percentage // ""),
      (.rate_limits.seven_day.used_percentage // ""),
      (.workspace.current_dir // ""),
      (.workspace.project_dir // ""),
      (.version // ""),
      (if .exceeds_200k_tokens then "1" else "0" end),
      (.transcript_path // "")
    ] | @tsv')"

  # Helper: convert empty to NULL, otherwise single-quote for SQL
  sv() { if [ -z "$1" ]; then echo "NULL"; else echo "'${1//\'/\'\'}'"; fi; }
  iv() { if [ -z "$1" ] || [ "$1" = "" ]; then echo "NULL"; else echo "$1"; fi; }

  sqlite3 "$DB_PATH" "
    INSERT INTO agent_telemetry (
      id, session_id, agent_name, model_id, model_display_name,
      total_cost_usd, total_duration_ms, total_api_duration_ms,
      total_lines_added, total_lines_removed,
      total_input_tokens, total_output_tokens, context_window_size, used_percentage,
      current_input_tokens, current_output_tokens, cache_creation_input_tokens, cache_read_input_tokens,
      five_hour_used_percentage, seven_day_used_percentage,
      current_dir, project_dir, version, exceeds_200k_tokens, transcript_path,
      recorded_at
    ) VALUES (
      '$ID', '$SESSION_ID', $(sv "$AGENT_NAME"), $(sv "$MODEL_ID"), $(sv "$MODEL_DISPLAY_NAME"),
      $(sv "$TOTAL_COST"), $(iv "$TOTAL_DURATION"), $(iv "$TOTAL_API_DURATION"),
      $(iv "$LINES_ADDED"), $(iv "$LINES_REMOVED"),
      $(iv "$INPUT_TOKENS"), $(iv "$OUTPUT_TOKENS"), $(iv "$CTX_SIZE"), $(sv "$USED_PCT"),
      $(iv "$CUR_INPUT"), $(iv "$CUR_OUTPUT"), $(iv "$CACHE_CREATE"), $(iv "$CACHE_READ"),
      $(sv "$FIVE_HOUR"), $(sv "$SEVEN_DAY"),
      $(sv "$CURRENT_DIR"), $(sv "$PROJECT_DIR"), $(sv "$VERSION"), $(iv "$EXCEEDS_200K"), $(sv "$TRANSCRIPT"),
      $NOW_MS
    );
  " 2>/dev/null
) &

exit 0
