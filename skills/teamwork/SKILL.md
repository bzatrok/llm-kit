---
name: teamwork
description: Use when work should be split across agents with Claude as lead — one fresh agent per board row (the Lead loop), Claude subagents first (Sonnet by default; which model, how many) and OpenCode agents (DeepSeek, GLM, gpt-6-luna) second, mixed into the same batch where rows fit. Triggers: /teamwork, "split this up", "use subagents", "fan out", "use opencode", "use GLM", "use ollama cloud", "fire up Luna", "use OpenAI agents", "use the local model", "save my Claude limits", "keep working while limits reset", or any task with several independent parts. Every repo that fans out has a shared task board file (`TASKS.md`) changed only through a claim script. Covers routing, models and effort, budgets, briefs, sizing, launching, monitoring, review and the failures seen on game-port work.
---

# Teamwork

Claude is the lead: it plans, splits, briefs, monitors and merges. Workers do the rows. The two
scarce things are **the user's Claude window** (5 h) and **the lead's own context**. OpenCode tokens do
not count against the Claude window; the provider plan or credit is the cost there.

Source: lead sessions on a game port, 2026-10-08 to 2026-10-11 (~100 Claude subagent launches, ~50 Luna
launches) and the user's notes on agent budgets. Token-cutting material (script wrappers, bundles,
cost metering) comes from a second port, 2026-10-16. The Lead loop below comes from the week of
2026-10-14 to 2026-10-20 on that second port, when four long-lived workers spent the weekly Claude
budget in about two days.

## The Lead loop (binding)

Cost per job is roughly context size × number of turns: every tool call re-sends the agent's whole
conversation. Every rule here shrinks one of the two factors.

0. **Create the board first. No board, no workers.** The board is a `TASKS.md` file in the repo root, changed only through a claim script (`tools/task.py claim/next/set`), so parallel agents never edit it by hand.
1. **The unit of work is one board row with a fixed function list.** A goal that crosses rows
   ("make the level build", "get into the game") is first split into rows by the lead, with no
   agent involved. No open-ended branches outside the board.
2. **The lead pre-scopes; the worker explores nothing.** The brief names the functions in order,
   with sizes, addresses and the file each lives in. It stays **under 4 KB**: no decompile or
   disassembly inlined. The worker reads one function's decompile when it starts that function and
   never re-reads it. (A `row_start` script that inlines every decompile should be changed first.)
3. **One fresh agent per row.** Every decision is in the spawn prompt. **No messages after spawn.**
   The agent reports in ≤100 words and ends; the next row is a new agent. Never chain a second job
   through a finished worker: messages to a busy worker get lost (decisions re-sent four times,
   two workers rebuilt the same functions), and job 2 pays for job 1's transcript on every call.
4. **Function cap, not turn cap.** "These N functions, in this order, commit after each." A turn
   ceiling at about twice the expected count is only a kill switch: on hitting it the worker
   commits what compiles and sets the row **blocked**, never review, so rushed stubs cannot pass
   the gate. A row that hits the ceiling twice is split by what landed (`git log`), the ceiling is
   not raised. The ceiling is self-counted: nothing outside the worker counts turns, so the
   function list is the real limit and the ceiling only tells an honest worker when to stop.
5. **A `blocked:` report ends the agent.** Wrong brief, missing type, dependency on an unclaimed
   row: one turn, no messaging. The lead fixes the brief and spawns fresh.
6. **Logs stay in files.** Build and test output go to a file; the worker runs `grep -n error:`
   first, then `tail -40`. One build per function, tests once at the end. No app runs, debugger
   or screenshots inside a worker; the lead does those on request. `row_start` prints one status
   line.
7. **The gate stays on the lead side.** The worker builds its own test target, commits, hands
   the row over (`row_finish` should only check the tree and sets `review`) and ends. The lead's merge script rebases, builds, runs the full suite and
   fast-forwards; a worker-side `row_finish` repeats that work in the worker's largest context.
