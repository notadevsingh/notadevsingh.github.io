#!/usr/bin/env node
/**
 * npm run reset
 *
 * Clears the sample content and leaves the smallest structure that still
 * builds and passes its own report: three branches, three placeholder entries
 * each spanning years, and a roots page. Run it once you have read the
 * samples and are ready to write your own.
 *
 * This deletes files. It asks first unless you pass --force.
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';

const ROOT = path.join(process.cwd(), 'content');
const force = process.argv.includes('--force');

const SKELETON = [
  { slug: 'one', title: 'First branch', color: '#4A5D75', order: 1 },
  { slug: 'two', title: 'Second branch', color: '#C39A4B', order: 2 },
  { slug: 'three', title: 'Third branch', color: '#7A8C63', order: 3 },
];

const branchFile = (b) => `---
slug: ${b.slug}
title: ${b.title}
color: "${b.color}"
order: ${b.order}
lead: One sentence. This is the only line that shows on the tree.
delta:
  then: { year: 2010, text: "Where this started. Be specific, not modest." }
  now: { year: "now", text: "Where it is now. This line has to differ from the one above." }
---

An optional paragraph opening the branch page. Delete it if you have nothing
to add beyond the delta.
`;

const entryFile = (year, n) => `---
year: ${year}
title: Placeholder entry ${n}
summary: One line. This is all that shows until someone chooses to go deeper.
where: Optional. An organisation, a place, or who with
---
`;

const rootsFile = `---
title: Below the soil line
lead: Schooling, the early years, and the ground everything else grew out of.
facts:
  - "School"
  - "Your degree, institution, years"
  - "Certifications"
---

One written page, not a list. The things that came before the work, plus
anything true about you that sits awkwardly on a branch.

Nothing down here needs to be an achievement. It is ground.
`;

async function main() {
  if (!force) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question('This deletes everything in content/ and writes a three-branch skeleton. Continue? (y/N) ');
    rl.close();
    if (answer.trim().toLowerCase() !== 'y') {
      console.log('Nothing changed.');
      return;
    }
  }

  fs.rmSync(path.join(ROOT, 'branches'), { recursive: true, force: true });
  fs.rmSync(path.join(ROOT, 'entries'), { recursive: true, force: true });
  fs.mkdirSync(path.join(ROOT, 'branches'), { recursive: true });

  for (const b of SKELETON) {
    fs.writeFileSync(path.join(ROOT, 'branches', `${b.slug}.mdx`), branchFile(b));
    const dir = path.join(ROOT, 'entries', b.slug);
    fs.mkdirSync(dir, { recursive: true });
    [2010, 2016, 2022].forEach((year, i) => fs.writeFileSync(path.join(dir, `${year}-placeholder-${i + 1}.mdx`), entryFile(year, i + 1)));
  }

  fs.writeFileSync(path.join(ROOT, 'roots.mdx'), rootsFile);

  console.log(`
Done. Three branches, three placeholder entries each.

Next:
  1. lib/site.ts        your name, email, links
  2. content/branches/  rename the three, add up to five more
  3. content/entries/   the directory name must match the branch slug

  npm run content       see where you stand
  npm run dev           look at it
`);
}

main();
