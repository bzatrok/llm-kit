---
name: handover-workflow
description: Use when the user asks to write/create a handover doc, plan work for a fresh agent, hand off a task, or run/execute a handover file ("execute this file: ..."), or asks about the handover log/tracker or the effort's destination, decisions, or scope. Covers both authoring handovers and executing them in a clean-context session.
---

# Handover Workflow

## How to write to the user

The user runs this workflow every day. Write so they never have to decode you.

- Use plain words. Write "the log", not "the map". Write "this contradicts the
  Destination", not "this is a drift bug".
- Do not invent a metaphor for a file. Call each file by its name.
- One instruction per sentence. 20 words or less.
- Use the active voice. Use no semicolons.
- Do not use phrasal verbs. Write "start", not "spin up". Write "read", not "dive into".
- Use one word for one thing, every time. Do not rotate synonyms.
- Lead every report with the conclusion. Put the support after it.
- Say what you assumed and did not verify. Put it where the user cannot miss it.
- Every question carries your recommended answer.

Keep to the rules above (Simplified Technical English style) if you are unsure.

## What this is

A **handover doc** is an execution plan. A context-rich agent writes it. A fresh agent
with no context then runs it from one instruction: `execute this file: <path>`.

There are two roles. One session never holds both.

- **Author** — has the conversation and the context. Investigates, settles the
  decisions with the user, writes the handover, adds it to the log.
- **Executor** — starts cold with only `execute this file: <path>`. Reads the doc, does
  the work, marks it done.

**The doc must stand alone.** The executor cannot ask the author a question. Every
decision, file path, root cause and acceptance check is in the file, or in the log the
file links to.

## The log

`handover_log.md` holds the intent of the whole effort. Each handover holds one task.
The log outlives all of them. Without the log, handover 015 cannot see why handover 009
chose what it chose, and the user must explain it again.

`PROJECT_CONTEXT.md` sits one level above the log. The log holds this effort's
Destination. `PROJECT_CONTEXT.md` holds what the project is for, who it is for, and what
must stay true across every effort. See the `project-context` skill.

**The log is an index. It is not a store.** A decision lives in one place only — the
handover that made it. The log gives the decision in one line and links to that handover.
Do not restate a decision the log can link to. Do not let a completion note grow into a
second copy of the work.

