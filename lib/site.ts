/**
 * Everything about you lives here. Replace all of it.
 *
 * Nothing else in the codebase hard-codes a name, a link or an email. Template
 * wording (button labels, headings) lives in lib/copy.ts; if you find a fact
 * about a person anywhere else, it is a bug.
 */
export const site = {
  name: 'Prabhjeet Singh',
  role: 'Product Owner & a lover of all things tech',

  /** The headline on the home page. No full stop; one is added for you. */
  title: 'A holistic view of my work and the things that grew beside it',

  /**
   * Two or three sentences under the headline. Say what the site is and how to
   * read it. Do not count the branches here; the page does that itself.
   */
  description:
    'This is a personal website that showcases my work, projects, and interests. Explore the branches to see the different facets of my professional and personal life. Each branch moves forward in years as you read down it.',

  /** Used for canonical URLs and link previews. Set it to the real address. */
  url: 'https://example.com',
  email: 'notadevsingh.cape902@slmail.me',

  /** Rendered in the footer, in this order. */
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/prabhjeet-singh-b3a21973' },
  ],
} as const;