8. **The merge gate is the only judge of done.** Worker claims are not.
9. **Budget line on the board.** At spawn the lead writes the row note `budget: N fn / T turns`
   (`tools/task.py set <id> claimed --session <sid> --provider <name> --note ...`; `row_start` accepts a row already
   claimed by its session). At merge the gate appends the commit count from git (reliable) and
   the lead adds turns from the agent's last message, marked self-reported. A row that overshoots
   twice is split next time.
10. **The lead keeps its own context small.** Tails and summaries only, never whole logs or
    review files. **Compaction:** with the cockpit mod loaded (its band shows above the prompt),
    do not ask the user to compact. Call `cockpit_update` with `phase_done: true` after each merge;
    the mod compacts by itself at that boundary once the context is past 200k, and writes its
    own note and resume prompt. Without the mod, name a compact point after each merge and the user
    runs `/compact`. See `~/prod/ClaudeMods/cockpit/PROJECT_CONTEXT.md`.
11. **Parallelism:** at most 2 Claude agents at once on the critical path; more only on cheap
    lanes.

## Do I split at all?

Split only when the parts are independent (different files, no shared state) **and** each part
is big enough to be worth a worker re-reading the project rules. One file, one question, a quick
lookup: do it yourself. A part a worker can finish in one sitting with a one-paragraph brief is
the right size.

## Route each part

Order of preference: **Claude subagents first, Sonnet by default** (Opus, Haiku or Explore where
the table says so). **OpenCode second, DeepSeek first there.** A batch may mix the two in either
direction: "3 Sonnet, 1 DeepSeek" and "3 DeepSeek, 1 Sonnet" are both fine.

Only rows that a test pass or fail can judge and whose brief fits in one paragraph go to OpenCode.
A row that needs judgement midway stays on Claude.

Mechanical transcription rows sent to OpenCode (the opencode subagent plugin defaults to
`opencode-go/deepseek-v4.1-flash`; confirm the provider with `opencode models` before the first launch). Spend rules (which providers are allowed, caps, who approves spend) come from the user's CLAUDE.md; with none there, ask before any paid run.

| Executor | Use for | Cost |
|---|---|---|
| Claude **Sonnet** subagent | **Default executor.** Every row unless the table below names a better fit: ports, fixes, real merge conflicts, link failures, crash debugging, reviews of OpenCode output. | Claude window. |
| Claude **Opus** subagent | Design-heavy parts: architecture, splitting a big unit into rows, a gnarly cross-cutting bug. Rare. | Claude window, most expensive. |
| Claude **Haiku** subagent, effort `max` | Parts made only of small functions (< ~2 KB each). It stubs anything bigger and declines rows with very many functions (one port: ~120 fns refused). | Claude window, cheapest. |
| Explore subagent | Wide read-only searches where you only need the conclusion. | Claude window. |
| OpenCode `ollama-cloud/deepseek-v4.1-flash` | **First OpenCode choice.** Mechanical bundle rows: same quality as GLM-low on script-command rows at a quarter of the price (2026-10-16); larger rows unmeasured. | Ollama Cloud plan. |
| OpenCode `ollama-cloud/glm-5.3-flash#low` | Second choice for mechanical rows: ports, split parts, stub follow-ups, script/config fixes, bulk renames, rebases with regenerated files, long unattended runs while Claude limits reset. | Ollama Cloud plan. |
| OpenCode `ollama-cloud/glm-5.3-flash#high` | Same kind of row, but harder: larger parts, tricky logic, a row `#low` got sent back on. | Ollama Cloud plan, slower. |
| OpenCode `openai/gpt-6-luna` | Fallback when Ollama Cloud fails (auth, quota, outage) or GLM rows keep failing review. | OpenAI credit. |
| OpenCode `ollama/qwen3.6:35b-a3b` | **Last resort.** Small, exactly specified edits (file + change named), when remote is unavailable or the material is private. Use the regular tag, not `-q6k`. | Free, local, slow. |

`fable` is selectable on the Agent tool but untried here; do not route to it without the user asking.

`opencode models` also lists `opencode/glm-5.3-flash-free`: untried (2026-10-16); do not route
there without the user asking.

