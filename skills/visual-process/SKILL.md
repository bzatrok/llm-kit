---
name: visual-process
description: Build a single-file process diagram (a runbook, an incident or patch procedure, an attack or privilege-escalation chain, an approval flow, an order or job lifecycle, a CI/CD pipeline as steps) with auto-laid-out steps and decisions, the inputs and outputs of each step, a state rail that shows what state the subject is in, and named paths that play end to end. Same look and controls as visual-map. Use when the user says /visual-process, "map this process", "diagram the procedure", "flowchart", "runbook as a diagram", "show the steps and states", "what goes in and out of each step", "how does this exploit work", "attack chain", "kill chain", or wants to see how a piece of work moves through steps and decisions rather than how the parts of a system connect.
---

# visual-process

Produce ONE self-contained HTML file: a process diagram. ELK.js lays it out, so you write a model, never coordinates. It has the same chrome as `visual-map` (marching dashes, click-to-focus, collapsible groups, URL params), and adds three things a map does not have:

- **Decisions** branch the flow. The branch label is the answer ("yes", "no", "retry").
- **Inputs and outputs** sit beside each step as small document chips: inputs on the left, outputs on the right.
- **States** belong to one subject (an order, a ticket, an nginx instance). A rail above the diagram lists them. When a path plays, the rail lights the state the subject is in at each step.
- **Step numbers** belong to a path, not to a step, because one step can sit at a different place on each path. When a path is selected, each of its steps gets a number badge that matches the numbered list in the side panel. The page opens on the first path, so put the main path first. The rail shows "Step 3 of 7" with Previous, Next and Play/Pause. ← and → step by hand.

