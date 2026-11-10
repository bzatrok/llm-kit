# Marktplaats page flows

**Observed 2026-08-16** by walking the real site while logged in as a private seller. Everything
here was seen, not assumed. Marktplaats will change — when a flow no longer matches, say so and
stop, don't click blindly.

## General rules

- **Navigate by visible text and element refs, not coordinates.** The layout reflows between
  renders and screenshot coordinates go stale within a single task. Use `find` → `computer` with
  `ref`, or `form_input` with `ref`.
- **Query-string filters do not work.** Constructing `?sortBy=PRICE&sortOrder=INCREASING` is
  silently ignored. Sorting is a **hash fragment** (`#sortBy:PRICE|sortOrder:INCREASING`) and
  facets must be clicked in the sidebar.
- **Modals interrupt constantly** — promo modals on the account page ("Zorg dat je opvalt"), a
  "Prettig handelen" modal the first time a thread is opened, a login nudge when logged out.
  Dismiss (`Sluiten`, `Bedankt, ik snap het!`, `×`) and continue.
- `link.marktplaats.nl` is **not** in the Chrome extension's allowed domains. Never navigate to it;
  click the on-page button instead, which redirects to a `www.marktplaats.nl` URL.
- **`form_input` can set a field visually without the page registering it.** Observed 2026-08-16:
  `form_input` on the wizard's **Vraagprijs** field displayed `€ 65,00` in the input, but the ad
  preview still rendered **€ 0,00** — the React state never saw the change. Selects, checkboxes and
  the title field were fine; the price field was not.
  **Fix:** click the field, `cmd+a` `Delete`, `type` the value with real keystrokes, then `Tab` to
  blur it.
  **Rule: always open `Bekijk advertentie` and read the price, title and description off the
  preview before publishing.** The preview is the only honest confirmation that what you set is
  what will go live — a silently-zeroed price would have published the item as free.

## Logged-in check

Load `https://www.marktplaats.nl/`.

| Header shows | Meaning |
|---|---|
| `Inloggen` | **Logged out.** Stop. Ask the user to log in in that tab; wait for confirmation. |
| account name + `∨` (e.g. `<your name> ∨`) | Logged in. Proceed. |

Never type into a login form and never touch credentials.

## URLs

| Surface | URL |
|---|---|
| Search | `https://www.marktplaats.nl/q/<query+with+plus>/` |
| Search, price ascending | append `#sortBy:PRICE\|sortOrder:INCREASING` |
| Listing detail | `/v/<cat-slug>/<subcat-slug>/m<id>-<title-slug>` |
| Category page | `/cp/<id>/<slug>/` |
| Messages | `/messages` |
| One thread | `/messages/<opaque-thread-id>` |
| Notifications | `/notifications` |
| My ads | `/my-account/sell/index.html` |
| Bids | `/my-account/bids/index.html` |
| Favourites | `/my-account/favorites/index.html` |
| Profile | `/my-account/profile/index.html` |
| Post an ad | `/plaats` → step 2 at `/plaats/<catId>/<subcatId>?bucketId=<n>&title=<title>` |

`/my-account/` on its own is a 404. The account menu (click the header name button) is the
canonical source if any of these move.

## Search results page

Sidebar facets, all click-only: **Prijs** (van/tot), **Categorie** (with per-subcategory counts),
**Direct Kopen**, **Conditie** (Nieuw / Refurbished / Zo goed als nieuw / Gebruikt / Niet werkend),
**Levering** (Ophalen / Verzenden), **Aangeboden sinds** (Vandaag / Gisteren / Een week / Altijd).

Sort dropdown ("Sorteer op") options, exact labels for `form_input`:
`Standaard` · `Datum (nieuw-oud)` · `Datum (oud-nieuw)` · `Prijs (laag-hoog)` · `Prijs (hoog-laag)`

Each result row carries: title, price, seller name, location, date posted, condition · delivery.

**There is no private-vs-dealer facet.** Dealers must be spotted by eye — a company-shaped name,
a `Bezoek website` link, a verified check badge, "Topadvertentie", or a location of
"Heel Nederland". The results header says outright that ordering is partly paid placement, so the
top of page 1 skews commercial.

## Listing detail page

Right rail: title, price, delivery chip (`Ophalen` / `Verzenden`), seller block (name, years on
Marktplaats, review score), **`Bericht`** button, and a **bid box** (€ field + `Bieden`) with a
`Biedingen (n)` count.

Below: **`Kenmerken`** — the category-specific structured attributes. Reading a comparable's
Kenmerken tells you exactly which fields the posting wizard will demand for that category.

