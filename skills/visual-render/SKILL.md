---
name: visual-render
description: Render a real system — an API gateway, a service mesh, a pipeline, a cluster, read from its actual config or code — as a crafted, animated isometric figure built on the Anatomy kit, without forcing a physical-machine metaphor. Every module, connection and number in the drawing maps to something found in the source. Use when the user says /visual-render, "render this system", "draw my gateway/cluster/pipeline", "isometric figure of our setup", or wants Anatomy-quality drawings of real infrastructure or abstract systems.
---

# visual-render

A thin layer over [Anatomy](https://github.com/wheresryan22/anatomy) (MIT, by Ryan). Anatomy brings the engine: the isometric kit, painter's order, four-tone shading, the card, motion, `capture.mjs` and `lines.mjs`, and the craft rules. This skill changes two things:

1. **Real input first.** The figure is drawn from a real config or codebase, and shows only what that source contains.
2. **No forced machine.** Anatomy requires inventing a physical object whose working is the concept. Here that is optional: you can render the system's own structure as crafted isometric modules instead.

Everything else follows Anatomy's `SKILL.md` and `references/`. Read them before the first build. Where the two disagree, this file wins.

## Engine

Find the Anatomy folder: `$ANATOMY_DIR`, else `~/.claude/skills/anatomy`. If it is missing, install it:

```bash
git clone https://github.com/wheresryan22/anatomy ~/.claude/skills/anatomy
```

Needs Node ≥ 20.10, plus Chrome for the checks. Import the kit by absolute path from the build script: `<anatomy>/kit/iso-kit.mjs` and `<anatomy>/scripts/inline-kit.mjs`. Start from `<anatomy>/examples/dial-indicator/build.mjs`, the smallest complete template.

## 1. Read the real source

- **Find it, don't assume it.** The obvious path can be empty. Docker leaves an empty directory where a bind-mounted file never existed, and a repo can have no config file at all. Search before you settle: declarative configs (`_format_version`, `kind:`, `image:` lines), provisioning scripts (curl calls to an admin API, Terraform, Pulumi), compose and k8s manifests. Read the folder's README and setup scripts: they often hold the real configuration.
- **If there are several candidates, ask which one is the user's**, and say what each one contains.
- **Write an inventory before any geometry.** List every entity that will appear (routes, services, plugins, consumers, queues, nodes, upstreams), each with `file:line`, and its real attributes (paths, ports, flags, counts). The figure draws this list and nothing else.
- **Name what you leave out.** Generated or out-of-repo parts (specs on another machine, global plugins whose behaviour you could not confirm) go in the caption as "not drawn", never as guesses.
- **Facts at the deployed version.** Read the version from the source (an image tag, a lockfile). When you fetch vendor source for behaviour (plugin order, error strings, defaults), fetch that version's tag, not the main branch. Every number and message in the readout and caption needs a source fetched in this session.

## 2. Choose the form

| The source is… | Form |
|---|---|
| a process with a mechanism a real object maps onto one-to-one: a request passing gates, a queue draining, a cache hit | **Machine**: Anatomy's way (a sorting line, a lock, a plotter). Good when every station is a real entity. |
| a structure: services and their links, a cluster, a data pipeline, a topology | **Modules**: the system's own parts as crafted isometric hardware |

Mixed is fine: modules for the topology, with one small mechanism where the interesting behaviour happens.

## 3. Modules form: abstract, not bland

Anatomy warns that stacked plates and labelled boxes don't read as anything. Modules avoid that by being made like real equipment. Only the metaphor is dropped, not the craft.

- **One module per inventory entity**, built like an instrument: a slab body with a bevel and a groove inset, screws at the corners, a recessed face, ports where its real connections leave. A module's size or detail encodes a real attribute (replica count as stacked cartridges, ports as sockets), never decoration.
- **Connections are real conduits**: rails, channels or cables (`wireSvg`, or slabs for rails) between the exact ports that the inventory links. Direction is shown by motion, not arrowheads: tokens (pucks, beads) travel the path a real request or message takes.
- **Grouping** by namespace, network or cluster is a base plate under its modules, with its own feet and groove. Nest plates for nested scopes.
- **Engraved labels are allowed**, which deliberately relaxes Anatomy's one-label rule, because abstract modules don't identify themselves. Use at most one short engraved label per module, set on its label plate with `faceTextSvg`, and only the entity's real name from the inventory. Explanation stays in the caption.
- **Exactly one lit part**: the token in flight, or the module the readout is talking about.
- **Outcomes are places.** A rejection, error or dead letter lands somewhere visible (a tray, a side track), labelled through the readout with the real status code and message.

## 4. Live behaviour

- The readout follows the token: the real request, the route matched, the entity acting on it, the real outcome string.
- Script one scenario per meaningful path through the inventory (the success path plus each rejection that really exists), and cycle them in the idle tour. Click, Enter or keys 1–n send a chosen one. Under reduced motion each scenario jumps straight to its end state.
- Every path's timing comes from one keyframe list per scenario (`to(dt, change)` steps). The page is a pure function of the scenario and its time.

## 5. Size and verify

- Default to **Figure** size (40–80 parts), light theme, a standalone HTML page written by one `build.mjs`. Grow to Hero only when the inventory demands it, and say so first.
- Verify lean unless asked for more:
  - one desktop capture
  - one 4× close-up of the busiest junction, in a moment of motion
  - one capture of each rejection path mid-move (`capture.mjs --key <n> --times ...`)
  - `lines.mjs` must print `line ends: 0`
- Check the camera early. A long line of stations at azimuth 45–60 runs diagonally and shrinks the figure, and a part that faces ±x almost disappears at high azimuth. Move the camera or turn the part so it faces the viewer.
- All text in the figure and the page follows the **Prose** rules of `visual-explain`, including ASD-STE100.
- Save as `.visuals/<name>/` (`build.mjs`, `<name>-render.html`, `sources/` with the config or code you read, `SOURCES.md`) at the project root, kept out of git through `.git/info/exclude`, as in `visual-explain`. If the user wants a standalone repo instead, create one with a thin `CLAUDE.md`.
- Hand over: the path, the inventory with its sources, what was not drawn and why, and the checks you ran or skipped.
