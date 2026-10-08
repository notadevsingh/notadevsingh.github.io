import Link from 'next/link';
import { getBranches, getEntriesForBranch, getRoots, grownIn } from '@/lib/content';
import { site } from '@/lib/site';
import { copy } from '@/lib/copy';
import Tree from '@/components/Tree';
import BranchCard from '@/components/BranchCard';

const THIS_YEAR = new Date().getFullYear();

export default function Home() {
  const branches = getBranches();
  const roots = getRoots();
  const grown = Object.fromEntries(branches.map((b) => [b.slug, grownIn(getEntriesForBranch(b.slug), THIS_YEAR)]));

  return (
    <>
      <section className="hero">
        <div>
          <h1>{site.title}.</h1>
          <p className="hero__lede">{site.description}</p>
          <div className="hero__actions">
            <Link href={`/b/${branches[0].slug}`} className="btn">
              {copy.hero.walk}
            </Link>
            <Link href="/timeline" className="btn btn--quiet">
              {copy.hero.resume}
            </Link>
          </div>
        </div>
        <Tree branches={branches} grown={grown} />
      </section>

      <section aria-labelledby="branches">
        <div className="section-head">
          <h2 id="branches">{copy.branches.heading(branches.length)}</h2>
          <p>{copy.branches.hint}</p>
        </div>
        <ul className="branch-grid">
          {branches.map((b) => (
            <BranchCard key={b.slug} branch={b} entries={getEntriesForBranch(b.slug)} grown={grown[b.slug]} />
          ))}
        </ul>
      </section>

      <section className="roots-teaser">
        <div className="roots-teaser__soil" aria-hidden="true" />
        <h2>{roots.title}</h2>
        <p>{roots.lead}</p>
        <Link href="/roots" className="btn btn--quiet">
          {copy.rootsTeaser.cta}
        </Link>
      </section>
    </>
  );
}