Other OpenCode models listed by `opencode models`: `gpt-6-luna-fast`, `gpt-6-luna-pro`,
`gpt-5.6-luna*`, other `ollama-cloud/*` (glm-5.3, kimi, deepseek, qwen3.5…),
`ollama/qwen3.6:35b-a3b-q6k`, `ollama/qwen3-coder:30b`. Not trialled; do not route to them
without the user asking.

The precondition for OpenCode and Haiku alike: **a test suite that acts as the review gate.**
No tests in the repo → keep the work on Sonnet, or make a test row first.

## Effort

- **Sonnet / Opus subagents:** omit `effort`; they run at their default. On one port Sonnet's review
  fixes came from gaps in the source material, not too little reasoning, so more effort was not
  expected to help. Set a level only when the user asks.
- **Haiku:** `effort: "max"` — this is the setup chosen for the Haiku trial, and this skill
  asks for it.
- **GLM:** always name the variant. `#low` by default; `#high` for harder rows or a retry of a row
  `#low` failed. Both variant names are accepted by OpenCode (checked 2026-10-12: an unknown variant
  errors with "Variant unavailable"). No other variant is allowed.
- **Luna:** `-m openai/gpt-6-luna` with no variant (OpenCode default). Syntax for a variant is
  `-m provider/model#variant`; which variants Luna accepts is **unchecked**. Check
  `opencode models openai --verbose` before promising the user a level. Raise it only if Luna rows
  keep being sent back after review.
- **Qwen:** thinking is on by default in ollama. Leave it.

## Budgets

| Limit | Value | Why |
|---|---|---|
| Claude workers in parallel | **2** on the critical path; never more than 3–4 | 8–9 Sonnet/Opus workers plus their subagents burned the 5 h window in ~20 min (2026-10-09). 4 Sonnet workers chained row after row hit it in ~40 min. Four long-lived workers chained by message spent a weekly budget in two days (2026-10-20). |
| Leads | One, unless the user asks for more | Two leads with ~18 workers caused the 20-min burn. |
| GLM workers in parallel | **2–4** (unmeasured; same as Luna until a batch shows otherwise) | Ollama Cloud plan limits not yet hit here. Back off on `429`/quota errors. |
| Luna workers in parallel | **2–4**; 2 when credit is low | 8 in parallel, each reading 100 KB+ files, drained the credit fast. |
| Local Qwen | One at a time | One ollama on a 48 GB machine; parallel untested. |
| Subagents inside a worker | Only for parts > ~100 KB; none for rows < ~15 KB | Every extra agent re-reads CLAUDE.md and the sources. |
| Worker reports | ~100 words, no timing tables | Long reports and relays multiply cost. The lead writes the handover entry from the row notes, so workers add nothing to the log. |

Before a batch, tell the user the plan as `rows × executor` (e.g. "4 rows → 3 Sonnet, 1 DeepSeek").
Stop chaining new rows after a batch unless the user says go on.

The user's priority: **Claude subagents first, Sonnet by default; OpenCode second**, mixed into the
same batch where rows fit it. On OpenCode, DeepSeek first and Luna as the fallback, within the spend
rules in the user's CLAUDE.md.

## Claude subagents and teammates

- Use the Agent tool with `model` set explicitly (`sonnet` by default) and a `name` so it is
  addressable. Give **every lead decision in the brief**; each SendMessage wakes a worker and costs
  tokens. **No messages after spawn** (Lead loop rule 3); a worker that needs a decision reports
  `blocked:` and ends.
- Parallel writers on the same repo: `isolation: "worktree"` or the project's own worktree-per-row
  scheme. One session owns each file it commits.
- **Every parallel worker gets its own build directory** (and its own run/test output dir: app config,
  screenshots, logs), never a shared one, so workers build and test in parallel instead of taking
  turns (all projects). Name both dirs in the brief; accept the extra first compile.
