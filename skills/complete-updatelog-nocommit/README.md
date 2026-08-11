# complete-updatelog-nocommit

| Skill | What it does |
|-------|--------------|
| `/complete-updatelog-nocommit` | Works through the numbered **Stages** of one or more `UPDATELOGV<M>.md` build docs — one stage at a time, never combined. Does the stage's work, runs its `Verify:` steps, fills in the `Stage N Report` — and **never commits or pushes**. Everything is left uncommitted in the working tree for you to review. |

Same as [`/complete-updatelog`](../complete-updatelog/README.md) with all git writes removed.

**How to trigger:** `/complete-updatelog-nocommit v11`, or `/complete-updatelog-nocommit v1-v3` (a range does each log fully, in order). Slash command only — it won't fire on natural-language mentions.

**Commit convention:** none. No `git add` / `commit` / `push` / `stash` / `reset` — read-only git only. The final summary lists the changed files and (optionally) the `stage<N>v<M>` messages you'd use if you commit by hand.

**Guardrails:** reads `NOW.md` first · updates `NOW.md` on final stages that ask for it · stops on a failed verify (writes an `_In progress._` handoff block instead of a report) · skips stages already reported · won't fake a screenshot or check it didn't run · warns that a wide range leaves a large uncommitted diff.
