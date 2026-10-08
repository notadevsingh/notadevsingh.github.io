/**
 * The rules, as tests. Each one builds a tiny content tree in a temp
 * directory and checks the loader's message. `npm test`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadContent, readsGeneric } from '../lib/content';

type Tree = Record<string, string>;

const branch = (slug: string, order: number, extra = '') => `---
slug: ${slug}
title: ${slug[0].toUpperCase()}${slug.slice(1)}
color: "#4A5D75"
order: ${order}
lead: A lead for ${slug}.
${extra}delta:
  then: { year: 2010, text: "Where it started." }
  now: { year: "now", text: "Where it is." }
---
`;

const entry = (year: number, title: string, extra = '', body = '') => `---
year: ${year}
title: ${title}
summary: One line about ${title}.
${extra}---
${body}`;

const NOTE = `## What it was
A firm in Leeds that moved 40 trucks a night.

## What I did
Cut the fleet to 31.

## What changed
Nine fewer trucks, same deliveries.

## What I'd redo
Started in March, not June.
`;
const EVIDENCE = `artifacts:
  - { label: "The plan", href: "/files/plan.pdf" }
`;
const ROOTS = `---
title: Roots
lead: Ground.
facts: ["School"]
---
Prose.
`;

/** Three branches, three entries each, one full note: the smallest clean garden. */
function base(): Tree {
  const t: Tree = { 'roots.mdx': ROOTS };
  for (const [slug, order] of [['one', 1], ['two', 2], ['three', 3]] as const) {
    t[`branches/${slug}.mdx`] = branch(slug, order);
    t[`entries/${slug}/2010-a.mdx`] = entry(2010, 'A');
    t[`entries/${slug}/2015-b.mdx`] = entry(2015, 'B');
    t[`entries/${slug}/2020-c.mdx`] = entry(2020, 'C');
  }
  t['entries/one/2020-c.mdx'] = entry(2020, 'C', EVIDENCE, NOTE);
  return t;
}

function write(tree: Tree): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bg-'));
  for (const [file, text] of Object.entries(tree)) {
    const full = path.join(root, file);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, text);
  }
  return root;
}

const load = (tree: Tree) => loadContent(write(tree));
const fails = (tree: Tree, needle: string) => assert.throws(() => load(tree), (e: Error) => e.message.includes(needle));

test('a clean garden loads with no warnings', () => {
  const c = load(base());
  assert.equal(c.branches.length, 3);
  assert.equal(c.entries.length, 9);
  assert.deepEqual(c.warnings, []);
});

test('fewer than three branches fails', () => {
  const t = base();
  delete t['branches/three.mdx'];
  for (const k of Object.keys(t)) if (k.startsWith('entries/three/')) delete t[k];
  fails(t, 'Below 3');
});

test('duplicate order fails', () => {
  const t = base();
  t['branches/three.mdx'] = branch('three', 2);
  fails(t, 'order 2 is already taken');
});

test('an identical then and now fails', () => {
  const t = base();
  t['branches/one.mdx'] = t['branches/one.mdx'].replace('Where it is.', 'Where it started.');
  fails(t, 'say the same thing');
});

test('a broken cross-link fails and names the file', () => {
  const t = base();
  t['entries/one/2010-a.mdx'] = entry(2010, 'A', 'grewInto: [two/nope]\n');
  fails(t, 'entries/one/2010-a.mdx: grewInto points at "two/nope"');
});

test('an unlinked chip fails', () => {
  const t = base();
  t['entries/one/2010-a.mdx'] = entry(2010, 'A', 'artifacts:\n  - { label: "Spec", href: "#" }\n');
  fails(t, 'artifact "Spec" has no real link');
});

test('a level-one heading in a note fails', () => {
  const t = base();
  t['entries/one/2020-c.mdx'] = entry(2020, 'C', EVIDENCE, `# A heading nobody sanctioned\n${NOTE}`);
  fails(t, 'level-one heading');
});

test('an h3 in a note fails', () => {
  const t = base();
  t['entries/one/2020-c.mdx'] = entry(2020, 'C', EVIDENCE, NOTE.replace('## What changed', '### Sub\n\n## What changed'));
  fails(t, 'h3 or deeper');
});

test('sections out of order fail', () => {
  const t = base();
  const swapped = NOTE.replace('## What it was', '## TEMP').replace('## What I did', '## What it was').replace('## TEMP', '## What I did');
  t['entries/one/2020-c.mdx'] = entry(2020, 'C', EVIDENCE, swapped);
  fails(t, 'sections must appear in order');
});

test('a note without "What I\'d redo" fails', () => {
  const t = base();
  t['entries/one/2020-c.mdx'] = entry(2020, 'C', EVIDENCE, NOTE.split("## What I'd redo")[0]);
  fails(t, "What I'd redo");
});

test('headings inside code fences are ignored', () => {
  const t = base();
  t['entries/one/2020-c.mdx'] = entry(2020, 'C', EVIDENCE, `${NOTE}\n\`\`\`\n# not a heading\n### nor this\n\`\`\`\n`);
  assert.doesNotThrow(() => load(t));
});

test('_retired directories and _files are skipped', () => {
  const t = base();
  t['entries/_retired/2001-old.mdx'] = entry(2001, 'Old');
  t['entries/one/_draft.mdx'] = 'not even valid';
  const c = load(t);
  assert.equal(c.entries.length, 9);
});

test('a formerly slug that collides with a live slug fails', () => {
  const t = base();
  t['branches/one.mdx'] = branch('one', 1, 'formerly: [two]\n');
  fails(t, 'formerly "two" is a live branch slug');
});

test('a thin branch is a warning, not an error', () => {
  const t = base();
  delete t['entries/two/2020-c.mdx'];
  const c = load(t);
  assert.ok(c.warnings.some((w) => w.includes('two has 2 entries')));
});

test('a full note with no evidence fails', () => {
  const t = base();
  t['entries/one/2020-c.mdx'] = entry(2020, 'C', '', NOTE);
  fails(t, 'a full note needs at least one artefact');
});

test('a generic note is a warning with the file name', () => {
  const t = base();
  const generic = NOTE.replace(/Leeds|40|31|Nine|March|June/g, 'the');
  t['entries/one/2020-c.mdx'] = entry(2020, 'C', EVIDENCE, generic);
  const c = load(t);
  assert.ok(c.warnings.some((w) => w.startsWith('one/2020-c.mdx reads generic')));
  assert.equal(readsGeneric(NOTE), false);
});

test('roots without a lead fails', () => {
  const t = base();
  t['roots.mdx'] = ROOTS.replace('lead: Ground.\n', '');
  fails(t, 'roots.mdx: lead is required');
});

test('the meta override is refused', () => {
  const t = base();
  t['branches/one.mdx'] = branch('one', 1, 'meta: "12 pieces"\n');
  fails(t, '"meta" is gone');
});
