import { useEffect, useRef } from "react";
import { getFirstTabbable, getTabbableElements, isFocusable } from "../utils/tabbable";

export interface UseFocusTrapParams {
  /** The element to trap focus inside. */
  container: HTMLElement | null;
  /** Trap only while true. */
  active: boolean;
  /** Focus this on activate. Defaults to the first tabbable descendant. */
  initialFocus?: HTMLElement | null | undefined;
  /**
   * Where focus goes on deactivate. Defaults to whatever was focused when the
   * trap engaged — usually the trigger.
   */
  returnFocus?: HTMLElement | null | undefined;
  /** Skip the automatic focus move on activate. */
  disableAutoFocus?: boolean | undefined;
  /** Skip restoring focus on deactivate. */
  disableReturnFocus?: boolean | undefined;
}

/**
 * Keeps Tab and Shift+Tab cycling inside `container` while `active`.
 *
 * Wrapping is handled on keydown rather than with sentinel nodes, so the DOM
 * the consumer wrote is the DOM that renders. A focusin listener catches the
 * cases keydown cannot — programmatic focus, and the browser moving focus into
 * the address bar and back.
 */
export function useFocusTrap({
  container,
  active,
  initialFocus,
  returnFocus,
  disableAutoFocus,
  disableReturnFocus,
}: UseFocusTrapParams): void {
  // Captured before focus moves, so we can put it back afterwards.
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !container) return;

    const ownerDocument = container.ownerDocument;
    previouslyFocused.current = ownerDocument.activeElement as HTMLElement | null;

    if (!disableAutoFocus) {
      const target = initialFocus ?? getFirstTabbable(container) ?? container;
      // A container with no tabbable content still needs to hold focus, or the
      // trap has nothing to trap and Escape never reaches the layer.
      if (target === container && !isFocusable(container)) {
        container.setAttribute("tabindex", "-1");
      }
      target.focus({ preventScroll: true });
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || event.defaultPrevented) return;

      const tabbables = getTabbableElements(container);
      if (tabbables.length === 0) {
        // Nothing to move to — keep focus pinned to the container.
        event.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }

      const first = tabbables[0]!;
      const last = tabbables[tabbables.length - 1]!;
      const activeElement = ownerDocument.activeElement as HTMLElement | null;

      if (event.shiftKey && (activeElement === first || activeElement === container)) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    // Catches focus that arrives without a Tab keypress.
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as Node | null;
      if (target && !container.contains(target)) {
        const fallback = getFirstTabbable(container) ?? container;
        fallback.focus({ preventScroll: true });
      }
    };

    ownerDocument.addEventListener("keydown", onKeyDown, true);
    ownerDocument.addEventListener("focusin", onFocusIn, true);

    return () => {
      ownerDocument.removeEventListener("keydown", onKeyDown, true);
      ownerDocument.removeEventListener("focusin", onFocusIn, true);

      if (disableReturnFocus) return;
      const target = returnFocus ?? previouslyFocused.current;
      // The trigger may have unmounted along with the overlay.
      if (target?.isConnected) target.focus({ preventScroll: true });
    };
  }, [
    active,
    container,
    initialFocus,
    returnFocus,
    disableAutoFocus,
    disableReturnFocus,
  ]);
}
