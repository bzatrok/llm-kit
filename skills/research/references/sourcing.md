# Sourcing

Evidence is greppable, dated and diffable, or it is not evidence.

## Capture rules

- **Web page** → `sources/<slug>-YYYY-MM-DD.md`, headed with the URL, the capture
  timestamp, and how it was fetched:

  ```markdown
  # Gaslicht.com — vaste contracten Arnhem
  Source: https://www.gaslicht.com/energie-vergelijken
  Captured: 2026-08-10 14:22 CEST · WebFetch
  ```

- **PDF** → `sources/<Name>_<YYYY-MM-DD>.pdf` plus a `.txt` twin:

  ```sh
  pdftotext -layout "sources/Liander_netwerkkosten_gas_2026.pdf"
  ```

  The twin is what makes a quote greppable and a re-check diffable. Always make it.

- **Captures are immutable.** A page that changed is a **new** capture with a new date.
  Never edit a capture.

## How to fetch

| Target | Tool |
|---|---|
| Normal page | `WebFetch` |
| Reddit | `curl -s -A "Mozilla/5.0" "https://www.reddit.com/r/<sub>/top.json?t=week"` — `WebFetch` is blocked there. Append `.json` to any post URL for a thread. Rate-limited to ~10/min. |
| Blocked by fetch, or needs the user's own session | Chrome MCP |
| Behind a login | Stop and ask |

Chrome MCP stops at any login gate and asks. It never types credentials.

## Visual data

Charts, maps and image slots follow the same rule as numbers: captured, dated, in `sources/`.

- **Lead images** — when the report will show a product or listing photo, capture the URL and
  a local copy: `sources/img/<slug>-YYYY-MM-DD.<ext>`.
- **Geocodes** — capture coordinates as a dated source file,
  `sources/geocode-YYYY-MM-DD.md`, with the query, the result and the service used.
- **Time series** — fetch from primary data. FRED `.txt` pages work with `WebFetch`; ECB
  refuses `WebFetch`. Fetch overlapping ranges and check that the overlap matches.
- **Never invent** an image, a coordinate or a value. A missing one leaves the slot generic or
  the chart out, and goes in Gaps.

## Past-context archives

Searched during **phase 1 only**, for facts already established:

- `~/.claude/projects/*.jsonl` — coding and technical history. `grep -l` to find the
  session, then read that one.
- `~/_Claude_Chat_Backup/<date-range>/conversations.json` — background and non-coding
  history. 178 MB on one line. Use `jq`, never `Read`. See
  `your memory notes on the chat backup`.

Also grep the adjacent topic folders. A boiler model for a heating question is already in
`Energy/sources/AcmeHeat_Model200_install-guide_2024-09.txt`.

## Fan-out

Size the fan-out to the topic: one subagent per axis — comparison site, region, supplier
class, regulator. Two or three axes on a normal question. Cap eight concurrent.

Each subagent returns structured findings, never prose:

```
option | price | what is included | source URL | capture path | confidence
```

Each subagent writes its own raw capture into `sources/` before it returns.

## Private data

Private data arrives by hand. Name the specific file you need in the BRIEF's
*What I need from you*, then read what the user drops into `sources/`. Sensitive drops go to
`sources/private/`, which is gitignored.

No account integrations in v1 — no Gmail, Drive, bank or supplier API.

## Never

- No credentials, no login forms, no CAPTCHA solving.
- No email sent and no contact form submitted. Not even approval-gated. Use the call sheet.
- No number that does not resolve to a file in `sources/`.
- `trash`, never `rm`.
