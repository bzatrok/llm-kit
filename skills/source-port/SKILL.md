---
name: source-port
description: Use when the user wants a native program they own rebuilt as compiling source from its shipped binary (a game to another platform, an unmaintained tool kept alive), when they ask how long such a port takes or how to split it across agents, or when a session finds itself decompiling more than a handful of functions. Triggers: "port this binary", "decompile the game", "rebuild from the ELF", "source port", "run it on the iPad", "like OpenTDU / Open-IG / re3". Not for understanding one function or one feature of someone else's app (use rea for that). For programs with source available (an OpenJK-style engine), skip to phase 3b.
---

# Porting binaries to source

Rebuild a shipped native program as source that compiles, tests and runs on a new platform, with a
fleet of agents working one board. The binary is the spec. Each rebuilt function keeps its original
address in a comment, unfinished functions are explicit stubs, and the app links at every stage.

Source: one game port, 2026-10-08 to 2026-10-13. 4.35 MB of own code (about 6,000 functions, 685
original source files) rebuilt as 184k lines of C++17 in six days, 2,943 commits, Opus leads with
Sonnet, Haiku and OpenCode workers. Rates and rules below are measured there unless marked.

## Go / no-go, before anything else

| Check | Go | No-go |
|---|---|---|
| Symbols | ELF symtab present, functions named | Stripped: every name is guesswork, cost is 3-5x (estimate) |
| Optimisation | -O0 / -O1: decompile reads like source | -O2 with inlining and LTO: units blur, rate collapses |
| Ownership | The user owns a copy, personal use, nothing published | Anything that leaves the machine (see Legal) |
| Oracle | The original runs somewhere the user can play it | No way to observe shipped behaviour |
| Libraries | Bundled libs have public upstreams | Proprietary middleware with no source |

Clang `-O0` x86-64 with symbols is the best case. Read the toolchain from `.comment` and version
strings before estimating. Own code is what is left after removing bundled libraries (by symbol
prefix) and `std::` template instantiations (weak symbols): for an 8 MB binary that was
4.35 MB, so plan on roughly half of `.text` until the unit map says otherwise.

## Legal boundary (hard rules, from the 2026-10-14 review)

- The rebuilt source is a translation of the program and stays a derivative work however much it
  is paraphrased. Dutch Auteurswet 45m allows decompilation only for interoperability; a port is
  not that. Keep the repo private, forever. No public host, no "requires original game" release.
- No game files in git. Assets are read from the user's own install at runtime.
- Nothing from the binary goes into any published artifact, this skill included: no snippet,
  offset, struct layout, symbol name or format note.
- A new game inspired by the port ships with none of the ported code, engine layer included, and
  under its own name. The port is a design document and testbed, which 45l permits.
- Jurisdiction assumed: the Netherlands. Another user re-checks their own law.

## Phases, in order

### 0. Feasibility, lead only, half a day
1. Copy the binary out of the install. Never write into the install.
2. Ghidra headless import with full analysis (about 5 min for 8 MB). Keep the project out of git.
3. `objdump -d` the whole binary once to a text file: workers grep it by address instead of
   running Ghidra. Only the lead ever runs Ghidra.
4. Split own code from bundled libraries by symbol prefix and version strings. Libraries are
   never decompiled: pin the upstream release the binary bundles (or the nearest with the same
   API) with a FetchContent hash and one smoke test each.
5. Solve the asset containers first and write a decoder that round-trips every file in the
   install. 100% round-trip is the first correctness gate and gives tests real data.
6. Pick the language the original was written in. Rust, Python and JavaScript are rewrites, not
   ports, and lose the one-function-one-address mapping that makes the work splittable.

### 1. Unit map
Recover the original compilation units without DWARF: `_GLOBAL__sub_I_<file>.cpp` static-init
symbols name files, per-section local symbols give link order, `.text` splits into per-object
blocks at COMDAT (weak template) boundaries. Output: one row per original source file with own
byte size and the function list. That port placed 98% of bytes by evidence this way. Known limit:
small C-style objects with no inline functions merge into a neighbour. Then a call graph from
the asm (strong calls only; ignore calls into weak/template code), which becomes the board's
dependency column.

