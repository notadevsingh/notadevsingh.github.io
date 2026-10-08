/**
 * Template wording. These are the template's words, not yours: change them if
 * you want the site to speak differently, but nothing here should ever be a
 * fact about you. Facts about you live in lib/site.ts and content/.
 */
export const copy = {
  nav: { garden: 'The garden', timeline: 'Timeline', roots: 'Roots', contact: 'Contact' },
  hero: { walk: 'Walk the garden', resume: 'Just the résumé' },
  branches: {
    heading: (count: number) => `${countWord(count)} branches`,
    hint: 'Read down one and you move forward in years.',
    entries: (n: number) => `${n} ${n === 1 ? 'entry' : 'entries'}`,
    thisYear: (n: number) => `${n} this year`,
  },
  rootsTeaser: { cta: 'Read the roots' },
  branch: { back: 'Back to the tree', next: (title: string) => `Next branch: ${title}` },
  entry: { readNote: 'Read the full note' },
  note: {
    back: (title: string) => `Back to ${title}`,
    evidence: 'Evidence',
    grew: 'Grew out of this',
  },
  timeline: {
    title: 'Everything, in order',
    intro: 'This view exists so nobody has to walk the garden to find a date. The garden is where the reasons live.',
    garden: 'Garden',
    timeline: 'Timeline',
    year: 'Year',
    what: 'What',
    where: 'Where',
    branch: 'Branch',
  },
  roots: {
    growth: 'Recent growth',
    growthHint: 'The last three years with entries. Derived from the branches; nothing here is written by hand.',
  },
  colophon: { tended: 'Last tended', email: 'Email' },
  forwarder: (to: string) => `This page moved to ${to}.`,
  notFound: { title: 'Nothing grows here', body: 'That page does not exist. The tree is back this way.', cta: 'Back to the garden' },
};

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
export function countWord(n: number): string {
  const w = WORDS[n] ?? String(n);
  return w.charAt(0).toUpperCase() + w.slice(1);
}
