---
name: visual-process
description: Build a single-file process diagram (a runbook, an incident or patch procedure, an approval flow, an order or job lifecycle, a CI/CD pipeline as steps) with auto-laid-out steps and decisions, the inputs and outputs of each step, a state rail that shows what state the subject is in, and named paths that play end to end. Same look and controls as visual-map. Use when the user says /visual-process, "map this process", "diagram the procedure", "flowchart", "runbook as a diagram", "show the steps and states", "what goes in and out of each step", or wants to see how a piece of work moves through steps and decisions rather than how the parts of a system connect.
---

# visual-process

Produce ONE self-contained HTML file: a process diagram. ELK.js lays it out, so you write a model, never coordinates. It has the same chrome as `visual-map` (marching dashes, click-to-focus, collapsible groups, URL params), and adds three things a map does not have:

- **Decisions** branch the flow. The branch label is the answer ("yes", "no", "retry").
- **Inputs and outputs** sit beside each step as small document chips: inputs on the left, outputs on the right.
- **States** belong to one subject (an order, a ticket, an nginx instance). A rail above the diagram lists them. When a path plays, the rail lights the state the subject is in at each step.

**visual-process, visual-map or visual-explain?** A map answers "what talks to what". A process answers "what do we do, in what order, with what, and where does the thing end up". An explainer answers "how does this mechanism work". A procedure someone carries out, or a lifecycle something goes through, is a process. If the steps run across systems the reader also needs to see, make the map and the process and link them from the intro line.

## Scope first: four questions

Ask only what the prompt does not already answer.

1. **What is the subject?** The one thing whose state changes: "one nginx instance", "an order", "a pull request". If you cannot name one subject, the process is two processes, or it is a map.
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

Copy `template.html`. Change the `<title>`, the `<h1>`, the intro line and the `MODEL` object. Nothing else unless a rule below says so. The template's model is a worked example (triage of the nginx2root CVEs): read it before you write your own.

```js
subject:   'one nginx instance'                  // whose states these are
states:    [{id, label, tone:'neutral'|'warn'|'bad'|'good', tip, terminal?:true}]
lanes:     [{id, label}]                         // phases or actors; a box around steps
steps:     [{id, lane?, kind?:'start'|'step'|'decision'|'wait'|'end', label, sub, tip,
             state?, in?:[artifact ids], out?:[artifact ids], cmd?}]
artifacts: [{id, label, sub, tip, external?:true}]
links:     [{from, to, label?, kind?:'loop'}]    // control flow between steps
paths:     [{id, label, steps:[step ids in order]}]
collapsed: [lane ids closed on first load]
showIO:    true                                  // chips on first load
```

- **label** ≤ 3 words, an imperative verb phrase for a step ("Read the version"), a question for a decision ("Fixed build out?"), the outcome for an end ("Patched"). **sub** ≤ 4 words: the tool, the scope or the threshold ("nginx -T", "1.9.5 – 1.31.8").
- **tip** 1–2 sentences: why the step exists or what the reader must not get wrong. No new term inside a tip.
- **cmd** is the exact command or action when the reader carries the process out. It shows in the detail panel, never on the diagram.
- **state** on a step is the state the subject is in *after* that step. Set it only where the state changes; the renderer carries it forward. Every `end` step has a state. A state no step sets is dead: remove it or add the step.
- **tone**: `bad` = needs action, `warn` = in progress or temporary, `good` = closed, `neutral` = not known yet. Mark end states `terminal:true` (dashed chip).
- **in / out** say what a step reads and what it makes, in the reader's words, using the source's own nouns. An output that no later step reads is fine only if it is a deliverable. An input that no step makes must be `external:true` (comes from outside the process).
- **links** in control-flow order. A decision has one link per answer, each labelled. A link that goes back is `kind:'loop'`.
- **lanes** group by what the reader reasons about: phases (Find, Assess, Act) or actors (Requester, Approver, System). Ids may repeat step ids; the renderer keeps them apart.
- **paths**: every consecutive pair must be a link. The page logs `console.error` for a missing link, an unknown state or an unknown artifact.
- All text follows the **Prose** rules of `visual-explain`, including ASD-STE100.

## Size budget

