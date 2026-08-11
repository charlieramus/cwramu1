---
name: updatelog
description: >-
  Scaffold a new Ostiara UPDATELOGV<N>.md build doc — stage-based prompt documents in
  the real house format (charlie canary, Context/Decisions, numbered Stages with fenced
  prompts + Verify lines + _Pending_ reports). Use whenever the user asks to create an
  update log, prompt a new feature in stages, plan a build, or "log this", "create stages
  for", "prompt this out". Auto-numbers the file (next after the latest UPDATELOGV*.md)
  and hands off to /complete-updatelog to execute it.
---

# Updatelog Skill

Produces structured, stage-based build documents for Claude Code — in Ostiara's real
`UPDATELOGV*.md` house format (matched to V19–V23). Two document types:
**Type 1 (Stage Prompt Document)** is the main one — a new `UPDATELOGV<N>.md`.
**Type 2 (Update Log Entry)** is a lightweight past-tense change record.

This skill **writes the plan**. Its sibling `/complete-updatelog` **executes** it (does
each stage, fills the `_Pending._` reports, commits + pushes `stage<N>v<M>`).

## Canary Rule

Every response and document while this skill is active must begin with:

```
charlie
```

Lowercase. One word. One line. Nothing else on that line. It is a hallucination catch —
if it is missing, the user knows something went wrong. If the user says "canary check",
respond with exactly:

```
charlie
Canary present.
```

---

## Filename & numbering

- Logs live at the **repo root** as `UPDATELOGV<N>.md`.
- **Auto-number:** find the highest existing `UPDATELOGV<N>.md`, the new one is `N+1`.
  (`git log` / the build-state table in `NOW.md` confirm the sequence.) State the number
  you picked before writing.
- If the feature is part of a planned set, title it with set position, e.g.
  `Field-Ops 2/4: Coverage`.
- **A log may never exceed FOUR stages** (see the hard cap below). Work that needs more
  becomes two consecutively-numbered logs, `V<N>` and `V<N+1>`, titled `… 1/2` and `… 2/2`.

---

## Document Type 1 — Stage Prompt Document (the UPDATELOGV format)

For prompting a new feature or build task into Claude Code, staged. **Read `NOW.md`
first** — its build-state table and "Direction" section tell you where the codebase is
and what not to relitigate. Then produce the doc below and write it to
`UPDATELOGV<N>.md`.

```
charlie

# Ostiara — [Feature / set position, e.g. "Field-Ops 2/4: Coverage"]
# Work on one stage at a time. Do NOT combine stages.

---

## Context
Read `NOW.md` first. [1–3 sentences on where the codebase is now and the specific gap
this log fills — name the real tables/files/routes it builds on.] [If part of a set: say
"log X of the <set> set (V.. → V.. → ..)" and what the neighboring logs cover.]

[One bold line defining the core noun this log introduces, e.g.
**A Job = a named, status-tracked subset of a saved territory's blocks, assigned to one rep.**]

This log builds only [scope]. It does **not** [explicit out-of-scope — the fence that
keeps stages honest], which is [where that lives instead].

## Decisions [(agreed in the model brainstorm)]
- **Schema / approach:** [the concrete data model or reuse decision — "copy
  lib/territories/store.ts exactly", "reuse getCoverageSummary, do not reimplement"].
- **Scope boundary:** [workspace-scoped? roles? what's real vs an honest locked state].
- **Real now:** [what ships as real, working data].
- **Locked / Soon:** [what stays a labeled LockedTile/SoonPill — never fabricated].
- **DESIGN.md:** cool ground #FBFBFC, violet #8C43F6 + fit ramp, Geist Mono figures,
  rounded-2xl, quiet status pills, no gradients, no pricing/dollar language.
- [Stage-count line — REQUIRED, last bullet:] Thin feature: two stages.
  (or "Medium feature: three stages." / "Four stages." — MAX FOUR, see the cap below.)

---

# Stage 1 — [Name]

\`\`\`
[The Claude Code prompt for this stage. Intent and outcome, not line-by-line code.
Numbered steps naming the real files/routes to create or touch. State reuse explicitly
("mirror lib/territories/store.ts"). One stage's scope only.]

Verify: [the exact checks — typically tsc --noEmit; next build; npm test; plus any
stage-specific proof, e.g. a store.test.ts isolation test. Say what to report.]
\`\`\`

## Stage 1 Report

_Pending._

---

# Stage 2 — [Name]
[repeat the pattern: fenced prompt with a Verify: line, then "## Stage N Report" / _Pending._]

---

# After These Stages
- [2–4 bullets: what this set now makes possible, what stays deferred on purpose
  (point at NOW.md), and what the next major build is.]
```

### Stage count — HARD CAP: FOUR (Ostiara)

**No Ostiara log may have more than four stages. This is not a guideline.** Six- and
eight-stage logs took whole sessions, drifted, and left `_Pending._` reports stranded
mid-build. Four is the ceiling; fewer is better.

