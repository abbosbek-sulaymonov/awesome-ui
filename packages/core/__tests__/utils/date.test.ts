import { describe, expect, it } from "vitest";
import {
  addDays, addMonths, addYears, clampDate, compareDays, daysInMonth, endOfMonth,
  formatMonthYear, fromISODate, getMonthGrid, getWeekdayNames, isSameDay,
  isSameMonth, isWithin, startOfDay, startOfMonth, toISODate,
} from "../../src/utils/date";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe("day arithmetic", () => {
  it("strips the time from a day", () => {
    const noon = new Date(2026, 2, 15, 13, 45, 30, 500);
    const start = startOfDay(noon);

    expect(start.getHours()).toBe(0);
    expect(start.getDate()).toBe(15);
  });

  it("compares calendar days, not instants", () => {
    const morning = new Date(2026, 2, 15, 1);
    const evening = new Date(2026, 2, 15, 23);

    expect(isSameDay(morning, evening)).toBe(true);
    expect(compareDays(morning, evening)).toBe(0);
  });

  it("treats a missing date as never equal", () => {
    expect(isSameDay(null, d(2026, 3, 1))).toBe(false);
    expect(isSameDay(undefined, undefined)).toBe(false);
  });

  it("crosses month and year boundaries when adding days", () => {
    expect(toISODate(addDays(d(2026, 1, 31), 1))).toBe("2026-02-01");
    expect(toISODate(addDays(d(2026, 12, 31), 1))).toBe("2027-01-01");
    expect(toISODate(addDays(d(2026, 1, 1), -1))).toBe("2025-12-31");
  });
});

describe("month arithmetic", () => {
  it("clamps rather than overflowing", () => {
    // setMonth alone rolls 31 January into 3 March, which makes "next month"
    // skip February from any 29th, 30th or 31st.
    expect(toISODate(addMonths(d(2026, 1, 31), 1))).toBe("2026-02-28");
    expect(toISODate(addMonths(d(2026, 3, 31), -1))).toBe("2026-02-28");
    expect(toISODate(addMonths(d(2026, 5, 31), 1))).toBe("2026-06-30");
  });

  it("clamps into a leap February", () => {
    expect(toISODate(addMonths(d(2024, 1, 31), 1))).toBe("2024-02-29");
  });

  it("steps a whole year without drifting", () => {
    expect(toISODate(addYears(d(2026, 3, 15), 1))).toBe("2027-03-15");
    // 29 February has no counterpart in a common year.
    expect(toISODate(addYears(d(2024, 2, 29), 1))).toBe("2025-02-28");
  });

  it("knows the length of a month", () => {
    expect(daysInMonth(d(2026, 2, 1))).toBe(28);
    expect(daysInMonth(d(2024, 2, 1))).toBe(29);
    expect(daysInMonth(d(2026, 4, 1))).toBe(30);
    expect(daysInMonth(d(2026, 12, 1))).toBe(31);
  });

  it("finds the ends of a month", () => {
    expect(toISODate(startOfMonth(d(2026, 3, 17)))).toBe("2026-03-01");
    expect(toISODate(endOfMonth(d(2026, 2, 5)))).toBe("2026-02-28");
  });

  it("compares months independently of the day", () => {
    expect(isSameMonth(d(2026, 3, 1), d(2026, 3, 31))).toBe(true);
    expect(isSameMonth(d(2026, 3, 1), d(2027, 3, 1))).toBe(false);
  });
});

describe("bounds", () => {
  it("clamps to a range", () => {
    const min = d(2026, 3, 10);
    const max = d(2026, 3, 20);

    expect(toISODate(clampDate(d(2026, 3, 1), min, max))).toBe("2026-03-10");
    expect(toISODate(clampDate(d(2026, 3, 25), min, max))).toBe("2026-03-20");
    expect(toISODate(clampDate(d(2026, 3, 15), min, max))).toBe("2026-03-15");
  });

  it("treats the bounds as inclusive", () => {
    const min = d(2026, 3, 10);
    const max = d(2026, 3, 20);

    expect(isWithin(min, min, max)).toBe(true);
    expect(isWithin(max, min, max)).toBe(true);
    expect(isWithin(d(2026, 3, 9), min, max)).toBe(false);
  });

  it("accepts anything when unbounded", () => {
    expect(isWithin(d(2026, 3, 15))).toBe(true);
  });
});

