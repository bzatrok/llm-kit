---
name: explain
description: Visualize anything as a single HTML file without choosing the format yourself. Picks the right visual-* skill (visual-explain, visual-explain-3d, visual-map, visual-render) from what the subject is, offers two options when two fit, and obeys an explicit format request. Use when the user says /explain, "explain this visually", "visualize this", "show me how X works", "draw this", "make a diagram/explainer/map of X", or names any concept, flow, system or codebase they want to see rather than read about.
---

# explain

A router. It decides which of the four `visual-*` skills fits the subject, then invokes that skill with the Skill tool and passes the user's request through unchanged. It builds nothing itself.

## 1. Explicit request wins

If the user names a format, use it and skip the rest: "scrollytelling", "steps" → `visual-explain`; "3D", "scrubbable", "effects", "camera" → `visual-explain-3d`; "map", "architecture diagram", "stack", "data flow" → `visual-map`; "render", "isometric", "draw my <system>", "Anatomy" → `visual-render`. Saying `/visual-<x>` is also explicit.

## 2. Otherwise classify the subject

Ask two questions about the subject, in order.

**Is it a real system with source at hand (config, code, infra files in the repo or pasted)?**

| Reader wants | Skill |
|---|---|
| to see how the parts connect and which way data moves, or the system is large (10+ parts) | `visual-map` |
| a crafted figure of this one setup, every module traceable to a line in the source | `visual-render` |

**Otherwise it is a concept, protocol, mechanism or flow to learn step by step.**

| Subject | Skill |
|---|---|
| abstract flow, protocol, algorithm, handshake, state machine, anything that reads as boxes and arrows | `visual-explain` (2D SVG) |
| physical machine or spatial mechanism with discrete steps | `visual-explain` (Three.js mode) |
| continuous phenomenon that is not a machine: optics, fields, waves, orbits, relativity, time, anything that needs light, particles or a moving camera | `visual-explain-3d` |

Signals that tip toward `visual-explain-3d` over `visual-explain`: the explanation only works if the reader sees motion between the steps, or the subject has no natural rest state.

## 3. One fit → go. Two fits → offer

- One clear fit: say in one line which skill and why, then invoke it. Do not ask.
- Two fit about equally (common pairs: `visual-map` vs `visual-render` for a real system, `visual-explain` vs `visual-explain-3d` for a mechanism): ask with AskUserQuestion, two options, the recommended one first, one sentence each on what the reader gets. Then invoke the pick.
- Nothing fits (the subject is data, not a mechanism or system): say so and suggest `dataviz` or a plain written answer instead.

## 4. Hand off

Invoke the chosen skill via the Skill tool with the user's original request as `args`. From there the chosen skill owns the work: its file layout, review steps and screenshots apply, not anything here. Whichever skill builds the page, its text follows the **Prose** rules of `visual-explain`, including ASD-STE100.
