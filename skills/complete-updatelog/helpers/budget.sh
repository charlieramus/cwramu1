#!/usr/bin/env bash
# /complete-updatelog — daily contribution budget meter.
#
# Prints KEY=value lines. Optional arg = commits already made this run that the
# GitHub API may not have indexed yet (the graph lags a few minutes).
#
#   budget.sh          -> meter as GitHub currently reports it
#   budget.sh 3        -> same, plus 3 local commits not yet counted
#
# The number compared against DAILY_LIMIT is contributionCalendar.totalContributions
# — the exact figure on your profile graph. It already includes merge commits and
# private-repo work, across every repo, so no per-repo math is needed.
set -uo pipefail

STATE_DIR="${HOME}/.claude/state/complete-updatelog"
CONFIG="${STATE_DIR}/config.env"
mkdir -p "$STATE_DIR"

if [ ! -f "$CONFIG" ]; then
  cat > "$CONFIG" <<'EOF'
# /complete-updatelog settings — edit these freely, they survive skill upgrades.
DAILY_LIMIT=47            # contribution-graph squares/day ceiling (merges count)
MERGE_RESERVE=1           # held back for the end-of-run merge commit
RESUME_START=1            # earliest resume hour, local 24h
RESUME_END=6              # latest resume hour, local 24h
MERGE_MODE=merge-push-keep   # merge-push-keep | merge-push-delete | print-only
EOF
fi
# shellcheck disable=SC1090
. "$CONFIG"

extra="${1:-0}"
offset="$(date +%z | sed 's/\(..\)$/:\1/')"
today="$(date +%Y-%m-%d)"

graph=""
source="github-graph"
if command -v gh >/dev/null 2>&1; then
  graph="$(gh api graphql \
    -f query='query($from:DateTime!,$to:DateTime!){viewer{contributionsCollection(from:$from,to:$to){contributionCalendar{totalContributions}}}}' \
    -F from="${today}T00:00:00${offset}" -F to="${today}T23:59:59${offset}" 2>/dev/null \
    | grep -o '"totalContributions":[0-9]*' | grep -o '[0-9]*$')"
fi

if [ -z "${graph:-}" ]; then
  # Fallback: current repo only, local git. Undercounts other repos — say so.
  graph="$(git log --all --since="${today} 00:00" \
            --author="$(git config user.email 2>/dev/null)" --oneline 2>/dev/null | wc -l | tr -d ' ')"
  graph="${graph:-0}"
  source="local-git-fallback"
fi

used=$(( graph + extra ))
available=$(( DAILY_LIMIT - used - MERGE_RESERVE ))
status="OK"
[ "$available" -le 0 ] && status="LIMIT"

# A resume slot tomorrow, jittered inside the window so runs don't stack on the hour.
span=$(( RESUME_END - RESUME_START ))
[ "$span" -lt 1 ] && span=1
hour=$(( RESUME_START + (RANDOM % span) ))
min=$(( RANDOM % 60 ))

echo "source=${source}"
echo "date=${today}"
echo "graph_today=${graph}"
echo "uncounted_local=${extra}"
echo "used=${used}"
echo "limit=${DAILY_LIMIT}"
echo "merge_reserve=${MERGE_RESERVE}"
echo "available=${available}"
echo "status=${status}"
printf 'resume_at=%s %02d:%02d\n' "$(date -d tomorrow +%Y-%m-%d)" "$hour" "$min"
printf 'resume_cron=%d %d %d %d *\n' "$min" "$hour" "$(date -d tomorrow +%-d)" "$(date -d tomorrow +%-m)"
echo "merge_mode=${MERGE_MODE}"
echo "config=${CONFIG}"
