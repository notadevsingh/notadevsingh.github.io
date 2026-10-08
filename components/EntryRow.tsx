import Link from 'next/link';
import type { Entry } from '@/lib/types';
import { formatYears } from '@/lib/content';
import { copy } from '@/lib/copy';
import Chips from './Chips';

/**
 * Depth level two. `expanded` entries get the paragraph and their evidence
 * inline; everything else stays one line. A full note is a click away, and
 * the row says so.
 */
export default function EntryRow({ entry }: { entry: Entry }) {
  const expanded = Boolean(entry.expanded);
  const href = `/b/${entry.branch}/${entry.slug}`;
  const hasNote = entry.body.length > 0;

  return (
    <li className={expanded ? 'entry entry--expanded' : 'entry'}>
      <span className="entry__year">{formatYears(entry)}</span>
      <div>
        <h3>{hasNote ? <Link href={href}>{entry.title}</Link> : entry.title}</h3>
        <p className="entry__summary">{entry.summary}</p>
        {entry.where ? <p className="entry__where">{entry.where}</p> : null}
        {expanded ? <p className="entry__expanded">{entry.expanded}</p> : null}
        {expanded ? <Chips items={entry.artifacts} /> : null}
        {hasNote ? (
          <Link href={href} className="entry__more">
            {copy.entry.readNote}
          </Link>
        ) : null}
      </div>
    </li>
  );
}
