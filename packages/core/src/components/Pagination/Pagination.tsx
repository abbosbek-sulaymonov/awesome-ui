import { forwardRef } from "react";
import { useControllableState } from "../../hooks/useControllableState";
import { cn } from "../../utils/cn";
import { getPaginationRange } from "../../utils/pagination";
import { VisuallyHidden } from "../../primitives/VisuallyHidden";
import styles from "./Pagination.module.css";
import type { PaginationProps } from "./Pagination.types";

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === "left" ? "M10 4L6 8l4 4" : "M6 4l4 4-4 4"} />
    </svg>
  );
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    count,
    page,
    defaultPage = 1,
    onPageChange,
    siblings = 1,
    boundaries = 1,
    size = "md",
    variant = "ghost",
    disabled = false,
    hideArrows = false,
    label = "Pagination",
    getPageLabel = (n) => `Page ${n}`,
    renderPage,
    className,
    ...rest
  },
  ref,
) {
  const [current, setPage] = useControllableState<number>({
    value: page,
    defaultValue: defaultPage,
    ...(onPageChange ? { onChange: onPageChange } : {}),
  });

  const clamped = Math.min(Math.max(current, 1), Math.max(count, 1));
  const items = getPaginationRange({ page: clamped, count, siblings, boundaries });

  const go = (next: number) => {
    if (disabled) return;
    const target = Math.min(Math.max(next, 1), count);
    if (target !== clamped) setPage(target);
  };

  if (count <= 0) return null;

  return (
    <nav ref={ref} aria-label={label} className={cn(styles.root, styles[size], styles[variant], className)} {...rest}>
      <ul className={styles.list}>
        {!hideArrows ? (
          <li>
            <button
              type="button"
              className={cn(styles.item, styles.arrow)}
              // Disabled rather than hidden: a control that vanishes at the
              // ends shifts every other button sideways as you page.
              disabled={disabled || clamped <= 1}
              aria-label="Previous page"
              onClick={() => go(clamped - 1)}
            >
              <Chevron direction="left" />
            </button>
          </li>
        ) : null}

        {items.map((item, index) => {
          if (item === "start-ellipsis" || item === "end-ellipsis") {
            return (
              <li key={`${item}-${index}`}>
                <span className={styles.ellipsis}>
                  <span aria-hidden="true">…</span>
                  <VisuallyHidden>More pages</VisuallyHidden>
                </span>
              </li>
            );
          }

          const isCurrent = item === clamped;

          return (
            <li key={item}>
              {renderPage ? (
                renderPage(item, isCurrent ? { "aria-current": "page" } : {})
              ) : (
                <button
                  type="button"
                  className={styles.item}
                  disabled={disabled}
                  // aria-current marks the page; aria-label names it. Without
                  // the label a screen reader reads a bare number with no idea
                  // what it selects.
                  {...(isCurrent ? { "aria-current": "page" as const } : {})}
                  aria-label={getPageLabel(item)}
                  onClick={() => go(item)}
                >
                  {item}
                </button>
              )}
            </li>
          );
        })}

        {!hideArrows ? (
          <li>
            <button
              type="button"
              className={cn(styles.item, styles.arrow)}
              disabled={disabled || clamped >= count}
              aria-label="Next page"
              onClick={() => go(clamped + 1)}
            >
              <Chevron direction="right" />
            </button>
          </li>
        ) : null}
      </ul>
    </nav>
  );
});

Pagination.displayName = "Pagination";
