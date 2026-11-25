#!/usr/bin/env python3
"""Build one Stack Underflow page from a search's JSON.

Usage: render.py <data.json> <out.html>

Checks the JSON against the shape the template expects, injects it into
template.html (next to this script) and writes a single self-contained page.
Exits non-zero with a list of problems when the JSON is wrong.
"""
import json
import pathlib
import sys

TEMPLATE = pathlib.Path(__file__).with_name("template.html")
PLACEHOLDER = "/*DATA*/"


def check(data):
    problems = []
    if not isinstance(data.get("query"), str) or not data["query"].strip():
        problems.append("query: missing")
    threads = data.get("threads")
    if not isinstance(threads, list) or not threads:
        return problems + ["threads: missing or empty"]
    ids = [t.get("id") for t in threads]
    if len(set(ids)) != len(ids):
        problems.append("threads: duplicate ids")
    for t in threads:
        where = "thread " + str(t.get("id"))
        for key in ("id", "title", "asked", "modified", "views"):
            if not isinstance(t.get(key), str):
                problems.append(f"{where}: {key} missing")
        if not isinstance(t.get("tags"), list):
            problems.append(f"{where}: tags missing")
        q = t.get("question") or {}
        posts = [("question", q)] + [(f"answer {i + 1}", a) for i, a in enumerate(t.get("answers", []))]
        for name, p in posts:
            if not isinstance(p.get("votes"), int):
                problems.append(f"{where} {name}: votes must be an integer")
            if not isinstance(p.get("body"), str):
                problems.append(f"{where} {name}: body missing")
            if not isinstance((p.get("author") or {}).get("name"), str):
                problems.append(f"{where} {name}: author.name missing")
            for i, c in enumerate(p.get("comments") or []):
                if not isinstance(c.get("votes"), int):
                    problems.append(f"{where} {name} comment {i + 1}: votes must be an integer")
                for key in ("text", "author", "ago"):
                    if not isinstance(c.get(key), str):
                        problems.append(f"{where} {name} comment {i + 1}: {key} missing")
        if sum(1 for a in t.get("answers", []) if a.get("accepted")) > 1:
            problems.append(f"{where}: more than one accepted answer")
        closed = t.get("closed")
        if closed and closed.get("reason") == "duplicate" and closed.get("of") not in ids:
            problems.append(f"{where}: closed as duplicate of unknown id {closed.get('of')}")
    return problems


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    src, out = map(pathlib.Path, sys.argv[1:])
    try:
        data = json.loads(src.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        sys.exit(f"{src}: invalid JSON: {e}")
    problems = check(data)
    if problems:
        sys.exit("\n".join(problems))
    # "</" would end the <script> block early; JSON allows the escaped form.
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    out.write_text(TEMPLATE.read_text(encoding="utf-8").replace(PLACEHOLDER, payload), encoding="utf-8")
    print(out)


if __name__ == "__main__":
    main()
