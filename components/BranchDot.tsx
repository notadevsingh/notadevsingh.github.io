import type { Branch } from '@/lib/types';

/** The colour dot always travels with the branch name, so nobody has to decode six colours. */
export default function BranchDot({ branch, label }: { branch: Branch; label?: string }) {
  return (
    <span className="branch-dot">
      <span className="dot" style={{ background: branch.color }} aria-hidden="true" />
      <span>{label ?? branch.title}</span>
    </span>
  );
}
