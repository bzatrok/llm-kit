---
name: project-context
description: Ensure PROJECT_CONTEXT.md exists, is referenced from CLAUDE.md, and is current — the project-level map that outlives every effort under it. Use when the user asks to create, check, refresh or review a project's context, when starting work in a repo whose non-code context is unclear (who the client is, what the pressure is, what is deliberately unfinished), and as step 0 of any skill that needs the project's intent before naming its own. Idempotent — safe to run at any time, silent when nothing needs fixing.
---

# project-context

`PROJECT_CONTEXT.md` is **the map, hoisted one level**.

`handover_log.md` holds the intent of one *effort* and dies with it. `PROJECT_CONTEXT.md`
holds the intent of the *project* — the part that outlives every effort under it. Same
sections, longer life. Nothing here is a new idea; it is the map's own rules applied one
level up.

This skill is the **ensure pass**: create the file if missing, make sure it is loaded every
session, and run the map-maintenance footer against it. It never rewrites the project's
prose on its own.

**Idempotent.** Running it on a clean project changes nothing and prints one line. That is
what makes it safe to call from other skills' step 0.

## Modes

The pass is one of three things depending on what it finds. Getting this wrong in either
direction ruins it: a silent create leaves an invented Destination, a chatty clean run makes
it unusable as another skill's step 0.

| Found | Mode | Behaviour |
|---|---|---|
| No file | **Create** | Full grill. Six empty sections are a design tree — work it in rounds. |
| File, no drift | **Clean** | One line. Ask nothing. |
| File, drift | **Refresh** | Grill only the frontier the drift opened. Never re-walk the whole tree. |

### The grill

Same mechanism as `grilling`, because the sections are a tree, not a list.

The **frontier** is every section whose prerequisites are already settled. Destination gates
Invariants and Out of scope. Intent gates Destination. Stakeholders gate most of the fog. A
question whose answer depends on another question still open belongs to a **later round**.

Ask the whole frontier in one round, numbered, each with your recommended answer:

```
❓ **Q1** - **<title>**: <question, options if there are any>

➡️ <your recommendation>
```

Then wait. Each round's answers push the frontier outward. Done when the frontier is empty.

**Finding facts is your job, never the user's.** Anything readable from `CLAUDE.md`, `README`,
`git log`, `.handovers/handover_log.md` or the code is not a question — go and read it, and
dispatch a subagent if it is a wide search. Only put *decisions* to the user. A running search is
an unsettled prerequisite: ask the rest of the frontier now, don't block on it.

## Where it lives

`<project-root>/PROJECT_CONTEXT.md` — next to `CLAUDE.md`, git-tracked, never ignored.

Repo root when it is a repo; project root otherwise. One per project. It does **not** live in
`.handovers/` — it outlives everything in there.

## The sections

Six from the map, project-scoped, plus one the map has no counterpart for, under one
**Exposure** line at the top.

- **Exposure** — `hobby`, `published` or `commercial`, one word. `hobby`: the user and at most
  family and friends run it. `published`: on GitHub, so anyone may run it (ports, esp32
  tailscale). `commercial`: sold to clients (B2B) or consumers (B2C), or client work. The agent reads it
  to decide which actions need a question: licence of borrowed code and assets matters only
  for `published` and `commercial`; any prod-data access on `commercial` asks first (GDPR).
  This is a decision, so ask the user; never infer it from the folder.

- **Destination** — what this project is *for*. Not what "done" looks like for one effort.
- **Intent, verbatim** — the client's or user's own words about why it exists, quoted. A
  paraphrase of a paraphrase is how intent dies; the quote is the anti-drift device.
- **Stakeholders** — the one addition. Who the client is, who owns what externally, who is
  waiting on whom. An effort inherits this and never records it, so the map has no place for
  it — and it is the line that decays hardest. One line each.
- **Invariants** — what must stay true across every effort. Hosting, stack constraints, the
  thing the client will not budge on.
- **Decisions so far** — index only. Gist plus the rejected alternative, linking the ADR or
  handover map that holds the detail. Never a second copy.
