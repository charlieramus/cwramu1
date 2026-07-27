# skills/

Real, file-for-file copies of my custom Claude Code skills (mirrors `~/.claude/skills/<name>/` exactly — `SKILL.md` plus any `README.md`, `scripts/`, `templates/`, etc.). This is the cloud copy used to move skills between machines.

Only custom skills live here — the gstack-provided ones are documented in [`../SKILLS.md`](../SKILLS.md) but reinstalled via `/gstack-upgrade` rather than synced as files, since they're managed by the gstack plugin, not authored here.

## Push (save local changes to this repo)

```bash
cp -r ~/.claude/skills/<skill-name> skills/
git add skills/<skill-name>
git commit -m "Update <skill-name> skill"
git push
```

## Pull (bring skills down onto a new/other machine)

```bash
git clone https://github.com/charlieramus/cwramu1.git
cp -r cwramu1/skills/* ~/.claude/skills/
```

## Current skills

| Skill | What it does |
|-------|---------------|
| `complete-updatelog` | Executes the numbered Stages in an `UPDATELOGV*.md` build doc one at a time, committing + pushing after each stage. |
| `updatelog` | Scaffolds a new `UPDATELOGV<N>.md` in house format and hands off to `complete-updatelog`. |
| `ui-mockups` | Drives a running app in a headless browser to capture portfolio-ready mockup/demo screenshots (FULL or SAFE disclosure mode). |
| `founder-brief` | Generates an interrogation-ready founder's briefing for the current project, grounded in real build/test evidence. |

See each skill's own `SKILL.md` for full details, and [`../SKILLS.md`](../SKILLS.md) for the prose description alongside the gstack skill roster.