The breadcrumb shows the display category path, which can be deeper than the URL slug path
(URL `/v/computers-en-software/monitoren/` vs breadcrumb
`Computers en Software > Randapparatuur en Accessoires > Monitoren`). Trust the wizard's own path.

## Messages (`/messages`)

Left: thread list with a `Filter op advertentietitel` box. Each row shows the listing thumbnail,
**listing title**, `van <Name>` (incoming) or `aan <Name>` (outgoing), last-message preview, date,
and sometimes a green **`Betaald`** badge.

Right: the conversation. Header carries the listing title, the counterparty, and
**`Advertentienummer: m<id>`** — this is how a thread maps to an item.

Inline in the thread: Marktplaats system messages (sender `Marktplaats`) about delivery and
payment, a payment banner (`Betaling geslaagd. Bekijk overzicht`), and read receipts
(`Gelezen • HH:MM`, double ticks).

**Composer — read this before typing anything:**

- Placeholder: `Schrijf hier je bericht. Gebruik SHIFT + ENTER voor een nieuwe regel.`
- **Plain ENTER SENDS.** Shift+Enter is newline.
- Therefore: **never type a draft into the composer before the user has approved it.** Show the
  draft as text in chat, get approval, and only then type it — using Shift+Enter for any line
  break, and clicking the send button rather than pressing Enter.
- Two buttons under the composer: **`Deel foto's`** and **`Deel adres`**. `Deel adres` is the
  built-in address-share shortcut — use it instead of ever typing an address into a message.

## Posting wizard

Reached by clicking the header **`Plaats advertentie`** button (redirects to `/plaats`).

**Step 1 — "Wat wil je verkopen?"**
Title field + `Vind categorie` (auto-suggests from the title), or a manual `Kies een categorie`
dropdown. Then `Verder`.

The auto-suggest returns several options and the wrong ones are plausible — for
"Dell UltraSharp U2412M 24 inch monitor" it offered both `Monitoren` and `Banden en Velgen`.
Always cross-check the chosen path against a real comparable listing's category before continuing.

**Step 2 — one long form**, in order:

1. `Gekozen categorie` — full path with a `Wijzigen` link.
2. `Foto's` — up to 24. The page nudges a per-category minimum (4 for monitors). Upload with
   `file_upload` against the file input's ref; **do not click the upload button**, it opens a
   native picker that can't be driven.
3. `Homepagina-advertentie` — **paid upsell, €10,59. Leave unticked.**
4. `Details` — title, description. An AI-fill option exists ("AI vult titel, beschrijving en
   kenmerken"); prefer the drafted copy the user approved.
5. `Website toevoegen` — **paid, €10,39. Leave empty.**
6. `Moet nu weg` sticker — **paid, €0,69. Leave unticked.**
7. `Kenmerken` — category-specific selects, text fields and checkbox groups (for monitors:
   Conditie, Ververssnelheid, Schermtype, Resolutie, Reactietijd, Merk, Schermdiagonaal,
   Aansluitingen). A completeness meter shows `n / 10`; fill as many as are truthfully known.
8. Location — `Nederland` / `Buitenland` radio + `Postcode` (prefilled from the account).
9. Delivery — `PostNL` and `DHL` checkboxes (**both pre-ticked by default**) and `Zelf Verzenden`.
   Then `Pakketgrootte`: Brievenbuspakje 0-2kg · Klein pakket 0-3kg · Gemiddeld pakket 0-10kg ·
   Groot pakket 10-23kg. Marktplaats marks one as `Suggestie`.
10. `Prijs` — `Prijstype` dropdown (default `Vraagprijs`), the price field, a
    **`Bieden toestaan` toggle that defaults ON**, and `Bieden vanaf`.
    Alongside it Marktplaats shows its own algorithmic band, e.g.
    *"€ 35,00 - € 100,00 — Midden vraagprijsklasse van soortgelijke producten"*. See `pricing.md`.
11. `Hoe wil je adverteren?` — `Gratis € 0,00` / `Plus € 1,89` / `Premium € 5,89`.
    **Nothing is pre-selected. Explicitly select `Gratis`** unless the user asked to pay.
12. Footer: `Totaal: € 0,00`, then `Bekijk advertentie` (preview) and
    **`Plaats je advertentie`** (publishes).

Use `Bekijk advertentie` as the approval checkpoint: screenshot the preview, show it, and only
click `Plaats je advertentie` after the user says yes.

A free ad runs **4 weeks** and can be extended free 3×.

**Abandoning a draft:** the wizard installs an unsaved-changes guard, so navigating away raises a
"Leave site?" dialog. Navigate with `force: true` to discard it.
