---
name: research
description: Research a real-life decision — a boiler inspection, an energy contract, an insurance switch, an appliance purchase, a car, a trip — against evidence that is captured, committed and re-checkable, and end in a published HTML report showing the options worth pursuing, what each really costs, and where each one bites. Use when the user asks to research, compare, price, shortlist or decide something outside code, when they ask what they should pick or what something should cost, when they drop quotes, PDFs or call results into a research folder, or when they invoke it bare to see which of their open topics have gone stale.
---

# research

Every real-life decision becomes a small repo: a contract (`BRIEF.md`), evidence
(`sources/`), analysis (`NN-*.md`), an adversarial check, and a published report.
Markdown is the source of truth. The HTML renders it and never holds a claim of its own.

**Finding facts is your job, never the user's.** A question whose answer is discoverable is a bug.

Read the reference the phase names before you run it. Do not run a phase from memory.

## Route

| Invocation | Route |
|---|---|
| Bare | **Orient** — phase 0 |
| A question | **New topic** — phase 1 |
| An existing topic name, or cwd holds `BRIEF.md` | **Resume** — re-check, correct, republish |
| A topic plus pasted call results or dropped files | **Fold-in** — straight to phase 3 |

Resume and fold-in never ask where the workspace goes.

## Phase 0 — Orient (bare invocation only)

1. Read the status block of every `README.md` one level under cwd, plus cwd's own.
   Grep target: `^> \*\*Status\*\*`. See `references/workspace.md` §Status.
2. Compute staleness from `Peildatum` and `Recheck`. Never read a stored `stale`.
3. Ask with `AskUserQuestion`, options built from what you found — a topic past its
   recheck, a `waiting-on-you` topic, open fog, or start something new.

You see cwd and nothing else. Never present a blind menu.

**Done when:** every topic under cwd has been read, and the options name real topics
with real numbers.

## Phase 1 — Scope

Legwork first, in this order:

1. Grep the adjacent topic folders for facts already established.
2. Grep the two past-context archives named in `~/.claude/CLAUDE.md`. Phase 1 only.
3. Cheap open-web orientation — enough to know the shape of the option space.

Then **one** grilling round: numbered questions, each with a recommended answer,
covering genuine decisions only — budget, hard constraints, what "good" means, risk
tolerance, deadline.

Then resolve the workspace and ask where it goes (`references/workspace.md` §Location).
Write `BRIEF.md` from `templates/BRIEF.md`, `git init` if the root is not already inside
a repo, write `.gitignore`, and commit.

**Gate: the user approves `BRIEF.md`. Nothing else happens until then.**

**Done when:** every Known fact carries a source, every item in What I need from you names
a specific file or a specific call, and Out of scope links every adjacent topic that
already covers part of the question.

## Phase 2 — Gather

Fan out background subagents, one per axis — comparison site, region, supplier class,
regulator. Two or three on a normal question. Cap eight concurrent.

Each subagent returns **structured findings**, not prose: option, price, what is included,
source URL, capture path, confidence. Each writes its own raw capture into `sources/`.
Capture rules and the fetch boundary are in `references/sourcing.md`.

**Stop when all three hold:**

1. A full round adds no new option and no new gotcha.
2. Every option has three independent sources, or is marked thin. A quote obtained
   directly from the supplier is primary evidence and satisfies this alone.
3. Every number that will appear in the analysis resolves to a file in `sources/`.

Log anything dropped for scope. Never truncate silently.
Pause only for a login wall, a paywall, or a file only the user can supply.

## Phase 2b — Call sheet

When the facts are not published — one-off service prices usually are not — write
`callsheet.md` from `templates/callsheet.md`. Set status to `waiting-on-you` and stop.
The user makes the calls. Their answers come back through the fold-in route.

Never send an email or submit a contact form. See `references/sourcing.md` §Never.

## Phase 3 — Analyse

Write `NN-<topic>.md`, numbered in the order written. Every claim carries its source.
Rank options against the BRIEF's criteria **in their stated order**.

**Sort, don't filter.** Only a hard fact removes an option. A preference reorders it.
Print an unknown as unknown. Attach each gotcha to the option it bites.

**Done when:** every option is rankable against every criterion, or the gap is stated
on the page.

## Phase 4 — Red-team

Dispatch **one fresh subagent** with the recommendation, the criteria and the source list.
Tell it to kill the recommendation. It answers four questions:

1. What would have to be true for this recommendation to be wrong?
2. What did the analysis assume without checking?
3. What does the cheapest option — or doing nothing — know that the pick does not?
4. Which load-bearing number has the thinnest sourcing?

It returns a verdict — `stands`, `weakened` or `falsified` — plus challenges tagged
`fatal`, `gotcha` or `noise`.

- `fatal` reopens phase 2.
- `gotcha` goes into the report.
- `noise` is dropped, but logged in the analysis file.

Commit the verdict.

## Phase 5 — Report

Render the README and the analysis files. Read `references/report.md` first: frame, tabs,
Options body and interactivity live there. Choose the report type from
`references/report-types.md` and state it. Style is `references/house-style.css` (v2), pasted
whole into one `<style>` block.

Write in the language of the sources, per `references/language.md`.

A toolbox, not a shopping list: use only the components the data supports.

A claim that appears only in the HTML is a bug.

1. Write `docs/<slug>-brief.html` and commit it.
2. Publish as an Artifact. On resume, republish to the URL already in the status block.
3. Write the URL, the short answer, the status, the next action and the recheck date
   into the README status block. Commit.

## Never

- No credentials, no login forms, no CAPTCHA solving.
- No message, email or contact form sent without the user approving that exact text.
- No invented numbers. An unknown prints as unknown.
- No option dropped for being inconvenient.
- `trash`, never `rm`.
- No unattended or scheduled run that needs the browser or a hand-supplied file.
