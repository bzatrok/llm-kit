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
| `explain` | Router over the four `visual-*` skills: picks the format from the subject, offers two when two fit, obeys an explicit request |
| `visual-explain` | One scrollytelling HTML explainer per concept: sticky SVG or Three.js graphic driven by prose steps, animated tokens and self-drawing paths, a collision check script and a fresh-eyes review |
| `visual-explain-3d` | One scroll-scrubbed 3D explainer per concept: a continuous timeline driven by scroll position, shader cross-sections, additive beams and particles computed from one shared model, an observer inset and frozen-moment screenshots |
| `visual-render` | One animated isometric figure of a real system read from its own config or code, built on the Anatomy kit: an inventory with sources first, then a machine or crafted modules, tokens on the real paths, outcomes as places |
| `visual-map` | One static HTML map per system: ELK auto-layout, animated dashed edges showing data direction, click-to-focus, collapsible groups for large systems and named flows traced end to end |
| `marktplaats` | Sell-and-check-up workflow for Marktplaats via the Chrome extension; every outgoing message is approval-gated |

## Mods

See `mods/CLAUDE.md`: `cockpit`, `context-bar`, `handover-report`, `tldr`.

Previously published as `ClaudeMods` and `llm-skills`; both are archived and point here.
