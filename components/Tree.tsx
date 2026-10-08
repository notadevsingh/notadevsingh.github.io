import Link from 'next/link';
import type { Branch } from '@/lib/types';
import { blobPath, boughFor, canopyFor } from '@/lib/tree-layout';

/**
 * The illustration is the primary navigation. Each canopy cluster is a link
 * with the branch title on it; a dashed ring marks a branch that grew this
 * year. Trunk and roots are fixed paths; the canopy is laid out from the
 * branch count (lib/tree-layout.ts), so adding a branch redraws the tree.
 *
 * Colours come from CSS tokens so the wood and soil follow the colour scheme.
 */

const TRUNK = 'M266,612 C260,540 256,486 266,438';

const ROOTS: Array<[string, number]> = [
  ['M264,556 C250,578 226,592 198,598', 5],
  ['M272,556 C286,582 312,596 342,602', 5],
  ['M268,558 C266,582 268,600 272,614', 4],
  ['M232,576 C214,582 200,594 192,608', 3],
];

export default function Tree({ branches, grown }: { branches: Branch[]; grown: Record<string, number> }) {
  const canopy = canopyFor(branches.length);

  return (
    <svg
      className="tree"
      viewBox="0 0 560 620"
      role="group"
      aria-label="An illustrated tree. Each canopy cluster links to one branch of this site. A dashed ring marks a branch that grew this year."
    >
      <defs>
        <filter id="tree-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <g className="tree__wood" fill="none" strokeLinecap="round">
        <path d={TRUNK} strokeWidth={24} />
        {canopy.map((blob, i) => {
          const bough = boughFor(blob, i, canopy.length);
          return <path key={`bough-${i}`} d={bough.d} strokeWidth={bough.width} />;
        })}
      </g>

      <g className="tree__canopy">
        {canopy.map((blob, i) => {
          const branch = branches[i];
          if (!branch) return null;
          const g = grown[branch.slug] ?? 0;
          const fontSize = Math.max(13, Math.min(20, blob.rx / 5.5));
          return (
            <Link
              key={branch.slug}
              href={`/b/${branch.slug}`}
              className="tree__blob"
              aria-label={`${branch.title}: ${branch.lead}${g ? `. Grew this year: ${g} ${g === 1 ? 'entry' : 'entries'}` : ''}`}
            >
              {g > 0 ? (
                <path
                  className="tree__ring"
                  d={blobPath({ cx: blob.cx, cy: blob.cy, rx: blob.rx + 9, ry: blob.ry + 9 }, i + 1)}
                  fill="none"
                  stroke={branch.color}
                />
              ) : null}
              <path d={blobPath(blob, i + 1)} fill={branch.color} />
              <text x={blob.cx} y={blob.cy} textAnchor="middle" dominantBaseline="middle" fontSize={fontSize}>
                {branch.title}
              </text>
            </Link>
          );
        })}
      </g>

      <path className="tree__soil" d="M34,548 C140,540 220,552 300,548 C380,544 460,536 532,544" strokeWidth={2} fill="none" />

      <g className="tree__roots" fill="none" strokeLinecap="round">
        {ROOTS.map(([d, w]) => (
          <path key={d} d={d} strokeWidth={w} />
        ))}
      </g>

      <rect width={560} height={620} filter="url(#tree-grain)" opacity={0.05} pointerEvents="none" />
    </svg>
  );
}
