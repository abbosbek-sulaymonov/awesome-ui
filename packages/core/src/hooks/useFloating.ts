import { useCallback, useEffect, useRef, useState } from "react";
import { computePosition } from "../utils/position";
import type { ComputePositionOptions, Position } from "../utils/position";

export interface UseFloatingParams extends ComputePositionOptions {
  /** Only measure and listen while open. */
  open: boolean;
}

export interface UseFloatingReturn {
  setAnchor: (node: HTMLElement | null) => void;
  setFloating: (node: HTMLElement | null) => void;
  setArrow: (node: HTMLElement | null) => void;
  position: Position | null;
  /** Styles for the floating element. */
  floatingStyles: React.CSSProperties;
  /** Styles for the arrow, or undefined when no arrow is mounted. */
  arrowStyles: React.CSSProperties | undefined;
  /** Force a re-measure, e.g. after the content changes size. */
  update: () => void;
}

/**
 * React binding for `computePosition`: measures the anchor and floating
 * element, then keeps them aligned while open.
 *
 * Re-measures on scroll and resize. Scroll is captured so nested scroll
 * containers are covered, and both listeners are passive since neither
 * cancels the event.
 */
export function useFloating({
  open,
  placement = "bottom",
  offset = 8,
  flip = true,
  shift = true,
  padding = 8,
  arrowSize = 0,
}: UseFloatingParams): UseFloatingReturn {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [floating, setFloating] = useState<HTMLElement | null>(null);
  const [arrow, setArrow] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState<Position | null>(null);

  const frame = useRef<number | null>(null);

  const update = useCallback(() => {
    if (!anchor || !floating) return;

    const anchorRect = anchor.getBoundingClientRect();
    const floatingRect = floating.getBoundingClientRect();

    const next = computePosition(
      anchorRect,
      floatingRect,
      { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight },
      { placement, offset, flip, shift, padding, arrowSize: arrow ? arrowSize : 0 },
    );

    setPosition((previous) =>
      previous &&
      previous.x === next.x &&
      previous.y === next.y &&
      previous.side === next.side &&
      previous.arrowX === next.arrowX &&
      previous.arrowY === next.arrowY
        ? previous
        : next,
    );
  }, [anchor, floating, arrow, placement, offset, flip, shift, padding, arrowSize]);

  useEffect(() => {
    if (!open || !anchor || !floating) return;

    update();

    const schedule = () => {
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        update();
      });
    };

    window.addEventListener("scroll", schedule, { capture: true, passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    // Content that grows or shrinks must re-anchor, not just re-flow.
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    observer?.observe(anchor);
    observer?.observe(floating);

    return () => {
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      observer?.disconnect();
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    };
  }, [open, anchor, floating, update]);

  const floatingStyles: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    // Keep it out of sight until measured, rather than flashing at 0,0.
    transform: position ? `translate3d(${position.x}px, ${position.y}px, 0)` : undefined,
    visibility: position ? undefined : "hidden",
  };

  const arrowStyles: React.CSSProperties | undefined = position
    ? {
        position: "absolute",
        left: position.arrowX === null ? undefined : `${position.arrowX}px`,
        top: position.arrowY === null ? undefined : `${position.arrowY}px`,
      }
    : undefined;

  return {
    setAnchor,
    setFloating,
    setArrow,
    position,
    floatingStyles,
    arrowStyles,
    update,
  };
}
