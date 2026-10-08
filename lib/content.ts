import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { NOTE_SECTIONS, type Artifact, type Branch, type Content, type Delta, type Entry, type Roots } from './types';
import { MAX_BRANCHES, MIN_BRANCHES } from './tree-layout';

/**
 * The one loader. `next build`, `npm run content` and `npm test` all call
 * loadContent(), so the build, the report and the tests cannot disagree about
 * what the rules are.
 *
 * Errors throw with the file name. Warnings are collected and returned; the
 * report prints them and `--strict` makes them fatal.
 */

const DEFAULT_ROOT = path.join(process.cwd(), 'content');

function fail(file: string, message: string): never {
  throw new Error(`[content] ${file}: ${message}`);
}

/** Directories and files starting with "_" are preserved but not read. */
function mdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'))
    .sort();
}

/* ---------------------------------------------------------------- helpers */

function parseDelta(file: string, raw: unknown): Delta {
  if (!raw || typeof raw !== 'object') fail(file, 'delta must have then and now');
  const d = raw as { then?: { year?: unknown; text?: unknown }; now?: { year?: unknown; text?: unknown } };
  if (!d.then || typeof d.then.year !== 'number') fail(file, 'delta.then.year must be a number');
  if (typeof d.then.text !== 'string' || !d.then.text.trim()) fail(file, 'delta.then.text is required');
  if (!d.now || (d.now.year !== 'now' && typeof d.now.year !== 'number')) {
    fail(file, 'delta.now.year must be a number or "now"');
  }
  if (typeof d.now.text !== 'string' || !d.now.text.trim()) fail(file, 'delta.now.text is required');
  if (d.then.text.trim() === d.now.text.trim()) {
    fail(file, 'delta.then and delta.now say the same thing. The delta is the whole point: what changed?');
  }
  return {
    then: { year: d.then.year, text: d.then.text.trim() },
    now: { year: d.now.year as number | 'now', text: d.now.text.trim() },
  };
}

function parseArtifacts(file: string, raw: unknown): Artifact[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) fail(file, 'artifacts must be a list');
  return raw.map((a, i) => {
    const label = typeof a?.label === 'string' ? a.label.trim() : '';
    const href = typeof a?.href === 'string' ? a.href.trim() : '';
    if (!label) fail(file, `artifact ${i + 1} has no label`);
    if (!href || href === '#') {
      fail(file, `artifact "${label}" has no real link. An unlinked chip promises something and delivers nothing.`);
    }
    return { label, href };
  });
}

function parseStringList(file: string, key: string, raw: unknown): string[] {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw) || raw.some((s) => typeof s !== 'string')) fail(file, `${key} must be a list of strings`);
  return raw as string[];
}

/** Strip fenced code before looking at headings; a "#" inside a fence is code. */
function withoutCodeFences(body: string): string {
  return body.replace(/```[\s\S]*?```/g, '');
}

/**
 * Build-time guard for the three-level rule. A full note may contain only the
 * four sanctioned `##` headings, in order, each once, and nothing above or
 * below that level. A fourth level of depth is how portfolios die.
 */
