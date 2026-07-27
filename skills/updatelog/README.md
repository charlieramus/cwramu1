# updatelog

| Skill | What it does |
|-------|--------------|
| `/updatelog` | Scaffolds a new **`UPDATELOGV<N>.md`** build doc in Ostiara's real house format — `charlie` canary, `Context` + `Decisions`, numbered **Stages** (fenced prompt + `Verify:` line + `_Pending._` report), and an `After These Stages` closer. Auto-numbers the file (next after the latest log) and hands off to `/complete-updatelog` to execute it. |

**Trigger:** *"create an update log for X"*, *"prompt this out in stages"*, *"log this"*, or `/updatelog`.

**Two document types:** **Type 1** — the staged UPDATELOGV prompt doc (main). **Type 2** — a lightweight past-tense change note ("log this").

**Pairs with:** `/complete-updatelog v<N>` — writes the plan here, executes it there.
