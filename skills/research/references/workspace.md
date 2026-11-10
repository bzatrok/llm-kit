# Workspace

Every path here is relative to the resolved workspace root.

## Location

There is no fixed research root. `~/write/Research/` is a directory that happens to hold
topics. Never assume it. Resolve the workspace from cwd on every run.

| cwd | Behaviour |
|---|---|
| Holds `BRIEF.md` | This **is** the workspace. Resume in place. Ask nothing. |
| Anything else | Ask before the first write. |

The ask offers two options, and the recommended one is computed, not fixed:

- **Here** — cwd becomes the workspace. Recommend this when cwd is empty or near-empty.
- **A new `<Topic>/` subdirectory** under cwd. Recommend this when cwd already holds
  files or other topic folders.

The ask fires **once**, at the end of phase 1, immediately before `BRIEF.md` is written.
Every step before it is a read, so nothing lands on disk ahead of the answer.

Run `git init` only when the resolved root is not already inside a repo. Inside an existing
repo the topic nests as a plain directory, and that repo's history is used as it is. No remote.

## Layout

```
<Topic>/
  README.md              the answer: status block, short answer, file index, sources, corrections
  BRIEF.md               the contract: the approved scope. Written at the gate, read on resume.
  NN-<topic>.md          analysis files, numbered in the order they were written
  sources/               raw evidence, dated captures, PDF + .txt twins
  sources/private/       gitignored drop for anything sensitive
  docs/<slug>-brief.html the rendered report
  callsheet.md           only when facts must be obtained by phone or contact form
  .gitignore
```

## Status

The first three lines of every `README.md`. Orient derives state by scanning these, so
there is no separate ledger to go stale.

```markdown
> **Status** decided · **Peildatum** 2026-08-10 · **Recheck** 2026-09-01
> **Next** Sign the cheapest 1-year fixed contract with a 1 December start
> **Report** https://claude.ai/public/artifacts/<id>
```

- Stored status is one of `scoping · gathering · waiting-on-you · decided · parked`.
- **`stale` is never stored.** Orient computes it from `Peildatum` and `Recheck`, so the
  file cannot lie about its own freshness.
- `Next` is `—` when no action is pending.
- `Report` is absent until the first publish. After that it is the URL to republish to.
- Grep target: `^> \*\*Status\*\*`.

## .gitignore

Write this whole file only when the workspace owns its repo:

```
.DS_Store
._*
.obsidian/
__pycache__/
*.pyc
.venv/

# Sensitive drops — kept on disk, never committed.
sources/private/
```

Derived aggregates are committed. Per-record dumps of sensitive data are not.

When the topic nests inside an existing repo, append **only** the `sources/private/` line
to that repo's `.gitignore`, path-qualified to the topic. Touch nothing else.

## Commits

The message states the **finding**, not the action:

- Good: `Stresstest tegen 2022 herziet 3-jaarsadvies naar 1 jaar vast`
- Bad: `add analysis`

Commit at: brief approved · each source batch · each analysis file · the red-team verdict ·
the published report. Four files or fewer per commit where the work allows.

## Corrections

Research that updates is the normal case, so a revision is a first-class object, not an
embarrassment. Corrections live in both the README and the report shell.

- Numbered and dated.
- A superseded claim is **never silently edited**. The old file keeps its text. The
  correction points forward — "read `03` before `02`".
- The correction states what changed, why, and where the new reasoning lives.

```markdown
### Corrections

1. **2026-08-10 — Timing.** "Sign mid-October" in `02` §1 is superseded. Prices lock at
   signature, not at the start date. See `03-timing.md` §2.7.
```

When two or more corrections exist, put a pointer directly under the short answer:
`⚠️ **This advice was revised three times — read `03` before `02`.**`