### 2. One unit end to end, then one hard unit
Rebuild the easiest self-contained unit (a JSON parser, a string helper) to a passing test
before any tooling for scale. Then time one hard game-logic unit: the largest game-logic file
with the most struct types (one port used a 135 KB diplomacy unit). The easy one gave 12.5 KB in
10 minutes wall clock; the hard one gave 908 bytes/min of one agent's time. The estimate from the easy unit alone was 40% low
in agent time and said nothing about the platform layer, shared headers, integration or
playtesting. Do not quote an estimate before the hard unit is timed.

### 3. Tooling for scale, before any fan-out
- **Header generator**: from the Ghidra export, per unit: classes, bases, vtable slot order,
  sizeof, field offsets as `// +0x18` comments, return types from the asm, globals with initial
  values. This is what makes a Sonnet-tier worker viable on a header row.
- **Board**: a shared task board file (`TASKS.md`) changed only through a claim script (`tools/task.py claim/next/set`). One row per unit, split into `H-`
  header and `U-` body rows, plus `L-` library, `X-` out-of-scope stub, `P-` platform.
  `teamwork` covers the rest of the agent protocol.
- **Worktree per row**, branch `task/<ID>`, lead rebases inside the worktree, ff-merges, reruns
  ctest. Workers never touch the main checkout.
- **Stub-fill link**: a generator that fills every unported function with a stub naming itself
  on stderr when reached. The app links on day two and the stub list is the progress bar and
  the worklist. Unfinished bodies inside ported units are explicit `// STUB:` plus a macro,
  never silently missing.
- **Build on the dev machine and the target from one tree.** Mac for iteration, device for
  acceptance. Add scripted input and frame dumps early; they are how workers test without a
  human.
- **Rulebook in one file** (CLAUDE.md), with AGENTS.md pointing to it, so non-Claude agents
  (OpenCode) work the same board. A second rulebook drifts.

### 3b. Platform layer, Opus, from day 3 in parallel
Dev-machine window, GL context and main loop first (`P-mac`), then the device target
(`P-ios`): Xcode project, signing with the personal team, game files copied into the app's
Documents folder by script, a touch mapping for a mouse-driven game. Decide the rendering
backend from the shipped shaders (GLSL ES 1.00 meant GLES 2 with ANGLE on Metal as the
fallback), because it fixes the shape of every renderer row. Video, audio mixing and
networking are not ported: pin the decoders the game's media files actually use, and stub
networking, ads and purchases as `X-` rows.

With source available (another port, OpenJK, 2026-10-23) this phase is the whole port: no
decompile, no board, the lead alone. First boot on the iPad took one session from a working Mac
build: one iOS CMake hook, iOS changes behind `TARGET_OS_IOS`, game files copied to Documents.

Device debug loop (measured on that port), so the lead needs the user only for play:
- `xcrun devicectl device capture screenshot --device <id> --destination x.png` shows the iPad's
  screen. Compare it with the engine's own GL readback (its screenshot command) and with the Mac
  build at the same resolution: that splits GL bugs from presentation bugs from engine behaviour.
- Crash reports: `devicectl device info files --domain-type systemCrashLogs`, then `copy from`
  and read the triggered thread from the `.ips` JSON.
- `devicectl device process launch --console <bundle> <args>` passes arguments to the game. Set
  stdout line-buffered on iOS (`setvbuf(stdout, NULL, _IOLBF, 0)`), or the console stalls.
- Launches fail while the iPad is locked. A debug setting turned on from the command line can be
  saved to the game's config: turn it off again on the next launch.

Desktop GL 1.x games on iOS through gl4es:
- On Darwin gl4es exports only `gl4es_glX`: link its dylib with `-alias_list` (gl4es_glX -> glX)
  made from its own symbols, and un-hide its symbols. Recipe: `tools/build_ios_deps.sh` there.
- Only the renderer may link gl4es. If the executable links it, SDL's own GLES calls bind to gl4es
  and crash. Resolve GLES functions from the OpenGLES handle, never by global name.