- Simple component / thin feature: 2 stages
- Medium feature: 3 stages
- Anything larger: **4 stages, or split into multiple logs** — never a fifth stage.
- The **final stage** is almost always a "Coherence + Verify" stage that runs the full
  build/test, does a literal walkthrough, and **updates `NOW.md`** (move the feature into
  the functional list). Include it — and count it against the four.
- State the count in the last Decisions bullet, e.g. `Medium feature: three stages.` or
  `No migration, closing log of the roadmap: four stages.`

**When the work does not fit in four stages — SPLIT IT, do not compress it.** Compressing
six stages into four by merging prompts produces stages nobody can complete in one pass,
which is the exact failure the cap exists to prevent.

- Write **two logs**, `UPDATELOGV<N>.md` and `UPDATELOGV<N+1>.md`, four stages or fewer each.
- Title them with the split position: `… 1/2: <what the first half does>` and
  `… 2/2: <what the second half does>`. Split on a **real seam** (audit/fix, build/verify,
  one subsystem/another) — never mid-stage.
- **Log 1's last stage verifies and hands off**: it runs the gate, updates `NOW.md` with the
  half-done state, and names exactly what log 2 inherits. It must NOT declare the feature or
  the arc complete.
- **Log 2's Context reads log 1 and its artifacts first**, states plainly what log 1 already
  did, and says *do not redo it*. Log 2's last stage is the real closer.
- **Shared foundations go in log 1** (schemas, guards, test seams) so log 2's fixes have
  something to fix against. If log 1 leaves a test deliberately red for log 2, it must name
  that test in its report — that named list is log 2's inbox.
- Tell the user about both numbers in the handoff, and note that **downstream version
  references shift by one** — fix the stale ones (`NOW.md`, the roadmap doc, any brief).

---

## Context budget — keep an executing log under ~40%

A log is not just a document, it is a **context bill** for whoever runs it. Before writing,
loosely predict what executing the whole log will cost and **aim to stay under ~40% of the
window on Opus 5**. Above that, `/complete-updatelog` starts compacting mid-stage, reports
drift, and later stages get done from a summary of the plan instead of the plan.

Estimate roughly — this is a sanity check, not accounting. Rough per-log cost:

- the log itself, read once per stage (~1k tokens per 40 lines);
- the docs the Context tells the agent to read (`NOW.md`, `DESIGN.md`, any pass-on brief) —
  read once and carried for the whole run, so a 600-line `DESIGN.md` is a permanent tax;
- **per stage: the files it touches, read and re-read, plus build/lint/tsc output and any
  screenshots** — the dominant term. Budget generously per stage; a stage that rewrites a
  stylesheet or walks three routes in two modes costs far more than one that adds a table.

If the estimate is over, **split the log** (see the four-stage cap above) — do not shrink the
prompts to make the number look smaller. Splitting genuinely halves the bill because each log
runs in its own session; compressing does not.

Cheap wins that lower the bill without losing anything:

- point at the **specific section** of a doc (`DESIGN-PASSON.md §§1–2`), not the whole file;
- in log 2 of a split, state what log 1 already did in a short "do not redo" list rather than
  making the agent re-read log 1's artifacts to work it out;
- keep `Verify:` lines to the checks that actually prove the stage — every extra screenshot
  and full-file paste is real context spend;
- never ask for a whole file to be pasted into a report; ask for the specific block.

State the estimate in one line in the handoff, e.g. `Est. ~30% of an Opus 5 window per log.`

---

## Document Type 2 — Update Log Entry (lightweight)

For quickly recording *already-completed* work (trigger: "log this"). Not the staged
format — a short retrospective note.

```
charlie

# [Area] Update — [YYYY-MM-DD]

## What Changed
- [Specific past-tense bullet per change, with file paths where relevant]

## Why
[1–3 sentences. Omit if obvious.]

## Files Touched
[Exhaustive list of every file created / modified / deleted]

## Known Issues
[Honest list or "None"]

## Next
- [2–4 real immediate next steps]
```

---

## Formatting Rules (matched to the real logs)

- **Em dashes and mid-sentence bold ARE the house style** — the real logs lean on both
  (`**There is no way to assign field work.**`). Use them for emphasis and asides.
- File paths use forward slashes; dates `YYYY-MM-DD`.
- Stage prompts describe **intent and outcome**, not pixel values or line-by-line code.
- Every stage's fenced block ends with a `Verify:` line.
- Stage reports start as exactly `_Pending._` (so `/complete-updatelog` can find and fill
  them).
- Keep the top three lines exact: `charlie`, blank, the `# Ostiara — …` title, then the
  `# Work on one stage at a time.` line.
- Obey `DESIGN.md`: no gradients, no AI slop, no pricing/dollar language.

---

## Handoff

After writing `UPDATELOGV<N>.md`, tell the user it's ready and that they can run
**`/complete-updatelog v<N>`** (or "complete updatelogv<N>") to execute the stages. Include
the one-line context estimate from the budget section above.

If the work was split across two logs (the four-stage cap), say so explicitly: name both
numbers, say where the seam is and why, and tell the user they can run
**`/complete-updatelog v<N>-v<N+1>`** to execute both in sequence, or one at a time.