- Agent teams may be enabled for the user: teammates may ask each other instead of guessing.
- Same brief shape as for Luna (below), plus: "Do not spawn subagents for this row" unless the row
  is > ~100 KB, "report in ≤100 words: review / blocked + one line why + turns used", the
  function list in order with "commit after each", the turn ceiling, and the stop rule: after the
  report, no builds and no edits in that worktree (a worker building while the gate ran made a
  test binary vanish mid-run, 2026-10-19).
- **Close the app after every check.** A worker that launches the program (a game
  window, a GUI app, a dev server) closes it as soon as that check is done: the launch quits by
  itself (frame list, `--once`, a timer such as `perl -e 'alarm N; exec @ARGV'`), the worker kills
  only its own PIDs (match on its worktree path, never on the bare binary name), and `pgrep` shows
  none of its processes before it reports. The lead checks this before the merge. Put this line in
  every brief that runs the app.
- The Workflow tool (multi-agent scripts) needs the user's explicit opt-in; do not reach for it here.

# OpenCode specifics

## Before the first launch (repo prerequisites)

1. **`AGENTS.md`** at the repo root. OpenCode reads it first. Make it one line pointing to
   `CLAUDE.md`, `PROJECT_CONTEXT.md` and the handover log, so there is one rulebook.
2. **An "Other agents" section in `CLAUDE.md`** with the differences for non-Claude sessions
   (template below). Without it Luna tries to SendMessage, spawn subagents, or run tools it must not.
3. **A claim mechanism** (e.g. `tools/task.py claim/next/set --session opencode-N --provider <name>`) and one
   git worktree per row, so parallel workers never share a checkout.
4. **A mechanical review gate**: the merge script runs the full build + test suite. Luna's
   claims are not the gate; the tests are.

"Other agents" section template — adapt names to the repo:

```markdown
## Other agents (OpenCode, Codex, anything that is not Claude Code)
`AGENTS.md` points here; this file is the one rulebook. Everything above applies. The differences:
- **Session id**: `--session <tool>-<n>` (e.g. `opencode-1`) on every board call. One id per session.
- **Rows**: only rows the lead's first message names, or `next --model sonnet`. Leave design rows to Claude.
- **No teammate messaging, no subagents**: instead set the row `blocked` with a one-line note naming
  what you need, commit, and take the next row. One row at a time.
- **Merging**: default is set the row `review` and stop. Never merge a row another session owns.
- **Scratch**: `/tmp/<project>-scratch/<sid>/`. Nothing from it goes into the repo.
- **Shared devices** (simulators, ports, DBs): touch only your own. Never `shutdown all` / erase.
- **Before you stop**: append a dated handover entry, commit it on master. Idle session: no entry.
- **Deleting files**: `trash <path>`, never `rm`.
```

## Launch

One worker per row, in the background, output to a log in the lead's scratchpad:

```sh
S=<scratchpad>; n=5; row=U-foo
(opencode run -m "ollama-cloud/glm-5.3-flash#low" --auto --title proj-opencode-$n "$(cat $S/oc$n.txt)" \
   > $S/oc$n.log 2>&1 &)
```

- Swap `-m` for `"ollama-cloud/glm-5.3-flash#high"` or `openai/gpt-6-luna` per the routing table.
  Quote the model: `#` starts a comment in some shells.
- Before the first GLM batch, smoke-test auth: `opencode run -m "ollama-cloud/glm-5.3-flash#low" "Reply OK."`.
  Working key: the stored "Ollama Cloud" credential (`opencode auth login`, 2026-10-12). The stale
  `OLLAMA_API_KEY` env var returned `Unauthorized`; if auth breaks, check `opencode auth list`.

- Write each brief to `$S/ocN.txt` first; derive the next from it with `sed` (swap session id and row).
- Launch several in a loop with `sleep 8`–`15` between them so they do not race on the board/master.
- zsh arrays are 1-based. A loop over `${rows[$i]}` from 0 gave one worker an empty row on one port.
- Same command with `-m ollama/qwen3.6:35b-a3b` for local. Run one local worker at a time
  (one ollama, 48 GB machine); parallel local runs are untested.
