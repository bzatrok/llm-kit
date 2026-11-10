# Pricing an item

Goal: an asking price that sells within a few weeks, and a floor the user has consciously agreed
to. Three independent signals, cheapest first. Never propose a number from a single source.

## 1. Marktplaats' own band (free, and it's right there)

The posting wizard shows an algorithmic band next to the price field:

> € 35,00 - € 100,00 — Midden vraagprijsklasse van soortgelijke producten

This is Marktplaats' own read of comparable *live* listings in the chosen category. It costs one
page load — the wizard has to be opened anyway — so take it, but **treat it as the weakest of the
three signals.**

It is a band for the whole category *bucket*, not for this model or condition, and the buckets are
coarse enough to be useless on their own. Observed 2026-08-16: `Keukenmixers` returned
**€45,00 - €250,00** for a mini food processor, because the same bucket holds €250 stand mixers.
When the band is that wide, say so and lean on signals 2 and 3.

## 2. Live comparables

Search `https://www.marktplaats.nl/q/<model>/`, then sort `Prijs (laag-hoog)` via the dropdown and
read the spread. Then apply, by clicking the sidebar facets:

- **Conditie** matching the item's real condition.
- **Levering** if it matters (pickup-only items price lower than shippable ones).
- **Aangeboden sinds → Altijd** to see the whole population, then compare against **Een week** —
  a category where most listings are months old is a category where asking prices are aspirational.

**Filter out dealers by eye.** There is no facet for it. Skip rows with a company-shaped name, a
`Bezoek website` link, a verified badge, `Topadvertentie`, or a location of "Heel Nederland".
Refurbished dealer stock carries a warranty and prices 30-50% above what a private seller gets for
the same hardware. Comparing against it will overprice the item every time.

**Check that each comparable is actually the same product.** A keyword search pulls in every
variant of the product line, and the bigger variants cost far more. Observed 2026-08-16: a search
for "kitchenaid mini foodprocessor" returned 18 listings, of which exactly **one** was a mini —
the rest were full-size 1,7 l and 2,1 l processors at €60-125, a different and pricier machine.
Read each title, and check capacity or model number before counting a row as a comparable.

When only one or two true comparables exist, the median is meaningless. Say the evidence is thin,
lean harder on the retail anchor, and let the ceiling rule below set the number.

What actually matters is the **private-seller subset**, and within it:

- the cheapest few (what undercuts you),
- the median (the realistic ask),
- how long listings sit — an item posted "11 jun" still live in August was priced wrong.

## 3. Retail anchor — Dutch retailers, checked directly

**Always the Dutch price. Never a UK, US or manufacturer RRP** — they are routinely 30-50% off
what the item actually costs here, and a wrong anchor poisons every number downstream.

Check **Coolblue** and **MediaMarkt** by hand, in the browser, searching the **model number**:

- `https://www.coolblue.nl/zoeken?query=<model>` — if it returns nothing, retry with the Dutch
  product word (`hakmolen`, `koptelefoon`) rather than the English one.
- `https://www.mediamarkt.nl/nl/search.html?query=<model>`

Both sites open a cookie wall: decline non-essential (`Weigeren` on Coolblue, `Opslaan` with the
toggles off on MediaMarkt). Neither renders prices into the DOM in a way `javascript_tool` reliably
reaches — **screenshot the results and read the prices off the image.**

Record for each: the **current** price, the **normal** price, the colour/variant, and **whether it
is actually in stock**. MediaMarkt shows the normal price as "Meestal € X" above the live price, so
a promo is visible at a glance. It matters which you are looking at: a promo can end mid-listing
and quietly make the asking price look good.

**A price you cannot buy is not a ceiling.** Open the product page and check for an order button.
On MediaMarkt, `Ik wil bestellen` means in stock; `Meldingen activeren`, `Helaas geen bezorging
mogelijk` or `Dit product is mogelijk beschikbaar in onze winkels` mean it is not really available.
On Coolblue, `Tijdelijk uitverkocht` means the same. Observed 2026-08-16: the red variant showed
€62 but was in-store-only, while black and silver at €62 shipped next day — so the effective
ceiling for a *red* item was the price of a different colour, plus whatever the buyer's colour
preference is worth. Note that gap out loud rather than pretending the headline price binds.

`WebSearch` is a fallback for discontinued items only, and its results skew to UK/US shops.

**Never take the retail anchor from a Marktplaats dealer listing.** Admarkt rows — listing URLs
starting `a<id>` rather than `m<id>`, company-shaped seller names — can sit *above* real retail.
Observed 2026-08-16: a dealer asked €116,99 for a mini food processor that MediaMarkt was selling
new, same colour, for €62.

## The ceiling rule

**A used asking price must sit clearly below the cheapest new price available in NL today.** New
comes with a warranty, a return window and no stranger at the door; if used isn't visibly cheaper
there is no reason to buy it. Find the cheapest new price first, then work down from it — don't
price up from the used comparables and check the ceiling afterwards.

If the gap between the best used comparable and the current new price is small, say so. Sometimes
the honest answer is that a promo has compressed the market and the item is worth listing later,
or worth accepting less for now.

## Turning signals into numbers

Report the three signals with the reasoning, then propose:

- **Asking** — at or slightly above the private-seller median if the item is clean, complete and
  photographs well; at the low end if it's cosmetically rough, incomplete, or the category is
  crowded. Round to a Marktplaats-natural number (€45, €75, €120 — not €47,50).
- **Floor** — the number below which the user would rather keep it. Propose one, but this is
  **the user's call and must be confirmed explicitly.** It goes in `brief.md` and is never crossed
  in a drafted reply without asking.

Leave headroom between asking and floor. Dutch buyers open with a lowball as a matter of routine;
an asking price with no room forces you to either hold firm or look inconsistent.

Say plainly when the evidence is thin — few comparables, no retail anchor, a niche item. A
confident number from three data points is worse than an honest range.

## Pricing to re-list

If an item has sat without messages, the diagnosis is usually one of: price, photos, or category.
Check views/favourites first. A listing with views but no messages is priced wrong; a listing with
no views is in the wrong category or has a title nobody searches for.
