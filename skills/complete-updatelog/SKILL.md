---
name: complete-updatelog
description: >-
  Execute the stages in one or more Ostiara UPDATELOGV*.md build docs, committing
  and pushing after each stage. ONLY run when the user explicitly invokes it with the
  slash command (/complete-updatelog vN, /complete-updatelog vN-vM, /complete-updatelog
  next, /complete-updatelog vN --status). Do NOT trigger by association — natural-language
  mentions like "complete updatelog vN", "do updatelogv7", or "finish updatelog 11" are NOT
  triggers on their own; ask the user to run the slash command instead. Once invoked, works
  through the numbered Stages of UPDATELOGV<N>.md one stage at a time (never combined),
  fills in each "Stage N Report", and commits + pushes as "stage<N>v<M>" (M = updatelog
  number) after every stage. Works on an updatelogv<M> branch, respects a daily
  contribution-graph budget (deferring the rest to 1–6am), offers a merge into main with a
  generated house-style description at the end, and always closes with a copy-paste
  NEXT UP handoff block.
---

# Complete Updatelog

Executes the numbered **Stages** inside `UPDATELOGV<M>.md` build docs, one stage at a
time, committing and pushing after each. This is the repo's core build ritual.

Helpers live next to this file and exist so you don't burn context re-deriving state:

| Helper | Use |
|---|---|
| `helpers/stages.sh <FILE>` | Stage index — `N⇥status⇥line⇥title`, status ∈ `done`/`red`/`pending`. Use the line numbers to read ONLY the stage you're on. |
| `helpers/stages.sh --next` | Lowest-numbered log in cwd with unfinished stages. Backs `/complete-updatelog next`. |
| `helpers/budget.sh [n]` | Today's contribution-graph count vs the daily limit, plus a jittered 1–6am resume slot. `n` = commits made this run that GitHub may not have indexed yet. |

Settings live at `~/.claude/state/complete-updatelog/config.env` (auto-created on first
run, survives skill upgrades): `DAILY_LIMIT`, `MERGE_RESERVE`, `RESUME_START`/`RESUME_END`,
`MERGE_MODE`. Never write skill state inside the repo — `git add -A` would commit it.

## When this runs

**Only run this skill when the user explicitly invokes it with a slash command
(`/complete-updatelog …`). Do NOT execute it by association.** Mentioning an updatelog,
describing stage work, or saying something that merely resembles the phrasings below is
not a trigger. If the user talks about completing an updatelog without typing the slash
command, ask them to confirm (or to run `/complete-updatelog`) rather than starting on
your own. The phrasings below identify *which* log to run **once the skill has been
explicitly invoked** — they are not standalone triggers.

Given an explicit `/complete-updatelog` invocation, the argument says which log(s):

| Invocation | Meaning |
|---|---|
| `/complete-updatelog v7` | Every stage of `UPDATELOGV7.md`. The canonical form. |
| `/complete-updatelog v1-v3` | `UPDATELOGV1.md`, then `V2`, then `V3` — each fully, **in order**. |
| `/complete-updatelog next` | `helpers/stages.sh --next` picks the lowest-numbered log with unfinished stages. State which file it chose before starting. |
| `/complete-updatelog v7 --status` | **Read-only.** Print the stage table and budget, do no work, make no commits. |
| `/complete-updatelog --flush` | Resume a deferred run from `~/.claude/state/complete-updatelog/resume-<repo>.md`. |
| `… --no-limit` | Ignore the daily contribution budget for this run. |
| `… --no-merge` | Skip the end-of-run merge prompt; still print the NEXT UP block. |

`v<M>` always identifies the updatelog file `UPDATELOGV<M>.md` at the repo root.

## Non-negotiable rules

1. **One stage at a time. Never combine stages.** Every log begins with
   `# Work on one stage at a time. Do NOT combine stages.` — honor it literally. Do
   all of Stage 1 (work + verify + report + commit + push) before touching Stage 2.
2. **Work on the log's own branch.** Each updatelog gets `updatelogv<M>`, branched off
   `main`, merged back at the end — this is what the repo's history already does
   (`git log --merges` shows `Merge branch 'updatelogv73' — …`). At preflight: if already
   on `updatelogv<M>`, stay; if the branch exists, check it out; otherwise
   `git switch -c updatelogv<M>` from an up-to-date `main`. If the user is on some other
   branch on purpose, ask before switching. Branches are kept after merging, not deleted.
3. **Commit + push after each stage** with the message **`stage<N>v<M>`** — `N` = the
   stage number, `M` = the updatelog number. Examples: Stage 3 of `UPDATELOGV7.md`
   → `stage3v7`; Stage 5 of `UPDATELOGV11.md` → `stage5v11`. No body, no
   co-author trailer, no other text — match the existing history exactly
   (`git log` shows `stage1v19`, `stage2v19`, …).
