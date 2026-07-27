# Founder Brief

Generates an **interrogation-ready** founder's briefing for whatever project you're
in — the 2-3 page document you'd hand someone who walks up and asks *"I want to
invest,"* *"what does this do?"*, or *"what are your next stages?"* Every likely
question is already answered, in plain English, backed by evidence.

## What makes it honest

- **A view, not a record.** Regenerated fresh on every run and stamped with the date +
  git SHA, so a stale copy is obvious. You never maintain it — you re-run it.
- **Evidence-grounded status.** It runs the build/tests (or reads CI) and tags every
  feature **✅ verified / ⚠️ done-untested / ○ stubbed** — so "does auth actually
  work?" has an honest answer on the spot.
- **Scales to any maturity.** A two-hour-old repo gets an honest "pre-launch, no tests
  yet." A live app gets a full inventory. It never fabricates to fill a section.

## Structure (organized around the questions people ask)

Elevator · Status at a glance · How it works · What's built · Known issues & risks ·
What's next · Decisions needed.

## Output

Writes `founder-brief.md` to the project root, then offers a shareable Artifact link
and a PDF (via `/make-pdf`) so it's genuinely presentable.

## Invoke

`/founder-brief` — or just ask for a status brief, project overview, or "state of the
app." Read-only on product code; it only writes the brief.
