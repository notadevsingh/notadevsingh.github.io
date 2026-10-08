import type { Delta } from '@/lib/types';

/**
 * The one thing a resume structurally cannot say: where this started and where
 * it is now, stated as a claim rather than implied by a list of dates.
 */
export default function ThenNow({ delta }: { delta: Delta }) {
  return (
    <dl className="delta">
      <div>
        <dt>Then, {delta.then.year}</dt>
        <dd>{delta.then.text}</dd>
      </div>
      <div className="delta__now">
        <dt>Now{delta.now.year === 'now' ? '' : `, ${delta.now.year}`}</dt>
        <dd>{delta.now.text}</dd>
      </div>
    </dl>
  );
}
