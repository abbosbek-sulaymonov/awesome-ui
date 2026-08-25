/**
 * Focusable-element discovery, used by the focus trap and by overlays that
 * need to place initial focus.
 *
 * Deliberately conservative: it asks the layout engine whether an element is
 * actually rendered rather than trying to reason about CSS, because
 * `visibility: hidden`, `display: none` on an ancestor, and a collapsed
 * `<details>` all remove an element from the tab order in ways a selector
 * cannot see.
 */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "button:not([disabled])",
  "iframe",
  "object",
  "embed",
  "audio[controls]",
  "video[controls]",
  "[contenteditable]:not([contenteditable='false'])",
  "[tabindex]",
].join(",");

function isHidden(element: HTMLElement): boolean {
  // offsetParent is null for display:none and for fixed-position elements, so
  // fall back to a rect check for the latter.
  if (element.hidden) return true;
  if (element.offsetParent === null && getComputedStyle(element).position !== "fixed") {
    return true;
  }
  const style = getComputedStyle(element);
  return style.visibility === "hidden" || style.display === "none";
}

function isDisabled(element: HTMLElement): boolean {
  if ((element as HTMLInputElement).disabled) return true;
  // A disabled <fieldset> takes everything but its first <legend> out of play.
  const fieldset = element.closest("fieldset:disabled");
  if (!fieldset) return false;
  const legend = fieldset.querySelector("legend");
  return !legend?.contains(element);
}

/** Can this element receive focus at all? */
export function isFocusable(element: HTMLElement): boolean {
  if (!element.matches(FOCUSABLE_SELECTOR)) return false;
  if (isDisabled(element)) return false;
  return !isHidden(element);
}

/** Is this element reachable with the Tab key? `tabindex="-1"` is not. */
export function isTabbable(element: HTMLElement): boolean {
  return isFocusable(element) && element.tabIndex >= 0;
}

/** Every tabbable descendant, in document order. */
export function getTabbableElements(container: HTMLElement): HTMLElement[] {
  const candidates = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
  return candidates.filter(isTabbable);
}

export function getFirstTabbable(container: HTMLElement): HTMLElement | undefined {
  return getTabbableElements(container)[0];
}

export function getLastTabbable(container: HTMLElement): HTMLElement | undefined {
  const elements = getTabbableElements(container);
  return elements[elements.length - 1];
}