4. **Follow each stage's own `Verify:` block** before writing its report — typically
   `tsc --noEmit`, `next build`, and `npm test`. If verification fails, fix it before
   committing; the default is not to commit a broken stage.

   **RED COMMITS (the deliberate exception).** A long stage whose verify is still failing
   may be committed as **`stage<N>v<M>-red`** — a checkpoint, never a completion. Use it
   when the work so far is genuinely useful for finishing the job (a root cause found, an
   environment fixed, a harness repaired) and losing it would mean re-deriving that
   context from scratch in a later session. Preserving hard-won context is the whole
   point; a red commit is cheaper than a rediscovery.

   Rules for a red commit:
   - The message is exactly `stage<N>v<M>-red` (e.g. `stage4v48-red`). A stage may have
     several; they are checkpoints, so `-red` repeated is fine.
   - **Never** write the final `## Stage N Report` on a red commit. Instead put a clearly
     marked **`_In progress (red)._`** block there recording: what is fixed, what is still
     failing with current pass/fail counts, the root causes already identified, and the
     next concrete step. That block is the handoff — write it for someone with no memory
     of this session.
   - The stage is **not** done. When it finally goes green, replace the in-progress block
     with the real report and commit the plain `stage<N>v<M>`.
   - Never let a red commit stand in for the stage in a summary. Say "committed red,
     still failing" and give the numbers.
5. **Respect the daily contribution budget.** Check it at preflight and again before every
   commit. At the limit, finish the current stage, commit it, then **stop and defer** —
   see [The daily contribution budget](#the-daily-contribution-budget). Never quietly blow
   past the limit; never fake commit dates to dodge it.
6. **Read `NOW.md` first** (the CLAUDE.md orientation ritual) and **update `NOW.md`**
   when a log's final stage instructs it (most final/coherence stages say
   "Update NOW.md"). Fold that NOW.md edit into that stage's commit.
7. **Obey DESIGN.md** for any visual/UI work (Cabinet Grotesk display, Geist body,
   Geist Mono figures; violet `#8C43F6`; cool `#FBFBFC` console ground; no gradients,
   no AI slop). Each stage spec usually restates the relevant tokens.

## Procedure

### 0. Parse the request
Resolve the set of updatelog numbers. A single `vN` → `[N]`. A range `vN-vM` →
`[N, N+1, …, M]`. `next` → ask `helpers/stages.sh --next`. Process files in ascending
order. Confirm each `UPDATELOGV<M>.md` exists before starting; if one is missing, stop and
tell the user.

### 0.5 Preflight — one shell round-trip, before any work
Run these together and read the result once:

```bash
bash <SKILL>/helpers/budget.sh
bash <SKILL>/helpers/stages.sh UPDATELOGV<M>.md
git status --short && git branch --show-current
ls ~/.claude/state/complete-updatelog/resume-*.md 2>/dev/null
```

Then, in order:
- **A pending resume file for this repo → handle it first.** If `resume_at` has passed,
  say so and continue that run before starting anything new. If it hasn't, tell the user
  the run is still deferred and ask whether to override.
- **Dirty tree?** Report it and ask before proceeding — this skill's `git add -A` would
  sweep unrelated changes into a stage commit.
- **Branch** per rule 2.
- **Budget** per rule 5. If `status=LIMIT` before a single stage runs, do **not** start:
  say how many squares are used, offer `--no-limit`, or offer to schedule the 1–6am run.
- **All stages already `done`?** Say so and stop rather than redoing work.
- If `--status`, print the table + budget and **stop here**.

### 1. Orient (once, up front — not per stage)
Read `NOW.md`. Then read the target log's **Context** and **Decisions** sections (the
header through the first `# Stage 1` line — `helpers/stages.sh` gives you that line
number). Those constraints bind every stage (reuse-this, don't-rebuild-that, "locked" vs
"real", route names). Do not violate them. Do not re-read `NOW.md` or the Context per
stage — read once, carry it.

### 2. For each updatelog `M`, for each Stage `N` in order:

a. **Identify the stage.** Stages are headed `# Stage N — <title>` with a fenced spec
   block (the numbered instructions) followed by a `## Stage N Report` section that
   starts as `_Pending._`. **Read only that stage's line range** (from its `# Stage N`
   line to the next stage's) — these logs run 600–1000 lines and re-reading the whole
   file per stage is the single biggest waste in this skill. Skip any stage whose report
   is already filled in (already done) unless the user explicitly asks to redo it —
   mention which you skipped.

   **A report reading `_In progress (red)._` is NOT done — it is the FIRST stage to
   work on** (`helpers/stages.sh` flags it as `red`). That block is a handoff left by an
   earlier red commit (rule 4): read it in full before touching anything, because it
   records the root causes already found and the next concrete steps, and re-deriving them
   wastes the context the red commit existed to preserve. Resume from its "next steps";
   do not restart the stage.

