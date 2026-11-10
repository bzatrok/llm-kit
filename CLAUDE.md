# llm-kit

Public repo of Claude Code skills, mods and plugins. One folder per item.

## Layout
- `skills/<name>/SKILL.md` — agent skills. No personal names, client names, local paths or real figures from private work: this repo is public.
- `mods/` — function-hook plugins; rules and commands in `mods/CLAUDE.md`.
- `plugins/` — standard Claude Code plugins.
- `.handovers/` — handover log for work on this repo.

## Commands
```bash
claude plugin validate mods/<mod>
claude plugin test mods/<mod>
```

## Checks
- Before every commit: `grep -rInE "/Users/|bzatrok" skills mods` must return nothing (unenforced; no hook yet).
