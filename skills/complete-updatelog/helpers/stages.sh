#!/usr/bin/env bash
# /complete-updatelog — stage index for an UPDATELOGV*.md.
#
#   stages.sh UPDATELOGV73.md          -> "N<TAB>status<TAB>line<TAB>title" per stage
#   stages.sh --next                   -> lowest-numbered log in cwd with unfinished stages
#
# status: done | red | pending | missing   (red = _In progress_ handoff, resume it FIRST)
set -uo pipefail

index() {
  awk '
    /^# Stage [0-9]+/ {
      n = $3 + 0
      t = $0
      sub(/^# Stage [0-9]+[^A-Za-z0-9(]*/, "", t)
      title[n] = t; line[n] = NR
      if (!(n in seen)) { seen[n] = 1; order[++c] = n }
      next
    }
    /^## Stage [0-9]+ Report/ { cur = $3 + 0; want = 1; next }
    want && NF {
      s = "done"
      if ($0 ~ /^_Pending\._*$/)  s = "pending"
      else if ($0 ~ /_In progress/) s = "red"
      status[cur] = s; want = 0
    }
    END {
      for (i = 1; i <= c; i++) {
        n = order[i]
        printf "%s\t%s\t%s\t%s\n", n, (n in status ? status[n] : "missing"), line[n], title[n]
      }
    }
  ' "$1"
}

if [ "${1:-}" = "--next" ]; then
  for f in $(ls UPDATELOGV*.md 2>/dev/null | sort -V); do
    if index "$f" | grep -qE '	(pending|red|missing)	'; then
      pending="$(index "$f" | grep -cE '	(pending|red|missing)	')"
      total="$(index "$f" | wc -l | tr -d ' ')"
      echo "file=${f}"
      echo "unfinished=${pending}/${total}"
      exit 0
    fi
  done
  echo "file="
  echo "unfinished=0/0"
  exit 0
fi

index "${1:?usage: stages.sh UPDATELOGV<N>.md | stages.sh --next}"