b. **Do the work** described in the stage's fenced spec block. Only that stage's
   scope. Respect the log's Context/Decisions and DESIGN.md.

c. **Verify** exactly as the stage's `Verify:` line says. **Chain the steps into one
   command** so a clean stage costs one round-trip instead of three:
   `npx tsc --noEmit && npm run build && npm test`. Chained with `&&` the first failure
   stops the rest, which is the behavior you want anyway. Only split them apart when
   something fails and you need to iterate on one step. Fix failures before proceeding.
   If a verify step genuinely can't run in this environment (e.g. a screenshot needs
   authenticated Clerk sign-in — see how V19's reports handle it), say so honestly in
   the report rather than fabricating a result. Never claim a screenshot or a passing
   check you didn't actually produce.

d. **Write the `## Stage N Report`.** Replace `_Pending._` with a concrete report of
   what you did, matching the voice/detail of the existing reports in the same file
   (routes touched, files changed, wiring, verify results, deviations from the spec
   and why). This edits `UPDATELOGV<M>.md` in place.

e. **If this is the log's final stage and it says "Update NOW.md"**, make that edit
   now so it lands in this stage's commit.

f. **Commit + push:**
   ```
   git add -A
   git commit -m "stage<N>v<M>"
   git push -u origin updatelogv<M>
   ```
   Use the plain `stage<N>v<M>` message — nothing else. If `git push` fails
   (no upstream, auth, rejected), stop and report it rather than continuing to the
   next stage on top of an unpushed one.

g. **Re-check the budget** (`helpers/budget.sh <commits-made-this-run>`). If
   `status=LIMIT`, defer here — do not start another stage.

h. Move to the next stage.

### 3. Close out
Two things happen at the end of every run, in this order.

