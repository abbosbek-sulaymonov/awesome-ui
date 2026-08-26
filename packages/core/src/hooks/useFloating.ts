import { useCallback, useEffect, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
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

  // Measured in a layout effect, not an effect: a plain effect runs after
  // paint, so the browser shows one frame of the element at its unpositioned
  // origin — the top-left corner — before the transform lands.
  useIsomorphicLayoutEffect(() => {
    if (!open || !anchor || !floating) return;
    update();
  }, [open, anchor, floating, update]);

  useEffect(() => {
    if (!open || !anchor || !floating) return;

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
    /**
     * `translate`, not `transform`.
     *
     * They are separate CSS properties, and the used transform composes
     * translate, then rotate, then scale, then transform. Writing the position
     * into `transform` puts it in direct conflict with entrance animations,
     * which animate `transform: scale(...)` — and a running animation outranks
     * an inline style, so the element would sit at its unpositioned origin for
     * the whole animation and only jump into place when it finished.
     *
     * Keeping them on separate properties lets a component animate scale and
     * opacity freely without ever disturbing where it is anchored.
     */
    translate: position ? `${position.x}px ${position.y}px` : undefined,
    // Belt and braces for the frame before measurement. The layout effect above
    // means there should not be one, but a floating element that flashes across
    // the viewport is a bad enough failure to guard twice.
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
