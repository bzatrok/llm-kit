---
name: visual-explain
description: Build a single-file scrollytelling explainer (sticky graphic left, prose steps right) for a technical concept, protocol, flow, mechanism or architecture. 2D SVG for abstract flows, Three.js for spatial mechanisms. Use when the user says /visual-explain, "visualize this", "make an explainer", "scrollytelling", or wants to learn a concept visually.
---

# visual-explain

Produce ONE self-contained HTML file: a sticky graphic that changes state as the reader scrolls through 5–8 short prose steps. Pattern from data journalism (The Pudding) and NYT 3D stories. Scrollama fires "step entered", the graphic renders that step. Nothing else.

## Scope first: three questions

Ask only what the prompt does not already answer.

1. Who reads it, and what do they already know (newcomer / practitioner)? Depth follows from this.
2. Which ONE question does the graphic answer ("how does one cylinder turn fuel into rotation?")? Broad topic → pick the core mechanism, say what you left out.
3. Grounding: does the user have source material (spec, doc, code, URL)? Facts come from that, or from 2–3 fetched primary sources. Never from memory alone for protocols, APIs, config keys, error strings.

## Hand-trace before you draw

Walk one concrete example through the mechanism: real hostnames, real values, the real error string. Every state the graphic shows is a state you traced. Bake the traced values in as data. Compute live only when the concept IS a transformation, and check the live result against the trace. A wrong but polished visual is more dangerous than wrong prose. Mark what you are not sure of as an assumption, in the page and in the handover.

## Pick the shape

| Concept is… | Shape inside the scrolly |
|---|---|
| process, protocol, flow, state machine | linear steps (default) |
| comparison, before/after | one svg, two panels on shared coordinates, only the difference differs |
| cycle, feedback loop | a token loops the path; each step zooms in on one leg |
| trade-off, parameter | one slider in the sticky figure drives a pure `model(x)`; steps set presets |
| failure branches | small multiples in one step, or a separate stepper file. Scrolly is linear. |
| data format: certificate, JWT, packet, file header | anatomy: the sticky graphic is the artifact itself, drawn once with every field; each step highlights one region (issuer, subject, key, extensions, signature) and the prose reads it |

| Concept is… | Renderer | Template |
|---|---|---|
| abstract: protocol, auth chain, data flow, state machine, architecture | inline SVG + CSS | `template.html` |
| spatial: mechanism, physical layout, anything with an interior worth a camera move | Three.js | `template-3d.html` |

3D only when the camera adds information (interior, depth, angle of a part). A box-and-arrow diagram in 3D is a gimmick. Skip CSS 3D transforms on flat SVG for the same reason.

## Procedure, both renderers

1. **Scope and trace** (above).
2. **List 5–8 steps.** Step 0 = starting state, last step = consequence, not summary. Something visibly changes at every step, or merge the step. Name the mental model once, in step 0 or 1, and reuse it as the throughline. Never put it in the `<h1>`; the title names the topic plainly.
3. **One predict step, minimum.** A step's prose ends with a question ("where does the client look for the root?"). The next step's graphic answers it. The reader commits before the reveal.
4. **Build the graphic once** with every element present. State is a single step number; the graphic is a pure function of it.
5. **Write the prose.** One `<div class="step" data-step="N">` per step, bold lead-in, 2–3 sentences. Depth in layers: the step text is plain language, a `<details>` under the step holds the deeper detail, the raw source (RFC section, file:line, command output) is one click away. The `<details>` glossary at the top stays.
6. **Scrollama stays as in the template.** No GSAP, no timeline library. Only unpkg CDN deps. Offline needed → inline the scripts. When the page links an external stylesheet (a teach lesson does), the graphic-state CSS still stays inline as the page's first `<style>` block: `check.sh` reads that block.
7. **Verify** (section below). Mandatory for 3D: a wrong import map gives a silent black canvas.
8. Save as `<topic>-explain.html` in the cwd. Report path, the one-line question, and the assumptions.

## Prose

- Present tense, active voice, one idea per sentence, under 20 words. Lead with the fact.
- Pre-empt common misreadings ("the root is not sent; if it were, the client would ignore it").
- Every arrow in the graphic has a verb, in its label or in the step text: signs, sends, looks up, rejects.
- Remove these tells: "not just X, it's Y", "at its core", "here's the thing", a rhetorical question as a transition, metaphor nouns (spine, throughline), em-dash chains, a closing aphorism.

## Animated figure rules (2D)

Port of the nicobailon/visual-explainer kit. The mechanics are in `template.html`; the TLS example uses each one once.

- **Token along a route**: `<circle class="tok oN" r="5" style="offset-path:path('M…');--dur:1.2s;--d:0s"/>`. Runs once when step N enters. A burst is several tokens with `--d` 150ms apart; the count ratio matches the real traffic split. Tokens run under the nodes, so place them before the boxes in the svg.
- **Path draws itself**: `class="draw sN"` plus `pathLength="1"` on the `<path>`. Use it for the edge that IS the step's claim (signed by, looks up).
- **Focus edge**: `class="hot"` on the one edge the step is about, via `.atN .hot`-style selectors or `oN`. Glow, thicker stroke. One per step.
- **Parts that come and go**: `oN oM` lists the steps they exist. **Changing value**: stacked `oN` texts at one spot, one per step.
- Solid = sync / check done, dashed = async / in flight / not yet present, red ✕ = blocked.
- One moving layer per step. Nothing autoplays that the step does not call for.
- Reduced motion: the template hides tokens and snaps transitions. Keep that rule when you copy CSS out.
- **Tooltips**: `data-tip="…"` on any svg part or a `<dfn data-tip tabindex="0">` in the prose. Hover, tap or focus shows the callout; the template's `#tip` code does the rest. Every term the glossary `<details>` defines gets one at its first use in the prose, and every box in the graphic gets one. One or two sentences, no new term inside a tip. `show()` turns pointer events off on hidden parts, so a tip never comes from something the reader cannot see.