export function validateNoteBody(file: string, body: string): void {
  if (!body) return;
  const text = withoutCodeFences(body);

  if (/^#\s/m.test(text)) {
    fail(file, 'full notes may not use a level-one heading. The title is the h1.');
  }
  if (/^#{3,}\s/m.test(text)) {
    fail(file, 'full notes may not use h3 or deeper. That is depth level four.');
  }

  const headings = [...text.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
  for (const h of headings) {
    if (!NOTE_SECTIONS.includes(h as (typeof NOTE_SECTIONS)[number])) {
      fail(file, `unexpected section "${h}". Allowed: ${NOTE_SECTIONS.join(', ')}`);
    }
  }
  if (new Set(headings).size !== headings.length) fail(file, 'duplicate section heading');

  const ordered = NOTE_SECTIONS.filter((s) => headings.includes(s));
  if (ordered.join('|') !== headings.join('|')) {
    fail(file, `sections must appear in order: ${NOTE_SECTIONS.join(', ')}`);
  }
  if (!headings.includes("What I'd redo")) {
    fail(file, 'every full note needs a "What I\'d redo" section, including the wins');
  }
}

/**
 * A heuristic, not a judge. A note whose body has no digit and no capitalised
 * word beyond the start of a sentence is describing a type of person rather
 * than a person. Reported as a warning with the file name.
 */
export function readsGeneric(body: string): boolean {
  const text = withoutCodeFences(body).replace(/^##.*$/gm, '');
  if (/\d/.test(text)) return false;
  const sentences = text.split(/(?<=[.!?])\s+|\n+/);
  return !sentences.some((s) =>
    s
      .trim()
      .split(/\s+/)
      .slice(1)
      .some((w) => /^[A-Z][a-z]{2,}/.test(w.replace(/^[*_("'“]+/, ''))),
  );
}

/* ---------------------------------------------------------------- loaders */

function loadBranches(root: string): Branch[] {
  const dir = path.join(root, 'branches');
  const branches = mdxFiles(dir).map((file) => {
    const id = `branches/${file}`;
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
    const slug = typeof data.slug === 'string' ? data.slug : file.replace(/\.mdx$/, '');

    for (const key of ['title', 'color', 'order', 'lead', 'delta'] as const) {
      if (data[key] === undefined) fail(id, `missing frontmatter key "${key}"`);
    }
    if (typeof data.color !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(data.color)) {
      fail(id, `color must be a six-digit hex, got "${data.color}"`);
    }
    if (typeof data.order !== 'number') fail(id, 'order must be a number');
    if (data.meta !== undefined) {
      fail(id, '"meta" is gone. The entry count and year span are computed from the entries and cannot be overridden.');
    }

    return {
      slug,
      title: String(data.title),
      color: data.color,
      order: data.order,
      lead: String(data.lead).trim(),
      delta: parseDelta(id, data.delta),
      body: content.trim(),
      formerly: parseStringList(id, 'formerly', data.formerly),
    } satisfies Branch;
  });

  branches.sort((a, b) => a.order - b.order);

  const slugs = new Set<string>();
  const orders = new Set<number>();
  for (const b of branches) {
    if (slugs.has(b.slug)) fail(`branches/${b.slug}.mdx`, 'duplicate branch slug');
    if (orders.has(b.order)) fail(`branches/${b.slug}.mdx`, `order ${b.order} is already taken. Orders must be unique.`);
    slugs.add(b.slug);
    orders.add(b.order);
  }
  for (const b of branches) {
    for (const old of b.formerly) {
      if (slugs.has(old)) fail(`branches/${b.slug}.mdx`, `formerly "${old}" is a live branch slug. A forwarder cannot shadow a real page.`);
    }
  }

  if (branches.length < MIN_BRANCHES) {
    fail('content/branches', `${branches.length} branches. Below ${MIN_BRANCHES} the tree stops being a tree; write a single page instead.`);
  }
  return branches;
}

function loadEntries(root: string, branches: Branch[]): Entry[] {
  const base = path.join(root, 'entries');
  const known = new Set(branches.map((b) => b.slug));
  const entries: Entry[] = [];
  if (!fs.existsSync(base)) return entries;

  for (const dirName of fs.readdirSync(base).sort()) {
    if (dirName.startsWith('_')) continue;
    const dir = path.join(base, dirName);
    if (!fs.statSync(dir).isDirectory()) continue;

    for (const file of mdxFiles(dir)) {
      const id = `entries/${dirName}/${file}`;
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
      const slug = typeof data.slug === 'string' ? data.slug : file.replace(/\.mdx$/, '');
      const branch = typeof data.branch === 'string' ? data.branch : dirName;

      if (!known.has(branch)) fail(id, `unknown branch "${branch}"`);
      if (typeof data.year !== 'number') fail(id, 'year must be a number');
      if (data.endYear !== undefined && typeof data.endYear !== 'number') fail(id, 'endYear must be a number');
      if (!data.title) fail(id, 'missing title');
      if (!data.summary) fail(id, 'missing summary (that is depth level one)');

      const body = content.trim();
      validateNoteBody(id, body);
      const artifacts = parseArtifacts(id, data.artifacts);
      if (body && artifacts.length === 0) {
        fail(id, 'a full note needs at least one artefact. A claim with no receipt is a claim anyone could make.');
      }

      entries.push({
        slug,
        branch,
        year: data.year,
        endYear: data.endYear,
        title: String(data.title),
        summary: String(data.summary).trim(),
        expanded: typeof data.expanded === 'string' ? data.expanded.trim() : undefined,
        where: typeof data.where === 'string' ? data.where : undefined,
        artifacts,
        grewInto: parseStringList(id, 'grewInto', data.grewInto),
        body,
      });
    }
  }

  const refs = new Set(entries.map((e) => `${e.branch}/${e.slug}`));
  for (const e of entries) {
    for (const r of e.grewInto) {
      if (!refs.has(r)) fail(`entries/${e.branch}/${e.slug}.mdx`, `grewInto points at "${r}", which does not exist`);
    }
  }

  // Oldest first: scrolling a branch moves you forward in years.
  entries.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
  return entries;
}

function loadRoots(root: string): Roots {
  const file = path.join(root, 'roots.mdx');
  if (!fs.existsSync(file)) fail('roots.mdx', 'missing. The roots page is required.');
  const { data, content } = matter(fs.readFileSync(file, 'utf8'));
  if (typeof data.title !== 'string' || !data.title.trim()) fail('roots.mdx', 'title is required');
  if (typeof data.lead !== 'string' || !data.lead.trim()) fail('roots.mdx', 'lead is required');
  const facts = parseStringList('roots.mdx', 'facts', data.facts);
  return { title: data.title.trim(), lead: data.lead.trim(), facts, body: content.trim() };
}

export function loadContent(root: string = DEFAULT_ROOT): Content {
  const branches = loadBranches(root);
  const entries = loadEntries(root, branches);
  const roots = loadRoots(root);
  const warnings: string[] = [];

  if (branches.length > MAX_BRANCHES) {
    warnings.push(`${branches.length} branches exceeds the canopy limit of ${MAX_BRANCHES}. The tree falls back to an arc; consider merging two.`);
  }
  for (const b of branches) {
    const own = entries.filter((e) => e.branch === b.slug);
    if (own.length === 0) warnings.push(`${b.slug} has no entries. It is a label, not a branch yet.`);
    else if (own.length < 3) warnings.push(`${b.slug} has ${own.length} ${own.length === 1 ? 'entry' : 'entries'}. Under three, consider folding it into another.`);
  }
  for (const e of entries) {
    if (e.body && readsGeneric(e.body)) {
      warnings.push(`${e.branch}/${e.slug}.mdx reads generic: no year, number or name in the body.`);
    }
  }
  return { branches, entries, roots, warnings };
}

/* ------------------------------------------------------------ site access */

let cache: Content | null = null;

/** Cached only in production builds. In dev, every request re-reads content/ so edits show without a restart. */
export function getContent(): Content {
  if (process.env.NODE_ENV !== 'production') return loadContent();
  return (cache ??= loadContent());
}

export const getBranches = () => getContent().branches;
export const getEntries = () => getContent().entries;
export const getRoots = () => getContent().roots;
export const getBranch = (slug: string) => getBranches().find((b) => b.slug === slug);
export const getEntriesForBranch = (branch: string) => getEntries().filter((e) => e.branch === branch);
export const getEntry = (branch: string, slug: string) => getEntries().find((e) => e.branch === branch && e.slug === slug);
/** Newest first, for the plain chronological view. */
export const getTimeline = () => [...getEntries()].reverse();
/** The live branch an old slug forwards to, if any. */
export const getBranchByFormerSlug = (old: string) => getBranches().find((b) => b.formerly.includes(old));

export function resolveRef(ref: string): { entry: Entry; branch: Branch } | null {
  const [branchSlug, entrySlug] = ref.split('/');
  const branch = getBranch(branchSlug);
  const entry = branch ? getEntry(branchSlug, entrySlug) : undefined;
  return branch && entry ? { entry, branch } : null;
}

export function formatYears(entry: Pick<Entry, 'year' | 'endYear'>): string {
  return entry.endYear && entry.endYear !== entry.year ? `${entry.year}–${entry.endYear}` : String(entry.year);
}

/** "2003–2020" for a list of entries, or "" for none. */
export function yearSpan(entries: Pick<Entry, 'year' | 'endYear'>[]): string {
  if (!entries.length) return '';
  const ys = entries.flatMap((e) => [e.year, e.endYear ?? e.year]);
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  return lo === hi ? String(lo) : `${lo}–${hi}`;
}

const lastYear = (e: Pick<Entry, 'year' | 'endYear'>) => e.endYear ?? e.year;

/** Entries on a branch dated the given year (start or end). Drives the ring on the tree. */
export function grownIn(entries: Entry[], year: number): number {
  return entries.filter((e) => e.year === year || e.endYear === year).length;
}

/** The last `n` years that have entries, newest first. Derived; nothing to maintain. */
export function recentGrowth(entries: Entry[], n = 3): Array<{ year: number; entries: Entry[] }> {
  const years = [...new Set(entries.map(lastYear))].sort((a, b) => b - a).slice(0, n);
  return years.map((year) => ({
    year,
    entries: entries.filter((e) => lastYear(e) === year).sort((a, b) => a.branch.localeCompare(b.branch)),
  }));
}
