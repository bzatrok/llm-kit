---
name: marktplaats
description: Sell second-hand items on Marktplaats end to end through the local Chrome browser — research a price and post a listing from a product name plus photos, check listings for new messages and bids, draft replies, close deals, and manage live listings. Every outgoing message is drafted and shown for approval before it sends; nothing is sent, published or agreed autonomously. Use when the user wants to list something on Marktplaats, check on what they're selling, answer a buyer, or simply invokes it with no further detail — in that case it orients and asks what they want.
---

# marktplaats

Drives the user's own Marktplaats account through Chrome MCP: listing, monitoring, replying,
closing. The site know-how lives in `references/`; the user's own selling defaults and per-item
state live in their sales workspace, not here.

**This skill never sends a message, publishes a listing, accepts an offer, or agrees a price
without the user approving that exact action first.**

## Setup

Two things must exist before any mode runs.

**The workspace** — default `~/Sales/`. If it isn't there, create it from `templates/`:
`CLAUDE.md` (the user's selling defaults — interview them for it), `ledger.md`, `.gitignore`
covering `items/*/photos/`. Read the workspace `CLAUDE.md` at the start of every mode; it holds
delivery, payment, address and tone defaults that override anything generic here.

```
<workspace>/
  CLAUDE.md              selling defaults
  ledger.md              index: item | status | asking | floor | listed | last activity | listing URL
  items/<slug>/
    brief.md             specs, condition, asking, floor, category path, listing id + URL, status
    photos/              user drops images here
    threads/<buyer>.md   append-only log: what was said, what was committed to
```

Status flow: `draft → listed → interest → reserved → sold`, plus `withdrawn`.

**The login gate** — every mode starts here. Load `https://www.marktplaats.nl/` and check the
header. `Inloggen` means logged out: **stop, ask the user to log in in that tab, and wait.** Do not
type into a login form, do not touch credentials, do not try to work around it. See
`references/page-flows.md` for the check and for the navigation rules that apply throughout —
element refs over coordinates, hash-fragment sorting, dismissing the site's frequent modals.

## Routing

**The user is never expected to know the mode names.** They are internal vocabulary for this
document. `/marktplaats` on its own is the normal way in.

**If the request already says what to do**, go straight there — don't ask a question whose answer
you already have:

| The user says | Go to |
|---|---|
| "sell my monitor", "list this", here are photos of X | `list` |
| "any news?", "check my listings", "anything come in?" | `check` |
| "reply to Roy", "answer that guy", "what do I say?" | `reply` |
| "drop the price on X", "mark the oven sold", "relist it" | `manage` |

**If the request is bare** — `/marktplaats`, "marktplaats", "let's do marktplaats stuff" — orient
first, then ask. Do not present a blind menu; a menu with real numbers in it is worth the two
seconds it costs.

1. Run the login gate. It loads the homepage anyway, and the header tells you whether there is a
   `Meldingen` indicator.
2. Read `ledger.md` — free, local, tells you how many items are live and what state they're in.
3. Ask with `AskUserQuestion`, with options built from what you just found. Offer only what makes
   sense: no "answer a buyer" when there are no threads, no "check listings" when nothing is
   listed. When the ledger is empty, the only real option is listing something, so say that and
   ask what they're selling rather than presenting a one-option menu.

Sketch of the question when there is live state:

> **You have 3 listings, 2 with unread messages. What do you want to do?**
> - **Check what's come in** — messages, bids and views across all 3, reported, nothing sent.
> - **Answer buyers** — go through the 2 waiting threads, drafting each reply for your approval.
> - **List something new** — research a price and post it.
> - **Update a listing** — change a price, relist, or mark something sold.

Then run the matching mode below. Modes chain naturally: `check` normally ends by offering `reply`.

## Modes

### `list` — research and post

1. **Read the photos** in `items/<slug>/photos/` (or wherever the user points). Pull model number,
   condition, what's included, colour, visible wear. Ask about what a photo can't show: faults,
   age, whether box/receipt/accessories exist, whether it's been tested working.
2. **Price it** per `references/pricing.md` — Marktplaats' own band from the wizard, live private-
   seller comparables, and a retail anchor. Report all three with reasoning, then propose asking
   and floor. **The user confirms both explicitly.** The floor goes in `brief.md`.
3. **Pick the category** with the wizard's `Vind categorie`, then cross-check it against a real
   comparable listing's category path — the auto-suggest offers plausible-wrong options.
4. **Draft the listing** — Dutch title and description, in the user's voice. Honest about defects.
   Answer the five standard buyer questions in the body (see `references/negotiation.md`) so buyers
   don't have to ask. **Show it for approval before entering anything.**
5. **Fill the wizard** per `references/page-flows.md`: photos via `file_upload`, Kenmerken as
   completely as is truthfully known, delivery and price from the workspace defaults, **`Gratis`
   selected explicitly**, and **every paid upsell left off**.
6. **Preview and publish** — click `Bekijk advertentie`, screenshot it, show the user. Only click
   `Plaats je advertentie` after they approve.
7. Write `brief.md` with the listing id and URL, add the row to `ledger.md`, status `listed`.

### `check` — see what's come in

Read `ledger.md` first, then gather:

- `/messages` — new messages per thread, matched to items by the `Advertentienummer` in the thread
  header. Distinguish real buyers from Marktplaats system messages (sender `Marktplaats`).
- `/my-account/bids/index.html` — **bids are a separate channel from messages** and are easy to
  miss. Bidding is on by default for new listings.
- `/my-account/sell/index.html` — listing status, views and favourites where shown.

Diff against the thread logs so a second run reports only what's new.

Output a **report, not an action**: what came in and from whom, what each message actually wants,
which items are quiet, which look mispriced, and anything matching the red flags in
`references/negotiation.md`. End with the threads awaiting a reply and offer to go answer them.

This is what `/loop 30m /marktplaats check` wraps on an active sale day. Pace it — don't hammer
the site.

### `reply` — answer and close

Per thread, one at a time:

1. Read the whole thread, and `brief.md` for what was already promised and what the floor is.
2. Draft one reply in the user's voice per `references/negotiation.md`.
3. **Show the draft in chat and wait.** The user approves, edits, or skips.
4. Only then send it. **The composer sends on plain ENTER** — use Shift+Enter for line breaks and
   click the send button. Never type an unapproved draft into the field.
5. Append the exchange and any commitment to `threads/<buyer>.md`.

Closing follows the checklist in `references/negotiation.md`: price → delivery → payment → time →
address via **`Deel adres`** (never typed) → mark `reserved` → after handover mark `sold`, close
the listing, and tell the other interested buyers.

### `manage` — change a live listing

Editing, repricing, relisting and closing out. Each of these changes something public or ends a
sale, so **each one is confirmed before it happens**, the same as a message.

- **Reprice** — propose the new number with the reasoning from `references/pricing.md` (a listing
  with views but no messages is priced wrong; one with no views is miscategorised or badly titled).
  Confirm, edit the listing, update `brief.md` and `ledger.md`. If the new price is below the
  recorded floor, that is a floor change — say so and get it agreed, don't quietly cross it.
- **Edit** — fix a title, description, photos or Kenmerken. Show the diff before saving.
- **Relist / extend** — a free ad runs 4 weeks and extends free 3×. Prefer extending; only relist
  fresh if the listing needs a new title or category to be findable.
- **Mark sold** — close the listing, set `sold` in `brief.md` and `ledger.md`, and offer to message
  any other interested buyers that it's gone. Confirm before closing: it can't be undone.
- **Withdraw** — take it off sale without a sale. Set `withdrawn`, note why.

Never buy Plus/Premium placement or any paid upsell as a fix for a slow listing. If visibility
genuinely looks like the problem, say so and let the user decide to spend.

## What this skill does not do

- Does not log in, or handle passwords, DigiD, bank or card details.
- Does not send any message, publish any listing, accept any bid, or agree any price without the
  user approving that exact text or action first.
- Does not go below the floor recorded in `brief.md` without asking.
- Does not tick paid upsells, buy Plus/Premium placement, or spend money.
- Does not type the user's address into a message — only the `Deel adres` button.
- Does not solve CAPTCHAs or work around anti-bot challenges.
- Does not invent rival buyers, urgency, or facts about an item's condition.
- Does not run unattended. Chrome MCP needs the user's local browser, so there is no cloud or
  scheduled path — a scheduled cloud agent cannot do this.

## Failure modes

- **Logged out** → stop and ask. Never attempt the login form.
- **A flow no longer matches `references/page-flows.md`** → say exactly what differs and stop.
  Marktplaats changes its DOM; guessing which button is the publish button is not acceptable.
- **CAPTCHA or rate limiting** → hand control back to the user, don't retry in a loop.
- **A modal blocks the page** → dismiss the known ones and continue; report an unknown one.
- **Wizard won't let you leave** → it guards unsaved changes; navigate with `force: true` to
  discard a draft.
- **Photos missing or unreadable** → ask for them rather than posting a listing without images.
- **Thin pricing evidence** → give the honest range and say the evidence is thin.
- **A scam pattern in a thread** → flag it in the report, don't draft a reply engaging with it.
- **Buyer asks something only the user can answer** (exact fault history, whether they'll deliver)
  → ask the user rather than inventing an answer that commits them.
