# Research and truth checks for visual pages

Every `visual-*` skill follows this file. The short rules in each SKILL.md point here. The order is: agree on what to show → research the input → build → check the layout → check the truth.

Screenshots check the layout. They do not check the facts. A polished page with a wrong fact is worse than wrong prose, because the reader trusts it more.

## Research the input (after approval, before the model)

1. **Claim list.** Turn the approved statement into the claims that the page will make. One part, hop, step, decision, state or number is one claim. Write them as rows in `build/claims.md` (format below) before you collect anything.
2. **Source map.** For each claim, write where the truth lives and how to read it: a command, a file path or a URL. Prefer the system itself to a description of it.
3. **Find the deployed source, not the nearest one.** A repo can hold a base config while the deployed values live in an overlay, another repo, a GitOps app, a lockfile or the live resource. Look for the file that the deploy really reads. If you cannot find it, label the claim one level lower and say so.
4. **Trust order.** Live state > deployed config > repo default or base > current doc > old doc > memory. A stronger source wins. Check a doc against live names and dates: old resource names or old host names mean an old doc.
5. **Capture raw output.** Save each command output, file or fetch to `sources/<id>.<ext>`. For command output, the first line is the exact command and the date. Never write a model value from memory of a chat or a terminal.
6. **Cross-check.** Check each central claim against a second source where one exists, for example the manifest against the live resource. A mismatch is a finding. Report it. Do not pick one value quietly.
7. **Label each claim**: `live`, `config`, `doc` or `assumed`, with its source id.
8. **Gates.** Ask before you read production, read credentials, or send traffic (a probe, a test request, a load). A refused read stays `doc` or `assumed`.
9. **Stop rule.** Build when every claim has a label. A central claim that is `assumed` needs the user's OK before the build. A central claim is one without which the approved statement is not true.

## Claim ledger format (`build/claims.md`)

```
| id | claim | values | where | source | label |
|----|-------|--------|-------|--------|-------|
| c1 | Public host resolves straight to the gateway | 203.0.113.10 | step dns | dig-public | live |
| c2 | Probe accepts 404 | 200-399,404 | step healthy | ingress-base | config |
| c3 | Attack traffic is dropped | | end_drop | | assumed |
```

- **values**: the literal facts that the page shows (IPs, names, versions, numbers, status codes), separated by `;`. Leave it empty only for a claim that has no literal value.
- **where**: the model element that shows the claim.
- **source**: a file name in `sources/`. The extension may be left out.

## Check the truth (after the build, before the hand-over)

1. **Ledger check.** Run `python3 -I check-claims.py <visual folder>` from the `explain` skill folder. It fails when a value is not in its source, when a source is missing, or when a row has no label or no model element. Fix the model or the label, then run it again.
2. **Coverage.** Every fact on the page (each IP, name, number and branch) has a ledger row. Read the model once against the ledger, element by element. A fact with no row is a claim that you did not research.
3. **Behaviour.** Config shows what is set, not what happens. Where a cheap and safe probe exists (a `curl -I`, a health endpoint, a dry run, a backend-health read), run it, capture it and cite it. The gates still apply.
4. **Refresh script.** Save the read-only collection commands as `build/refresh.sh`. It writes into `sources/` again, so a later run shows drift with `git diff --no-index` or a new ledger check.
5. **Fresh eyes on the facts.** A subagent that did not write the model gets the page, `build/claims.md` and `sources/` only. For each fact on the page, it answers: traced, doc only, assumed, wrong, or no row. Fix every "wrong" and every "no row". This review is part of every build. Skip it only when the user says so.
6. **Show the evidence on the page.** The intro line gives the mix ("14 live, 3 config, 2 doc, 1 assumed") and names the scope that was not checked, such as an environment. Each tip or caption for a claim that is not `live` or `config` starts with `doc:` or `assumed:`.
7. **Hand-over.** List the claims that are `doc` or `assumed`, every mismatch you found, the checks you skipped, and why.
