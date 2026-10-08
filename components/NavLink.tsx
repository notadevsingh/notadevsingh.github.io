'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** A link that knows whether it is the current page, so the masthead style and screen readers agree. */
export default function NavLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const pathname = usePathname() ?? '/';
  const current = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link href={href} className={className} aria-current={current ? 'page' : undefined}>
      {children}
    </Link>
  );
}
