# Sales workspace

State for selling second-hand items on Marktplaats. The how-to lives in the `marktplaats` skill
(run `/marktplaats`); this repo holds **my defaults and per-item state only**.

Keep this repo local or private — thread logs contain buyer names and pickup arrangements.

## Layout

```
ledger.md              index of every item and its status
items/<slug>/
  brief.md             specs, condition, asking, floor, category, listing URL, status
  photos/              source images (gitignored)
  threads/<buyer>.md   append-only log of the conversation and what I committed to
```

Status flow: `draft → listed → interest → reserved → sold`, plus `withdrawn`.

## My selling defaults

> Fill these in by interviewing the user on first setup. They override anything generic in the
> skill. Delete this quote block once filled.

**Delivery** — <pickup only / shipping only / both; which carriers; who pays postage>

**Payment** — <preferred method, fallback, and the confirm-before-handover rule>

**Address** — <use the `Deel adres` button; when it may be shared>

**Tone** — <language, formal or informal, how long a reply should be>

**Price floor** — set per item in `brief.md`. Never go below it in a drafted reply without asking.

## Hard rules

- Every outgoing message is drafted and shown to me before it sends. No exceptions.
- Never attempt to log in to Marktplaats. If not logged in, stop and ask me to do it.
- Never agree to move the conversation off-platform (WhatsApp, email) on the buyer's initiative.
- Never respond to a payment request "to verify my account" — that is always a scam. Flag it.
