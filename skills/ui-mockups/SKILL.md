---
name: ui-mockups
description: >-
  Generate clean, portfolio-ready mockup and demonstration UI images from a
  running web app by driving the real app in a headless browser and capturing at
  retina resolution: full-bleed hero shots (16:9), 1:1 component-spotlight
  squares, banners (32:9), and icon tiles. Two disclosure modes — FULL reveal
  (everything, real data) and SAFE/showcase (blurs confidential data and
  proprietary logic so unreleased or sensitive apps can be shown off without
  leaking real values or how they work). Use whenever the user asks for mockups,
  demonstration UI shots, portfolio screenshots, hero images, showcase/preview
  visuals, a banner, or an app icon tile.
---

# ui-mockups

Turn a real, running web app into a family of ultraclean downloadable PNGs for a
portfolio or landing page. The images are **real pixels from the actual app** —
no AI-imagined UI — so they are accurate by construction.

## What it produces (the default family)

Every file is **prefixed with the project name** (see "Output & wrap-up") — shown
below as `<project>-`. Match the naming the user has come to expect; adapt counts
to the app:

| File | Ratio | Output px | What it is |
|------|-------|-----------|------------|
| `<project>-hero-a.png`, `-hero-b.png`, `-hero-c.png` | 16:9 | 3840×2160 | Full-bleed screenshots of the app in 3 **distinct states** (each a different story, not the same screen reskinned) |
| `<project>-square-1.png` … `-square-4.png` | 1:1 | 2160×2160 | Feature **spotlights** — one real component lifted onto a clean brand-tone wash |
| `<project>-banner.png` | 32:9 | 3840×1080 | Brand-tone background + logomark top-left, nothing else |
| `<project>-icon.png` | 1:1 | 1024×1024 | The logomark centered on the brand tone |

Aspect-ratio recipe (general): pick CSS viewport dims that match the ratio, then
`--scale 2` for retina. 16:9 → `1920x1080@2`. 1:1 spotlight → clip `1080x1080`
out of a 1920-wide `@2` page. 32:9 → `1920x540@2`. 9:16 mobile → `540x960@2`.

## Prerequisites

- The gstack **`browse`** headless-browser binary. Resolve it once:
  ```bash
  _ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
  B=""; [ -n "$_ROOT" ] && [ -x "$_ROOT/.claude/skills/gstack/browse/dist/browse" ] && B="$_ROOT/.claude/skills/gstack/browse/dist/browse"
  [ -z "$B" ] && B="$HOME/.claude/skills/gstack/browse/dist/browse"
  [ -x "$B" ] && echo "READY: $B" || echo "NEEDS_SETUP (run the /browse skill's setup once)"
  ```
- A runnable web app (dev server or static build). Reuse `/run` conventions if a
  project skill exists; otherwise start it (`npm run dev`, `vite`, `next dev`,
  etc.) in the background and read the printed local URL (do not assume the port).

Skill assets (this directory):
- `scripts/spotlight.js` — clone a live component into a centered square wash tile
- `scripts/redact.js` — blur confidential regions for SAFE mode
- `templates/banner.html`, `templates/icon.html` — banner & icon-tile scaffolds

## Step 0 — Mode + plan (ask the user)

1. **Disclosure mode:**
   - **FULL** — reveal the whole app, real data. For public apps / your own work.
   - **SAFE** — showcase look & feel; blur confidential content. For unreleased
     apps or when you must not leak real values or how it works.
2. **Brand tone:** read the app's design tokens (e.g. `tokens.css`, Tailwind
   config, `:root` vars) for the real background/surface color; use it for the
   wash, banner, and icon tile so everything matches. Ask if none is discoverable.
3. **States & components:** explore the app (routes, demo/seed data, signature
   components, empty vs solved states, menus, modes). Propose 2–3 distinct hero
   states and 4 component spotlights, each telling a different story. Get a quick
   thumbs-up before rendering the full set (rendering is cheap; a wrong lineup is
   the expensive part).

Always **view each capture** with the Read tool and iterate — framing, zoom, and
state matter more than resolution.

## Step 1 — Full-bleed heroes (16:9)

```bash
$B viewport 1920x1080 --scale 2
$B goto <APP_URL>
$B wait "<a-known-selector>"          # ensure the app mounted
# drive into the target state (click demo data, navigate, open a result, etc.)
$B screenshot --viewport out/hero-a.png
```
- Get the app into a **compelling, populated** state (a result/dashboard beats an
  empty shell). Use built-in demo/seed data when present.
- To reframe a map/canvas without a zoom control: focus it and press keys, e.g.
  `$B js "document.querySelector('.leaflet-container').focus()"` then `$B press "-"`.
  Verify you didn't mutate state (e.g. node count unchanged) before trusting it.