[Log format](#handover_logmd-format) lists all the sections. Four of them do the real work.

- **Destination** — what "done" means for the whole effort.
- **Intent, verbatim** — the user's own words, quoted. An executor can paraphrase a
  paraphrase and lose the meaning. It cannot do that to a quote.
- **Not yet specified** — questions that are in scope, that you can see coming, but that
  you cannot yet state sharply. Write them here or they die in the conversation.
- **Out of scope** — work ruled out of this effort, with the reason. It stays ruled out.
  Without this section, each fresh agent proposes again what the user already rejected.

**Is it a handover item or is it "Not yet specified"?** Ask if you can state the question
sharply now. You do not need the answer. If you can state it sharply, it becomes a
handover item, even when it is blocked. If you cannot, it becomes one line under **Not
yet specified**.

## Refer to a handover by name

Every handover has a slug. Use it. Write `builds on [town-view](handover_006_town-view.md)`.
Do not write `builds on 006`. The number stays inside the link.

## Directory layout (per project)

```
<repo-root>/.handovers/          # git-tracked, so status is versioned with the code
  handover_log.md                # the log — intent above, one row per handover below
  handover_001_<slug>.md         # one handover, zero-padded count + kebab slug
  handover_002_<slug>.md
```

Create `.handovers/` and `handover_log.md` if they are missing. Otherwise add to them.
Read the log to find the highest count. Add 1 to get the next count.

Use one log per repo. Create a second log, `log_<slug>.md`, only when the repo runs two
efforts at once with different destinations. Each handover then names its own log in the
header.

## Author workflow

### 0. Run `project-context`, then name the Destination

Call the `project-context` skill first. It checks that `PROJECT_CONTEXT.md` exists and is
current, and it loads the file. On a clean project it prints one line and costs nothing.
On a project without the file it builds the file with the user. You are context-rich now, so
this is the cheapest moment to run it.

Then, before handover 001, write three things in the log. Write the Destination. Quote
the user's intent verbatim. List the Invariants.

Take all three from `PROJECT_CONTEXT.md`. Never write an effort Destination that
contradicts a project Invariant. Never re-open something in the project's **Out of
scope**. If the Destination does contradict the project, stop and tell the user before you
write anything.

On later handovers, check that the Destination still holds. If the effort moved, update
the Destination in the live session and say so.

### 1. Read the log first

Read the Destination, the Invariants, Decisions so far, and Out of scope. If your planned
handover contradicts any of them, stop and tell the user.

### 2. Investigate

Read the code. Confirm the root causes. Run the diagnostics. The value of the doc is the
unknowns you resolved. A handover full of "figure out X" failed its job.

### 3. Grill the user until every decision is settled

See [The grill](#the-grill). Do this before you write the handover. After you write the
doc, the question window is closed.

### 4. Check the claim gate

See [Claim gate check](#claim-gate-check). Record the result in the doc's shared context.

### 5. Pick the count and the slug

Take the next count from the log. Write a short kebab slug, for example `orders-map-fixes`.

### 6. Write the handover

Use `handover_{count}_{slug}.md` and the [template](#handover-doc-template).

### 7. Add it to `handover_log.md`

Add a row with status ⬜ pending. Move anything now sharp out of **Not yet specified**.
Add anything now ruled out to **Out of scope**.

### 8. Give the user the handoff command

Give them the exact command to paste into a fresh session:

`execute this file: .handovers/handover_{count}_{slug}.md in a work tree, commit push and open PR when done`

This is the default form. Give it exactly as written. Change it only when the user asks for
something else, for example work on the current branch, or no PR.

## The grill

You know the code now. Settle every open decision with the user before you write.

Ask in **rounds**. A round holds every question you can ask now, without guessing at an
answer you have not heard yet. Ask the whole round in one message. Wait for the user's answers.
Then work out the next round.

A question whose answer depends on another open question belongs to a later round.

Format each question like this:

```
❓ **Q1** — **<short title>**: <the question, with the choices>

➡️ <your recommended answer>
```

**Find the facts yourself.** Never ask the user for something you can read from a file, a
command, or a tool. Send a sub-agent when the lookup is slow. Do not wait for it. Ask the
rest of the round now. Hold back only the questions that depend on the result.

**The decisions are the user's.** Put each one to the user and wait.

The grill ends when the next round is empty. Every branch is visited. Nothing is
silently assumed.

### Write down each round before you ask the next

This rule stops a long grill from losing its own start. A grill that runs 20 rounds will
forget the first five.

After the user answers a round, write the answers to disk. Do this before you ask the next
round.

1. A settled decision goes in the log under **Decisions so far**, with the alternative it
   beat.
2. A question that is now sharp becomes a stub handover. Create
   `handover_{count}_{slug}.md` with the header, the Scope line, and the decisions you
   hold so far. Fill in the rest at step 6.
3. A question that is real but not sharp goes in the log under **Not yet specified**.
4. Work that the user ruled out goes in the log under **Out of scope**, with the reason.

Never hold a round of answers in the conversation only.

## Close every question before you write

The closing message of an authoring session must not raise a new open item. Write no "one
last thing". Write no "this I did not handle". Write no caveat paragraph at the end.

The grill exists to empty that list. A question that arrives after the doc is written
arrives too late to change the doc. It costs the user a second round trip on work they thought
was closed.

Before you write the doc, ask yourself once: what would I want to flag at the end?
Everything on that list gets asked in the grill, now.

If something is still open when you write, it has three homes. Each one is inside the
files.

1. **A locked decision** — you pick the default. Record it as ✅ with the alternative you
   rejected. Name it in the handover.
2. **A handover item** — the question is sharp, so it becomes a task with a decided
   approach.
3. **Not yet specified** — the question is not sharp, so it becomes one line in the log.

The closing message then says three things only: the doc path, what the doc covers, and
the handoff command from step 8. If the user must choose between two real options, that choice
belongs in the grill, before the doc exists.

The same rule binds the executor's final message. Anything unfinished goes in the log row
as 🔄 with a note row, and in the PR body. It does not live as a trailing paragraph in
the chat.

## Claim gate check

Some projects run a Stop-hook claim gate. At the end of every turn that changed a file, a
fresh reviewer compares the closing message against the diff. The reviewer blocks the turn
when a claim is contradicted. The executor must know this before it starts.

Run this from the repo root:

```bash
test -x .claude/hooks/review-gate.sh && grep -q '"Stop"' .claude/settings.json 2>/dev/null \
  && echo "review gate: ON" || echo "review gate: OFF"
```

**If the gate is ON**, put this in the doc's shared context. The gate checks the closing
message against the diff on every turn that changes a file. False claims come back through
stderr. Full reviews land in `reviews/review-<timestamp>.md`. The gate releases itself
after 3 blocks in a row. Tell the executor to correct the work, or to correct the claim.
Tell it never to work around the gate. State the acceptance checklist as the claims that
the final turn will be judged against.

**If the gate is OFF**, say so in one line in the shared context. Then ask the user if they want
the gate installed before the handover runs. Do not install it without their answer. If they
say yes, run this from the repo root:

```bash
~/.claude/hooks/install-review-gate.sh
```

The installer copies the hook from `~/.claude/hooks/review-gate.sh`. It merges the Stop
hook into any existing `.claude/settings.json` and leaves the rest of that file alone. It
creates `reviews/` and ignores it. Running it twice is safe.

To disable the gate later, run `chmod -x .claude/hooks/review-gate.sh`.

The gate needs `jq` and the `claude` CLI on PATH. It reviews only what a diff can show. A
repo whose work is mostly infrastructure gains little from it.

## Handover doc template

Match the depth to the scope. A small fix drops sections. A multi-item batch keeps them
all. Always end with the executor footer.

```markdown
# Handover {count} — <title>

**Branch:** `<branch>` (create/continue?)  ·  **Author:** <session/date>  ·  **Status:** pending
**Log:** [handover_log.md](handover_log.md)
**Serves:** one line — which part of the Destination this advances.
**Scope:** one paragraph — what and why. Link earlier handovers by name.

## 0. Shared context (read first)
- Only what this task needs beyond the log. Link to the log, CLAUDE.md and the
  style guide. Do not restate them.
- Key files table: | Concern | Path:line |
- **Claim gate:** ON or OFF (see author step 4). When ON, name the reviews
  directory and the 3-block cap.

## <N> — <task title>  *(BLOCKER / DECIDED / …)*
### Root cause (confirmed)   ← for bugs. Cite the evidence.
### Fix / approach            ← concrete. The decision is already made.
**Files:** path · path · test to add

## Sequencing
An ordered list. Say what unblocks what.

## Decisions — locked ✅
Every settled choice, each with the alternative it beat:
- <decision> — chose X over Y because <reason>.
The rejected alternative stops the next agent proposing it again.

## Out of scope for this handover
One line each, with the reason. This work does not come back.

## Acceptance / pre-merge checklist
- Build and test commands, from the project CLAUDE.md.
- Manual checks that prove each item works.

---
**On completion:**
1. Update `.handovers/handover_log.md`. Set this handover's status to ✅ done and fill
   in the Completed date. If you could not finish, set 🔄 in-progress and add a note row
   that describes what remains.
2. Add each locked decision to the log's **Decisions so far**. Write one line: the gist
   plus the rejected alternative, linking this doc by name. The detail stays here.
3. Move anything this work made sharp out of **Not yet specified**. Move anything it
   ruled out into **Out of scope**.
4. Commit, push the branch, and open the PR.
```

## handover_log.md format

Create the file with this shape if it is missing. Intent above, table below.

```markdown
# Handover Log — <effort name>

## Destination
<what "done" means for the whole effort. One or two lines.>

## Intent, verbatim
> <the user's own words, quoted, never paraphrased>

## Invariants
<what must stay true through every handover — "public API unchanged", "measure before optimizing">

## Notes
<skills every session must call. Standing preferences for this effort.>

## Decisions so far
<!-- index only: one line per decision, linking the handover that holds the detail -->
- [nations-diplomacy-balance](handover_009_nations-diplomacy-balance.md) — pirate lairs are
  tradeable and reputation-gated. Rejected: lairs as combat-only.

## Not yet specified
<!-- in-scope questions you can see coming but cannot yet state sharply -->

## Out of scope
<!-- ruled out of this effort, with the reason. It stays ruled out. -->

| # | Slug | Goal | Status | Branch | Created | Completed |
|---|------|------|--------|--------|---------|-----------|
| 001 | [orders-map-fixes](handover_001_orders-map-fixes.md) | Fix analytics 500s + map overhaul | ✅ done | feature/x | 2026-06-23 | 2026-06-24 |
| 002 | [<slug>](handover_002_<slug>.md) | <one-line goal> | ⬜ pending | <branch> | <date> | — |
```

Status legend: ⬜ pending · 🔄 in-progress · ✅ done. Always link the slug to its file.

## Executor workflow (`execute this file: <path>`)

The default instruction is `execute this file: <path> in a work tree, commit push and open
PR when done`. Steps 3 and 8 apply that default. Skip them only when the user's instruction
leaves them out.

0. **The doc is the plan. Do not plan it again.** Skip `brainstorming`, `writing-plans`,
   `spec`, and every other up-front design skill. The author ran them, and this file is
   their output. Every decision is locked. There is nothing to explore and nobody to answer
   a question. Skills that fit execution stay available — TDD, systematic-debugging,
   verification-before-completion. Use them when the work calls for them, not on arrival.
1. Read the whole handover and `handover_log.md` before you touch the code.
2. **Restate the intent. This is a hard stop.** In your first message, state the
   Destination and the Invariants in your own words. Name which part of the Destination
   this task serves. Stop and report instead of working if the task contradicts an
   Invariant, sits in **Out of scope**, or re-opens a decision in **Decisions so far**. A
   wrong restatement is visible now. Drift found in the diff is not.

   Read `PROJECT_CONTEXT.md` too if the repo has one. Run the same three checks against
   the project Invariants and the project Out of scope. Do not run the `project-context`
   pass. You are cold, so you cannot answer what it asks. Read only. Report a
   contradiction. Do not fix it.
3. Enter an isolated work tree with the native `EnterWorktree` tool. Use the branch named
   in the handover header. Do not use a `git worktree` shell command.
4. Set the log row to 🔄 in-progress.
5. Execute the doc from start to end. Follow its sequencing and its locked decisions. Do
   not add scope beyond the doc. Stop and report if something is blocked or ambiguous. Do
   not guess.
6. Run the doc's acceptance and pre-merge checklist.
7. Run the doc's completion footer. Set the log row to ✅ done with the date. Add the
   decision gists to the log's **Decisions so far**. Update **Not yet specified** and
   **Out of scope**.
8. Commit the work in small commits. Push the branch. Open a pull request. Put the
   handover number and title in the PR title. Summarize the acceptance checklist result in
   the PR body. Give the user the PR URL.

## Common mistakes

| Mistake | Fix |
|---|---|
| Wrote to the user in metaphors or long sentences | Read **How to write to the user** at the top. Plain words, short sentences, no invented names for files. |
| Doc says "investigate X" or "decide X" | Settle it in the authoring session. The executor only executes. |
| Doc relies on conversation context | Write every path, root cause and decision into the file. The executor has none. |
| Wrote no Destination | Author step 0. Without it, each doc invents its own scope. |
| Named an effort Destination without reading `PROJECT_CONTEXT.md` | Author step 0 runs `project-context` first. An effort cannot out-scope its project. |
| Executor ran the `project-context` pass | The executor reads only. It is cold and cannot answer the questions. |
| Paraphrased the user's intent | Quote it verbatim in the log. |
| Recorded a decision without the rejected alternative | Name what it beat, or the next agent proposes it again. |
| Held a grill round in the conversation only | Write each round to disk before you ask the next one. |
| Asked a question that depends on another open question | It belongs to a later round. |
| Asked the user for a fact you could look up | Find facts yourself. Send a sub-agent. |
| Dropped a detail that was real but not sharp | Write it under **Not yet specified**. |
| Restated a decision the log already holds | The log is an index. Give the gist and link to the handover. |
| Completion note grew into a second copy of the work | One line in the log. The detail stays in the handover and the PR. |
| Referred to a handover by a bare number | Use its slug as a named link. |
| Forgot to add the row, or to mark it done | The author adds the ⬜ row. The footer makes the executor mark it ✅. |
| Restated CLAUDE.md or style rules | Link to them. Keep the doc about this work. |
| Re-used a count | Always take the next count from the log or the directory. |
| Did not state the claim gate | Check it in author step 4. A blocked executor with no explanation wastes a session. |
| Gave a bare `execute this file:` command | The default adds `in a work tree, commit push and open PR when done`. |
| Executor worked in the main checkout | Enter a work tree first, unless the user asked for the current branch. |
| Executor skipped the restate step | Step 2 is a hard stop. Drift is invisible without it. |
| Executor opened with a brainstorming or planning skill | The handover is that skill's output. Step 0. |
| Executor ran the full pre-merge suite after every section | Run the narrow tests for the section while working. Run the doc's full block once, before you push. |
| Closing message ended with "one last thing open" | Ask it in the grill, before you write. Afterwards it is a locked decision, a handover item, or **Not yet specified**. |