- **At most 14 steps visible on first load**, decisions and ends included. Above that, collapse lanes in `collapsed` until the open steps are ≤ 14.
- **At most 7 states.** More means the state model is finer than the reader needs, or there are two subjects.
- **At most 3 chips per side of a step.** More means the step does too much: split it.
- **Over ~30 steps**: make two pages (an overview with lanes collapsed, plus one page per lane that matters) and link them from the intro.

## Procedure

1. **Scope and ground** (above). List steps, decisions, states and artifacts with the source each came from, in your notes.
2. **Write states first**, then steps and links. Check: every step has a link in and out (start has none in, ends none out), every decision has ≥ 2 labelled links, every state is set by some step.
3. **Write paths**, one per question from scope step 3. Read each back as a sentence per step: "Dump the config reads nginx instances, makes Full config, and the instance is now Affected version." If an input is not made by an earlier step on the path and is not external, a step is missing or the order is wrong.
4. **Verify** (below).
5. Save in one folder per visual: `.visuals/<name>/<name>-process.html` at the project root (git root, else cwd), with `sources/`, `build/` and `SOURCES.md` as in `visual-map`. Same rules for `.git/info/exclude` and for learning vaults (see `explain`, **Where the page goes**). Report the path, the steps and states you assumed, and what you left out.

## Verify

The template reads URL params so every state can be screenshotted: `?path=<id>`, `?focus=<step id>`, `?focus=art:<artifact id>`, `?state=<state id>`, `?collapse=<lane ids>`, `?io=0`, `?view=fit` (whole diagram instead of the readable opening view).

1. Screenshot `?view=fit`, the default view, each path, `?io=0&view=fit` and each lane collapsed:
   `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --window-size=1300,900 --virtual-time-budget=5000 --screenshot=<out>.png "file://<abs path>?view=fit"`
   Read every PNG. Look for: an edge with no arrow between two steps that should connect, a branch label far from its branch, a chip that overlaps another box, a box outside its lane, a dead end that is not an `end`.
2. **Playback needs a real browser.** Headless screenshots do not advance `requestAnimationFrame`, so the rail, the current-step highlight and the camera stay on step 1. Serve the folder (`python3 -m http.server`) and check in Chrome that the rail, the step list and the view move with the token.
3. **Fresh eyes.** A subagent that did not write the model reads the HTML, the PNGs and the sources, and answers: is every step, branch and fact traceable to a source or marked assumed, is any branch missing (what happens when the check fails?), does every path match the source, is any state unreachable. Ranked blocker / should-fix / optional. Fix blockers.
4. Hand over: path, assumptions, what the check did not cover.

## Template mechanics (change only with reason)

- Shared with `visual-map`: ELK `layered` DOWN, orthogonal routing, `INCLUDE_CHILDREN`, canvas-measured box widths, marching-dash edges, morph on collapse, tokens on `offset-path`, reduced motion, pinned `elkjs@0.9.3` with SRI, `esc()` on every model string before `innerHTML`. See that skill for the details.
- **Ports.** Each step node is core shape + chips. Control edges attach to fixed NORTH and SOUTH ports at the core's centre (`portConstraints: FIXED_POS`), so they never land on a chip. When chips make a node taller than its core, short stubs join the ports to the core.
- **Chips are drawn, not laid out.** Inputs and outputs are part of the step's node, not ELK nodes. An artifact used by three steps shows three chips; clicking one lights all of them. This keeps long input/output edges out of the layout (they made unreadable tangles when artifacts were graph nodes).
- **Lane ids get an internal `lane:` prefix**, because ELK edges are positioned relative to their container and a lane and step with the same id overwrote each other's offset.
- **`cycleBreaking: MODEL_ORDER`** keeps loops pointing back up, so the main flow reads top to bottom in model order.
- **Opening view.** If the whole diagram would render below 80% scale, the page opens at a readable scale, top first, centred on the first step. Fit shows everything. Plain scroll pans; pinch or ctrl/⌘ + scroll zooms (a process is tall; a map is wide, which is why the map zooms on scroll).
- **Playback** runs one `requestAnimationFrame` loop per path: the hop index sets the current step, the rail state, the highlighted list item, and pans the view when the step leaves it. Any zoom, pan or drag by the reader stops the auto-pan until another path is picked.
