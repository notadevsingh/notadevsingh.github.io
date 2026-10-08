# Handbook

Part one: filling the structure in, field by field, with the writing rules.
Part two: changing the structure, and what breaks when you do.

Each rule says whether the loader **enforces** it (the build fails and names
the file), **warns** about it (`npm run content` lists it; `--strict` fails),
or leaves it to you.

---

# Part one: fields and writing rules

## 1. You

`lib/site.ts`. The only file in the repo that knows who you are.

```ts
name: 'Your Name',
role: 'Your role',
title: 'Everything that grew alongside the work',   // headline, no full stop
description: '...',                                 // how to read the site, not a career summary
url: 'https://example.com',                         // canonical URLs and link previews
email: 'you@example.com',
links: [{ label: 'LinkedIn', href: '...' }, { label: 'GitHub', href: '...' }],
```

Do not count the branches in `description`. The page counts them itself.

Template wording (button labels, headings such as "Evidence") lives in
`lib/copy.ts`. Change it if you want the site to speak differently, but never
put a fact about yourself there.

## 2. A branch

`content/branches/<slug>.mdx`. One file per branch. **Three to eight of them:
enforced** (fewer fails; more falls back to an arc layout and warns).

```yaml
---
slug: practice                    # the URL. Changing it later: see "Renaming".
title: Practice                   # free to change any time
color: "#4A5D75"                  # six-digit hex. Enforced.
order: 1                          # unique. Enforced. Sets card order and canopy position.
lead: One sentence. The only line that shows on the tree.
delta:
  then: { year: 2010, text: "Where this started." }
  now:  { year: "now", text: "Where it is now." }
formerly: [quality]               # optional. Old slugs that should forward here.
---

An optional paragraph that opens the branch page. Rendered as MDX.
```

The entry count and year span under each card are computed from the entries.
There is no field that overrides them; a card cannot claim more than the
branch delivers.

### The delta is the whole thing

If you write one field carefully, write this one. Two lines, and they must
differ. **Enforced**: identical text fails the build. Different-but-not-really
is yours to catch, and the report prints every then-line and now-line in
sequence so you can.

Weak, because it is the same sentence twice:

> then: Learning the craft.
> now: Still learning the craft, at a higher level.

Working, because something changed:

> then: Doing the task as handed to me, in an organisation that had many like me.
> now: Deciding which tasks are worth handing to anyone, and defending that choice.

### `lead` vs the body paragraph

`lead` is for a stranger scanning six cards in five seconds. The body is for
someone who has clicked. If the body only restates the lead, delete the body.

### Order

`order: 1` gets the largest, most central canopy cluster. Put the branch that
is the trunk of the whole thing first. Professional branches generally go
before personal ones, so the five-second serious check passes first.

## 3. An entry

`content/entries/<branch>/<year>-<slug>.mdx`. The directory name must match
the branch slug. **Enforced.**

```yaml
---
year: 2019               # number. Enforced.
endYear: 2021            # optional, renders as a range
title: The thing that happened
summary: One line. Required. Enforced.
expanded: >              # optional. Renders inline on the branch page.
  Three or four sentences.
where: An organisation, a place, or who with
artifacts:               # evidence. Required on a full note. Enforced.
  - { label: "The plan", href: "/files/plan.pdf" }
grewInto:                # cross-branch links. Must exist. Enforced.
  - teaching/2021-writing-it-down
---

## What it was
## What I did
## What changed
## What I'd redo
```

Everything except `year`, `title` and `summary` is optional, and **most
entries should use nothing else.** A branch of one-liners with two expanded
entries reads well. A branch where everything is expanded reads like a wall.

### The three levels

| Level | Field | Shows on | Length |
|---|---|---|---|
| One | `summary` | branch page, timeline | one sentence |
| Two | `expanded` | branch page, inline | three or four sentences |
| Three | the MDX body | its own page | four sections |

An entry with no body gets no link and stays a one-liner. That is the correct
default. An entry with a body gets a "Read the full note" link under it.

