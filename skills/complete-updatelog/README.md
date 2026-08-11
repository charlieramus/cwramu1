# complete-updatelog

| Skill | What it does |
|-------|--------------|
| `/complete-updatelog` | Works through the numbered **Stages** of one or more `UPDATELOGV<M>.md` build docs — one stage at a time, never combined. Does the stage's work, runs its `Verify:` steps, fills in the `Stage N Report`, then **commits + pushes as `stage<N>v<M>`** after each stage. Ends by offering a merge into `main` with a generated house-style description, and always prints a copy-paste **NEXT UP** block. |

**How to trigger:** `/complete-updatelog v11` · `/complete-updatelog v1-v3` (each log fully, in order) · `/complete-updatelog next` (auto-picks the lowest log with unfinished stages) · `/complete-updatelog v11 --status` (read-only stage table + budget) · `/complete-updatelog --flush` (resume a deferred run). Flags: `--no-limit`, `--no-merge`.

**Commit convention:** `stage<N>v<M>` — N = stage number, M = updatelog number (e.g. `stage3v7`, `stage5v11`). Red checkpoint: `stage<N>v<M>-red`. Batched: `stage<first>-<last>v<M>`.

**Branch convention:** each log runs on `updatelogv<M>` off `main`, merged back with `--no-ff` and a message in the repo's existing voice (`Merge branch 'updatelogv73' — T-41 has a cause: the resolve is short, 17 of 54`). Branches are kept.

**Daily budget:** `helpers/budget.sh` reads `contributionCalendar.totalContributions` from the GitHub API — the exact number on your profile graph, already counting merges and private repos across every repo. At the limit the run finishes its current stage, commits, writes a resume file outside the repo, and defers the rest to a jittered 1–6am slot. Never fabricates commit dates.

**Settings:** `~/.claude/state/complete-updatelog/config.env` (auto-created, survives skill upgrades) — `DAILY_LIMIT=47`, `MERGE_RESERVE=1`, `RESUME_START=1`, `RESUME_END=6`, `MERGE_MODE=merge-push-keep`.

**Helpers:** `helpers/stages.sh <FILE>` → `N⇥done|red|pending⇥line⇥title` (line numbers let it read only the stage it's on instead of a 1000-line log). `helpers/stages.sh --next` → next unfinished log. `helpers/budget.sh [n]` → today's count vs limit + a resume slot.

**Guardrails:** reads `NOW.md` first · updates `NOW.md` on final stages that ask for it · stops on a failed verify, a dirty tree, or a failed `git push` · skips stages already reported · resumes `_In progress (red)._` stages before anything else · won't fake a screenshot, a passing check, or a commit date.
