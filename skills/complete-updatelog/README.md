# complete-updatelog

| Skill | What it does |
|-------|--------------|
| `/complete-updatelog` | Works through the numbered **Stages** of one or more `UPDATELOGV<M>.md` build docs — one stage at a time, never combined. Does the stage's work, runs its `Verify:` steps, fills in the `Stage N Report`, then **commits + pushes as `stage<N>v<M>`** after each stage. |

**How to trigger:** say *"complete updatelogv7"* or *"complete updatelogv1-v3"* (a range does each log fully, in order), or `/complete-updatelog v11`.

**Commit convention:** `stage<N>v<M>` — N = stage number, M = updatelog number (e.g. `stage3v7`, `stage5v11`).

**Guardrails:** reads `NOW.md` first · updates `NOW.md` on final stages that ask for it · stops on a failed verify or `git push` · skips stages already reported · won't fake a screenshot or check it didn't run.