- `--auto` approves every edit and shell command. **The user's Claude deny list does not apply** — `rm`,
  force-push and the rest are only blocked by what the brief says. Say it in the brief.
- `opencode run` attaches to the background service by default. A long-lived `opencode serve`
  (from an earlier session) ran workers on a port outside the lead's control. Check
  `ps -axo pid,etime,command | grep "opencode serve"` before counting workers; `--standalone`
  gives a private server.

## The brief

Self-contained, one paragraph, every lead decision up front — the worker cannot ask. Proven shape:

> You are session opencode-$n. Read AGENTS.md first and follow CLAUDE.md exactly. Claim row $row:
> `<claim cmd> --session opencode-$n`, create its worktree as CLAUDE.md shows. <What to write, which
> files, which source to work from, priority order.> Before defining any function, grep src/ for it:
> if another file already defines it, do not copy it. Anything you truly cannot finish gets a
> `// STUB: <reason>` body, never left missing. Add tests. Full build + test must pass, then set the
> row review with a one-line note. Do not take other rows. Before you stop, append a dated handover
> entry and commit it on master.

For a take-over of a half-done row: say the worktree path and branch already exist with WIP commits,
"continue there, do not recreate it", and how to reclaim (`set <row> open` then claim).

Extra lines for local Qwen (from `handover-local`, measured on qwen3.6-35b-a3b): it diagnoses and
then asks "shall I proceed?", or proposes a plan instead of editing, or ends with no message. So:
"Make the edits now. Do not ask for permission. Do not write a plan." Judge it by `git diff` and
the files, never by its reply. For longer local work, write the brief with `handover-local`.

## Sizing

- Luna **refused every unit over ~40 KB** of source ("too large for one sitting"). Split into
  parts of **~16 KB** each, one row per part. Parts run in parallel.
- Even inside a part, Luna sometimes leaves its biggest functions unwritten (one port: an 11.8 KB
  function). After review, `grep -n STUB` the diff and send a follow-up worker for the leftovers.
- 2–3 parts per worker brief is fine ("take p01 then p03, stop after your 2 rows").

## Cut the fixed cost per row (2026-10-16)

Measured there: for rows under ~2 KB the fixed cost (read CLAUDE.md and the worker prompt, create a
worktree, configure, build) dominated the cost of the code itself. Three fixes, in order of effect:

1. **Wrap everything mechanical in scripts the worker calls once**, so tokens go to code only. The worker
   prompt shrinks to "run `row_start`, write code, run `row_finish`".
   - `row_start <sid> <row>... | --next ... | --bundle N ...`: claims the rows (or checks the claim),
     creates worktree and branch, configures, warm-builds the library only, prints the function list
     and writes a brief file (item 3).
   - `row_finish <sid> <row> "<note>"`: refuses a dirty tree or an empty branch, rebases on master,
     full build, full `ctest -j8 --repeat until-pass:2`, sets every row on the branch to `review`.
     On failure it prints the failing step and changes nothing.
   - Lead side, `merge_batch <row>...`: chains several review rows through one build+test gate,
     fast-forwards master, marks them done; on a failed gate the caller falls back to per-row
     `merge_row` to isolate the bad row. A branch already in master skips the gate.
2. **Bundles.** Small rows of one family (same name prefix, e.g. script commands) are claimed N at a
   time on one branch and one worktree (`row_start --bundle N`). One rulebook read and one
   configure/build cover 6-10 rows. One test file per row, one `row_finish` at the end.
3. **One brief file per row set** (`row_brief.py`, written by `row_start`): function list with sizes,
   which functions `src/` already defines, the row's header, the decompile block of each listed
   function, and the disassembly inlined for functions up to 512 bytes. The worker reads one file
   instead of grepping five; larger functions are grepped by address.
4. **Build cost.** ccache with `base_dir` set to the checkout so all worktrees share one cache.
   Measured: library rebuild ~2.4 s warm, stub generation 2 s once its groups also go through ccache
   (8.5 s before), fresh worktree library+stubs ~12 s,
   full link of all tests ~72 s; `ctest -j8` 62 s vs 83 s serial for ~520 tests. Workers build only
   their own target while working (`cmake --build build --target test_<name> && ctest -R '^<name>$'`);
   only `row_finish` links everything.

