#!/usr/bin/env python3
"""Check a visual's claim ledger against its raw sources.

Usage: python3 -I check-claims.py <visual folder>

Reads <folder>/build/claims.md, a markdown table with these columns:
  | id | claim | values | where | source | label |
- values: the literal facts the page shows (IPs, names, versions, numbers), separated by ';'
- where:  the model element that shows the claim (step id, node id, step number)
- source: a file name in <folder>/sources/ (the extension may be left out)
- label:  live | config | doc | assumed

For every row that is not 'assumed', each value must appear in its source file.
Prints one line per problem and a count per label. Exits 1 when a check fails.
"""
import pathlib
import sys

LABELS = ("live", "config", "doc", "assumed")


def rows(md):
    head = None
    for line in md.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if head is None:
            head = [c.lower() for c in cells]
            continue
        if set("".join(cells)) <= set("-: "):
            continue
        yield dict(zip(head, cells))


def find_source(src_dir, name):
    exact = src_dir / name
    if exact.is_file():
        return exact
    hits = sorted(src_dir.glob(name + ".*"))
    return hits[0] if hits else None


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    folder = pathlib.Path(sys.argv[1])
    ledger = folder / "build" / "claims.md"
    src_dir = folder / "sources"
    if not ledger.is_file():
        sys.exit(f"FAIL no claim ledger at {ledger}")
    fails, counts = [], {k: 0 for k in LABELS}
    for r in rows(ledger.read_text()):
        cid, label = r.get("id", "?"), r.get("label", "").lower().strip("` ")
        if label not in LABELS:
            fails.append(f"{cid}: label '{label}' is not one of {', '.join(LABELS)}")
            continue
        counts[label] += 1
        if not r.get("where"):
            fails.append(f"{cid}: no model element in 'where'")
        if label == "assumed":
            continue
        name = r.get("source", "").strip("` ")
        src = find_source(src_dir, name) if name else None
        if not src:
            fails.append(f"{cid}: source '{name}' not found in {src_dir}")
            continue
        text = src.read_text(errors="replace")
        for v in [v.strip().strip("`") for v in r.get("values", "").split(";")]:
            if v and v not in text:
                fails.append(f"{cid}: value '{v}' not in {src.name}")
    for f in fails:
        print("FAIL", f)
    total = sum(counts.values())
    print("claims:", total, "|", " ".join(f"{k} {n}" for k, n in counts.items()))
    sys.exit(1 if fails or not total else 0)


if __name__ == "__main__":
    main()
