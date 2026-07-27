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
- [Stage-count line — REQUIRED, last bullet:] Thin feature: five stages.
  (or "Medium feature: four stages." / "Three stages." — match the guide below.)

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

### Stage count guide (state it in the last Decisions bullet)
- Simple component / thin feature: 2–3 stages
- Medium feature: 4–6 stages
- Large system: 8–12 stages
- The **final stage** is almost always a "Coherence + Verify" stage that runs the full
  build/test, does a literal walkthrough, and **updates `NOW.md`** (move the feature into
  the functional list). Include it.

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
**`/complete-updatelog v<N>`** (or "complete updatelogv<N>") to execute the stages.
