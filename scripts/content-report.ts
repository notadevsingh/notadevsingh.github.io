#!/usr/bin/env tsx
/**
 * npm run content            a read-only picture of the content tree
 * npm run content -- --strict  warnings are fatal (CI runs this before deploy)
 *
 * Same loader as the build, so anything that would fail `next build` fails
 * here first, with the file name. Then the report: branch sizes, warnings,
 * and the then/now sequences read end to end, which is the one peer-review
 * test the HANDBOOK considers the whole thesis.
 */
import { loadContent } from '../lib/content';

const strict = process.argv.includes('--strict');
const pad = (s: unknown, n: number) => String(s).padEnd(n);

let content;
try {
  content = loadContent();
} catch (err) {
  console.error(`\n${(err as Error).message}\n`);
  process.exit(1);
}

const { branches, entries, warnings } = content;

console.log('\nBranches\n');
console.log(`  ${pad('order', 6)}${pad('slug', 22)}${pad('entries', 9)}${pad('notes', 7)}span`);
console.log(`  ${'-'.repeat(58)}`);
for (const b of branches) {
  const own = entries.filter((e) => e.branch === b.slug);
  const ys = own.flatMap((e) => [e.year, e.endYear ?? e.year]);
  const span = ys.length ? `${Math.min(...ys)}–${Math.max(...ys)}` : '—';
  console.log(`  ${pad(b.order, 6)}${pad(b.slug, 22)}${pad(own.length, 9)}${pad(own.filter((e) => e.body).length, 7)}${span}`);
}
console.log(
  `\n  ${branches.length} branches, ${entries.length} entries, ${entries.filter((e) => e.body).length} full notes, ${entries.filter((e) => e.expanded).length} expanded inline.`,
);

console.log('\nThen, top to bottom\n');
for (const b of branches) console.log(`  ${pad(b.delta.then.year, 6)}${b.delta.then.text}`);
console.log('\nNow, top to bottom\n');
for (const b of branches) console.log(`  ${pad(b.delta.now.year, 6)}${b.delta.now.text}`);
console.log('\n  Does a person emerge? That is the test.');

if (warnings.length) {
  console.log(`\n${strict ? 'Failing on' : 'Worth looking at'}\n`);
  for (const w of warnings) console.log(`  · ${w}`);
}
console.log('');
if (strict && warnings.length) process.exit(1);
