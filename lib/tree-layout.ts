/**
 * Canopy layout.
 *
 * The canopy is laid out from a table: the row matching your branch count
 * gives the clusters and the boughs are drawn to fit. Three to eight branches
 * each have a hand-tuned row, so a seventh branch has somewhere to go.
 *
 * Blobs are still irregular rather than circular — the wobble is a pure
 * function of the blob index, so it is stable across server and client renders
 * and identical between builds. It reads as hand-drawn without being random.
 *
 * Positions are in the 560 x 620 viewBox. The soil line sits at y ≈ 548 and
 * the trunk runs up the middle, so the canopy region is roughly x 40–520,
 * y 60–480.
 */

export type Blob = { cx: number; cy: number; rx: number; ry: number };

/**
 * Ordered largest and most central first. Branch `order: 1` gets the first
 * blob, so whichever branch you want to read as the trunk of the thing should
 * be ordered first.
 */
const LAYOUTS: Record<number, Blob[]> = {
  3: [
    { cx: 252, cy: 242, rx: 140, ry: 100 },
    { cx: 412, cy: 330, rx: 96, ry: 73 },
    { cx: 118, cy: 348, rx: 92, ry: 69 },
  ],
  4: [
    { cx: 246, cy: 236, rx: 132, ry: 96 },
    { cx: 406, cy: 310, rx: 98, ry: 74 },
    { cx: 126, cy: 340, rx: 92, ry: 68 },
    { cx: 320, cy: 122, rx: 70, ry: 52 },
  ],
  5: [
    { cx: 250, cy: 244, rx: 128, ry: 94 },
    { cx: 402, cy: 304, rx: 100, ry: 77 },
    { cx: 148, cy: 336, rx: 95, ry: 70 },
    { cx: 316, cy: 132, rx: 68, ry: 50 },
    { cx: 452, cy: 404, rx: 60, ry: 45 },
  ],
  6: [
    { cx: 253, cy: 251, rx: 127, ry: 93 },
    { cx: 402, cy: 302, rx: 100, ry: 78 },
    { cx: 149, cy: 334, rx: 95, ry: 70 },
    { cx: 313, cy: 140, rx: 67, ry: 49 },
    { cx: 452, cy: 400, rx: 60, ry: 45 },
    { cx: 96, cy: 437, rx: 54, ry: 42 },
  ],
  7: [
    { cx: 258, cy: 258, rx: 122, ry: 90 },
    { cx: 404, cy: 300, rx: 96, ry: 74 },
    { cx: 152, cy: 336, rx: 92, ry: 68 },
    { cx: 320, cy: 142, rx: 65, ry: 48 },
    { cx: 456, cy: 402, rx: 58, ry: 44 },
    { cx: 98, cy: 438, rx: 53, ry: 41 },
    { cx: 176, cy: 168, rx: 56, ry: 42 },
  ],
  8: [
    { cx: 260, cy: 264, rx: 116, ry: 86 },
    { cx: 400, cy: 302, rx: 92, ry: 71 },
    { cx: 156, cy: 338, rx: 88, ry: 66 },
    { cx: 322, cy: 146, rx: 63, ry: 47 },
    { cx: 452, cy: 404, rx: 56, ry: 43 },
    { cx: 100, cy: 440, rx: 52, ry: 40 },
    { cx: 178, cy: 172, rx: 54, ry: 41 },
    { cx: 500, cy: 232, rx: 48, ry: 38 },
  ],
};

export const MIN_BRANCHES = 3;
export const MAX_BRANCHES = 8;

/**
 * Beyond eight the canopy stops reading as a tree and starts reading as a
 * scatter plot, so this falls back to an arc rather than pretending. If you hit
 * it, the honest fix is merging branches, not widening the table.
 */
function arcFallback(n: number): Blob[] {
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const angle = Math.PI * (0.08 + 0.84 * t);
    return {
      cx: 280 - Math.cos(angle) * 210,
      cy: 300 - Math.sin(angle) * 150,
      rx: 74 - i * 2,
      ry: 56 - i * 1.5,
    };
  });
}

export function canopyFor(count: number): Blob[] {
  if (LAYOUTS[count]) return LAYOUTS[count];
  if (count < MIN_BRANCHES) return LAYOUTS[MIN_BRANCHES].slice(0, Math.max(count, 1));
  return arcFallback(count);
}

/** Deterministic pseudo-random in [-1, 1], seeded by two integers. */
function wobble(seed: number, k: number): number {
  const x = Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/**
 * A closed cubic path around the blob with each of the eight control vertices
 * nudged, so no two blobs share a silhouette.
 */
export function blobPath(blob: Blob, seed: number): string {
  const { cx, cy, rx, ry } = blob;
  const k = 0.5523;
  const j = (i: number, amount: number) => 1 + wobble(seed, i) * amount;

  const top = cy - ry * j(0, 0.07);
  const right = cx + rx * j(1, 0.07);
  const bottom = cy + ry * j(2, 0.06);
  const left = cx - rx * j(3, 0.07);

  const hx = rx * k;
  const hy = ry * k;

  return [
    `M${left.toFixed(1)},${cy.toFixed(1)}`,
    `C${(left).toFixed(1)},${(cy - hy * j(4, 0.16)).toFixed(1)} ${(cx - hx * j(5, 0.16)).toFixed(1)},${top.toFixed(1)} ${cx.toFixed(1)},${top.toFixed(1)}`,
    `C${(cx + hx * j(6, 0.16)).toFixed(1)},${top.toFixed(1)} ${right.toFixed(1)},${(cy - hy * j(7, 0.16)).toFixed(1)} ${right.toFixed(1)},${cy.toFixed(1)}`,
    `C${right.toFixed(1)},${(cy + hy * j(8, 0.14)).toFixed(1)} ${(cx + hx * j(9, 0.14)).toFixed(1)},${bottom.toFixed(1)} ${cx.toFixed(1)},${bottom.toFixed(1)}`,
    `C${(cx - hx * j(10, 0.14)).toFixed(1)},${bottom.toFixed(1)} ${left.toFixed(1)},${(cy + hy * j(11, 0.14)).toFixed(1)} ${left.toFixed(1)},${cy.toFixed(1)}`,
    'Z',
  ].join(' ');
}

/** Where each bough leaves the trunk. Lower index means lower on the trunk. */
const TRUNK_TOP = 430;
const TRUNK_BASE = 500;
const TRUNK_X = 266;

export function boughFor(blob: Blob, index: number, total: number): { d: string; width: number } {
  const t = total === 1 ? 0 : index / (total - 1);
  const startY = TRUNK_BASE - (TRUNK_BASE - TRUNK_TOP) * t;
  const endX = blob.cx + (blob.cx > TRUNK_X ? -blob.rx * 0.35 : blob.rx * 0.35);
  const endY = blob.cy + blob.ry * 0.45;

  const midX = TRUNK_X + (endX - TRUNK_X) * 0.45 + wobble(index, 20) * 18;
  const midY = startY + (endY - startY) * 0.55 + wobble(index, 21) * 14;

  return {
    d: `M${TRUNK_X},${startY.toFixed(1)} Q${midX.toFixed(1)},${midY.toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}`,
    width: Math.max(5, Math.round(blob.rx / 8)),
  };
}
