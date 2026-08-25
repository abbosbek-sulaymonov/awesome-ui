import { describe, expect, it } from "vitest";
import { computePosition } from "./position";

const viewport = { x: 0, y: 0, width: 1000, height: 800 };
const rect = (x: number, y: number, width: number, height: number) => ({ x, y, width, height });

describe("computePosition", () => {
  it("centres below the anchor by default", () => {
    const result = computePosition(rect(400, 300, 100, 40), rect(0, 0, 200, 80), viewport);

    expect(result.side).toBe("bottom");
    expect(result.y).toBe(348); // anchor bottom (340) + 8 offset
    expect(result.x).toBe(350); // anchor centre (450) - half width (100)
  });

  it("honours start and end alignment", () => {
    const anchor = rect(400, 300, 100, 40);
    const floating = rect(0, 0, 200, 80);

    expect(computePosition(anchor, floating, viewport, { placement: "bottom-start" }).x).toBe(400);
    expect(computePosition(anchor, floating, viewport, { placement: "bottom-end" }).x).toBe(300);
  });

  it("flips to the opposite side when the preferred one overflows", () => {
    // Anchor near the top: a top-placed element would run off screen.
    const result = computePosition(rect(400, 10, 100, 40), rect(0, 0, 200, 80), viewport, {
      placement: "top",
    });

    expect(result.side).toBe("bottom");
    expect(result.y).toBe(58);
  });

  it("does not flip when the opposite side overflows too", () => {
    const tallViewport = { x: 0, y: 0, width: 1000, height: 120 };
    const result = computePosition(rect(400, 10, 100, 40), rect(0, 0, 200, 200), tallViewport, {
      placement: "top",
    });

    // Both sides overflow, so the requested side is kept rather than thrashing.
    expect(result.side).toBe("top");
  });

  it("shifts along the cross axis to stay inside the viewport", () => {
    // Anchor hard against the left edge.
    const result = computePosition(rect(0, 300, 40, 40), rect(0, 0, 300, 80), viewport);

    expect(result.x).toBe(8); // clamped to the padding
  });

  it("keeps the arrow pointed at the anchor after shifting", () => {
    const result = computePosition(rect(0, 300, 40, 40), rect(0, 0, 300, 80), viewport, {
      arrowSize: 8,
    });

    // Anchor centre is 20; content starts at x=8, so the arrow sits at 20-8-4.
    expect(result.arrowX).toBe(8);
    expect(result.arrowY).toBeNull();
  });

  it("clamps the arrow inside the floating element's corners", () => {
    const result = computePosition(rect(950, 300, 40, 40), rect(0, 0, 300, 80), viewport, {
      arrowSize: 8,
    });

    expect(result.arrowX).toBeLessThanOrEqual(300 - 8 - 8);
    expect(result.arrowX).toBeGreaterThanOrEqual(8);
  });

  it("reserves space for the arrow in the offset", () => {
    const withArrow = computePosition(rect(400, 300, 100, 40), rect(0, 0, 200, 80), viewport, {
      arrowSize: 8,
    });
    const without = computePosition(rect(400, 300, 100, 40), rect(0, 0, 200, 80), viewport);

    expect(withArrow.y - without.y).toBe(8);
  });

  it("positions on the horizontal axis for left and right", () => {
    const result = computePosition(rect(400, 300, 100, 40), rect(0, 0, 200, 80), viewport, {
      placement: "right",
    });

    expect(result.side).toBe("right");
    expect(result.x).toBe(508);
    expect(result.y).toBe(300 + 20 - 40);
  });
});