## Step 2 — Component spotlights (1:1)

Keep the app at a **wide** viewport (narrow/square viewports can overflow
toolbars). Drive the app so the target component is populated, then:

```bash
$B js "window.__sqSel='#the-component'; window.__sqScale=2.2; window.__sqDark=false; /* window.__sqBg='#F2EEE6' */ 'set'"
$B eval  <skill-dir>/scripts/spotlight.js      # prints: OK clip=<left>,0,1080,1080
$B screenshot --clip <left>,0,1080,1080 out/square-1.png
```
- Pick the app's most telling components: signature control, a key readout/number,
  an export/format menu, a distinctive mode/panel.
- If a card bleeds past the frame it lost its layout width — `spotlight.js` pins
  the clone's real width, so just lower `__sqScale`.
- Clear the overlay before the next interaction: `$B js "var f=document.getElementById('sqframe'); if(f) f.remove(); 'x'"`.

## Step 3 — Banner (32:9) and icon tile

Find the app's real logomark (inline header SVG, `public/icon.svg`, favicon,
manifest icon). Fill the templates, load, screenshot:

```bash
# banner: copy templates/banner.html, replace {{BG}} {{ICON_SVG}} {{ICON_PX}} {{TOP}} {{LEFT}}
$B viewport 1920x540 --scale 2
$B load-html /tmp/banner.html
$B screenshot --selector ".banner" out/banner.png     # -> 3840x1080

# icon tile: copy templates/icon.html, replace {{BG}} {{ICON_SVG}} {{ICON_PX}}
$B viewport 512x512 --scale 2
$B load-html /tmp/icon.html
$B screenshot --selector ".tile" out/icon.png          # -> 1024x1024
```
Write temp HTML under the OS temp dir or the repo (browse restricts file paths to
cwd/TEMP). If a `screenshot` path is rejected right after a daemon restart, write
to the temp dir and `cp` into the output folder.

## SAFE mode — redaction (blur)

When mode is SAFE, before every capture blur what must stay hidden. Default
protected categories (confirm specifics with the user):
- **Real / user data** — PII, account names, live values, anything from real
  records.
- **How it works** — proprietary formulas, metrics, algorithm internals, or copy
  that gives away the core idea, when the user flags them.

Identify the sensitive elements (ask the user to point them out; use selectors
and/or text patterns), then:

```bash
$B js "window.__redactSelectors=['#live-value','.account-name']; window.__redactText=['\\\\d{3,}']; window.__redactBlurPx=10; 'set'"
$B eval <skill-dir>/scripts/redact.js         # blurs matching elements in place
# ...then screenshot as in Steps 1–3...
$B js "window.__redactClear=true; 'clear'"     # then re-eval redact.js to remove
```
- Blur is applied as a CSS filter on the real elements, so the rest of the shot
  stays crisp. Bump `__redactBlurPx` until content is unreadable but the shape/
  layout still reads.
- Alternatives if the user prefers (not the default): swap real content for
  realistic placeholder data via `$B js`; show a design-only shell with generic
  copy; or simply frame/crop so sensitive areas never appear.
- Before delivering SAFE shots, **view each one** and confirm nothing sensitive is
  legible (including partially-blurred edges, tooltips, and adjacent panels).

## Output & wrap-up

- Save to a `mockups/` folder in the project (create it).
- **Prefix every filename with the project name** so assets stay identifiable once
  downloaded and mixed with others. Derive it from the repo, not this skill's
  folder:
  ```bash
  PROJ=$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")
  # lowercase, spaces/underscores -> hyphens, strip other punctuation
  PROJ=$(echo "$PROJ" | tr '[:upper:] _' '[:lower:]--' | tr -cd 'a-z0-9-')
  ```
  Prefer a real product/brand name if the folder name is generic (e.g. a repo
  called `SAT` whose app is "Backtrace" → use `backtrace-`); confirm with the user
  when unsure. Result: `backtrace-hero-a.png`, `backtrace-square-1.png`, etc.
- For SAFE mode add a `-safe` suffix if both modes coexist
  (`backtrace-hero-a-safe.png`).
- Report the file list with clickable paths and each image's dimensions.
- Note any background dev server you started and offer to stop it. Any in-page
  patches (geolocation, placeholder data, blur) are runtime-only and touch no
  files — say so.

## Notes

- Prefer the app's own demo/seed data for populated states — it's designed to look
  right and carries no real-data risk (doubles as SAFE-friendly).
- Retina: `--scale 2` is plenty; SVG/vector text stays crisp at any scale, so
  spotlights capture live DOM (not an upscaled image) to keep type sharp.
- Keep the favicon/logomark identical across a set; users recognize the family by
  it.
