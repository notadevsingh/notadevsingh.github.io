import Link from 'next/link';
import { copy } from '@/lib/copy';

export default function NotFound() {
  return (
    <article className="note">
      <h1>{copy.notFound.title}</h1>
      <p>{copy.notFound.body}</p>
      <Link href="/" className="btn">
        {copy.notFound.cta}
      </Link>
    </article>
  );
}
