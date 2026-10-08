import Link from 'next/link';
import type { Metadata } from 'next';
import { formatYears, getBranch, getBranches, getTimeline } from '@/lib/content';
import { copy } from '@/lib/copy';
import BranchDot from '@/components/BranchDot';

export const metadata: Metadata = {
  title: copy.timeline.title,
  description: 'The same entries as the garden, flattened to years.',
};

export default function TimelinePage() {
  const entries = getTimeline();
  const branches = getBranches();

  return (
    <article className="page">
      <div className="section-head">
        <h1 className="page__title">{copy.timeline.title}</h1>
        <div className="toggle">
          <Link href="/">{copy.timeline.garden}</Link>
          <span aria-current="page">{copy.timeline.timeline}</span>
        </div>
      </div>

      <p>{copy.timeline.intro}</p>

      <ul className="legend">
        {branches.map((b) => (
          <li key={b.slug}>
            <Link href={`/b/${b.slug}`}>
              <BranchDot branch={b} />
            </Link>
          </li>
        ))}
      </ul>

      <div className="ledger-wrap">
        <table className="ledger">
          <thead>
            <tr>
              <th scope="col">{copy.timeline.year}</th>
              <th scope="col">{copy.timeline.what}</th>
              <th scope="col" className="ledger__where">
                {copy.timeline.where}
              </th>
              <th scope="col">{copy.timeline.branch}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => {
              const branch = getBranch(e.branch)!;
              const href = `/b/${e.branch}/${e.slug}`;
              return (
                <tr key={`${e.branch}/${e.slug}`}>
                  <td>{formatYears(e)}</td>
                  <td>{e.body ? <Link href={href}>{e.title}</Link> : e.title}</td>
                  <td className="ledger__where">{e.where ?? ''}</td>
                  <td>
                    <BranchDot branch={branch} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}