**visual-process, visual-map or visual-explain?** A map answers "what talks to what". A process answers "what do we do, in what order, with what, and where does the thing end up". An explainer answers "how does this mechanism work". A procedure someone carries out, a lifecycle something goes through, or an attack chain an attacker moves along (the subject is the attacker's access) is a process. If the steps run across systems the reader also needs to see, make the map and the process and link them from the intro line.

## Agree on what to show (before anything else)

Before you scope, ground or build, write in 1–2 lines what the page will show. Get the user's OK on it. Build nothing until they approve it.

- **Form:** "**Shows:** <what is on screen, in the user's nouns>. **Answers:** <the one question the reader gets answered>."
- **Name the subject, not the work around it.** "The request path from the internet to the API gateway, with DDoS protection and the WAF at each hop" is a subject. "How we checked that DDoS protection is on" is the work that found it. Show the work only when the user asks for it.
- **After a conversation, look for the result.** When the request follows earlier work, the subject is usually a result already in the conversation: a path, a diagram, a list, a table. Quote it or point to it in the statement.
- **Always ask, even when the prompt looks clear.** A clear-looking prompt is where the wrong subject slips through. Use AskUserQuestion: your statement first, marked recommended. Add one or two real alternatives that read the request in a different way. The user can correct through "Other".
- **Refine until approved.** If the user corrects the statement, rewrite it and ask again. You may read sources to write a better statement. Do not write a model, a step list or a page before approval.
- **Use it.** Put the approved statement in the page intro and in the handover. Every later choice (subject, flows, paths, steps, what you leave out) must serve it.
- **Wrong skill?** If the approved subject fits another `visual-*` skill better (a path through parts is a `visual-map`, steps with decisions are a `visual-process`), say so in the same ask and offer that skill.
- **No second ask.** If `explain` passes an approved statement in `args` ("Approved: Shows: … Answers: …"), use it and do not ask again.

## Research the input and check the truth

Follow `RESEARCH.md` in the `explain` skill folder. Read it before you collect anything. The hard rules:

- After approval, write the claims that the page will make in `build/claims.md`, one row per claim, before you collect.
- Read the deployed source, not the nearest one. Trust order: live state > deployed config > repo base > current doc > old doc > memory.
- Save every raw output in `sources/` and cite it. Never write a model value from memory of a chat or a terminal.
- Label every claim `live`, `config`, `doc` or `assumed`. Report a mismatch between two sources. Do not pick one value quietly.
- Ask before you read production, read credentials or send traffic.
- Screenshots check the layout, not the facts. Before the hand-over, run `check-claims.py`, run the fresh-eyes check on the facts, and show the evidence mix in the intro.

## Scope first: four questions

Ask only what the prompt and the approved statement do not already answer.

1. **What is the subject?** Take it from the approved statement. The one thing whose state changes: "one nginx instance", "an order", "a pull request", "the attacker's access". If you cannot name one subject, the process is two processes, or it is a map.
2. **Who reads it?** The person who carries it out (needs commands and exact inputs) or someone who approves or audits it (needs decisions and end states).
3. **Which 3–6 paths matter?** A path is one named run from start to an end ("happy path", "no fix yet", "rejected"). Every end state should be reached by at least one path.
4. **Grounding.** Is there a runbook, a ticket workflow, a CI file, a state enum in code, an advisory? Read it.

## Ground the model in the source

- Steps come from runbooks, pipeline files (`azure-pipelines.yml`, `.github/workflows/*`), workflow or state-machine code (an enum of statuses and the code that moves between them), ticket workflows, vendor advisories.
- States come from the source's own words where they exist (a status enum, ticket statuses). Do not invent a finer state model than the source has.
- Facts on the page (versions, dates, limits, commands) need a source you read in this session. Put the sources in the intro line as links and in `SOURCES.md`.
- A step, branch or state you could not find in a source is an assumption. Say so in its `tip` ("assumed: …") and in the hand-over.
- No source at all (the user describes a design): build from the description and mark the page "proposed process" in the intro line.

## The model

Copy `template.html`. Change the `<title>`, the `<h1>`, the intro line and the `MODEL` object. Nothing else unless a rule below says so. The template's model is a worked example (the nginx2root attack chain, from one HTTP/2 connection to root on the host): read it before you write your own. It shows decisions as the points where a defense stops the chain, and detection signs in the tips.

```js
subject:   'one nginx instance'                  // whose states these are
states:    [{id, label, tone:'neutral'|'warn'|'bad'|'good', tip, terminal?:true}]
lanes:     [{id, label}]                         // phases or actors; a box around steps
steps:     [{id, lane?, kind?:'start'|'step'|'decision'|'wait'|'end', label, sub, tip,
             state?, in?:[artifact ids], out?:[artifact ids], cmd?}]
artifacts: [{id, label, sub, tip, external?:true}]
links:     [{from, to, label?, kind?:'loop'}]    // control flow between steps
paths:     [{id, label, steps:[step ids in order]}]
terms:     [{term, def}]                         // every technical word, defined once
collapsed: [lane ids closed on first load]
showIO:    true                                  // chips on first load
```

- **label** ≤ 3 words, an imperative verb phrase for a step ("Read the version"), a question for a decision ("Fixed build out?"), the outcome for an end ("Patched"). **sub** ≤ 4 words: the tool, the scope or the threshold ("nginx -T", "1.9.5 – 1.31.8").
- **tip** 1–2 sentences: why the step exists or what the reader must not get wrong. No new term inside a tip.
- **cmd** is the exact command or action when the reader carries the process out. It shows in the detail panel, in the step list of a path, and in the Commands card. It never shows on the diagram. A click on a command copies it.
- **state** on a step is the state the subject is in *after* that step. Set it only where the state changes; the renderer carries it forward. Every `end` step has a state. A state no step sets is dead: remove it or add the step.
- **tone**: `bad` = needs action, `warn` = in progress or temporary, `good` = closed, `neutral` = not known yet. Mark end states `terminal:true` (dashed chip).
- **in / out** say what a step reads and what it makes, in the reader's words, using the source's own nouns. An output that no later step reads is fine only if it is a deliverable. An input that no step makes must be `external:true` (comes from outside the process).
- **links** in control-flow order. A decision has one link per answer, each labelled. A link that goes back is `kind:'loop'`.
- **lanes** group by what the reader reasons about: phases (Find, Assess, Act) or actors (Requester, Approver, System). Ids may repeat step ids; the renderer keeps them apart.
- **paths**: every consecutive pair must be a link. The page logs `console.error` for a missing link, an unknown state or an unknown artifact.
- **terms** define every technical word the page uses, one STE sentence or two each. They show as a collapsed Terms card under the detail panel.
- All text follows the **Prose** rules of `visual-explain`, including ASD-STE100: active voice, no semicolons, one idea per sentence, 25 words or fewer, one word per meaning. Write detection signs and remedies as instructions ("To detect it, look for …").
- **Attack chains** stay at the level of the published write-ups: stages, conditions, what each stage gives the attacker, detection signs. Leave out payloads, offsets and request-shaping detail.

## Size budget

- **At most 14 steps visible on first load**, decisions and ends included. Above that, collapse lanes in `collapsed` until the open steps are ≤ 14.
- **At most 7 states.** More means the state model is finer than the reader needs, or there are two subjects.
- **At most 3 chips per side of a step.** More means the step does too much: split it.
- **Over ~30 steps**: make two pages (an overview with lanes collapsed, plus one page per lane that matters) and link them from the intro.

## Procedure

1. **Agree, research, scope and ground** (above). The approved statement comes first, then `build/claims.md` and `sources/`. List steps, decisions, states and artifacts with the source each came from, in your notes.
2. **Write states first**, then steps and links. Check: every step has a link in and out (start has none in, ends none out), every decision has ≥ 2 labelled links, every state is set by some step.
3. **Write paths**, one per question from scope step 3. Read each back as a sentence per step: "Start a large copy makes Memory addresses and Corrupted heap, and the access is now Heap corrupted." If an input is not made by an earlier step on the path and is not external, a step is missing or the order is wrong.
4. **Verify** (below).
5. Save in one folder per visual: `.visuals/<name>/<name>-process.html` at the project root (git root, else cwd), with `sources/`, `build/` and `SOURCES.md` as in `visual-map`. Same rules for `.git/info/exclude` and for learning vaults (see `explain`, **Where the page goes**). Report the path, the steps and states you assumed, and what you left out.

## Verify

The template reads URL params so every state can be screenshotted: `?path=<id>` (the page opens on the first path; `?path=none` opens the plain diagram), `?focus=<step id>`, `?focus=art:<artifact id>`, `?state=<state id>`, `?collapse=<lane ids>`, `?io=0`, `?view=fit`, `?step=<n>` (with `?path=`: open paused at step n) (whole diagram instead of the readable opening view).

1. Screenshot `?path=none&view=fit`, the default view, each path (add `&step=<n>` for a middle step), `?path=none&io=0&view=fit` and each lane collapsed:
   `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --window-size=1300,900 --virtual-time-budget=5000 --screenshot=<out>.png "file://<abs path>?view=fit"`
   Read every PNG. Look for: an edge with no arrow between two steps that should connect, a branch label far from its branch, a chip that overlaps another box, a box outside its lane, a dead end that is not an `end`.
2. **Playback needs a real browser.** Headless screenshots do not advance `requestAnimationFrame`, so the camera does not pan and auto-play stays on step 1. `?path=<id>&step=<n>` shows the badges, the rail and the current step without playback. Serve the folder (`python3 -m http.server`) and check in Chrome that the rail, the badges, the step list and the view move with the token, and that Previous, Next and ← → step correctly.
3. **Truth check.** Follow **Check the truth** in `RESEARCH.md` (`explain` skill folder): run `python3 -I check-claims.py <visual folder>`, check that every fact on the page has a ledger row, run the safe behaviour probes, save `build/refresh.sh`, and put the evidence mix in the intro. A failed ledger check fails the build.
4. **Fresh eyes.** A subagent that did not write the model reads the HTML, the PNGs and the sources, and answers: is every step, branch and fact traceable to a source or marked assumed, is any branch missing (what happens when the check fails?), does every path match the source, is any state unreachable. Ranked blocker / should-fix / optional. Fix blockers. Give it `build/claims.md` and `sources/` too, and have it mark each fact on the page as traced, doc only, assumed, wrong or no row. Fix every wrong and every no row.
5. Hand over: path, the evidence mix, the `doc` and `assumed` claims, every mismatch, what the check did not cover.

## Template mechanics (change only with reason)

- Shared with `visual-map`: ELK `layered` DOWN, orthogonal routing, `INCLUDE_CHILDREN`, canvas-measured box widths, marching-dash edges, morph on collapse, tokens on `offset-path`, reduced motion, pinned `elkjs@0.9.3` with SRI, `esc()` on every model string before `innerHTML`. See that skill for the details.
- **Ports.** Each step node is core shape + chips. Control edges attach to fixed NORTH and SOUTH ports at the core's centre (`portConstraints: FIXED_POS`), so they never land on a chip. When chips make a node taller than its core, short stubs join the ports to the core.
- **Chips are drawn, not laid out.** Inputs and outputs are part of the step's node, not ELK nodes. An artifact used by three steps shows three chips; clicking one lights all of them. This keeps long input/output edges out of the layout (they made unreadable tangles when artifacts were graph nodes).
- **Lane ids get an internal `lane:` prefix**, because ELK edges are positioned relative to their container and a lane and step with the same id overwrote each other's offset.
- **`cycleBreaking: MODEL_ORDER`** keeps loops pointing back up, so the main flow reads top to bottom in model order.
- **Opening view.** If the whole diagram would render below 80% scale, the page opens at a readable scale, top first, centred on the first step. Fit shows everything. Plain scroll pans; pinch or ctrl/⌘ + scroll zooms (a process is tall; a map is wide, which is why the map zooms on scroll).
- **Playback** runs one `requestAnimationFrame` loop per path: the hop index sets the current step, the rail state, the current badge, the highlighted list item, and pans the view when the step leaves it. Any zoom, pan or drag by the reader stops the auto-pan until another path is picked or the reader steps by hand.
- **Manual stepping** pauses the loop and freezes each token animation at the moment the current step's token lands, so Play resumes from that step. Clicking a badge or a list item jumps to that step. Reduced motion opens paused on step 1.
- **Badges** are drawn per selected path in their own top layer at the core's top-left corner (inset on decisions). A step the path visits twice shows both numbers. A collapsed lane shows the range ("4–7").
