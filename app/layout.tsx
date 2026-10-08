import type { Metadata } from 'next';
import { Karla, Shippori_Mincho } from 'next/font/google';
import './globals.css';
import { site } from '@/lib/site';
import { copy } from '@/lib/copy';
import Masthead from '@/components/Masthead';

/** Downloaded once at build and served from _next/static: no runtime request to Google, no layout shift. */
const body = Karla({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body', display: 'swap' });
const display = Shippori_Mincho({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.title}`, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: { type: 'website', siteName: site.name, title: `${site.name} — ${site.title}`, description: site.description },
  twitter: { card: 'summary' },
};

/** Evaluated at build time for static pages, so this is the date the garden was last built. */
const BUILT = new Date();
const tended = BUILT.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body>
        <Masthead />
        <main className="shell">{children}</main>
        <footer className="shell colophon">
          <span>
            {site.name} · {site.role}
          </span>
          <span className="colophon__tended">
            <time dateTime={BUILT.toISOString().slice(0, 10)}>
              {copy.colophon.tended} {tended}
            </time>
          </span>
          <span>
            {site.links.map((l, i) => (
              <span key={l.href}>
                {i > 0 ? ' · ' : ''}
                <a href={l.href}>{l.label}</a>
              </span>
            ))}
            {' · '}
            <a href={`mailto:${site.email}`}>{copy.colophon.email}</a>
          </span>
        </footer>
      </body>
    </html>
  );
}
