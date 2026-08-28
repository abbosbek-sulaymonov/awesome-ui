import { describe, expect, it } from "vitest";
import { getPaginationRange } from "../../src/utils/pagination";

const at = (page: number, count: number, siblings = 1, boundaries = 1) =>
  getPaginationRange({ page, count, siblings, boundaries });

describe("getPaginationRange", () => {
  it("lists every page when there is nothing to truncate", () => {
    expect(at(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(at(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("returns nothing for an empty set", () => {
    expect(at(1, 0)).toEqual([]);
  });

  it("truncates on the right near the start", () => {
    // The window expands to fill the constant width rather than leaving the
    // row narrower than it will be a page later.
    expect(at(1, 20)).toEqual([1, 2, 3, 4, 5, "end-ellipsis", 20]);
  });

  it("truncates on the left near the end", () => {
    expect(at(20, 20)).toEqual([1, "start-ellipsis", 16, 17, 18, 19, 20]);
  });

  it("truncates both sides in the middle", () => {
    expect(at(10, 20)).toEqual([1, "start-ellipsis", 9, 10, 11, "end-ellipsis", 20]);
  });

  it("keeps a constant width once truncation begins", () => {
    // Controls that change width as you page through them move under the
    // pointer, so the button you meant to press is not the one you land on.
    const widths = new Set(Array.from({ length: 20 }, (_, i) => at(i + 1, 20).length));
    expect(widths.size).toBe(1);
  });

  it("shows a lone hidden page instead of an ellipsis over it", () => {
    // A gap of exactly one page wastes a slot hiding a single number.
    const result = at(4, 9, 1, 1);
    expect(result).not.toContain("start-ellipsis");
    expect(result).toContain(2);
  });

  it("never repeats a page", () => {
    for (let page = 1; page <= 20; page++) {
      const numbers = at(page, 20).filter((item): item is number => typeof item === "number");
      expect(new Set(numbers).size).toBe(numbers.length);
    }
  });

  it("stays in ascending order", () => {
    for (let page = 1; page <= 20; page++) {
      const numbers = at(page, 20).filter((item): item is number => typeof item === "number");
      expect([...numbers].sort((a, b) => a - b)).toEqual(numbers);
    }
  });

  it("always includes the current page", () => {
    for (let page = 1; page <= 30; page++) {
      expect(at(page, 30)).toContain(page);
    }
  });

  it("always includes the first and last page", () => {
    for (let page = 1; page <= 30; page++) {
      const result = at(page, 30);
      expect(result).toContain(1);
      expect(result).toContain(30);
    }
  });

  it("clamps a page outside the range instead of producing nonsense", () => {
    expect(at(999, 10)).toEqual(at(10, 10));
    expect(at(-5, 10)).toEqual(at(1, 10));
  });

  it("widens with more siblings", () => {
    expect(at(10, 20, 2)).toEqual([1, "start-ellipsis", 8, 9, 10, 11, 12, "end-ellipsis", 20]);
  });

  it("pins more pages at each end with more boundaries", () => {
    const result = at(10, 20, 1, 2);
    expect(result.slice(0, 2)).toEqual([1, 2]);
    expect(result.slice(-2)).toEqual([19, 20]);
  });
});
