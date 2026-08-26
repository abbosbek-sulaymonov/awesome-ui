import { useCallback, useEffect, useRef } from "react";

export type RovingOrientation = "vertical" | "horizontal" | "both";

export interface UseRovingFocusParams {
  /** Element that owns the collection and receives the key handler. */
  container: HTMLElement | null;
  /** Only bind while true. */
  active: boolean;
  /** Which arrow keys move focus. @default "vertical" */
  orientation?: RovingOrientation | undefined;
  /** Wrap from last to first and back. @default true */
  loop?: boolean | undefined;
  /**
   * Selects the focusable items inside the container. Must exclude disabled
   * ones — a roving collection skips them entirely rather than focusing and
   * bouncing off.
   */
  itemSelector?: string | undefined;
  /** Called whenever focus lands on an item. */
  onFocusChange?: ((item: HTMLElement, index: number) => void) | undefined;
}

export interface UseRovingFocusReturn {
  getItems: () => HTMLElement[];
  focusItem: (item: HTMLElement | null | undefined) => void;
  focusFirst: () => void;
  focusLast: () => void;
  focusNext: () => void;
  focusPrevious: () => void;
}

/**
 * Arrow-key navigation over a collection.
 *
 * Moves real DOM focus rather than tracking `aria-activedescendant`. Real focus
 * is what makes `:focus-visible`, scroll-into-view and screen-reader cursors
 * behave without a parallel implementation of each — the cost is that items
 * must be focusable, which is why every item carries `tabindex="-1"`.
 *
 * Reusable by Select, Menu, Tabs and RadioGroup; only the selector and
 * orientation differ.
 */
export function useRovingFocus({
  container,
  active,
  orientation = "vertical",
  loop = true,
  itemSelector = '[role="option"]:not([data-disabled]),[role="menuitem"]:not([data-disabled])',
  onFocusChange,
}: UseRovingFocusParams): UseRovingFocusReturn {
  const onFocusChangeRef = useRef(onFocusChange);
  onFocusChangeRef.current = onFocusChange;

  const getItems = useCallback((): HTMLElement[] => {
    if (!container) return [];
    return Array.from(container.querySelectorAll<HTMLElement>(itemSelector));
  }, [container, itemSelector]);

  const focusItem = useCallback(
    (item: HTMLElement | null | undefined) => {
      if (!item) return;
      // preventScroll, then scroll deliberately — the browser's default scroll
      // jumps the item to the edge of the viewport rather than into the list.
      item.focus({ preventScroll: true });
      // Guarded: jsdom does not implement scrollIntoView, and a consumer
      // running their own tests should not crash over a scroll nicety.
      item.scrollIntoView?.({ block: "nearest" });

      const index = getItems().indexOf(item);
      if (index !== -1) onFocusChangeRef.current?.(item, index);
    },
    [getItems],
  );

  const move = useCallback(
    (delta: number) => {
      const items = getItems();
      if (items.length === 0) return;

      const activeElement = container?.ownerDocument.activeElement as HTMLElement | null;
      const current = activeElement ? items.indexOf(activeElement) : -1;

      // Nothing focused yet: enter from whichever end the key implies.
      if (current === -1) {
        focusItem(delta > 0 ? items[0] : items[items.length - 1]);
        return;
      }

      let next = current + delta;
      if (next < 0) next = loop ? items.length - 1 : 0;
      else if (next >= items.length) next = loop ? 0 : items.length - 1;

      focusItem(items[next]);
    },
    [container, getItems, focusItem, loop],
  );

  const focusFirst = useCallback(() => focusItem(getItems()[0]), [getItems, focusItem]);
  const focusLast = useCallback(() => {
    const items = getItems();
    focusItem(items[items.length - 1]);
  }, [getItems, focusItem]);
  const focusNext = useCallback(() => move(1), [move]);
  const focusPrevious = useCallback(() => move(-1), [move]);

  useEffect(() => {
    if (!active || !container) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;

      const vertical = orientation === "vertical" || orientation === "both";
      const horizontal = orientation === "horizontal" || orientation === "both";

      switch (event.key) {
        case "ArrowDown":
          if (!vertical) return;
          event.preventDefault();
          move(1);
          break;
        case "ArrowUp":
          if (!vertical) return;
          event.preventDefault();
          move(-1);
          break;
        case "ArrowRight":
          if (!horizontal) return;
          event.preventDefault();
          move(1);
          break;
        case "ArrowLeft":
          if (!horizontal) return;
          event.preventDefault();
          move(-1);
          break;
        case "Home":
          event.preventDefault();
          focusFirst();
          break;
        case "End":
          event.preventDefault();
          focusLast();
          break;
        default:
          break;
      }
    };

    container.addEventListener("keydown", onKeyDown);
    return () => container.removeEventListener("keydown", onKeyDown);
  }, [active, container, orientation, move, focusFirst, focusLast]);

  return { getItems, focusItem, focusFirst, focusLast, focusNext, focusPrevious };
}