### The four sections

These are the only `##` headings allowed, in this order, each once. No `#`
(the title is the h1) and no `###` at all. **Enforced**, and the message names
the file. Headings inside code fences are ignored.

**What it was.** Two or three sentences, and at least one of them carries a
year, a place, or a number. "A logistics firm" is a category anyone could
type; "a firm that moved 40 trucks of produce a night between two cities" is a
fact only you would know.

**What I did.** The specific calls *you* made, not the team's. Where you were
wrong first is more interesting than where you were right. Dates and names
belong here: the month it turned, the person who disagreed, the document that
settled it.

**What changed.** The outcome in whatever unit is honest: a number, a date it
stopped hurting, a thing the team does differently now. A vague impact claim
is worse than none.

**What I'd redo.** One thing. Required on every note, including the wins.
**Enforced.** A note with no regret in it is a note nobody believes.

### Specific beats fluent

The site is competing with text that is fluent and general. What generated
prose cannot supply is the month, the name, the count and the receipt. Two
rules back this up:

- **A full note needs at least one artefact. Enforced.** A commit, a photo, a
  document, a colleague's write-up: something outside the page a reader can
  check. One-liners and expanded entries are exempt; only level three must
  show its work.
- **A note with no digit and no proper noun in its body reads generic. Warns.**
  It is a heuristic, not a judge. It runs in `npm run content` and names the
  file; `--strict` makes it fatal, and CI runs strict.

### `expanded`

Ends on the tension, not the tidy summary. Its job is to make someone decide
whether to click, and an unresolved thread does that better than a conclusion.

### `artifacts`

Things a reader can actually open. **Enforced**: an empty or `#` href fails.
Paths starting with `/` are served from `public/` and prefixed with the
basePath for you on GitHub Pages.

### `grewInto`

Cross-branch links, `branch/entry-slug`. **Enforced**: a ref to a missing entry
fails the build. Use them sparingly and only where the connection is real.
When they are real they are the best thing on the page, because they are the
evidence that the branches are one person rather than six lists.

## 4. The roots page

`content/roots.mdx`. One written page, not a list of entries. `title` and
`lead` **enforced**; `facts` optional, rendered as chips.

```yaml
---
title: Below the soil line
lead: One line under the heading. Also shown on the home page.
facts:
  - "Short items, rendered as chips"
---

Prose.
```

What goes here: schooling, the degree, where you grew up, languages,
certifications. Then the things that are true about you but sit awkwardly on a
branch: a move, a house, a year that went badly.

Below the prose the page lists **recent growth**: the last three years with
entries, derived from the branches. Nothing to maintain.

### On the honest material

The instinct is to leave out the bad year, the job you left badly, the thing
that did not work. Keep them, and frame them from your own side. A degree that
started at the bottom and finished well says more about how you operate than a
flat good result. A job you left over a disagreement becomes usable the moment
the sentence is about your standard rather than their behaviour.

If you have no failures worth listing, do not invent gravitas. Say the
formative things plainly and let the page be short.

## 5. Images and files

Anything in `public/` is served from the root. Reference it as `/files/x.pdf`
in `artifacts` or in note bodies; the basePath is added for you.

## 6. Growth, visible

Three things on the site say when it was last tended, all derived:

- The colophon shows the build date.
- A branch with an entry dated this year wears a dashed ring on the tree, and
  its card says "1 this year".
- The roots page lists recent growth by year.

None of these need a field. Add an entry and they update; stop adding and
they fade.

## Checks before you publish

- [ ] `lib/site.ts` has no placeholder left in it, including `url`
- [ ] Every delta's two lines differ in substance, not volume
- [ ] Reading all the then-lines, then all the now-lines, a person emerges
- [ ] No two branch leads could be swapped unnoticed
- [ ] Every full note has a "What I'd redo" you would say aloud
- [ ] `npm run content -- --strict` passes

---

# Part two: structure and change

Adding an entry needs no planning. Adding a branch does, because a branch is a
claim about who you are, and six loose claims read worse than four sharp ones.

