# Components

The toolbox. Use a component only when the data for it exists and the reader needs it. All components use only the tokens; no new colours, sizes or fonts.

## Frame

| Component | Use | Notes |
|---|---|---|
| Header | Every report | Meta line, 2–4 word title, Theme pill. |
| TL;DR card | Every report | Card, label "TL;DR" in ink-3. Max 3 `p` lines. `mark` (teal-soft, ink, 500, 4 px radius) on 1–2 conclusions. `a.ref` links (teal, 1 px underline, offset 3 px) open the Sources tab and highlight row `src-N` for 1.6 s. |
| Segmented tabs | Every report | White bar, 12 px radius, 4 px padding. Active tab teal-soft fill, teal text, 500. Scrolls sideways on phones. |
| Card | Everywhere | card surface, 1 px rule border, 16 px radius, shadow-card, 22 px padding. Heading 18/500, subtitle 12 ink-3. |
| Footer line | Every report | 12 px ink-3. Scope, ranking order, red-team verdict. |

## Content

| Component | Use when |
|---|---|
| Option card | Ranked options. Image slot (56 px), route dot + label, name 14/500, price 14/500 (teal for the pick), field rows (label 12 ink-3, value 14), offer link (`a.out`, opens the shop or listing page in a new tab; usually in the Price row), red-team box (red-soft, red text, 12 px). |
| Listing card | Used items: year, km, place, seller, price, history chips, "Ask the seller" list. |
| Field rows | Fixed attributes per option. Dividers in rule. |
| Status chip | Pill, 12 px. Verified (teal), Single source (orange), Unverified (red), neutral. |
| Matrix table | Options × requirements with ✓ ~ ? ✗ and a legend. Pick row in teal-soft. Clear column headings ("Gets security updates", not "Updates"). |
| Price per shop table | Same product at several shops. Cheapest marked. |
| Gaps list | Grouped questions with a "who can answer" column. |
| Sources table | Numbered rows, ids `src-N`, capture date or file. |
| Checklist | Before you buy or order. Native checkboxes; nothing is saved. |
| Message block | Text to send (seller, partner, provider) with a Copy button. |
| Call card / script | Who to call, what to ask, what answer changes the decision. |
| Verdict rows | A claim or objection, the evidence line, a Holds / Does not hold chip. |
| Correction list | Old belief → finding. For "what I got wrong". |
| Process steps | A flow strip, then numbered steps with Who, Time, Cost, Rule. |
| Itinerary rows | Date, stop dot, title, one-line detail. |
| Headline rows | News: image slot, topic, 1–2 sentence summary, citation chips. |
| Ranked list | Decision criteria in order, numbered circles. |

## Charts

| Chart | Use when |
|---|---|
| Horizontal bars | Comparing one value across options (cost, distance, score). Pick in teal text. |
| Donut | Share of a whole with 2–5 parts (options by route, allocation). Total in the centre. |
| Dumbbell / range rows | Min–max per group (price range per route, temperature low–high). |
| Radar | Pick against 1–2 alternatives on 4–6 scored axes. Only when the score is derived from data, and say how. |
| Stacked coverage bars | Yes / partial / unknown / no counts per requirement. |
| Support timeline | End dates as bars from today, with a dashed "today" line. Open-ended bars fade. |
| Time series | Monthly or daily values over years. Direct end labels, event markers, crosshair tooltip, optional 1y / 3y / all pills. |
| Sparkline | A small time series next to a trigger or metric. |
| Histogram with markers | Distribution of comparables, with your offer and fair value marked. |
| Scatter | Two numeric attributes (price vs km). Ring on the pick. |
| Waterfall | Cost build-up to a total, low and high case. |
| Cumulative line | Cost over time per contract term, with break-even. |
| Diverging bars | Positive and negative effects around zero. |
| Gauge rows | Current level against a trigger line. |
| Stacked bar with total | Parts of a total per option (flights + stay). |

## Maps

| Map | Use when |
|---|---|
| Route map | Travel: stops in order, nights per stop, route line. |
| Place map with filters | Travel: stays, hikes, food, beer; category chips refit the view. |
| Country map with pins | News, listings, shops: places in the stories or offers. Click a pin to jump to its row. |
| Small multiples | Several countries side by side on the Overview. |

Map rules: Natural Earth outlines inlined, no tiles, no network. Land `card`, coast `rule`, pins categorical with a `card` ring, labels 12 px with collision avoidance, tooltip as a small card.
