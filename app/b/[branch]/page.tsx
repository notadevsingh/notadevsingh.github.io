import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getBranch, getBranchByFormerSlug, getBranches, getEntriesForBranch } from '@/lib/content';
import { copy } from '@/lib/copy';
import ThenNow from '@/components/ThenNow';
import EntryRow from '@/components/EntryRow';
import Prose from '@/components/Prose';
import Forwarder from '@/components/Forwarder';

type Params = { params: Promise<{ branch: string }> };

/** Live slugs, plus every `formerly` slug so renamed branches keep their old addresses. */
export function generateStaticParams() {
  return getBranches().flatMap((b) => [b.slug, ...b.formerly].map((branch) => ({ branch })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { branch } = await params;
  const b = getBranch(branch) ?? getBranchByFormerSlug(branch);
  if (!b) return {};
  return { title: b.title, description: b.lead, alternates: { canonical: `/b/${b.slug}` } };
}

export default async function BranchPage({ params }: Params) {
  const { branch: slug } = await params;
  const branch = getBranch(slug);
  if (!branch) {
    const live = getBranchByFormerSlug(slug);
    if (live) return <Forwarder to={`/b/${live.slug}`} />;
    notFound();
  }

  const entries = getEntriesForBranch(slug);
  const all = getBranches();
  const next = all[(all.findIndex((b) => b.slug === slug) + 1) % all.length];

  return (
    <article style={{ ['--branch' as string]: branch.color }}>
      <header className="branch-head">
        <h1>{branch.title}</h1>
        <ThenNow delta={branch.delta} />
        <Prose source={branch.body} />
      </header>

      <ul className="entries">
        {entries.map((e) => (
          <EntryRow key={e.slug} entry={e} />
        ))}
      </ul>

      <nav className="pager" aria-label="Branches">
        <Link href="/">{copy.branch.back}</Link>
        {next && next.slug !== slug ? <Link href={`/b/${next.slug}`}>{copy.branch.next(next.title)}</Link> : null}
      </nav>
    </article>
  );
}
