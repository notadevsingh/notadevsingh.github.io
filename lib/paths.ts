/**
 * next/link prefixes the basePath for you; a raw <a href> does not. Content
 * links (artifact chips, images in notes) are plain strings, so they go
 * through here. Absolute URLs and anchors pass untouched.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function withBase(href: string): string {
  if (!href.startsWith('/')) return href;
  if (BASE && href.startsWith(`${BASE}/`)) return href;
  return `${BASE}${href}`;
}
