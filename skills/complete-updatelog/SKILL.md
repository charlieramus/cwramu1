---
name: complete-updatelog
description: >-
  Execute the stages in one or more Ostiara UPDATELOGV*.md build docs, committing
  and pushing after each stage. ONLY run when the user explicitly invokes it with the
  slash command (/complete-updatelog vN, /complete-updatelog vN-vM). Do NOT trigger by
  association — natural-language mentions like "complete updatelog vN", "do updatelogv7",
  or "finish updatelog 11" are NOT triggers on their own; ask the user to run the slash
  command instead. Once invoked, works through the numbered Stages of UPDATELOGV<N>.md
  one stage at a time (never combined), fills in each "Stage N Report", and commits +
  pushes as "stage<N>v<M>" (M = updatelog number) after every stage.
---

# Complete Updatelog

Executes the numbered **Stages** inside `UPDATELOGV<M>.md` build docs, one stage at a
time, committing and pushing after each. This is the repo's core build ritual.

## When this runs

**Only run this skill when the user explicitly invokes it with a slash command
(`/complete-updatelog …`). Do NOT execute it by association.** Mentioning an updatelog,
describing stage work, or saying something that merely resembles the phrasings below is
not a trigger. If the user talks about completing an updatelog without typing the slash
command, ask them to confirm (or to run `/complete-updatelog`) rather than starting on
your own. The phrasings below identify *which* log to run **once the skill has been
explicitly invoked** — they are not standalone triggers.

Given an explicit `/complete-updatelog` invocation, the argument says which log(s):
- `/complete-updatelog v7` → do every stage of `UPDATELOGV7.md`.
- `/complete-updatelog v1-v3` (or "v1 to v3", "updatelogs 1 through 3") → do
  `UPDATELOGV1.md`, then `UPDATELOGV2.md`, then `UPDATELOGV3.md`, **in order**.
- `/complete-updatelog v11` — the canonical form.

`v<M>` always identifies the updatelog file `UPDATELOGV<M>.md` at the repo root.

## Non-negotiable rules

1. **One stage at a time. Never combine stages.** Every log begins with
   `# Work on one stage at a time. Do NOT combine stages.` — honor it literally. Do
   all of Stage 1 (work + verify + report + commit + push) before touching Stage 2.
2. **Commit + push after each stage** with the message **`stage<N>v<M>`** — `N` = the
   stage number, `M` = the updatelog number. Examples: Stage 3 of `UPDATELOGV7.md`
   → `stage3v7`; Stage 5 of `UPDATELOGV11.md` → `stage5v11`. No body, no
   co-author trailer, no other text — match the existing history exactly
   (`git log` shows `stage1v19`, `stage2v19`, …).
3. **Follow each stage's own `Verify:` block** before writing its report — typically
   `tsc --noEmit`, `next build`, and `npm test`. If verification fails, fix it before
   committing; do not commit a broken stage.
4. **Read `NOW.md` first** (the CLAUDE.md orientation ritual) and **update `NOW.md`**
   when a log's final stage instructs it (most final/coherence stages say
   "Update NOW.md"). Fold that NOW.md edit into that stage's commit.
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

### 2. For each updatelog `M`, for each Stage `N` in order:

a. **Identify the stage.** Stages are headed `# Stage N — <title>` with a fenced spec
   block (the numbered instructions) followed by a `## Stage N Report` section that
   starts as `_Pending._`. Skip any stage whose report is already filled in (already
   done) unless the user explicitly asks to redo it — mention which you skipped.

b. **Do the work** described in the stage's fenced spec block. Only that stage's
   scope. Respect the log's Context/Decisions and DESIGN.md.

c. **Verify** exactly as the stage's `Verify:` line says (typically
   `tsc --noEmit` → `next build` → `npm test`). Fix failures before proceeding.
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
   git push
   ```
   Use the plain `stage<N>v<M>` message — nothing else. If `git push` fails
   (no upstream, auth, rejected), stop and report it rather than continuing to the
   next stage on top of an unpushed one.

g. Move to the next stage.

### 3. When all requested logs are done
Give a short summary: which logs/stages completed, the commit messages pushed, any
stages skipped (already done) or verify caveats, and confirm `NOW.md` was updated
where required.

## Notes & edge cases

- **Range means every log fully.** "v1-v3" = finish all of v1's stages (each its own
  commit) before starting v2. Do not interleave.
- **Number of stages varies** — the Context/Decisions section usually states it
  ("Three stages." / "Medium feature: four stages."). Trust the actual `# Stage N`
  headings in the file, not that prose, if they disagree.
- **The leading `charlie` line** and the two `#` comment lines at the top of each log
  are intentional — don't remove them when editing the report sections.
- **Don't relitigate the founder's direction** (build-first, long horizon — see
  NOW.md). Just execute the stages as written.
- If the user says "complete updatelog" with **no number**, ask which one (or infer
  the next `_Pending._` log only if it's unambiguous).
- **Batched commits (when the user asks to push/commit every N stages).** The default
  is one commit + push per stage (rule 2). But if the invocation says something like
  "only push every 4 stages", that means **both** committing AND pushing are batched —
  you do NOT make a per-stage commit. Still execute one stage at a time (work + verify +
  report per stage, never combined); just defer the commit. **Batches align to updatelog
  (version) boundaries**, one commit per version covering all of that version's stages,
  and the message uses a stage RANGE: **`stage<first>-<last>v<M>`** (e.g. all four stages
  of `UPDATELOGV6.md` → `stage1-4v6`; a v3 with three stages → `stage1-3v3`). A single-
  stage batch keeps the plain `stage<N>v<M>` form. Fold each version's report edits (and
  any final-stage `NOW.md` update) into that version's one commit, then push. If a push
  fails, stop and report rather than starting the next version.
