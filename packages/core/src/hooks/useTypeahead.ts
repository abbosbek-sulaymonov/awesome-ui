import { useCallback, useEffect, useRef } from "react";

export interface UseTypeaheadParams {
  /** Only listen while true. */
  active: boolean;
  /** Element that receives the key handler. */
  container: HTMLElement | null;
  /** The searchable collection, in document order. */
  getItems: () => HTMLElement[];
  /** Called with the item the search landed on. */
  onMatch: (item: HTMLElement) => void;
  /** Reads the text to match against. Defaults to the item's text content. */
  getItemText?: ((item: HTMLElement) => string) | undefined;
  /** Idle time before the buffer resets, in ms. @default 800 */
  timeout?: number | undefined;
}

/**
 * Type-to-jump over a collection.
 *
 * Two behaviours that native `<select>` has and hand-rolled versions usually
 * miss:
 *
 *  - repeating the same character cycles through everything starting with it,
 *    rather than searching for "aaa"
 *  - the search starts *after* the current item, so pressing the same letter
 *    twice advances instead of re-selecting what is already focused
 */
export function useTypeahead({
  active,
  container,
  getItems,
  onMatch,
  getItemText,
  timeout = 800,
}: UseTypeaheadParams): void {
  const buffer = useRef("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getItemsRef = useRef(getItems);
  getItemsRef.current = getItems;
  const onMatchRef = useRef(onMatch);
  onMatchRef.current = onMatch;
  const getItemTextRef = useRef(getItemText);
  getItemTextRef.current = getItemText;

  const clear = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    buffer.current = "";
  }, []);

  useEffect(() => clear, [clear]);

  useEffect(() => {
    if (!active || !container) return;

    const onKeyDown = (event: KeyboardEvent) => {
      // Only printable single characters; modifiers mean a shortcut, not a search.
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key.length !== 1) return;
      // A leading space would open or select rather than search.
      if (event.key === " " && buffer.current === "") return;

      event.preventDefault();
      event.stopPropagation();

      buffer.current += event.key.toLowerCase();

      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        buffer.current = "";
      }, timeout);

      const items = getItemsRef.current();
      if (items.length === 0) return;

      // Same character repeated: treat it as "next one starting with this".
      const isRepeat =
        buffer.current.length > 1 &&
        buffer.current.split("").every((character) => character === buffer.current[0]);
      const search = isRepeat ? buffer.current[0]! : buffer.current;

      const readText = (item: HTMLElement) =>
        (getItemTextRef.current?.(item) ?? item.textContent ?? "").trim().toLowerCase();

      const activeElement = container.ownerDocument.activeElement as HTMLElement | null;
      const currentIndex = activeElement ? items.indexOf(activeElement) : -1;

      // Start after the current item so a repeated key advances, and wrap.
      const offset = isRepeat ? currentIndex + 1 : currentIndex === -1 ? 0 : currentIndex;
      const ordered = [...items.slice(offset), ...items.slice(0, offset)];

      const match = ordered.find((item) => readText(item).startsWith(search));
      if (match) onMatchRef.current(match);
    };

    container.addEventListener("keydown", onKeyDown);
    return () => container.removeEventListener("keydown", onKeyDown);
  }, [active, container, timeout]);
}
