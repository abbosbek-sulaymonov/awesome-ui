/**
 * Anchored positioning: place a floating element against a reference element,
 * keeping it on screen.
 *
 * Hand-rolled rather than pulled from Floating UI. It covers the cases this
 * library needs — side + alignment, flip on overflow, shift along the cross
 * axis, and an arrow that tracks the anchor — and nothing else. Anything
 * needing virtual elements, nested scroll containers, or auto-placement is out
 * of scope by design.
 */

export type Side = "top" | "right" | "bottom" | "left";
export type Align = "start" | "center" | "end";
export type Placement = Side | `${Side}-${Align}`;

export interface ComputePositionOptions {
  placement?: Placement | undefined;
  /** Gap between anchor and floating element, in px. */
  offset?: number | undefined;
  /** Flip to the opposite side when the preferred one overflows. */
  flip?: boolean | undefined;
  /** Slide along the cross axis to stay inside the viewport. */
  shift?: boolean | undefined;
  /** Minimum distance kept from the viewport edge, in px. */
  padding?: number | undefined;
  /** Arrow size, so the arrow's own offset can be reserved. */
  arrowSize?: number | undefined;
}

export interface Position {
  x: number;
  y: number;
  /** Side actually used — may differ from the request after a flip. */
  side: Side;
  align: Align;
  /** Arrow offset along the anchor's axis, in px from the floating element's edge. */
  arrowX: number | null;
  arrowY: number | null;
}

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const OPPOSITE: Record<Side, Side> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

function parsePlacement(placement: Placement): { side: Side; align: Align } {
  const [side, align = "center"] = placement.split("-") as [Side, Align?];
  return { side, align };
}

function isVertical(side: Side): boolean {
  return side === "top" || side === "bottom";
}

/** Where the floating element lands for a given side/align, before clamping. */
function coordsFor(
  side: Side,
  align: Align,
  anchor: Rect,
  floating: Rect,
  offset: number,
): { x: number; y: number } {
  let x = 0;
  let y = 0;

  if (isVertical(side)) {
    y = side === "top" ? anchor.y - floating.height - offset : anchor.y + anchor.height + offset;

    if (align === "start") x = anchor.x;
    else if (align === "end") x = anchor.x + anchor.width - floating.width;
    else x = anchor.x + anchor.width / 2 - floating.width / 2;
  } else {
    x = side === "left" ? anchor.x - floating.width - offset : anchor.x + anchor.width + offset;

    if (align === "start") y = anchor.y;
    else if (align === "end") y = anchor.y + anchor.height - floating.height;
    else y = anchor.y + anchor.height / 2 - floating.height / 2;
  }

  return { x, y };
}

function overflowsOnMainAxis(
  side: Side,
  coords: { x: number; y: number },
  floating: Rect,
  viewport: Rect,
  padding: number,
): boolean {
  switch (side) {
    case "top":
      return coords.y < viewport.y + padding;
    case "bottom":
      return coords.y + floating.height > viewport.y + viewport.height - padding;
    case "left":
      return coords.x < viewport.x + padding;
    case "right":
      return coords.x + floating.width > viewport.x + viewport.width - padding;
  }
}

export function computePosition(
  anchorRect: Rect,
  floatingRect: Rect,
  viewport: Rect,
  options: ComputePositionOptions = {},
): Position {
  const {
    placement = "bottom",
    offset = 8,
    flip = true,
    shift = true,
    padding = 8,
    arrowSize = 0,
  } = options;

  const requested = parsePlacement(placement);
  let { side } = requested;
  const { align } = requested;

  const totalOffset = offset + arrowSize;

  let coords = coordsFor(side, align, anchorRect, floatingRect, totalOffset);

  // Flip only if the opposite side is actually better, so a floating element
  // larger than the viewport does not oscillate.
  if (flip && overflowsOnMainAxis(side, coords, floatingRect, viewport, padding)) {
    const flipped = OPPOSITE[side];
    const flippedCoords = coordsFor(flipped, align, anchorRect, floatingRect, totalOffset);

    if (!overflowsOnMainAxis(flipped, flippedCoords, floatingRect, viewport, padding)) {
      side = flipped;
      coords = flippedCoords;
    }
  }

  // The arrow tracks the anchor's centre, which shifting does not move.
  const anchorCenterX = anchorRect.x + anchorRect.width / 2;
  const anchorCenterY = anchorRect.y + anchorRect.height / 2;

  if (shift) {
    if (isVertical(side)) {
      const min = viewport.x + padding;
      const max = viewport.x + viewport.width - floatingRect.width - padding;
      coords.x = max < min ? min : Math.min(Math.max(coords.x, min), max);
    } else {
      const min = viewport.y + padding;
      const max = viewport.y + viewport.height - floatingRect.height - padding;
      coords.y = max < min ? min : Math.min(Math.max(coords.y, min), max);
    }
  }

  let arrowX: number | null = null;
  let arrowY: number | null = null;

  if (arrowSize > 0) {
    // Clamp the arrow inside the floating element's corners, so it never
    // detaches from the body when the anchor sits near a viewport edge.
    const limit = (value: number, extent: number) =>
      Math.min(Math.max(value, padding), extent - arrowSize - padding);

    if (isVertical(side)) {
      arrowX = limit(anchorCenterX - coords.x - arrowSize / 2, floatingRect.width);
    } else {
      arrowY = limit(anchorCenterY - coords.y - arrowSize / 2, floatingRect.height);
    }
  }

  return {
    x: Math.round(coords.x),
    y: Math.round(coords.y),
    side,
    align,
    arrowX: arrowX === null ? null : Math.round(arrowX),
    arrowY: arrowY === null ? null : Math.round(arrowY),
  };
}