- **Not yet specified** — the fog. In-scope questions you can see coming but cannot yet
  state sharply, and work **deliberately unfinished** with the reason it is unfinished.
- **Out of scope** — ruled out for the *project*, with the reason. It never graduates.

**Sharp or fog?** The same test the handover skill uses: can you state the question sharply
now — not answer it. Sharp enough to specify becomes an effort; not sharp is one line in the
fog. This test is why the file does not rot: nothing in it claims to be current state.

## Write it to age

A field written as current state is wrong within weeks. A field written as a standing
condition survives, and says more:

| Rots | Holds |
|---|---|
| "Deadline is 14 Nov." | "Client wants it before their fiscal close; they have moved the date twice." |
| "Auth is stubbed." | "Auth is stubbed because the client has not picked an IdP." |
| "Waiting on the API key." | "The API key comes through their ops lead, who is the only route in." |

If a line will be falsified by ordinary progress, it is written wrong. Rewrite the condition,
not the status.

## What goes where

Four files plausibly answer "context". The test that separates them: **which one is wrong if
nobody touches it for six weeks?**

| File | Holds | Six weeks untouched |
|---|---|---|
| `CLAUDE.md` | How an agent works *in this repo* — stack, commands, rules | Still right |
| `PROJECT_CONTEXT.md` | Non-code intent: why, for whom, under what pressure, what is deliberately unfinished | **Goes wrong — this is the one that needs the pass** |
| `.handovers/handover_log.md` | One effort's Destination and decisions | Frozen-correct by design |
| ADRs / code comments | Why-not for a specific technical choice | Point-in-time, stays true |

Only `PROJECT_CONTEXT.md` needs ensuring — do not go looking for drift in the other three.
But the pass **may subtract from `CLAUDE.md`**, and must: see below.

**The line against `CLAUDE.md`.** `CLAUDE.md` is **thin and operational** — layout, commands,
and which checker binds which design principle. Everything durable is here: intent,
stakeholders, invariants, decisions, fog, out of scope. A rule about how the project must
behave is an **invariant**, and invariants live here even though they feel like CLAUDE.md
material.

**Move, never copy.** When the pass finds a durable line in `CLAUDE.md`, it moves the line
here and **deletes it there**, leaving no summary behind. A summary left in place is not a
compromise — it is the mechanism by which the two files drift into contradicting each other,
and `CLAUDE.md` is the one that auto-loads, so the stale copy wins. Deleting from `CLAUDE.md`
is a prose change: propose it, do not do it silently.

**Loading is handled by a directive, not a copy.** `CLAUDE.md` must carry a line near the top
telling the agent to read this file before acting, because it holds the hard rules. That is
an instruction, which cannot drift; a restated rule can.

**Index, not store.** Link the handover maps and ADRs; never copy a decision out of them.
The same rule that binds `handover_log.md` binds this one level up.

## The ensure pass

Run all five. Report once at the end.

1. **Exists.** If missing, enter **Create** mode and grill it out, section by frontier
   round, against the template below. Read everything readable first so no round asks what
   the repo already answers. Leave a section empty rather than guessing — an invented
   Destination is worse than a blank one, and it will be inherited by every effort under it.
2. **Referenced.** `CLAUDE.md` must link it, so it loads every session. If the link is
   missing, add one line. A file nothing reads is worse than no file — it makes the user believe
   the thing is written down.
3. **Footer pass.** The handover completion footer, run against this map:
   - Append any decision the session settled — gist plus the rejected alternative, linked.
   - Move anything now sharp **out of** Not yet specified.
   - Move anything now ruled out **into** Out of scope.
4. **Mechanical drift.** Check and fix directly, no confirmation:
   - Paths named in the file still exist.
   - Links resolve — handover docs, ADRs, external docs.
   - Named branches still exist.
   - Named dependencies are still in the manifest.
   - **Exposure line present.** If missing, it is one question for the user, with your
     recommendation, asked in the same round as any refresh question.
   - **No unresolved placeholders** — a `pending`, `TBD` or `<sha>` left in a decision row.
     `git show pending` fails, so the index points at nothing. Backfill it from the log.
