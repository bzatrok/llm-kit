# The report

The markdown is the source of truth. The HTML is a render of `README.md` and the analysis
files. **A claim that appears only in the HTML is a bug.**

## A toolbox, not a shopping list

Use only the components the data supports. A component earns its place when it shows something
the reader needs and the data for it exists in `sources/`. Leave out a chart rather than fill
it with weak or invented data. A short report with 2 charts beats a long one with 8.

Read before you render:

- `design-system.md` — principles, the Never list, visual foundations.
- `language.md` — how to write, status words, TL;DR rules, number format.
- `components.md` — the parts, charts and maps.
- `report-types.md` — choose the report type here. It sets the type tab and the usual parts.
- `examples/` — one approved mockup per type. `examples/nas-replacement.html` is the base.

Write the report in the language of the sources, per `language.md`. Translate the frame labels.

## Shell — every report, in this order

1. **Meta line** — `Research · <peildatum>`, for example `Research · 23 Oct 2026`.
2. **Title** — 2–4 words, a noun phrase. "NAS replacement", "Portugal 2028". Not the answer.
3. **Theme pill** — top right. Toggles light and dark.
4. **TL;DR card** — see below.
5. **Segmented tabs** — see below.
6. **Footer line** — scope, ranking order, red-team verdict. Add "Revised n times" when
   corrections exist.

## TL;DR

Rendered from the README's **Kort antwoord**. Max 3 lines:

1. The answer.
2. The main condition or risk.
3. Optional: what to do first. This is where the next step lives. There is no next-action section.

Mark 1–2 conclusions with `<mark>`. Link 2–4 key references as `<a class="ref" data-src="N">`,
which jump to Sources row `src-N`. With 2 or more corrections, one line points to them.

## Tabs

| Tab | Holds |
|---|---|
| **Overview** | Charts and maps only. A plain "Next step" sentence may close it. |
| **Options** | The option bodies. Choose one body below. |
| **Compare** | Matrix, tables, timelines across options. |
| *Type tab* | At most one, taken from `report-types.md` (Buy, Plan, Triggers, Calls, …). |
| **Gaps** | "What I could not verify". Questions grouped by what the answer could change: "Could change the pick", "Could change another option", "Minor". Right column: who can answer. Always present: if nothing is open, say so. |
| **Sources** | Numbered table, row ids `src-N`, capture date or file. Rename it **Method** when it also holds the brief, the ranked criteria or the correction list. |

Rename or drop a tab the type has no content for. The news digest drops Options, Compare and
Gaps.

## Options body — choose one per topic

| Body | When | Example |
|---|---|---|
| **Ladder** | Eight or fewer options, and the reasoning is the point. **The default.** | `examples/nas-replacement.html` |
| **Board** | A wide field whose job is sorting and filtering | `EbikeSale/docs/callsheet.html` (old style; no v2 example yet) |
| **Calculator** | Ranking depends on the user's own numbers over a horizon | `Broadband` |

State which body you used and why, in one line in the Options tab or in the footer.

- **Ladder** → option cards (`.card.opt`) in `.grid`, ranked. `.opt.pick` on the
  recommendation. Status goes in chips (`language.md` §Controlled status words). A red-team
  `.flag` sits inside the card of the option it bites, never in a pile at the end.
- **Offer links** → every shop, listing or seller named on an option card or board row is a
  link to that offer page: `<a class="out" href="<url>" target="_blank" rel="noopener">Marktplaats</a>`.
  Typically in the Price row: "€225 + €15 shipping, <a class="out">Marktplaats</a>". The URL
  is the `Source:` line of the capture in `sources/`. No capture, no link: print the name
  plain. Never use `a.ref` for these; it jumps to the Sources tab.
- **Board** → sortable `table` in `.tw`. Sort, never filter, on preference. Print an unknown
  as `?` or `—`, never as a blank cell.
- **Calculator** → prefill every input with the real number from `sources/` and label where it
  came from. The page must be readable and correct before an input is touched.

## Corrections

Render as the correction list (`components.md`): old belief → finding, dated, linked to the
file that corrects it. It lives in the **Method** tab. With 2 or more corrections, the TL;DR
carries a pointer to it. Source of truth: `workspace.md` §Corrections.

## Never

- Number ladder, KPI or summary tiles.
- Eyebrow, standfirst, uppercase labels, mono fonts, emoji.
- A next-action section or banner. The next step is TL;DR line 3.
- Left-border accent cards, decorative gradients.
- The full list is in `design-system.md` §Never.

## Style

`references/house-style.css` (v2), pasted whole into one `<style>` block. It is the `<style>` of
`examples/nas-replacement.html`. Do not restyle it per topic. Type-specific parts (maps, time
series, range rows, date lists) are built from its tokens only; copy them from the matching
example. No new colours, sizes or fonts.

Charts are drawn at the container's real pixel width and redrawn on resize and tab change, so
chart text stays 12 px. Do not scale a fixed `viewBox` to fit.

## Interactivity

Nothing beyond this list (`components.md`):

1. Tabs and the theme pill.
2. Reference links that jump to a Sources row, and offer links (`a.out`) to the shop or listing.
3. Chart tooltips and range pills (1y / 3y / all).
4. Map pins and category or area filters.
5. Copy buttons on message blocks.
6. Checklists. Native checkboxes; nothing is saved.
7. Sortable tables.
8. Calculator inputs.

## External requests

Only Google Fonts: Poppins 400 and 500. Everything else is inline. Map outlines are Natural
Earth, simplified and inlined, with the source in Sources. No map tiles, no CDN scripts, no
fetched data.

## Delivery

1. Write `docs/<slug>-brief.html`. Commit it.
2. Publish as an Artifact:
   - **Title** — the report title, 2–4 words. Keep it stable across republishes.
   - **Icon** — one generic word (`chart`, `map`, `car`), fixed across republishes.
   - **Description** — one sentence.
3. On resume, pass the URL already in the README status block so the artifact updates in
   place. Never mint a second URL for the same topic.
4. Write the URL into the status block. Update the short answer, the status, the next
   action and the recheck date. Commit.
