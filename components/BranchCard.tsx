import Link from 'next/link';
import type { Branch, Entry } from '@/lib/types';
import { yearSpan } from '@/lib/content';
import { copy } from '@/lib/copy';

/** The count, the span and the growth are computed. No field can override them. */
export default function BranchCard({ branch, entries, grown }: { branch: Branch; entries: Entry[]; grown: number }) {
  const span = yearSpan(entries);
  return (
    <li>
      <Link href={`/b/${branch.slug}`} className="branch-card" style={{ ['--branch' as string]: branch.color }}>
        <h3>{branch.title}</h3>
        <p className="branch-card__lead">{branch.lead}</p>
        <span className="branch-card__meta">
          {copy.branches.entries(entries.length)}
          {span ? ` · ${span}` : ''}
          {grown > 0 ? (
            <>
              {' · '}
              <span className="grew-this-year">{copy.branches.thisYear(grown)}</span>
            </>
          ) : null}
        </span>
      </Link>
    </li>
  );
}
