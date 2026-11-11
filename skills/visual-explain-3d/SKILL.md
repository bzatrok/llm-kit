---
name: visual-explain-3d
description: Build a single-file 3D explainer whose animation the reader scrubs back and forth by scrolling — one continuous timeline, not snapped steps — with shader effects, light, particles and camera moves, for concepts that are not a physical machine (optics, relativity, fields, orbits, waves, time). Use when the user says /visual-explain-3d, "scrubbable 3D", "scroll-scrubbed animation", "3D explainer with effects", or wants /visual-explain's scrollytelling with continuous 3D motion.
---

# visual-explain-3d

Produce ONE self-contained HTML file: a sticky WebGL stage beside 5–8 prose steps. Scroll position is the clock. Every frame is a pure function of `t ∈ [0, 1]`, so scrolling back plays the animation exactly in reverse. `template.html` is a complete worked example (why the twilight sky turns purple); copy it and replace the model, the timeline and the scene.

This skill extends `visual-explain`. Its rules still apply here and are not repeated: **Scope first: three questions**, **Hand-trace before you draw**, the step list and predict step (**Procedure**, steps 1–3 and 5), **Prose**, and the `.visuals/` save location. Read that SKILL.md first. This file covers only what changes when the graphic is a continuous 3D timeline.

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
3. **Scene.** Built once. `render(t)` only sets uniforms, transforms and opacities, and rebuilds cheap geometry (lines, particle colours) when the driving quantity changes.
4. **Clock.** `scrollT()` reads the scroll position of `#scrolly`. The shown `t` follows it with a short frame-rate-independent ease (`1-(1-k)^(dt*60)`, k ≈ 0.16), and rendering stops when it arrives. Under `prefers-reduced-motion` the shown `t` equals the scroll `t`. Nothing ever autoplays.

## Steps are windows on t

- With N equal-height `.step` blocks, step i owns `[i/N, (i+1)/N)`, and the active card is `floor(t·N)`. Place each key in `TL` inside the window of the step whose prose describes it.
- Hold the driving quantity still across part of the window (two keys with the same value) wherever the prose needs the reader to look, not just scroll past.
- The last step is a consequence (a what-if, a variation), not a summary. The template scrubs back to the purple window and triples the particles.

## Effects without a machine

- **The picture is the model.** Every colour, glow or particle is computed from the model, not painted on. Light colour is `exp(-τ)` along a path, a shadow is a geometric test, and stars fade in with the driving quantity. If an effect has no quantity behind it, cut it.
- **Cross-sections beat solids.** A slice through the phenomenon (a `RingGeometry` or plane with a `ShaderMaterial` that evaluates the model per fragment) shows the interior that a solid would hide. Put solid bodies behind the slice (half-sphere plus cut face) so they never cover it.
- **Exaggerate one axis and say so.** When the real proportions are invisible (atmosphere on a planet, a light cone at walking speed), scale one axis. Then draw straight lines through the same mapping, so they bend consistently with the shader, and state the factor in the page.
- **A second view of the same model.** An inset (a 2D canvas strip, a graph) shows what an observer would see or measure, computed from the same functions. The template's sky strip integrates the scattered light along sightlines.
- **Lines and particles**: `THREE.Line` with per-vertex colour and `AdditiveBlending` for beams; `THREE.Points` with additive blending for particles. Recolour them in `render` when the driving quantity changes. No bloom pass is needed when additive lines and emissive colours carry the glow.
- **Tone mapping in the inset**: scale by the brightest channel (`(1-e^-m)/m`) so bright regions keep their hue instead of clipping to white.
- **Emphasis tracks** (0–1 in `TL`) fade one element in for the step that talks about it: the ozone band, the sightlines. One emphasis per step, and it replaces labels.

## Controls

- Scroll is the only clock. The rail at the left of the stage scrubs by calling `scrollTo`, so scroll stays the one source of truth. It takes arrow keys and PageUp/PageDown.
- HUD under the stage: the driving quantity, the main derived value and the phase name, with real units.
- `?t=0.4` freezes the timeline and hides the header, so screenshots show the stage at that moment.

## Performance and degradation

- Render only when the shown `t` changes, never in an idle loop. `devicePixelRatio` capped at 2. `ResizeObserver` on the canvas.
- Mobile (≤ 820 px): stage stacked above the text at 62vh, steps 90vh.
- Import map pins `three` and `three/addons/` to the same version on unpkg. A wrong map gives a silent black canvas.

## Verify

1. `bash shots.sh <file> 0 0.2 0.38 0.5 0.66 0.84 0.95` from this skill's folder. It prints the path of each PNG, written to a fresh private temp folder with headless Chrome (SwiftShader WebGL). Read every PNG. Pick moments in the middle of each step window and at the edges where something switches on.
2. For each shot, check that the picture matches the prose of that step, that the HUD numbers match the model, and that no solid hides the slice and no line runs past the edge of the slice.
3. Check the inset against the source's own words at each step. A model tuned until it "looks right" can still show the wrong thing: the template's first draft showed a yellow zenith at sunset because ozone was missing. That is exactly the error the source describes, which is how it was caught.
4. Open the page and scrub end to end in both directions, fast and slow. Nothing may pop or depend on the scroll direction.
5. Fresh-eyes pass and handover as in `visual-explain` (Verify, steps 3–4).
