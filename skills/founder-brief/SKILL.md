---
name: founder-brief
description: >-
  Generate an interrogation-ready founder's briefing for the current project — a
  readable 2-3 page document that answers, cold and with evidence, every question a
  real person would ask: "what does it do?", "does it actually work?", "how does it
  work?", "what's built?", "what are the risks?", "what are your next stages?", "what
  do you need?". Use whenever the user asks for a status brief, founder/investor
  brief, project overview, "state of the app", "explain this project", "what's the
  status", "pitch-ready summary", or "brief me on where this is". Works on any project
  at any maturity — greenfield to live. Grounds every status claim in real evidence
  (build/test results, test coverage, git activity) and tags claims verified vs.
  assumed. Regenerated fresh on every run, never stored as truth.
---

# Founder Brief

Produces an **interrogation-ready** briefing for whatever project you're in: the
document a founder would hand someone who walks up and says *"I want to invest"* or
*"what does this even do?"* or *"what are your next stages?"* — with every likely
question already answered, in plain English, backed by evidence.

## Core philosophy (read this first)

1. **The document is a view, not a record.** You regenerate it from ground truth on
   every run. Never treat a stored brief as current. Always stamp it with the
   generation date and git SHA so a stale copy is obvious.
2. **Status is grounded in evidence, not vibes.** An honest brief separates what is
   *verified* (a test passes, the build is green) from what is merely *claimed*. If you
   cannot verify something, say "assumed" — never assert "it works" without a signal.
3. **It scales to any maturity.** A two-hour-old repo gets an honest "Pre-launch, no
   tests yet." A mature app gets a full inventory. Degrade sections gracefully; never
   fabricate to fill a section.
4. **It is organized around the questions people ask,** not around engineering
   internals. Each section pre-answers a natural question.

## When this runs

Invoke on request: the user asks for a founder/investor brief, project status,
"state of the app", "explain this project", a pitch-ready summary, or "brief me". It
reads the project and writes a document — it does **not** change any product code.

## Process

### Step 1 — Gather evidence

Read the project's ground truth. Prefer the dedicated tools (Read, Glob, Grep) and use
Bash for build/test/git signals. Collect:

- **Identity:** README, `package.json`/`pyproject.toml`/`Cargo.toml`/`go.mod` (name,
  description, deps → infers the stack), any docs/ folder, CLAUDE.md.
- **Structure:** top-level layout, entry points, main modules — enough to describe how
  it works in plain terms.
- **Git signals:**
  ```bash
  git log --oneline -15
  git log -1 --format=%cr            # how fresh (last activity)
  git branch -a                      # work in flight
  git rev-parse --short HEAD         # SHA for the stamp
  ```
- **Build/test signals (the honesty engine):** detect the toolchain and run the
  cheapest available check. Do NOT block for long — cap it. Examples:
  - Node: `npm test`, `npm run build` (or the scripts that exist in package.json)
  - Python: `pytest -q`, or read CI config
  - Rust: `cargo test`, `cargo build`
  - If tests/build can't be run cheaply or safely, read CI config
    (`.github/workflows/`, etc.) for the last known status and say so.
  Record: does it build? tests passed/total? If nothing runs, say "no test suite yet".
- **Debt & risk:** `grep -rn "TODO\|FIXME\|HACK\|XXX"` (exclude node_modules/vendor/.git),
  count and locate hotspots. Recent churn (files changed a lot lately) hints at
  instability.
- **Roadmap sources:** TODOS.md, issue tracker if reachable, recent commit direction,
  and — if the project uses gstack — `~/.gstack/projects/<slug>/ceo-plans/` and
  `decisions` for what's planned and what's been decided. Use these opportunistically;
  degrade cleanly when absent.

### Step 2 — Detect the stage

Classify the project honestly into one of: **IDEA · PROTOTYPE · ALPHA · BETA · LIVE.**
Base it on signals, not optimism (e.g. no tests + few commits + no deploy config →
Prototype; green tests + deploy config + real usage → Live). State the reasoning in one
line.

### Step 3 — Classify features

For each meaningful feature/area, tag it:
- **✅ verified** — exercised by a passing test, or observably working.
- **⚠️ done, untested** — code exists but no test/evidence backs it.
- **○ stubbed / partial** — placeholder, TODO-heavy, or incomplete.

This tagging is the spine of the brief. It is what lets the founder answer "does auth
actually work?" honestly on the spot.

### Step 4 — Write the brief

Write `founder-brief.md` to the project root (2-3 pages). Structure it around the
questions people ask:

```
# Founder Brief: <Project Name>
_Generated <YYYY-MM-DD> · <git-sha> · Stage: <STAGE>_

**<Stage>** · Builds <✅/❌> · Tests <passed>/<total> <✅/⚠️> · Last activity <relative>

## Elevator            ← "What is this? What does it do?"
One-liner + a short paragraph a non-engineer understands. Who it's for, the value.

## Status at a glance  ← "Is it real? Does it actually work?"
Stage + why. The health signals. One honest sentence on how far along it really is.

## How it works        ← "How does it work?"
The stack, the main flows, the key components — plain terms. (Offer a diagram via
/diagram if the architecture is non-trivial.) This section stands regardless of status.

## What's built        ← "What's actually done?"
Feature inventory with ✅ / ⚠️ / ○ tags. Verified vs. assumed is explicit.

## Known issues & risks ← "What are the risks?"
FIXME/TODO hotspots, debt, fragile areas, anything a diligent person should know.

## What's next          ← "What are your next stages?"
Synthesized roadmap from TODOs, recent direction, and any ceo-plans. Concrete stages,
in order.

## Decisions needed / the ask  ← "What do you need? Why now?"
Open forks that need a human call. If it's an investor context, what would unblock or
accelerate.
```

Rules for the writing:
- Plain, direct, honest. No hype, no filler. A smart non-engineer should follow every
  line.
- Never assert a status you didn't verify — use the ⚠️/assumed tag instead.
- Degrade empty sections gracefully ("No tests yet — pre-launch" beats a fabricated
  metric). Never invent traction, users, or revenue.
- Keep it to 2-3 pages. If it's ballooning, cut detail, not honesty.

### Step 5 — Offer presentable output

The markdown is the source of truth. Then offer (don't force):
- **Shareable Artifact** — render the brief as a clean hosted page via the Artifact
  tool, so it's genuinely presentable / linkable.
- **PDF** — via `/make-pdf` on `founder-brief.md` for something sendable.
- **Register variant** — if asked, regenerate the same facts in an investor,
  new-hire, or personal-reorientation voice.

## Notes

- **Regenerate, don't maintain.** If a `founder-brief.md` already exists and the repo
  has moved since its stamp, say so and regenerate rather than trusting it.
- **Read-only on product code.** This skill writes the brief (and optional
  Artifact/PDF) and nothing else. It never edits application code.
- **"Since last brief" changelog (optional):** if a previous `founder-brief.md` is
  present, note what changed since its generation to show momentum.
