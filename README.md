# Branch Garden

A portfolio organised as **domains rather than one timeline**. Three to eight
branches, each one a part of your life; reading down a branch moves you
forward in years, so depth is literally time.

It exists because a chronological portfolio is a prettier LinkedIn. A timeline
lists what you did. This states what changed: every branch opens with one line
about where it started and one about where it is now, which is the claim a
résumé structurally cannot make.

Next.js App Router, MDX content, no CSS framework, no database. Deploys as a
normal app (Vercel, Cloudflare) or a fully static export (GitHub Pages).

```bash
npm install
npm run dev
```

The repo ships with sample content so it renders immediately. It is fictional,
about nobody, and demonstrates the shape. Read it, then `npm run reset`.

---

## The three ideas

**Domains as branches, chronology as texture.** A pure timeline flattens you
into a job history. Pure domains go flat the other way, with no sense of
movement. Putting years *inside* domains gives both: the shape of the person,
and the direction of travel.

**Exactly three levels of depth.** One line on the tree, a paragraph on the
branch, a full note on its own page. There is no fourth level and the build
enforces it. Portfolios die from level four.

**A roots layer below the soil line.** Schooling, the formative years, the
things that sit awkwardly on a branch. It is where the honest material goes:
the year that started badly, the job you left. Not a failure section; ground.

---

## Five commands

```bash
npm run dev          # http://localhost:3000, re-reads content on every request
npm run content      # the report: branch sizes, warnings, then/now read end to end
npm test             # the content rules, as tests
npm run check        # tsc
npm run build        # production build; runs the same loader as the report
```

`npm run content` is the one to run while thinking. It tells you which
branches are too thin, which notes read generic, and prints every branch's
then-line and now-line in sequence so you can see whether a person emerges.
`npm run content -- --strict` makes warnings fatal; CI runs that before every
deploy.

---

## What's here

```
app/
  page.tsx                  the tree
  b/[branch]/               a branch: depth level two
  b/[branch]/[entry]/       the full note: depth level three
  timeline/                 plain chronological view, the recruiter escape hatch
  roots/                    below the soil line, plus recent growth
  globals.css               all styling; tokens at the top, dark scheme just below
components/
  Tree.tsx                  the illustration. Every cluster is a link.
  BranchCard, EntryRow, ThenNow, Chips, BranchDot, Prose, NavLink, Masthead, Forwarder
lib/
  site.ts                   your name, links, url. The only file about you.
  copy.ts                   the template's wording. Change it if you want; it is not about you.
  content.ts                the one loader: reads, validates, warns
  tree-layout.ts            canopy layouts for 3 to 8 branches
  paths.ts                  basePath-safe links for content hrefs
  types.ts                  the content shapes
content/
  branches/*.mdx            one file per branch
  entries/<branch>/*.mdx    everything that happened
  roots.mdx                 the formative layer, one written page
scripts/
  content-report.ts         npm run content
  reset-content.mjs         npm run reset
tests/content.test.ts       one test per rule
```

---

## Filling it in

**[HANDBOOK.md](./HANDBOOK.md)** is the one document. Part one covers every
field and the writing rules; part two covers changing the shape (adding,
merging, renaming branches) and what breaks.

Short version:

1. `lib/site.ts`: your name, email, links, url. The only file with you in it.
2. `npm run reset`: clears the samples, leaves a three-branch skeleton that
   passes its own report.
3. Write branches, then entries. Directory name must match the branch slug.
4. `npm run content`, then `npm run dev`.

Each rule in the handbook says whether the loader enforces it. The ones it
does: three to eight branches, unique orders, a delta whose two lines differ,
exactly four sections in a note in a fixed order with "What I'd redo" present,
no h1 or h3 in a note, every artefact chip linked, every full note carrying at
least one artefact, every `grewInto` pointing at a real entry. The ones it
warns about: thin branches, notes with no year, number or name in them.

---

## Getting feedback on your structure

The point of the branch layout is that it is arguable, so argue about it
before you write twenty entries. Give a peer `npm run content` output and ask:

1. **Read the branch names and leads. Can you tell them apart?** If two could
   be swapped without anyone noticing, that is one branch in two hats.
2. **Which branch is doing the least work?** There is usually one that exists
   because you liked the word.
3. **Read the then-lines end to end, then the now-lines. Does a person
   emerge?** The report prints both sequences for exactly this.
4. **What's missing that you'd expect from someone like me?** The gap people
   name is often the branch you were avoiding.

---

## Deploying

### Vercel or Cloudflare Pages

Import the repo. No configuration. Set `url` in `lib/site.ts` so canonical
URLs and link previews are right.

### GitHub Pages

`.github/workflows/deploy.yml` handles it. Two things:

1. Settings → Pages → Source: **GitHub Actions**.
2. Project repo: leave `BASE_PATH` as is. User site (`<you>.github.io`): set it
   to an empty string.

Static export is switched on by `DEPLOY_TARGET=pages`, which the workflow sets.
Locally you always get a normal dev server with no `basePath`. Content links in
`artifacts` are prefixed for you.

**Renaming a branch on GitHub Pages:** there are no server redirects, so add
the old slug to `formerly:` in the branch file and a forwarder page is built at
every old address. Works on any host.

---

## Licence

MIT. Use it, fork it, strip it for parts.
