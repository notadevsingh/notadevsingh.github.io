import Link from 'next/link';
import type { Metadata } from 'next';
import { getBranch, getEntries, getRoots, recentGrowth } from '@/lib/content';
import { copy } from '@/lib/copy';
import Prose from '@/components/Prose';
import BranchDot from '@/components/BranchDot';

export function generateMetadata(): Metadata {
  const roots = getRoots();
  return { title: roots.title, description: roots.lead };
}

export default function RootsPage() {
  const roots = getRoots();
  const growth = recentGrowth(getEntries());

  return (
    <article className="note" style={{ ['--branch' as string]: 'var(--earth)' }}>
      <h1>{roots.title}</h1>
      <p className="note__meta">{roots.lead}</p>

      <Prose source={roots.body} className="note__body" />

      {roots.facts.length > 0 ? (
        <ul className="chips chips--facts">
          {roots.facts.map((f) => (
            <li key={f}>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {growth.length > 0 ? (
        <section className="growth">
          <h2>{copy.roots.growth}</h2>
          <p>{copy.roots.growthHint}</p>
          <dl className="growth__list">
            {growth.map(({ year, entries }) => (
              <div key={year}>
                <dt>{year}</dt>
                <dd>
                  <ul>
                    {entries.map((e) => {
                      const b = getBranch(e.branch)!;
                      return (
                        <li key={`${e.branch}/${e.slug}`}>
                          {e.body ? <Link href={`/b/${e.branch}/${e.slug}`}>{e.title}</Link> : e.title}
                          <span className="growth__branch">
                            <BranchDot branch={b} />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </article>
  );
}