- SDL on iOS draws into its own FBO: wrap gl4es's `glBindFramebuffer(0)` to bind SDL's.
- gl4es initialises once: keep one window and GL context across the game's video restarts.
- A fault seen only on the device: check the Mac build first, then gl4es (its viewport cache
  dropped negative x, which drew the 2D layer inside a model's viewport).

### 4. Fan-out
- 3-4 workers, never 8. Eight Sonnet workers spent a 5-hour window in 20 minutes; four chained
  workers spent it in 40. Say the batch size to the user before launching.
- Tiers: Opus for headers over 20 KB, units over 40 KB or with a function over 8 KB, and all
  platform work. Sonnet for the rest. Haiku only for parts made of functions under 2 KB; it stubs
  anything larger. OpenCode on cheaper models for rows a test can judge; see `teamwork`.
- Units too big for one sitting are split on the board into parts with their own function
  lists, each part declaring the other parts' functions at the top of its file.
- A worker may hand independent parts of a row over 15 KB to its own subagents (one function
  group, struct family or table each). Below that, it works alone.
- Dependency gating: a `U-` row opens when every header it calls into is done. A worker missing
  a declaration sets its row blocked with the name and stops. Guessing a type another row owns
  is the most expensive mistake on the board.
- Lead merges only; a claim with no commits after two hours goes back to open.

### 5. Correctness
- Shipped behaviour, bugs included. Known-upstream code (a JSON library, a codec) helps naming
  only; the binary still decides behaviour. Mark `Differs from <upstream>` where the shipped copy
  diverges.
- Tests assert what the decompile says the code does, plus real game data from the install for
  any file that reads one. No trace harness, no RNG-seeded state hashing against a VM: both
  were rejected as weeks of work for little gain.
- Floating point: match the original's contraction (`-ffp-contract=off` for clang -O0 x86-64),
  or maths diverges bit by bit.
- Standard library layout differs (libc++ vs libstdc++): any fixed-size memset/memcpy over an
  object holding std:: members becomes `sizeof`, marked Differs, or it overruns the heap.
- Audit numeric literals and string-table ids against the asm in bulk once a layer is ported;
  decompilers drop or mangle some.
- Cross-unit regression: scripted input files replayed on the dev-machine harness with frame
  dumps (`shot <file>`), compared by eye against the oracle, plus a playtest log of what was
  reached per campaign. That is the whole automated layer; the rest is play.
- Final gate is play on the device. Back up the user's saves before any long run; autosave
  overwrites them. One tester on the device at a time; workers never launch the dev-machine app
  while a device test runs.

## Decisions already made (do not re-spike)

| Question | Decision | Rejected and why |
|---|---|---|
| Lift (static translation) or rebuild | Rebuild in the original language | Lifted code cannot be debugged on the device or cross replaced-library ABIs |
| Oracle | The original played in CrossOver plus the binary | x86-64 Linux VM on arm64 Mac: slow, and a trace harness is a project of its own |
| Byte-identical output | No | Costs far more, buys nothing for a port |
| Libraries | Upstream source, version-matched | Decompiling SDL/FreeType/FFmpeg |
| Assets | Shipped containers decoded at load | One-time unpack step: puts game files on disk outside the install |
| First link | Day two, with generated stubs | Waiting for every unit |

## Rates for planning

| Measure | Value |
|---|---|
| Easy unit, one agent | 12.5 KB in 10 min |
| Hard game unit, one agent | 908 bytes/min |
| Whole port, 4.35 MB own code | 6 calendar days with 3-4 workers plus OpenCode; tokens per day not measured |
| Ghidra full analysis, 8 MB ELF | about 5 min |
| Batch decompile of 6,000 functions to files | about 2.5 min |

## Where the tools are

Build these per port; there is no shared copy. The set that worked: a unit-map script, a header
generator, a board planner, a stub-fill link generator, literal audits (constants and strings), a
batch decompile script (plus a Ghidra headless script that takes a function list), and a worker
brief file. Keep game-derived content out of anything you publish. The claim script is the task
board's (`tools/task.py`). rea (github.com/morluto/rea) can replace the two Ghidra scripts as the
decompile provider; whether it tolerates many workers on one project is unchecked.

## Red flags

- An estimate before the hard unit is timed.
- A spike on lifting, a VM, or a trace harness.
- More than four workers, or a worker spawning subagents for a row under 15 KB.
- A worker that guessed a type instead of blocking.
- A function missing from a ported unit with no `// STUB:` line.
- Game files, symbol names or offsets in anything that leaves the machine.
