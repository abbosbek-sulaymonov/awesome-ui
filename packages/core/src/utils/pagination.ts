/**
 * Which page numbers to show, and where the gaps go.
 *
 * Kept separate from the component because it is the only part with real logic
 * in it, and it is far easier to test as a pure function than through rendered
 * buttons.
 *
 * The rule that matters: the returned list is always the same length once the
 * page count is large enough to need truncation. A list that grows and shrinks
 * as you page through it makes the controls move under the pointer, so the
 * button you are about to click is not the one you land on.
 */

export type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

export interface PaginationRangeOptions {
  /** 1-based. */
  page: number;
  count: number;
  /** Pages either side of the current one. @default 1 */
  siblings?: number;
  /** Pages pinned at each end. @default 1 */
  boundaries?: number;
}

const range = (start: number, end: number): number[] =>
  end < start ? [] : Array.from({ length: end - start + 1 }, (_, i) => start + i);

export function getPaginationRange({
  page,
  count,
  siblings = 1,
  boundaries = 1,
}: PaginationRangeOptions): PaginationItem[] {
  if (count <= 0) return [];

  const current = Math.min(Math.max(page, 1), count);

  // Boundaries at both ends, the sibling window, the current page, and the two
  // slots an ellipsis could occupy. Below this there is nothing to truncate.
  const total = boundaries * 2 + siblings * 2 + 3;
  if (total >= count) return range(1, count);

  const startPages = range(1, boundaries);
  const endPages = range(count - boundaries + 1, count);

  // Clamped so the window never runs past a boundary block, which would
  // otherwise render the same page twice.
  const left = Math.max(
    Math.min(current - siblings, count - boundaries - siblings * 2 - 1),
    boundaries + 2,
  );
  const right = Math.min(
    Math.max(current + siblings, boundaries + siblings * 2 + 2),
    count - boundaries - 1,
  );

  return [
    ...startPages,
    // A gap of exactly one page is rendered as that page: "1 … 3 4" wastes a
    // slot hiding a single number behind an ellipsis.
    ...(left > boundaries + 2
      ? (["start-ellipsis"] as PaginationItem[])
      : boundaries + 1 < count - boundaries
        ? [boundaries + 1]
        : []),
    ...range(left, right),
    ...(right < count - boundaries - 1
      ? (["end-ellipsis"] as PaginationItem[])
      : count - boundaries > boundaries
        ? [count - boundaries]
        : []),
    ...endPages,
  ];
}