#### 3a. The merge prompt
Once the last requested stage is committed and pushed, **ask the user whether to merge
into `main`** (skip if `--no-merge`, or if stages were deferred — an unfinished log
doesn't merge). Use `AskUserQuestion`, and put the generated merge message in the option
previews so they're choosing on the actual text:

- **Merge + push, keep the branch** (default, `MERGE_MODE=merge-push-keep`)
- **Edit the message first** — show it, take their edits, then merge
- **Don't merge** — stay on the branch, print the commands in the NEXT UP block

Write the message in the house style already in `git log --merges`: a subject naming the
finding, then a short paragraph, then bullets of what actually changed and what it cost.

```
Merge branch 'updatelogv<M>' — <the finding, in the log's own voice>

<2–4 lines: what this log settled, and what it did NOT settle.>

- <the result, with the numbers that make it checkable>
- <what found it — the instrument or assertion, not just the conclusion>
- <what is still open, and which log inherits it>
```

Build it from the stage reports you just wrote and the log's Context — **not** from a
generic template. Reuse the log's own numbers. If a stage went red or a verify was
skipped, that belongs in the bullets; a merge message that hides a red is a lie in the
permanent history.

Then:
```bash
git switch main && git pull --ff-only
git merge --no-ff updatelogv<M> -F <message-file>
git push origin main
```
The merge commit **counts against the daily budget** (that's what `MERGE_RESERVE` holds
back). If merging would cross the limit, say so and offer to defer the merge to the 1–6am
slot with the rest.

#### 3b. The NEXT UP block — always, even on a deferred or failed run
Close every run by printing a fenced block the user can paste into a **fresh, empty
context** and be immediately oriented. It must stand alone: no "as discussed", no
pronouns pointing at this conversation.

````
```
cd "<absolute repo path>"

JUST LANDED — V<M> stages <a>–<b>, <merged to main <sha> | on branch updatelogv<M>, unmerged>.
<One line: what this log actually settled, with its number.>

NEXT: <the exact next slash command, e.g. /complete-updatelog v74>
<or, if no next log exists yet: /updatelog — scaffold V<M+1> for <the inherited job>>

CARRY-IN (what V<M+1> inherits):
- <the open question this log left, with the numbers>
- <any red stage or skipped verify, named>

BUDGET: <used>/<limit> squares today<, remaining stages resume <resume_at>>.
```
````

Get "what's next" in this order, and say which one you used:
1. **Unfinished stages in the current log** (deferred by budget, or red) — those first.
2. **The next `UPDATELOGV<M+1>.md` that exists** with unfinished stages
   (`helpers/stages.sh --next`).
3. **No next log on disk** → read `NOW.md`'s open threads and `TODOS.md`'s top-priority
   unblocked item, and suggest `/updatelog` to scaffold the next one, naming the job it
   should take.

Follow the block with the ordinary short summary: which logs/stages completed, commits
pushed, stages skipped or deferred, verify caveats, and confirmation that `NOW.md` was
updated where required.

## The daily contribution budget

`helpers/budget.sh` reads `contributionCalendar.totalContributions` from the GitHub
GraphQL API for today — **the exact number on the profile graph**. That figure already
counts merge commits, private-repo work, and every repo at once, so there is no per-repo
arithmetic to get wrong. `MERGE_RESERVE` holds squares back for the end-of-run merge.
If `gh` is unavailable it falls back to counting today's local commits in the current repo
and reports `source=local-git-fallback` — say so, because that undercounts other repos.

The graph API lags a few minutes behind a push. Pass the number of commits made this run
as the argument (`budget.sh 3`) so the meter doesn't under-report mid-run.

**At the limit: finish the current stage, commit it, then stop.** Do not start another
stage. Then:

1. **Write the resume file** `~/.claude/state/complete-updatelog/resume-<repo>.md` —
   outside the repo, so `git add -A` can never commit it. It holds: repo path, branch,
   log number, stages done, stages remaining, `resume_at`, whether a merge is still owed,
   and any red-stage handoff. Write it for someone with no memory of this session.
2. **Tell the user, in the NEXT UP block**, that the run is deferred and when it resumes.
3. **Offer to schedule the resume.** Three mechanisms, honestly ranked — say which you
   used and what it depends on:
   - **`CronCreate`** with `helpers/budget.sh`'s `resume_cron` and `recurring: false`,
     prompt `/complete-updatelog --flush`. Simplest, but **session-only** — it fires only
     if this Claude session is still open at that hour, and nothing is written to disk.
   - **Windows Task Scheduler** — durable, survives session exit, needs the machine awake:
     ```
     schtasks /create /tn "ostiara-updatelog-flush" /sc once /st 02:08 /sd 08/11/2026 ^
       /tr "cmd /c cd /d \"<repo>\" && claude -p \"/complete-updatelog --flush\""
     ```
     Only set this up if the user asks for it — it runs an agent unattended.
   - **Next invocation** (always on, zero infrastructure): preflight reads the resume file
     and picks the run back up. If the machine was asleep at 2am, this is what catches it.

**Never fabricate timestamps.** Do not set `GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE` to move
a commit into another day. The point of the limit is to pace real work, and a backdated
commit corrupts the history the reports depend on.

## Notes & edge cases

- **Range means every log fully.** "v1-v3" = finish all of v1's stages (each its own
  commit) before starting v2. Do not interleave. Each log gets its own branch and its own
  merge prompt.
- **Number of stages varies** — the Context/Decisions section usually states it
  ("Three stages." / "Medium feature: four stages."). Trust `helpers/stages.sh` (which
  reads the actual `# Stage N` headings), not that prose, if they disagree.
- **The leading `charlie` line** and the two `#` comment lines at the top of each log
  are intentional — don't remove them when editing the report sections.
- **Don't relitigate the founder's direction** (build-first, long horizon — see
  NOW.md). Just execute the stages as written.
- If the user says "complete updatelog" with **no number**, ask which one (or use
  `next` if it's unambiguous).
- **Batched commits (when the user asks to push/commit every N stages).** The default
  is one commit + push per stage (rule 3). But if the invocation says something like
  "only push every 4 stages", that means **both** committing AND pushing are batched —
  you do NOT make a per-stage commit. Still execute one stage at a time (work + verify +
  report per stage, never combined); just defer the commit. **Batches align to updatelog
  (version) boundaries**, one commit per version covering all of that version's stages,
  and the message uses a stage RANGE: **`stage<first>-<last>v<M>`** (e.g. all four stages
  of `UPDATELOGV6.md` → `stage1-4v6`; a v3 with three stages → `stage1-3v3`). A single-
  stage batch keeps the plain `stage<N>v<M>` form. Fold each version's report edits (and
  any final-stage `NOW.md` update) into that version's one commit, then push. If a push
  fails, stop and report rather than starting the next version.
- **Batching interacts with the budget in your favor** — four stages as one commit is one
  square instead of four. If a run is about to hit the limit, offering to batch the
  remainder is a legitimate alternative to deferring. Offer it; don't switch silently.
- **`/complete-updatelog-nocommit`** is the sibling that never touches git. Budget, branch,
  and merge rules don't apply there; the NEXT UP block does.
