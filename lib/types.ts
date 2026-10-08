export type Delta = {
  then: { year: number; text: string };
  now: { year: number | 'now'; text: string };
};

export type Branch = {
  slug: string;
  title: string;
  color: string;
  order: number;
  /** One line on the tree. Depth level one for a branch: a single sentence. */
  lead: string;
  delta: Delta;
  /** Body of the branch MDX. Rendered as MDX, like everything else. */
  body: string;
  /** Old slugs this branch used to live at. Each one gets a forwarder page. */
  formerly: string[];
};

export type Artifact = { label: string; href: string };

export type Entry = {
  slug: string;
  branch: string;
  year: number;
  endYear?: number;
  title: string;
  /** Depth level one: the single line that shows in a list. */
  summary: string;
  /** Depth level two: the paragraph that shows inline on the branch page. */
  expanded?: string;
  where?: string;
  /** Evidence. Required on any entry with a full note. */
  artifacts: Artifact[];
  /** Refs of the form "branch/entry": cross-branch links on the full note. */
  grewInto: string[];
  /** Depth level three: the four-section MDX body. Empty means no page is linked. */
  body: string;
};

export type Roots = {
  title: string;
  lead: string;
  facts: string[];
  body: string;
};

export type Content = {
  branches: Branch[];
  entries: Entry[];
  roots: Roots;
  /** Advisory. The build ignores these; `npm run content -- --strict` does not. */
  warnings: string[];
};

/**
 * The only four sections a full note may have. Enforced at build time so the
 * site cannot quietly grow a fourth level of depth.
 */
export const NOTE_SECTIONS = ['What it was', 'What I did', 'What changed', "What I'd redo"] as const;
