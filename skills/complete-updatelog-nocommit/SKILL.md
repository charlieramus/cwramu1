---
name: complete-updatelog-nocommit
description: >-
  Execute the stages in one or more Ostiara UPDATELOGV*.md build docs WITHOUT committing
  or pushing anything — code and reports only, everything left uncommitted in the working
  tree. ONLY run when the user explicitly invokes it with the slash command
  (/complete-updatelog-nocommit vN, /complete-updatelog-nocommit vN-vM). Do NOT trigger by
  association — natural-language mentions like "complete updatelog vN without committing",
  "do updatelogv7 no commit", or "finish updatelog 11" are NOT triggers on their own; ask
  the user to run the slash command instead. Once invoked, works through the numbered
  Stages of UPDATELOGV<N>.md one stage at a time (never combined) and fills in each
  "Stage N Report". Never runs git commit, git push, or any other git write command.
---

# Complete Updatelog (no commit)

Executes the numbered **Stages** inside `UPDATELOGV<M>.md` build docs, one stage at a
time. Identical to `/complete-updatelog` **except that it never commits and never
pushes** — all work is left in the working tree for the user to review and commit
themselves.

## When this runs

**Only run this skill when the user explicitly invokes it with a slash command
(`/complete-updatelog-nocommit …`). Do NOT execute it by association.** Mentioning an
updatelog, describing stage work, or saying something that merely resembles the phrasings
below is not a trigger. If the user talks about completing an updatelog without typing the
slash command, ask them to confirm (or to run `/complete-updatelog-nocommit`) rather than
starting on your own. The phrasings below identify *which* log to run **once the skill has
been explicitly invoked** — they are not standalone triggers.

Given an explicit `/complete-updatelog-nocommit` invocation, the argument says which log(s):
- `/complete-updatelog-nocommit v7` → do every stage of `UPDATELOGV7.md`.
- `/complete-updatelog-nocommit v1-v3` (or "v1 to v3", "updatelogs 1 through 3") → do
  `UPDATELOGV1.md`, then `UPDATELOGV2.md`, then `UPDATELOGV3.md`, **in order**.
- `/complete-updatelog-nocommit v11` — the canonical form.
- `/complete-updatelog-nocommit next` → the lowest-numbered log with unfinished stages.
- `/complete-updatelog-nocommit v11 --status` → read-only stage table, no work done.

`v<M>` always identifies the updatelog file `UPDATELOGV<M>.md` at the repo root.

The `/complete-updatelog` helpers work here too and are read-only:
`bash ../complete-updatelog/helpers/stages.sh <FILE>` prints `N⇥done|red|pending⇥line⇥title`,
and `--next` picks the next unfinished log. Use the line numbers to read only the stage
you're on rather than a 1000-line file. Do **not** use `helpers/budget.sh` — there are no
commits here to budget.

## Non-negotiable rules

1. **One stage at a time. Never combine stages.** Every log begins with
   `# Work on one stage at a time. Do NOT combine stages.` — honor it literally. Do
   all of Stage 1 (work + verify + report) before touching Stage 2.
2. **Never commit. Never push. Zero git writes.** This is the whole point of this
   variant. Do not run `git add`, `git commit`, `git push`, `git stash`, `git reset`,
   `git checkout`/`git switch`, `git merge`, `git rebase`, `git tag`, or any other
   command that mutates the repository or the index. Read-only git (`git status`,
   `git diff`, `git log`) is fine and often useful for reporting. Every stage's changes
   simply accumulate in the working tree; the user commits when they're ready.

   There is **no red-commit escape hatch** here — nothing is committed, so nothing needs
   checkpointing. If a stage's verify is still failing when you must stop, write an
   **`_In progress._`** block in place of the `## Stage N Report` recording: what is
   fixed, what is still failing with current pass/fail counts, the root causes already
   identified, and the next concrete step. Write it for someone with no memory of this
   session. The stage is **not** done until it goes green and the block is replaced with
   a real report.