## Where the constraints live

**Branch count: 3 to 8.** Below three the tree is not a tree and the build
refuses. Above eight the canopy falls back to an arc and warns. Every count
from three to eight has a hand-tuned canopy row in `lib/tree-layout.ts`.

**Depth: exactly three levels.** Not adjustable. The single most valuable rule
in the repo.

**Entries per branch: three is the floor.** Warns. A branch with two entries
is a label you liked the sound of.

Run `npm run content` before and after any structural change.

## Does this branch deserve to exist?

Four tests. A branch should pass all of them.

1. **It has its own then-and-now** that you could write honestly and that
   differ. If not, it is a topic rather than a branch.
2. **It has three or more entries spanning years.** Three entries all from
   2024 is a project, and projects are entries.
3. **It would not collapse into a neighbour without loss.** If merging loses
   nothing, merge.
4. **A stranger could tell it apart from the others in one line.**

## Adding a branch

1. At eight already? This is a merge decision, not an add.
2. Pick a colour. All branch colours sit at roughly equal chroma against the
   warm paper; that shared muting is what stops the tree looking like a pie
   chart. The sample six: `#4A5D75` `#C39A4B` `#8A6076` `#7A8C63` `#5F8078`
   `#B4674A`. For a seventh, a slate around `#6B7385` or a dusty olive around
   `#8C8A5E` sit well. `#8E7A5E` earth is reserved for the roots.
3. Write `content/branches/<slug>.mdx` with a unique `order`.
4. Give it three entries immediately, oldest and newest included so the span
   is real. A branch shipped empty tends to stay empty.
5. `npm run content`, `npm run dev`, look at the tree. The canopy redraws
   itself; check the new cluster is not sitting somewhere awkward.

## Removing a branch

The entries are the problem, not the branch file. Decide what happens to them
before you delete anything.

**Fold them into another branch** (the usual right answer): move the files,
update or remove each `branch:` field, delete the branch file, and rewrite the
survivor's `lead` and `delta`, which now cover more ground.

**Retire them**: move to `content/entries/_retired/`. Anything starting with
`_` is preserved but not read. Same for a single file: `_draft.mdx`.

Either way: `grep -rn "<dying-slug>/" content/` for cross-links (the build
will catch them too), close the `order` gap, and add the old slug to the
survivor's `formerly:` so old addresses forward.

## Merging two branches

The move to reach for more often than adding. Pick the survivor, move the
entries, **rewrite the delta** to cover both (if you cannot, the merge is
wrong), delete the loser, close the gap, add `formerly`.

## Renaming or reslugging

`title` is free to change. `slug` is the URL. If you must change it:

```bash
git mv content/branches/old.mdx content/branches/new.mdx
git mv content/entries/old content/entries/new
# update slug: in the branch file and any branch: fields in the entries
```

Then `formerly: [old]` in the new branch file. The build emits a forwarder page
at `/b/old` and at `/b/old/<every-entry>`, each with a meta refresh and a
canonical pointing at the live address. Works on GitHub Pages, Vercel,
anywhere. A `formerly` slug that collides with a live slug fails the build.

Renaming an *entry* breaks any `grewInto` pointing at it, which the build
catches.

## Reordering

Change the `order` numbers. Unique, sorted ascending, and the canopy
assignment follows, so a reorder visibly redraws the tree.

## Changing the tree itself

`lib/tree-layout.ts` holds a table keyed by branch count. Each row is an
ordered list of cluster positions in the 560×620 viewBox, largest and most
central first. Silhouettes are wobbled deterministically from the index, so
every build produces the same shape. To tune a count, edit its row. The trunk,
soil line and roots are fixed paths and do not respond to count.

## Pre-commit checklist for any structural change

- [ ] `npm run content -- --strict` clean
- [ ] Every branch has three or more entries spanning years
- [ ] `order` values unique and contiguous
- [ ] `formerly` added for any slug that changed
- [ ] `npm run build` passes
- [ ] Home page tree looked at, not just built
