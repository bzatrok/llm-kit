---
name: visual-map
description: Build a single-file static system map (software stack, service architecture, infrastructure, data pipeline) with auto-laid-out boxes, animated dashed edges that show which way data moves, click-to-focus, collapsible groups for large systems and named flows traced end to end. Use when the user says /visual-map, "map this system", "diagram the stack", "architecture diagram", "show the data flow", or wants to see how the parts of a system connect rather than learn a mechanism step by step.
---

# visual-map

Produce ONE self-contained HTML file: a static map of a system. ELK.js lays it out, so you write a model, never coordinates. Dashes march in the direction data moves. The reader explores by clicking: focus a part, collapse a group, pick a flow.

**visual-map or visual-explain?** A map answers "what talks to what". An explainer answers "what happens, in order". A stack, a service landscape or an infra layout is a map. A protocol handshake or a mechanism is an explainer. If the user needs both, make the map and link the explainer from one flow.

## Scope first: three questions

Ask only what the prompt does not already answer.

1. Who reads it: a newcomer to the system, or an engineer who works on it? Newcomers get fewer parts and more tips.
2. Which 2–5 flows matter? A flow is one named request or job end to end ("checkout", "nightly export"). Flows are what turn a box diagram into an explanation.
3. Grounding: is there a repo, compose file, IaC or doc? Read it.

## Ground the model in the source

Build the model from what the system really is, not from what such systems usually look like.

- Parts come from `docker-compose*.yml`, Terraform/Bicep, Kubernetes manifests, `package.json`/`*.csproj`, `appsettings*.json`, `.env.example`, CI files.
- Edges come from code: HTTP clients and base URLs, connection strings, queue/topic names, webhook routes, SDK calls.
- A part or edge you could not find in a source is an assumption. Say so in its `tip` ("assumed: …") and in the hand-over.
- No source at all (the user describes a design): build from the description, mark the page "proposed design" in the intro line.

## The model

Copy `template.html`. Change the `<title>`, the `<h1>`, the intro line and the `MODEL` object. Nothing else unless a rule below says so.

```js
groups: [{id, label}]                      // a box around parts: a host, a cloud account, a bounded context
nodes:  [{id, group?, label, sub, tip, kind?:'db', external?:true}]
edges:  [{id, from, to, kind:'sync'|'async'|'data', label}]
flows:  [{id, label, sub, edges:[edge ids in order]}]
collapsed: [group ids closed on first load]
```

- **label** ≤ 3 words, the thing's real name. **sub** ≤ 4 words, its tech or role ("ASP.NET Core", "tables + outbox").
- **tip** 1–2 sentences: what it owns or why it exists. No new term inside a tip.
- **edge label is a verb phrase** ≤ 3 words, read as `from <label> to`: "calls REST", "polls outbox", "webhook". An edge points in the direction the data or request goes. A request/response pair is one sync edge from the caller.
- **kind**: `sync` = caller waits; `async` = poll, queue, webhook, cron, fire-and-forget; `data` = read/write to a store. Four colours at most, the template already uses them.
- `kind:'db'` draws a cylinder (databases, buckets, queues as storage). `external:true` draws a dashed border: anything you do not operate.
- **flow edges** in the order the request travels. A flow can reuse edges and go back (webhook returning). 3–7 hops.

## Size budget

- **At most 9 parts visible on first load.** Above that, put groups in `collapsed` until the open parts are ≤ 9. The reader opens what they need.
- **Group by what the reader reasons about**: a deployment unit (one VM, one cluster), a trust boundary (external services), a bounded context. Never by tech type alone unless that IS the boundary.
- **Over ~40 parts**: make two maps (overview with every group collapsed, plus one map per group that matters) and link them from the intro. One map should not need scrolling in both directions.
- Collapsed groups merge edges: same direction becomes one edge "N links", mixed kinds draw grey. Expected, not a bug.

## Procedure

1. **Scope and ground** (above). List parts and edges with the file each came from, in your notes.
2. **Write the model.** Edges first, then check every node has at least one edge. A part with no edge is either missing an edge or does not belong on the map.
3. **Write flows**, one per question from scope step 2.
4. **Verify** (below).
5. Save as `.visuals/<system>-map.html` at the project root (git root, else cwd); create the folder if missing. Keep it out of the repo: in a git repo where `git check-ignore -q .visuals` fails, append `.visuals/` to `.git/info/exclude`, never to `.gitignore`, and never stage it. Report the path, the parts and edges you assumed, and what you left out.

## Verify

The template reads URL params so every state can be screenshotted: `?flow=<id>`, `?focus=<node id>`, `?collapse=<g1,g2>` (empty `?collapse=` opens everything).

1. Screenshot the default state, every flow, and each group collapsed:
   `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --window-size=1300,900 --virtual-time-budget=4000 --screenshot=<out>.png "file://<abs path>?flow=<id>"`
   Read every PNG. Look for: a label crossing a box or another label, an edge entering the wrong box, a box sitting outside its group, a flow whose lit path skips a hop.
2. **Fresh eyes.** A subagent that did not write the model reads the HTML, the PNGs and the source files you named, and answers: is every edge traceable to a source or marked assumed, does any edge point the wrong way, is any important part missing, does each flow match the code path. Ranked blocker / should-fix / optional. Fix blockers.
3. Hand over: path, assumptions, what the check did not cover.

## Template mechanics (change only with reason)

- ELK `layered`, direction DOWN (fills a landscape stage better than RIGHT, which came out ~4:1 on a 20-part map), orthogonal routing, `hierarchyHandling: INCLUDE_CHILDREN`. ELK returns child boxes relative to their group and edges relative to `edge.container`. The renderer adds the offsets. Do not rely on `elk.json.shapeCoords`; it had no effect with elkjs 0.9.3 in testing.
- Box widths come from canvas `measureText`, not estimates.
- The page fills the viewport. The map fits the stage on load; wheel/pinch zooms around the cursor, drag pans, +/−/Fit buttons and a hover Legend chip sit top right. Zoom and pan rewrite the `viewBox`; a click after a drag is ignored.
- Marching dashes are CSS `stroke-dashoffset` animation; a negative offset moves dashes along the path direction, so edge direction is drawing direction. Speed by kind: sync fast, data medium, async slow.
- Expand/collapse animates (`morph()`): each box glides from its previous box, or from its group's box when it is newly revealed, the `viewBox` tweens to the new fit, and edges fade in after ~60% of the move. ELK re-routes every edge, so edges are faded, never morphed. Zoom, pan or Fit cancels the tween. Reduced motion skips it.
- Flow tokens: one circle per hop on `offset-path`, Web Animations keyframes stagger them so each starts when the last lands.
- `prefers-reduced-motion` stops the dashes and hides tokens. The lit path still shows.
- One CDN dependency: `elkjs@0.9.3` from unpkg, pinned with an SRI `integrity` hash; changing the version means recomputing it (`openssl dgst -sha384 -binary elk.bundled.js | openssl base64 -A`). Model text goes through `esc()` before any `innerHTML`. Offline needed → inline `elk.bundled.js`.
