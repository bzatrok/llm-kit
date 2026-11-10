# llm-kit

Skills, mods and plugins for [Claude Code](https://claude.com/claude-code), one folder per item.

| Folder | What | How to load |
|---|---|---|
| `skills/` | Agent skills (`SKILL.md` + references) | Copy or symlink a folder into `~/.claude/skills/` |
| `mods/` | Function-hook plugins that change Claude Code's interface (status bands, panes, slash commands) | Set `CLAUDE_CODE_PLUGIN_DIRS=<repo>/mods` in `~/.claude/settings.json` |
| `plugins/` | Standard Claude Code plugins | `claude plugin install <path>` |

## Skills

| Skill | What it does |
|---|---|
| `teamwork` | Claude as lead splitting work across Claude subagents and OpenCode agents: routing, sizing, briefs, monitoring, review |
| `project-context` | Keeps a `PROJECT_CONTEXT.md` per repo: intent, stakeholders, invariants, what is deliberately unfinished |
| `handover-workflow` | Writes and executes handover docs so a cold-start session can carry out planned work |
| `source-port` | Rebuilds a native program you own as compiling source from its shipped binary |
| `research` | Researches a real-life decision against captured evidence and ends in an HTML report |
| `discuss` | Talk a thing through: short turns, one question at a time, stays on until you stop it |
| `teach` | Teaching workspace over many sessions: mission, learner profile, glossary, resources, a spaced review queue and a learning record per topic; practice is graded in the terminal |
| `visual-explain` | One scrollytelling HTML explainer per concept: sticky SVG or Three.js graphic driven by prose steps, animated tokens and self-drawing paths, a collision check script and a fresh-eyes review |
| `marktplaats` | Sell-and-check-up workflow for Marktplaats via the Chrome extension; every outgoing message is approval-gated |

## Mods

See `mods/CLAUDE.md`: `cockpit`, `context-bar`, `handover-report`, `tldr`.

Previously published as `ClaudeMods` and `llm-skills`; both are archived and point here.