5. **Refresh.** Only when a signal fires. Grill the frontier that signal opened — usually
   one or two questions, in the same numbered format — and stop there. Signals:
   - A line in the fog became sharp.
   - Code contradicts an Invariant.
   - A Stakeholder line names a person or system that no longer appears anywhere.
   - The structure moved since the file's last commit — a new top-level directory, a new
     service, a new dependency, a deleted module. **Not commit count**: volume cries wolf on
     a refactor week, structure does not.

## Fix or propose

**Fix directly:** everything mechanical — dead paths, broken links, stale branch names, the
missing `CLAUDE.md` reference, moving an item between fog and Out of scope on the user's word.

**Propose, never write:** Destination, Intent, Stakeholders, Invariants. Show the diff and
wait. A skill that silently rewrites a description of a client relationship is one the user will
stop trusting, and then the file is dead.

## Report

Clean project, one line and nothing else:

`PROJECT_CONTEXT.md: clean`

Otherwise: what was fixed, then what needs an answer. Never a wall of confirmation for work
that changed nothing — this runs as another skill's step 0, and ceremony there is noise.

## Callers

This skill runs because real work runs, not because a hook nagged. Call it at the point where
the context is already loaded:

- `handover-workflow` author **step 0** — read `PROJECT_CONTEXT.md` before naming an effort's
  Destination. An effort that contradicts the project's Invariants or re-opens something in
  its Out of scope is a drift bug; surface it before writing the handover.
- `project-architect` — create the file with the rest of the project scaffold.

Direct invocation always works, for a check or a first run.

## Template

```markdown
# Project Context — <project name>

<!-- The project map. Outlives every effort in .handovers/. -->
<!-- Write standing conditions, not current status. See ~/.claude/skills/project-context. -->

**Exposure:** <hobby | published | commercial>

## Destination
<what this project is for. One or two lines.>

## Intent, verbatim
> <the client's or user's own words, quoted, never paraphrased>

## Stakeholders
- <name / role> — owns <what>, waiting on <what>.

## Invariants
<what must stay true across every effort — hosting, stack, the client's hard line>

## Decisions so far
<!-- index only: gist + rejected alternative, linking the ADR or handover map -->
- [<slug>](.handovers/handover_00N_<slug>.md) — <gist>. Rejected: <alternative>.

## Not yet specified
<!-- the fog: questions not yet sharp, and work deliberately unfinished with its reason -->

## Out of scope
<!-- ruled out for the project, with the reason. Never graduates. -->

## Efforts
- [.handovers/handover_log.md](.handovers/handover_log.md)
```

## Common mistakes

| Mistake | Fix |
|---|---|
| Invented a new field schema | Exposure line, six map sections plus Stakeholders. Nothing else. |
| Guessed Exposure from the folder or stack | Ask. `play/` can hold a published port. |
| Wrote a field as current status | Write the standing condition. See *Write it to age*. |
| Copied a decision out of a handover map | Index, not store. Gist and link. |
| Created the file but never linked it from `CLAUDE.md` | Step 2. Unlinked is unread is dead. |
| Guessed a Destination to avoid a blank section | Blank beats invented. Ask, or leave it. |
| Rewrote Intent or Stakeholders without asking | Propose and wait. Mechanical only is silent. |
| Used commit count as the staleness signal | Structural change. Volume cries wolf. |
| Extended the pass to `CLAUDE.md` or the handover maps | Only this file rots. |
| Copied a durable line out of `CLAUDE.md` instead of moving it | Move and delete. A summary left behind is how the two files come to contradict each other. |
| Left a `pending` sha in the decision index | Mechanical drift. Backfill from the log before reporting clean. |
| Printed a full report on a clean project | One line. It runs as another skill's step 0. |
| Asked the whole tree at once on create | Rounds. A question downstream of an open one waits. |
| Asked the user something the repo already answers | Facts are your job. Read it, or dispatch a subagent. |
| Grilled the whole tree on a refresh | Refresh grills only the frontier the drift opened. |
| Asked anything on a clean project | Clean is one line. |
| Put the file in `.handovers/` | Project root. It outlives everything in there. |
| Left an open question in the closing message | Same rule as handover: ask it during the pass, or it is fog. |
