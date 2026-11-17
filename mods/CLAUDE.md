# Claude Code mods

Personal mods (plugins of function hooks), one folder per mod. Loaded in every session via
`CLAUDE_CODE_PLUGIN_DIRS=<repo>/mods` in `~/.claude/settings.json`, which loads every subfolder
with a `.claude-plugin/plugin.json` — a new mod folder loads without touching settings.

| Mod | What it does |
|---|---|
| `context-bar/` | `/context-bar` shows a stacked context-window bar above the prompt, `/context-bar off` hides it; per session, starts hidden |
| `handover-report/` | `/handover-report` opens a pane with the state of `.handovers/handover_log.md` |
| `tldr/` | `/tldr [extra ask]` summarises the last reply with haiku in a bordered box above the prompt (under context-bar, cleared on the next turn); `/tldr auto` does it after every reply (per session, starts off); `/tldr eli5|eli8|eli12|eli15` sets the reading level (persisted, default eli12); `/tldr tune <level> <feedback>` has sonnet rewrite that level's rules into the `/config` field `tldr.<level>`, `/tldr reset <level>` clears it; the model never reads it |
| `inline-images/` | draws PNGs inline above any assistant reply that names their absolute path (max 3, 80×30 cells, shrunk to 480 px with `sips`); swapped for same-size placeholders while scrolling and redrawn 300 ms after it stops; a picture scrolled partly off the top is drawn as an ImageMagick crop of its visible rows (needs `magick`; iTerm2 3.5+ fullscreen, kitty or Ghostty) |
| `cockpit/` | situation band above the prompt (gauge, goal/now/done/next/constraints, workers) and auto-compaction with a resume prompt. Read `cockpit/PROJECT_CONTEXT.md` and `.handovers/handover_log.md` before working on it |

## Commands (per mod folder)
```bash
claude plugin validate <mod>   # manifest + what the module hooks and calls
claude plugin test <mod>       # runs hooks/*.test.ts against the engine
npx -p typescript@5 tsc -p <mod>   # after the engine has laid .claude-plugin/types/ once
```

## Rules
- `$` never crosses an import: anything calling `$.…` lives in `register.tsx`; pure logic goes in sibling `.ts` files.
- Mod values live in `$.state` (declared in `types/index.d.ts`), persisted preferences in `$.store`.
- Actions that change repos or files only fill the prompt box (`$.prompt.fill`); the mod never writes on its own.
- Terminal `Image` limits found the hard way (iTerm2): a PNG side over 4096 px is refused (the render hook is skipped, the pane goes grey); a picture whose top row is above the screen is skipped, and so is any picture in a pane that is scrolled at all, so draw only the visible rows; every redraw resends the bytes, so draw a same-sized blank box while the view moves (`inline-images/`).
