import Link from 'next/link';
import { withBase } from '@/lib/paths';
import { copy } from '@/lib/copy';

/**
 * A static page that forwards an old address to the live one. GitHub Pages
 * cannot do server redirects; a meta refresh works on any host.
 */
export default function Forwarder({ to }: { to: string }) {
  const target = withBase(to);
  return (
    <article className="note">
      <meta httpEquiv="refresh" content={`0;url=${target}`} />
      <p>{copy.forwarder(to)}</p>
      <Link href={to} className="btn">
        {to}
      </Link>
    </article>
  );
}
