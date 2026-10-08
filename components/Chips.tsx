import type { Artifact } from '@/lib/types';
import { withBase } from '@/lib/paths';

/** Evidence chips. The loader guarantees every one has a real href. */
export default function Chips({ items, className = '' }: { items: Artifact[]; className?: string }) {
  if (!items.length) return null;
  return (
    <ul className={`chips ${className}`.trim()}>
      {items.map((a) => (
        <li key={a.href + a.label}>
          <a href={withBase(a.href)}>{a.label}</a>
        </li>
      ))}
    </ul>
  );
}
