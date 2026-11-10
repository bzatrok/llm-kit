# Research

The design system for reports made by the `research` skill. A report answers one question, shows the evidence, and lets the reader check every number. It looks calm: white cards on a cool grey page, one teal accent, one font.

Read this file first. Then read `language.md` for how to write, `components.md` for the parts, and `report-types.md` for which parts each kind of research usually needs.

## The rule above all others: a toolbox, not a shopping list

Not every component, chart or tab is used every time. Pick the few that answer the question. A component earns its place only when it shows something the reader needs and the data for it exists. Leave out a chart rather than fill it with weak or invented data. A short report with 2 charts is better than a long one with 8.

## Principles

1. **Answer first.** The TL;DR states the answer in the first line. Everything below is evidence.
2. **One screen, then tabs.** The header and TL;DR fit above the fold. The rest sits behind tabs, never in one long scroll.
3. **Visuals carry the data.** Use charts, maps, matrices and fields instead of paragraphs.
4. **Every number traces to a source.** References link to the Sources tab. Never invent a number, score, date or name.
5. **Reduce distractions.** One accent colour, one font, few borders, no decoration.

## Never

- KPI or summary tiles at the top.
- Long titles. The title is 2–4 words.
- Dashed-edge badges or annotations.
- Next-action banners or nudging notifications. A next step is a plain sentence in the TL;DR or at the end of the Overview.
- Uppercase labels, mono fonts, emoji.
- Left-border accent cards, decorative gradients, blue-purple gradients.
- Brand logos drawn by hand. Use the official file, or no logo.

## Report frame

Every report uses the same frame. Contents vary; the frame does not.

| Part | Rule |
|---|---|
| Meta line | `Research · 23 Oct 2026`, label style, ink-3. |
| Title | 2–4 words, title style (26/500). Example: "NAS replacement". |
| Theme button | Pill, top right. Toggles light and dark. |
| TL;DR card | Max 3 short lines. Conclusions in `mark`. Key references linked. See `components.md`. |
| Tabs | Segmented control. Fixed: Overview, Options, Compare, Gaps, Sources. Add at most one type tab (for example Buy, Plan, Route, Calls). Rename or drop a fixed tab when the type has no such content. |
| Overview | Charts and maps only. |
| Gaps | Titled "What I could not verify". Questions grouped by what the answer could change. |
| Sources | Numbered table. Row ids `src-N` for reference links. Holds the brief, ranked criteria and corrections when needed (then rename it "Method"). |
| Footer | One line: scope, ranking order, red-team verdict. |

## Visual foundations

**Colour.** Grey page (`bg`), white surfaces (`card`), inset areas (`soft`). Text in three steps: `ink`, `ink-2`, `ink-3`. One accent, `teal`, marks the pick, links, the active tab and references. Status colours mean status only: `teal` yes/verified, `orange` partial/one source, `red` no/unverified/red team, `c-mute` unknown. Categorical colours `c-used`, `c-new`, `c-diy`, `c-pi` mark series and groups in charts and maps, never text.

Open point: teal and orange appear both as status and as categories. When a chart shows status, do not also colour categories in teal or orange in the same card.

**Type.** Poppins, weights 400 and 500 only. Four sizes: 12, 14, 18, 26 px. Sentence case everywhere. Tabular numbers only on figures, prices and table numbers (not on text, where it widens hyphens).

**Shape.** Cards 16 px radius, inner boxes 12, tabs and image slots 8, chips and bars pill. One soft shadow token on cards and the tab bar. Borders are 1 px `rule`.

**Dark mode.** Every colour has a dark value. A report must work in both themes and at 390 px wide, with no sideways page scroll. Wide tables scroll inside their card.

**Charts.** Draw SVG at the container's real pixel width and redraw on resize and tab change, so chart text stays at 12 px. Label lines directly at their end. Gridlines in `rule`, axis text in `ink-3`.

**Images.** Product and listing cards have an image slot. Use the real product or listing photo when it was captured. Otherwise use a generic line drawing in `ink-3` on `soft`. For brand research, use the official logo file or plain text. Never fetch or invent images to fill a slot.

**Maps.** Simplified Natural Earth outlines, inlined. Land in `card`, sea is `bg`, coastline 1 px `rule`. Pins are categorical dots with a 2 px `card` ring. Coordinates come from geocoding captured in the sources.

## Language, in short

Dry, concise, close to ASD-STE100 Simplified Technical English. Short sentences, active voice, one idea per sentence. EU format: € before the number, metric units, 24-hour time, no em dashes. Write the report in the language of its sources; translate the fixed labels. Full rules: `language.md`.

## Reference mockups

Eleven approved mockups, one per report type, were built from sample research: NAS replacement (the base), product shortlist (robot vacuum), used listings (hatchback), selling (e-bike), service contract (Internetcontract 2026, Dutch), money (inflation hedge), travel (Portugal 2028), business options (coffee subscription), feasibility (van import), home DIY (shower mixer), news digest. `report-types.md` lists what each uses.