3. **Follow each stage's own `Verify:` block** before writing its report — typically
   `tsc --noEmit`, `next build`, and `npm test`. If verification fails, fix it before
   moving to the next stage. A stage whose verify never passed must be reported as
   unfinished (see the `_In progress._` block above), not quietly written up as done.
4. **Read `NOW.md` first** (the CLAUDE.md orientation ritual) and **update `NOW.md`**
   when a log's final stage instructs it (most final/coherence stages say
   "Update NOW.md"). Make that edit as part of that stage's work — it just stays
   uncommitted like everything else.
5. **Obey DESIGN.md** for any visual/UI work (Cabinet Grotesk display, Geist body,
   Geist Mono figures; violet `#8C43F6`; cool `#FBFBFC` console ground; no gradients,
   no AI slop). Each stage spec usually restates the relevant tokens.

## Procedure

### 0. Parse the request
Resolve the set of updatelog numbers. A single `vN` → `[N]`. A range `vN-vM` →
`[N, N+1, …, M]`. Process the files in ascending order. Confirm each
`UPDATELOGV<M>.md` exists before starting; if one is missing, stop and tell the user.

### 1. Orient (once, up front)
Read `NOW.md`. Then read the first target `UPDATELOGV<M>.md` fully — its **Context**
and **Decisions** sections carry constraints that bind every stage (reuse-this,
don't-rebuild-that, "locked" vs "real", route names). Do not violate them.

If the working tree already has uncommitted changes, note that up front — this skill
adds to them rather than isolating its own work, so the user should know what was
already there before you started.

### 2. For each updatelog `M`, for each Stage `N` in order:

a. **Identify the stage.** Stages are headed `# Stage N — <title>` with a fenced spec
   block (the numbered instructions) followed by a `## Stage N Report` section that
   starts as `_Pending._`. Skip any stage whose report is already filled in (already
   done) unless the user explicitly asks to redo it — mention which you skipped.

   **A report reading `_In progress._` (or `_In progress (red)._` from a previous
   `/complete-updatelog` run) is NOT done — it is the FIRST stage to work on.** That
   block is a handoff: read it in full before touching anything, because it records the
   root causes already found and the next concrete steps. Resume from its "next steps";
   do not restart the stage.

b. **Do the work** described in the stage's fenced spec block. Only that stage's
   scope. Respect the log's Context/Decisions and DESIGN.md.

c. **Verify** exactly as the stage's `Verify:` line says (typically
   `tsc --noEmit` → `next build` → `npm test`). Fix failures before proceeding.
   If a verify step genuinely can't run in this environment (e.g. a screenshot needs
   authenticated Clerk sign-in — see how V19's reports handle it), say so honestly in
   the report rather than fabricating a result. Never claim a screenshot or a passing
   check you didn't actually produce.

   #### THE FULL GATE RUNS ONCE PER LOG — Ostiara only

   **Applies only when the repo is Ostiara**, and check rather than assume: the working
   tree has a `NOW.md` **and** `package.json` has `"name": "ostiara"`. In any other repo
   this subsection does not exist.

   `npm run gate` drives the full Playwright suite against a production build, and every
   run of it is **billable Supabase traffic**. Measured 2026-08-19: `pg_stat_statements`
   on the dev project read **4,677,667 PostgREST requests in 68 days** with **zero
   users** — all laptop and gate traffic — and Supabase has warned that another
   free-tier overrun disables the org.

   - **Between stages, verify with the cheap layer** — `npx tsc --noEmit && npm test`,
     plus `npm run build` when the stage touched rendering, plus
     **`npm run test:e2e:smoke`** (~80 s) when it touched a route, an action or a role
     gate.
   - **Run the full `npm run gate` ONCE, at the log's final stage.**
   - **Never re-run the gate to "confirm" a green** (V107, V115 each ran three on one
     seed). If a result needs confirming, name what varied and re-run only that spec.

   **The log outranks this skill** — a stage whose `Verify:` line calls for the full gate
   gets the full gate, noted as such in its report. **This is a cost policy, not
   permission to weaken verification:** *a skip is not a pass* still holds and `npm test`
   still runs every stage. Revisit once dev/test traffic no longer hits the cloud.

