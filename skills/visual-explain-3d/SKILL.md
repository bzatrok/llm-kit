---
name: visual-explain-3d
description: Build a single-file 3D explainer on one continuous timeline, with shader effects, light, particles and camera moves, for concepts that are not a physical machine (optics, relativity, fields, orbits, waves, time). The reader steps through it with Next/Back and a scrubber in a player that fits one screen, readable first; scroll-driven scrollytelling is an option. Use when the user says /visual-explain-3d, "scrubbable 3D", "3D explainer with effects", "scroll-scrubbed animation", or wants /visual-explain with continuous 3D motion.
---

# visual-explain-3d

Produce ONE self-contained HTML file: a WebGL stage beside a caption panel that shows one of 5–8 steps, with Back/Next buttons and a scrubber. Every frame is a pure function of `t ∈ [0, 1]`, so Back and the scrubber are exact. The clock is decoupled from the page: buttons, keys and the scrubber set `t`, and scroll position plays no part unless the user asks for scrollytelling. `template.html` is a complete worked example (why the twilight sky turns purple); copy it and replace the model, the timeline and the scene.

**Readability comes first.** When a rule below trades against an effect, the camera or density, the reader's ability to read the words and see the subject wins.

This skill extends `visual-explain`. Its rules still apply here and are not repeated: **Scope first: three questions**, **Hand-trace before you draw**, the step list and predict step (**Procedure**, steps 1–3 and 5), **Prose**, the `.visuals/<name>/` folder (Procedure, step 8) and `maps.md` for real geography. Read that SKILL.md first. This file covers only what changes when the graphic is a continuous 3D timeline.

## When to use which

| The concept… | Use |
|---|---|
| is a flow, protocol or state machine | `visual-explain`, 2D |
| is a mechanism with parts, with discrete beats | `visual-explain`, 3D template |
| changes continuously with one quantity: an angle, a speed, time, a distance | **this skill** |
| is a real machine whose working is the idea | `anatomy` |

If scrubbing back and forth teaches nothing (the in-between frames are meaningless), use `visual-explain` instead.

## The four parts of every page

1. **Model.** Pure functions of the driving quantity, written once and shared by the shaders and the JS: `illum(h, d)`, `shadowH(d)` in the template. Numbers come from fetched sources. Where you choose a value to make the picture work (a layer height, a scattering weight), name it as an assumption in a code comment and in the page's assumptions `<details>`.
2. **Timeline.** `TL` maps `t` to every animated value as `[t, value]` keys eased with smoothstep: the driving quantity, effect strengths (0–1 emphasis tracks), and the camera (azimuth, elevation, distance, target). `at(keys, t)` reads it. Never animate by hand per step, and never accumulate state between frames.
3. **Scene.** Built once. `render(t)` only sets uniforms, transforms and opacities, and rebuilds cheap geometry (lines, dash offsets) when the driving quantity changes. Anything keyed on `t` alone (a visibility window, an emphasis, a label) is set on every call, outside any dirty check keyed on the driving quantity. A cache that skips a frame while the driving quantity holds still also skips the switch, and a `?t=` screenshot never shows it because it renders once.
4. **Clock.** A step player (template section 6). `play(i)` runs `t` from `i/N` to the step's reading frame `(i + 0.98)/N` at a constant rate (`PLAY_S` ≈ 3 s per step); the timeline's smoothstep keys do the easing. The scrubber sets `t` directly. Rendering stops when `t` arrives. Under `prefers-reduced-motion` `play` jumps to the reading frame. Nothing autoplays: the page opens on step 1's reading frame.

## Steps are windows on t

- With N steps, step i owns `[i/N, (i+1)/N)`, and the caption shows step `floor(t·N)`. Place each key in `TL` inside the window of the step whose prose describes it.
- Finish every motion in the first ~70% of its window and hold the rest. The end of the window is the reading frame: the picture the reader studies while reading the caption, and the frame Back, Next and the screenshots land on.
- The last step is a consequence (a what-if, a variation), not a summary. The template scrubs back to the purple window and triples the particles.

## Effects without a machine

- **The picture is the model.** Every colour, glow or particle is computed from the model, not painted on. Light colour is `exp(-τ)` along a path, a shadow is a geometric test, and stars fade in with the driving quantity. If an effect has no quantity behind it, cut it.
- **Cross-sections beat solids.** A slice through the phenomenon (a `RingGeometry` or plane with a `ShaderMaterial` that evaluates the model per fragment) shows the interior that a solid would hide. Put solid bodies behind the slice (half-sphere plus cut face) so they never cover it.
- **Exaggerate one axis and say so.** When the real proportions are invisible (atmosphere on a planet, a light cone at walking speed), scale one axis. Then draw straight lines through the same mapping, so they bend consistently with the shader, and state the factor in the page.
- **A second view of the same model.** An inset (a 2D canvas strip, a graph) shows what an observer would see or measure, computed from the same functions. The template's sky strip integrates the scattered light along sightlines.
- **Flow along a path is a dashed line.** A `ShaderMaterial` with a per-vertex distance attribute and an offset uniform. The offset is a value from the model (cumulative energy, a count), so the sign gives the direction and scrubbing back reverses it. Dash length and brightness follow the magnitude. Dots (`THREE.Points`) are for discrete things only: stars, photons, people.
- **Beams**: `THREE.Line` with per-vertex colour and `AdditiveBlending`. Recolour them in `render` when the driving quantity changes. No bloom pass is needed when additive lines and emissive colours carry the glow.
- **Tone mapping in the inset**: scale by the brightest channel (`(1-e^-m)/m`) so bright regions keep their hue instead of clipping to white.
- **Emphasis tracks** (0–1 in `TL`) fade one element in for the step that talks about it: the ozone band, the sightlines. One emphasis per step, and it replaces labels.

