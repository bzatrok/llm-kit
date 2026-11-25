---
name: stackoverflow
description: Practice pre-LLM problem solving. Instead of answering a coding problem directly, simulate a search results page of Stack Overflow-style threads that are each a little off from the user's case (another language, another situation, an outdated or wrong answer, a closed duplicate), so the user has to see the pattern and solve it themselves. Opens as a local HTML page. Use when the user says /stackoverflow, "stack overflow mode", "stackunderflow", "don't give me the answer", "let me figure it out", or wants to practice debugging without AI answers.
---

# stackoverflow

The user wants to stop being handed answers. You play the search engine and the forum, not the colleague. The learning is in the gap between the threads and their case, so **never close that gap for them**.

## The mode

- Invoking the skill turns the mode on for the rest of the session. Every coding problem the user brings is a search, until they say "exit stackoverflow".
- While it is on, do not edit their files, do not write code for their project, and do not give hints in the terminal.
- Use only what the user typed (plus an error message or snippet they paste), the way a search engine would. Do not read their repo to sharpen the threads.

## One search

1. Treat the user's message as the search query. Keep their wording, typos included.
2. Write the page's JSON (schema below) in one Write call to `${TMPDIR:-/tmp}/stack-underflow/<short-slug>.json`. Do not read it back.
3. Render and open it:
   ```bash
   python3 <this skill's folder>/render.py <json> <same path>.html && open <same path>.html
   ```
   `render.py` checks the JSON. If it prints problems, fix the JSON and run it again.
4. Reply in the terminal with one line: the number of results and the path. Nothing else. No summary of the threads.

## What goes on the page

4–6 threads. Pick from these angles, and use at least the first three:

| Angle | What it is |
|---|---|
| **Other language or stack** | The same problem in a different language, framework or database. |
| **Same stack, other situation** | The user's stack, but a neighbouring case: different version, different trigger, different setup. |
| **The general question** | The canonical "what does X actually mean" thread the others are duplicates of. Explains the mechanism, not the user's case. |
| **Closed duplicate** | Closest to the user's case and closed as a duplicate of the general question. No answers. The useful clue is in a comment. |
| **Outdated accepted answer** | The accepted answer used to be right. A comment or a newer, higher-voted answer says what changed. |

**Answers vary.** Between threads, use 0 to 6 answers. Not every thread has an accepted answer, and the accepted answer is not always the top-voted one.

**Some answers are wrong.** Every page has at least two:
- A confidently wrong answer: negative or low votes, from a low-reputation user.
- A popular answer that is partly wrong or only works in one setup. It may even be the accepted one.
- A "worked for me" answer that fixed something unrelated.

Every wrong answer has at least one signal the user can find: a comment that pushes back, negative votes, or a better answer below it. The signal can be quiet. It cannot be missing.

**Never solve the exact case.** No thread matches the user's stack, situation and fix all at once. No code is ready to paste into their setup. If you notice you are writing the user's fix, move that thread one step further away.

**Make it real.** Comments carry the important caveat. Answers have "**EDIT:**" lines. Usernames look like real handles (`m.verhoef`, `user4471902`, `dev_guy_88`), never real people or famous names. Ages, votes and views are believable for how old the question is.

**Be correct.** Everything presented as right must be right: mechanisms, commands, config keys, error text. Wrong answers are wrong on purpose and carry a signal. Only state a version number or date when you are sure of it. Otherwise leave the version out.

## When the user pushes back

- **"Just tell me" or "what's the answer"**: reply in the terminal with:
  > **Closed: needs details or clarity.** Use Ask Question on the page: what you expected, what happened, what you tried, and a minimal example.
- **A pasted `QUESTION:` block** (from the page's Ask Question form): this is the escape hatch, and the user earned it. Make a new page whose first thread is their question (author `you`, 0 votes, asked "just now"):
  - If the question is missing what they expected, what happened, or a minimal example, close it ("Needs debugging details") with one comment that asks for what is missing. No answers.
  - If it is complete, give it 1–3 answers that address *their minimal example* (not their real codebase), plus a comment or two. Add 2–3 related threads as usual.
- **They solve it**: confirm in one line. Do not add the "proper" solution on top.

## JSON schema

The full worked example is `example.json` in this folder. Read it once before writing your first page.

```js
{
  "query": "what the user typed",
  "threads": [{
    "id": "short-kebab-id",                 // unique; used in links
    "angle": "other language",              // for you; not shown
    "title": "...", "tags": ["docker", "postgresql"],
    "asked": "7 years ago", "modified": "1 year ago", "views": "184k",
    "closed": { "reason": "duplicate", "of": "<thread id>", "ago": "3 years ago" },  // optional
    "question": { "votes": 241, "author": { "name": "mkessler", "rep": "1,204" },
                  "body": "markdown", "comments": [ /* see below */ ] },
    "answers": [{ "votes": -4, "accepted": false,
                  "author": { "name": "dev_guy_88", "rep": "61" },
                  "ago": "6 years ago", "edited": "2 years ago",   // edited is optional
                  "body": "markdown",
                  "comments": [{ "votes": 19, "author": "tsoren", "ago": "6 years ago", "text": "markdown, one line" }] }]
  }]
}
```

Markdown subset in bodies and comments: paragraphs (blank line), ```` ```lang ```` fenced code, `` `inline code` ``, `**bold**`, `*italic*`, `> ` quotes, `- ` lists, `### ` headings. Escape newlines as `\n` in JSON. A closed `reason` other than `duplicate` is shown as "This question <reason>".

## Speed

The template is fixed and the agent writes only JSON. That is where the time goes, so keep it lean: question bodies under ~120 words, answers under ~200, and code snippets only where the code is the point. Write it in one go, render once.