Pattern for the repo: each script prints one failing step and exits non-zero; the brief template names the
exact `row_start` call, the exact `row_finish` call, and the report format. Check the scripts with one
worker before a batch (on one port the first worker run of `row_finish` found an exit-status bug in
`row_start`, harmless but confusing). A bundle drawn from a one-row family wastes a whole launch on the
rulebook read: top the bundle up from other ready rows of the tier.

## Meter the spend (OpenCode, measured 2026-10-16)

- `opencode stats --days 0 --cost --models` gives today's spend per model, computed from list prices.
  Cross-check it against the provider's billing page, which stays the ground truth.
- Fixed-budget trial: run a background meter on that command and pause the workers at the cap.
- Measured on one port: GLM-5.3-flash#low cost about $0.008 per step.
- DeepSeek trialled 2026-10-16 on script-command bundles: 26 rows merged in the first
  40 min, all through the full test gate, one `// STUB:` (a unit not yet ported) in the lot; about
  $0.0013 per step against GLM-low's $0.0025 on the same bundles, and on equal token counts a quarter
  of GLM's price (`opencode stats`, 13:00). Quality on larger
  (sonnet-tier, 10-40 KB) rows is still unmeasured. Name the GLM variant every time (`#low` unless told
  otherwise).

## Monitor without spending context

```sh
pgrep -fl "opencode run" | grep -o "proj-opencode-[0-9]*" | tr '\n' ' '   # who is alive
tail -c 600 $S/oc$n.log                                                     # last words only
```

- Never `cat` a worker log. `tail -c` and `grep` for `error|credit|STUB|review` only.
- Let a background loop merge `review` rows as they appear and exit when no worker is alive and
  nothing is in review (an `automerge.sh`: merge each review row via the merge script, record
  failures in a skip file, `sleep 60`, cap at 240 min). Run it with `run_in_background` so the
  lead is woken on exit instead of polling. With 2+ review rows the loop sends them through
  `merge_batch` (one gate) and falls back to per-row merges when the gate fails. When the push host
  is unreachable the merge still completes; the push is retried later, never forced
  (2026-10-16: ~40 commits ahead of origin while the user was away).

## Review

The test gate catches crashes and link errors, not fidelity. A read-only review of 10 Luna-ported
files on one port found one serious bug and small drift in the rest. So for each Luna row:
check every new function is present, stubs carry a reason, deviations are marked, and give one
row in ten (and every row on a critical path) a Sonnet review pass.

## Failures seen and what to do

| Symptom | Action |
|---|---|
| `Unauthorized` / `429` / quota error from `ollama-cloud` | GLM workers stop. Reset claims to `open`, tell the user, fall back to Claude if the window allows, else Luna. Local Qwen only for small exact edits. |
| `credit_balance_exhausted` in a log | All OpenAI workers stop. Reset their claims to `open` with a note naming WIP commits on `task/<row>`, tell the user, fall back to 3–4 Claude workers. |
| "too large for one sitting" | Split the unit (~16 KB parts). |
| 8 parallel Luna workers each reading 100 KB+ files | Burned the OpenAI credit fast. Default to **2–4 parallel**; when credit is low, 2. Say the planned count × model to the user before a batch. |
| Merge conflict only in a generated file | Send a Luna worker to rebase and regenerate. |
| Stale uncommitted handover log in the main checkout | Workers raced on master. Restore from HEAD if HEAD has every entry. |
| Shared device shut down repeatedly | Brief every worker to touch only its own simulator/port. |
| Worker exits with its row still `claimed` | Check `git log master..task/<row>`, reset to `open` with a note, relaunch. |

## Report to the user

Per batch: which rows went to which executor, how many workers are alive, what merged, what
failed and why, and whether credit looks strained. Never claim a row works because its
worker said so — only after the merge gate passed.
