# Changelog

## v3 · polish before personal notes

Three priorities, in order.

**Writing rules that resist generic prose.**
- A full note must carry at least one artefact (`artifacts:`). Enforced.
- The report warns when a note body has no year, number or proper noun in it;
  `--strict` (and CI) makes that fatal.
- The sample note's four sections now ask for a year, a place, a number, a
  name, and a document.
- "Artefacts" on the note page is now "Evidence" (`lib/copy.ts`).

**Growth, visible and derived.**
- The colophon shows the build date ("Last tended …").
- A branch with an entry dated this year wears a dashed ring on the tree and
  its card says "n this year".
- The roots page ends with "Recent growth": the last three years with
  entries, grouped by year.

**Geometry.** The canopy table already covered 3 to 8; confirmed and
documented. Adding a seventh branch redraws the tree.

## v2 · rebuild

- One loader (`lib/content.ts`) behind the build, the report and the tests.
  `npm run content` cannot disagree with `next build`.
- Enforced: delta lines differ; `grewInto` targets exist; artefact chips have
  real links; no `#` heading in a note; `_retired/` and `_files` skipped;
  roots validated; `formerly` cannot shadow a live slug; `meta` removed.
- Tree clusters are labelled links with focus rings. Tree colours are tokens.
- Dark colour scheme, token-only.
- Fonts self-hosted at build via `next/font/google`.
- Masthead marks the current page (`NavLink`).
- Branch body renders as MDX (`Prose`), same as notes and roots.
- Entry rows show "Read the full note" when a note exists.
- Content links are prefixed with the basePath (`lib/paths.ts`, `Chips`).
- Timeline: real Branch header, dot always with its name, legend links.
- Renamed slugs forward on any host (`formerly:` → static forwarder pages).
- Link previews and canonical URLs (`metadataBase`, OpenGraph).
- Dev server re-reads content on every request.
- `GUIDE.md` + `CONTENT.md` merged into `HANDBOOK.md`; each rule says whether
  the loader enforces it.
- Template wording in `lib/copy.ts`; `lib/site.ts` is the only personal file.
- `npm test`: one test per rule. CI runs tests and the strict report before
  building.
- Reset skeleton (three branches × three entries) passes its own report.
- Dead `lint` script and shipped `next-env.d.ts` removed.

## v1

The template as first shared.