d. **Write the `## Stage N Report`.** Replace `_Pending._` with a concrete report of
   what you did, matching the voice/detail of the existing reports in the same file
   (routes touched, files changed, wiring, verify results, deviations from the spec
   and why). This edits `UPDATELOGV<M>.md` in place.

e. **If this is the log's final stage and it says "Update NOW.md"**, make that edit now.

f. **Do not commit.** No `git add`, no `git commit`, no `git push`. Leave everything in
   the working tree and move straight on. (Optionally run `git status --short` to keep
   an accurate picture of what has accumulated for the final summary.)

g. Move to the next stage.

### 3. When all requested logs are done
Give a short summary: which logs/stages completed, any stages skipped (already done) or
verify caveats, and confirm `NOW.md` was updated where required. Then state plainly that
**nothing was committed or pushed**, and list the changed files (`git status --short`) so
the user can review and commit themselves. If it helps, suggest the commit messages the
standard skill would have used (`stage<N>v<M>`) — but do not run them.

Then print the **NEXT UP** block — a fenced block the user can paste into a fresh, empty
context and be immediately oriented. It must stand alone: no "as discussed", no pronouns
pointing at this conversation.

````
```
cd "<absolute repo path>"

JUST LANDED — V<M> stages <a>–<b>, UNCOMMITTED in the working tree (<n> files changed).
<One line: what this log actually settled, with its number.>

NEXT: <the exact next slash command, e.g. /complete-updatelog-nocommit v74>
REVIEW FIRST: git status --short && git diff
COMMIT AS: stage<a>v<M> … stage<b>v<M>  (or stage<a>-<b>v<M> as one)

CARRY-IN (what V<M+1> inherits):
- <the open question this log left, with the numbers>
- <any _In progress._ stage or skipped verify, named>
```
````

Get "what's next" in this order, and say which one you used: (1) unfinished stages in the
current log — an `_In progress._` block first; (2) the next `UPDATELOGV<M+1>.md` on disk
with unfinished stages (`stages.sh --next`); (3) **the next unstarted item in
`docs/roadmap-*.md` — AND IT WINS**, outranking any ticket however urgent it sounds;
(4) `TODOS.md`, **only** if the roadmap is exhausted and **only** `[OPEN]` P1/P2 items.

**A defect queue can only emit the next defect** — every measurement leaves an error bar
and every error bar is fileable — so a selector that reads the ticket file first chooses
the repo's own exhaust forever. **If no `docs/roadmap-*.md` exists, say the roadmap is
MISSING and that a human has to write it**, rather than dropping to (4) and picking a
ticket.

## Notes & edge cases

- **Range means every log fully.** "v1-v3" = finish all of v1's stages before starting
  v2. Do not interleave.
- **Number of stages varies** — the Context/Decisions section usually states it
  ("Three stages." / "Medium feature: four stages."). Trust the actual `# Stage N`
  headings in the file, not that prose, if they disagree.
- **The leading `charlie` line** and the two `#` comment lines at the top of each log
  are intentional — don't remove them when editing the report sections.
- **Don't relitigate the founder's direction** (build-first, long horizon — see
  NOW.md). Just execute the stages as written.
- If the user says "complete updatelog" with **no number**, ask which one (or infer
  the next `_Pending._` log only if it's unambiguous).
- **If the user asks you to commit mid-run**, that's an explicit instruction and
  overrides rule 2 — but only for what they asked for. Don't resume auto-committing
  afterwards; if they want the committing version, that's `/complete-updatelog`.
- **Long multi-stage runs are uncommitted work at risk.** Because nothing is checkpointed,
  a large range (say v1-v5) leaves a big uncommitted diff. Mention this when the user
  requests a wide range so they can decide whether they'd rather use
  `/complete-updatelog`.
