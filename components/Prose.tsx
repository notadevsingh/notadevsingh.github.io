import { MDXRemote } from 'next-mdx-remote/rsc';

/** One renderer for every MDX body: branch, note, roots. */
export default function Prose({ source, className = '' }: { source: string; className?: string }) {
  if (!source) return null;
  return (
    <div className={`prose ${className}`.trim()}>
      <MDXRemote source={source} />
    </div>
  );
}