## Readability

- **No vertical scroll, at any size.** At a window 1000 px wide or more, the header, stage, inset, caption and controls fit the viewport. The caption column is 360 px and scrolls internally when its text is long. The stage column flexes: the canvas keeps 16:9 and is capped by the height left over, the inset is 180 px (130 px below 800 px of height). Below 1000 px the stage stacks above the caption and the page may scroll. After layout the page writes `document.documentElement.dataset.overflow = scrollHeight - innerHeight`. `shots.sh` reads it at 1280 × 720, 1440 × 900 and 1920 × 1080 and prints `SCROLLS`, which fails the build. Lay the scene out to use the wide stage, side by side rather than stacked tall.
- **Legend as a tab.** A `Legend` chip at the bottom right of the stage, closed by default. Hover, click or tap opens it. It lists only the symbols of the current step. The HUD is a thin one-line overlay at the bottom left of the stage.
- **Only the active step is shown.** No dimmed neighbours. Its lead-in is an `<h2>`, then 2–3 short sentences. Deeper detail goes in `<details>`.
- **Type.** Prose 18 px, line height 1.6, line length ≤ 62 characters in the caption. HUD, legend and details ≥ 14 px. Text in light grey (`#eceaf4` / `#b3b0c4`) on near-black; never darker than `#b3b0c4` for words the reader must read.
- **Words in the scene are labels on canvas textures facing the camera**, ≤ 3 lines, ≤ 24 characters a line, the first line bold. At every reading frame the smallest label line must be at least 13 CSS px tall in a 1440-wide window; if it isn't, move the camera in or enlarge the label, never shrink the font.
- **Frame the subject.** At each reading frame, the parts the caption talks about fill at least 60% of the stage. Push parts the step does not need out of frame or fade them.
- **One continuous shot.** Key one camera pose per subject, not per step. Consecutive steps on the same subject share the pose, and labels do the pointing. When the subject changes, move the target first and change the distance only as much as the new subject needs. Never pass through a wide view to reach a close one. Key a move as `[s(i), previous pose], [s(i) + 0.3 W, this pose]`: a key that leads into the next step's pose makes the reading frame drift and clips it. When two consecutive subjects share nothing, one short fade through black beats a long swing.
- **The outcome in words, on the stage.** When a step has a result (a value, a status, an error string), show it in a large overlay line in the stage, computed from the same state as the picture.

## Controls

- Back, Next and ↻ (replay this step) above the caption; the step counter between them; a full-width range input as the scrubber. Keys: → / Space / PageDown next, ← / PageUp back, Home/End. Buttons, inputs and `<summary>` keep their own keys.
- HUD overlay at the bottom left of the stage: the driving quantity, the main derived value and the phase name, with real units.
- `?t=0.4` freezes the timeline and hides the header, so screenshots show the stage at that moment. `?walk=3` renders the reading frame of every step up to step 4 in order, then freezes there: the frame Next lands on, with every cache exercised.

### Optional: scroll as the clock

Only when the user asks for scrollytelling. Put the steps in tall blocks beside a sticky stage and replace `play` with `goal = scrollT()` on scroll, where `scrollT = clamp(-r.top / (r.height - innerHeight), 0, 1)` for the scrolly section's rect `r`. Let the shown `t` follow with `1-(1-k)^(dt*60)`, k ≈ 0.16. The readability rules still hold: the active step's text at full contrast, the stage framed per step.

## Performance and degradation

- Render only when the shown `t` changes, never in an idle loop. `devicePixelRatio` capped at 2. `ResizeObserver` on the canvas.
- Narrow (≤ 1000 px): stage above the caption panel, full width.
- Import map pins `three` and `three/addons/` to the same version on unpkg. A wrong map gives a silent black canvas.

## Verify

1. `bash shots.sh <file> --walk` from this skill's folder shoots every step's reading frame the way Next reaches it (`?walk=i`), then `bash shots.sh <file> <t ...>` for a few moments mid-motion and at the edges where something switches on. Both print the path of each PNG, written to a fresh private temp folder with headless Chrome (SwiftShader WebGL), and the overflow at three window sizes. `SCROLLS` fails the build. Read every PNG.
2. For each shot, read every label and the caption at 1×; anything you squint at fails the readability rules. Check that the picture matches the prose of that step, that the HUD numbers match the model, and that no solid hides the slice and no line runs past the edge of the slice.
3. Check the inset against the source's own words at each step. A model tuned until it "looks right" can still show the wrong thing: the template's first draft showed a yellow zenith at sunset because ozone was missing. That is exactly the error the source describes, which is how it was caught.
4. Open the page, step through with Next and Back, and drag the scrubber end to end in both directions, fast and slow. Nothing may pop or depend on the direction. The camera moves only when the caption changes subject.
5. Extract the visible text (`<h1>`, `<h2>`, `<p>`, `<summary>`, `<details>`, labels, HUD strings) and run `ste-lint.py` from the `asd-ste100` skill. Hard violations fail the build.
6. Fresh-eyes pass and handover as in `visual-explain` (Verify, steps 3–4).