describe("month grid", () => {
  it("is always six weeks", () => {
    // A grid that changes height between months makes everything below it jump
    // as you page through.
    for (let month = 1; month <= 12; month++) {
      expect(getMonthGrid(d(2026, month, 1))).toHaveLength(42);
    }
    expect(getMonthGrid(d(2026, 2, 1))).toHaveLength(42);
  });

  it("starts on the configured weekday", () => {
    const mondayFirst = getMonthGrid(d(2026, 3, 1), 1);
    const sundayFirst = getMonthGrid(d(2026, 3, 1), 0);

    expect(mondayFirst[0]!.getDay()).toBe(1);
    expect(sundayFirst[0]!.getDay()).toBe(0);
  });

  it("runs in unbroken daily order", () => {
    const grid = getMonthGrid(d(2026, 3, 1));
    for (let i = 1; i < grid.length; i++) {
      expect(compareDays(grid[i]!, addDays(grid[i - 1]!, 1))).toBe(0);
    }
  });

  it("contains every day of the month it is for", () => {
    const grid = getMonthGrid(d(2026, 2, 1));
    for (let day = 1; day <= 28; day++) {
      expect(grid.some((cell) => isSameDay(cell, d(2026, 2, day)))).toBe(true);
    }
  });

  it("pads with the neighbouring months", () => {
    // 1 March 2026 is a Sunday, so a Monday-first grid opens in February.
    const grid = getMonthGrid(d(2026, 3, 1), 1);
    expect(isSameMonth(grid[0]!, d(2026, 2, 1))).toBe(true);
    expect(isSameMonth(grid[41]!, d(2026, 3, 1))).toBe(false);
  });
});

describe("locale formatting", () => {
  it("orders weekday names from the configured start", () => {
    const monday = getWeekdayNames("en-GB", 1);
    const sunday = getWeekdayNames("en-GB", 0);

    expect(monday).toHaveLength(7);
    expect(monday[0]).toMatch(/^Mon/);
    expect(sunday[0]).toMatch(/^Sun/);
  });

  it("follows the locale", () => {
    expect(formatMonthYear(d(2026, 3, 1), "en-GB")).toMatch(/March/);
    expect(formatMonthYear(d(2026, 3, 1), "de-DE")).toMatch(/März/);
  });
});

describe("ISO round-trip", () => {
  it("formats in local time", () => {
    expect(toISODate(d(2026, 3, 1))).toBe("2026-03-01");
    expect(toISODate(d(999, 1, 2))).toBe("0999-01-02");
  });

  it("parses as a local day rather than UTC midnight", () => {
    // `new Date("2026-03-01")` is UTC midnight, which is the previous day
    // anywhere west of Greenwich.
    const parsed = fromISODate("2026-03-01")!;

    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(2);
    expect(parsed.getDate()).toBe(1);
  });

  it("round-trips", () => {
    for (const iso of ["2026-01-01", "2026-02-28", "2024-02-29", "2026-12-31"]) {
      expect(toISODate(fromISODate(iso)!)).toBe(iso);
    }
  });

  it("rejects impossible dates instead of rolling them over", () => {
    // Without the check these become 2 March and 1 December.
    expect(fromISODate("2026-02-30")).toBeNull();
    expect(fromISODate("2026-13-01")).toBeNull();
    expect(fromISODate("2025-02-29")).toBeNull();
  });

  it("rejects anything that is not a plain date", () => {
    for (const bad of ["", "nonsense", "2026-3-1", "2026/03/01", "2026-03-01T00:00"]) {
      expect(fromISODate(bad)).toBeNull();
    }
  });
});
