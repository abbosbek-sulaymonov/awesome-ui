import { useEffect, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";

export interface UsePresenceReturn {
  /** Keep rendering while true — covers the exit animation. */
  isPresent: boolean;
  /** Attach to the animated node so its animation end can be observed. */
  ref: (node: HTMLElement | null) => void;
  /** Mirror onto the node as `data-state`, which the CSS keys off. */
  state: "open" | "closed";
}

/**
 * Defers unmount until the exit animation finishes.
 *
 * React removes an element the moment its condition flips, which kills any
 * exit transition. This keeps the node mounted, flips `data-state` to
 * `"closed"` so the CSS can run its exit, and unmounts on `animationend` /
 * `transitionend`.
 *
 * If the node has no animation, unmount happens immediately — so a consumer who
 * writes no exit CSS pays nothing.
 */
export function usePresence(present: boolean): UsePresenceReturn {
  const [node, setNode] = useState<HTMLElement | null>(null);
  const [isPresent, setIsPresent] = useState(present);
  const wasPresent = useRef(present);

  useIsomorphicLayoutEffect(() => {
    if (present) {
      wasPresent.current = true;
      setIsPresent(true);
      return;
    }

    // Was never shown — nothing to animate out.
    if (!wasPresent.current) {
      setIsPresent(false);
      return;
    }

    if (!node) {
      setIsPresent(false);
      return;
    }

    const styles = getComputedStyle(node);
    const hasAnimation =
      styles.animationName !== "none" && Number.parseFloat(styles.animationDuration) > 0;
    const hasTransition = Number.parseFloat(styles.transitionDuration) > 0;

    if (!hasAnimation && !hasTransition) {
      setIsPresent(false);
    }
  }, [present, node]);

  useEffect(() => {
    if (present || !node || !wasPresent.current) return;

    const done = (event: Event) => {
      // Ignore bubbled events from descendants; only the layer itself decides.
      if (event.target !== node) return;
      setIsPresent(false);
    };

    node.addEventListener("animationend", done);
    node.addEventListener("animationcancel", done);
    node.addEventListener("transitionend", done);
    node.addEventListener("transitioncancel", done);

    return () => {
      node.removeEventListener("animationend", done);
      node.removeEventListener("animationcancel", done);
      node.removeEventListener("transitionend", done);
      node.removeEventListener("transitioncancel", done);
    };
  }, [present, node]);

  return {
    isPresent,
    ref: setNode,
    state: present ? "open" : "closed",
  };
}
