import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { formatYears, getBranch, getBranchByFormerSlug, getBranches, getEntries, getEntry, resolveRef } from '@/lib/content';
import { copy } from '@/lib/copy';
import Prose from '@/components/Prose';
import Chips from '@/components/Chips';
import BranchDot from '@/components/BranchDot';
import Forwarder from '@/components/Forwarder';

type Params = { params: Promise<{ branch: string; entry: string }> };

/**
 * Every entry gets a route, including one-liners with no note body, so a fresh
 * install with no full notes still exports. Old branch slugs get a forwarder
 * for each entry too.
 */
export function generateStaticParams() {
  const former = new Map(getBranches().map((b) => [b.slug, b.formerly]));
  return getEntries().flatMap((e) => [e.branch, ...(former.get(e.branch) ?? [])].map((branch) => ({ branch, entry: e.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { branch, entry } = await params;
  const b = getBranch(branch) ?? getBranchByFormerSlug(branch);
  const e = b ? getEntry(b.slug, entry) : undefined;
  if (!b || !e) return {};
  return { title: e.title, description: e.summary, alternates: { canonical: `/b/${b.slug}/${e.slug}` } };
}

export default async function NotePage({ params }: Params) {
  const { branch: branchSlug, entry: entrySlug } = await params;
  const branch = getBranch(branchSlug);
  if (!branch) {
    const live = getBranchByFormerSlug(branchSlug);
    if (live && getEntry(live.slug, entrySlug)) return <Forwarder to={`/b/${live.slug}/${entrySlug}`} />;
    notFound();
  }
  const entry = getEntry(branchSlug, entrySlug);
  if (!entry) notFound();

  const related = entry.grewInto.map(resolveRef).filter((r): r is NonNullable<ReturnType<typeof resolveRef>> => r !== null);

  return (
    <article className="note" style={{ ['--branch' as string]: branch.color }}>
      <Link href={`/b/${branch.slug}`} className="crumb">
        <BranchDot branch={branch} label={copy.note.back(branch.title)} />
      </Link>

      <h1>{entry.title}</h1>
      <p className="note__meta">{[entry.where, formatYears(entry)].filter(Boolean).join(' · ')}</p>

      {entry.body ? <Prose source={entry.body} className="note__body" /> : <p className="note__summary">{entry.summary}</p>}

      {entry.artifacts.length > 0 ? (
        <section className="note__section">
          <h2>{copy.note.evidence}</h2>
          <Chips items={entry.artifacts} />
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="grew">
          <h2>{copy.note.grew}</h2>
          <ul>
            {related.map(({ entry: e, branch: b }) => (
              <li key={`${b.slug}/${e.slug}`}>
                <Link href={`/b/${b.slug}/${e.slug}`}>
                  <BranchDot branch={b} label={e.title} />
                  <span className="grew__branch">{b.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
