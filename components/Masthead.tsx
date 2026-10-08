import { site } from '@/lib/site';
import { copy } from '@/lib/copy';
import NavLink from './NavLink';

export default function Masthead() {
  return (
    <header className="shell masthead">
      <NavLink href="/" className="masthead__name">
        {site.name}
      </NavLink>
      <nav aria-label="Sections">
        <NavLink href="/">{copy.nav.garden}</NavLink>
        <NavLink href="/timeline">{copy.nav.timeline}</NavLink>
        <NavLink href="/roots">{copy.nav.roots}</NavLink>
        <a href={`mailto:${site.email}`}>{copy.nav.contact}</a>
      </nav>
    </header>
  );
}