## 2D rules (template.html)

- State lives in `data-step` on the `<svg>`. CSS cumulative attribute selectors (`svg[data-step="3"] .s2`) so earlier elements stay. Transitions on opacity, fill, stroke, stroke-dasharray, and `transform` on `<g>` for moving parts (translate/rotate, set `transform-origin`).
- viewBox around 600×600 portrait, fits beside the text column (`max-height:96vh` on the svg).
- **Measure, don't estimate text width.** Chrome's monospace fallback renders ~0.85 × font-size per char (a 22-char mono label at 11px is ~200px, not 145; 64 mono chars at 10px fill a 560px bar); sans ~0.55. Before handing over, screenshot headless and look at it: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --window-size=1100,1500 --screenshot=/tmp/shot.png --virtual-time-budget=1500 file://<abs path>` then Read the PNG. Check every state, not just step 0: write the `<style>` + `<svg>` alone into a bare page per step with `data-step="N"` set, screenshot each (700×620 window), look for text crossing a box edge, an arrow, or another label. Clipped text = widen the viewBox (680+ is fine, it scales), never shrink fonts below 10px or squeeze labels into gaps. Keep ≥ 12px padding inside boxes, two-line boxes ≥ 36px tall, mono `issuer:` stacks ~260px wide, a config box with mono keys ~240px.
- A CSS class on svg text (`.mono{font-size:12px}`) beats the `font-size="…"` attribute. Inside the svg use `font-family="ui-monospace,monospace"` attributes, not the class, so per-text sizes work.
- Colour meaning, max four: green = ok/verified, red = failed, blue = in flight/active, grey dashed = not yet present.
- Arrows `marker-end="url(#m)"`; dashed = message in flight, solid = check performed.
- Labels ≤ 6 words. Explanation lives in the prose column.
- Real artifacts beat decoration: the actual error string, header, command output the reader will meet.
- Failure-branch toggles (checkboxes) go in a separate stepper file. Scrolly is linear.

## 3D rules (template-3d.html)

- **Derive everything from one driving variable** (crank angle, time, progress). A step sets a target for that variable plus a camera pose. Positions, swings, colours, flashes are functions of it. Never animate parts per step by hand.
- **A pose is a few numbers**: driving-variable target, camera azimuth, elevation, highlighted parts. Ease toward it every frame, frame-rate independent: `a + (b-a)*(1-(1-k)^(dt*60))`, k 0.05–0.1. Native scroll stays the source of truth; never trap the wheel.
- **Camera moves tell the story.** Orbit a little per step so the model never feels static; tilt to look into an interior exactly when the prose talks about it. Keep `lookAt` on one point.
- **Highlight the part the step is about** with `OutlinePass.selectedObjects`. One part per step. This replaces labels in 3D.
- **Lighting**: `RoomEnvironment` through `PMREMGenerator` as `scene.environment`, `NeutralToneMapping`, one directional light. No HDR download. Metal: `MeshStandardMaterial` metalness .8. Transparent housings: `MeshPhysicalMaterial` transmission 1, roughness .05, ior 1.5. Transmission only on the one or two objects that need it, it is expensive and transmissive objects do not refract each other.
- **Primitives first.** Cylinder, box, torus, group. Download a glTF only when shape fidelity is the point, and check the licence (Sketchfab CC0 filter, Blend Swap). Free CC0 engine models are rare; paid cutaways exist.
- **Bloom only for light sources**, via the selective layers technique, threshold high enough that lit metal does not glow. Prefer emissive + PointLight flash without bloom.
- **Degrade**: `prefers-reduced-motion` → snap to poses. Render loop sleeps when the section is off screen (IntersectionObserver). `devicePixelRatio` capped at 2. Mobile: stack graphic above text.
- **HUD** line under the canvas with the driving variable's value. Cheap debugging and a teaching aid.
- Import map pins `three` and `three/addons/` to the same version from unpkg.

## Verify

1. `open <file>` and scroll end to end, both directions.
2. 2D: `bash check.sh <file>` from this skill's folder, then Read every `step-N.png`. The report finds collisions and clipping, not errors of meaning.
3. **Fresh eyes.** A subagent that did not write the page reads the HTML and the PNGs and answers: does step 0 show the full starting state, does every step visibly change something, is every claim traceable to the source or marked as an assumption, does the predict step land before its reveal, any slop (emoji as icons, decorative gradients, a palette with no colour taken from the subject). It ranks findings blocker / should-fix / optional. Fix the blockers, re-run `check.sh` on the edited steps. Only blockers fail the build.
4. Hand over: path, the one-line question, assumptions, what the fresh-eyes pass did not check.

See `RESOURCES.md` for references and worked examples to steal from.
