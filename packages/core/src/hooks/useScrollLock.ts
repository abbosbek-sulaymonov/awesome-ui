import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

let lockCount = 0;
let restore: (() => void) | null = null;

/**
 * Freezes background scrolling while `active`.
 *
 * Reference-counted, because nested overlays each ask for a lock and only the
 * last one to leave should restore the page. The scrollbar's width is added as
 * padding so removing it does not shift the layout underneath.
 */
export function useScrollLock(active: boolean): void {
  useIsomorphicLayoutEffect(() => {
    if (!active || typeof document === "undefined") return;

    lockCount += 1;

    if (lockCount === 1) {
      const body = document.body;
      const previousOverflow = body.style.overflow;
      const previousPaddingRight = body.style.paddingRight;

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        const current = Number.parseFloat(getComputedStyle(body).paddingRight) || 0;
        body.style.paddingRight = `${current + scrollbarWidth}px`;
      }
      body.style.overflow = "hidden";

      restore = () => {
        body.style.overflow = previousOverflow;
        body.style.paddingRight = previousPaddingRight;
      };
    }

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        restore?.();
        restore = null;
      }
    };
  }, [active]);
}
