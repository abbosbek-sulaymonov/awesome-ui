/**
 * Date helpers for Calendar and DatePicker.
 *
 * Hand-written rather than pulled from date-fns or Day.js, because the package
 * claims zero runtime dependencies and the arithmetic a month grid needs is
 * genuinely small. Anything harder than this — parsing arbitrary user input,
 * time zones, durations — is deliberately out of scope and belongs to the
 * caller.
 *
 * Everything here works in the local time zone and treats a Date as a calendar
 * day, ignoring its time. That is the only interpretation a date picker has.
 */

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Midnight local time on the same calendar day. */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/**
 * Adds days, months or years.
 *
 * Months clamp rather than overflow: adding one month to 31 January gives 28
 * February, not 3 March. `setMonth` alone rolls over, which makes "next month"
 * skip February entirely from any 29th, 30th or 31st.
 */
export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function addMonths(date: Date, amount: number): Date {
  const result = new Date(date);
  const targetDay = result.getDate();

  result.setDate(1);
  result.setMonth(result.getMonth() + amount);
  result.setDate(Math.min(targetDay, daysInMonth(result)));

  return result;
}

export function addYears(date: Date, amount: number): Date {
  return addMonths(date, amount * 12);
}

export function daysInMonth(date: Date): number {
  // Day 0 of the next month is the last day of this one.
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function startOfMonth(date: Date): Date {
  return startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function endOfMonth(date: Date): Date {
  return startOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

/** Compares calendar days only, so times never affect the result. */
export function compareDays(a: Date, b: Date): number {
  return startOfDay(a).getTime() - startOfDay(b).getTime();
}

export function clampDate(date: Date, min?: Date | undefined, max?: Date | undefined): Date {
  if (min && compareDays(date, min) < 0) return startOfDay(min);
  if (max && compareDays(date, max) > 0) return startOfDay(max);
  return startOfDay(date);
}

export function isWithin(date: Date, min?: Date | undefined, max?: Date | undefined): boolean {
  if (min && compareDays(date, min) < 0) return false;
  if (max && compareDays(date, max) > 0) return false;
  return true;
}

/**
 * The six-week grid for a month.
 *
 * Always 42 cells, never fewer. A grid that changes height between months makes
 * everything below it jump as you page through, and moves the day you were
 * about to click out from under the pointer.
 */
export function getMonthGrid(month: Date, weekStartsOn: Weekday = 1): Date[] {
  const first = startOfMonth(month);

  // How far back to the start of that week, given where the week begins.
  const offset = (first.getDay() - weekStartsOn + 7) % 7;
  const gridStart = addDays(first, -offset);

  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

/** Weekday names in the caller's locale, ordered from `weekStartsOn`. */
export function getWeekdayNames(
  locale: string | undefined,
  weekStartsOn: Weekday = 1,
  format: "short" | "narrow" | "long" = "short",
): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: format });

  // 4 January 1970 was a Sunday, which anchors the sequence without needing a
  // lookup table.
  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(new Date(Date.UTC(1970, 0, 4 + ((index + weekStartsOn) % 7)))),
  );
}

export function formatMonthYear(date: Date, locale?: string | undefined): string {
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
}

/** Spoken form of a full date, for a cell's accessible name. */
export function formatFullDate(date: Date, locale?: string | undefined): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(date);
}

/** `YYYY-MM-DD` in local time, for form values and `<input type="date">`. */
export function toISODate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses `YYYY-MM-DD` as a local calendar day.
 *
 * `new Date("2026-03-01")` parses as UTC midnight, which is the previous day
 * anywhere west of Greenwich — the classic off-by-one that makes a picker show
 * the wrong date for half the world.
 */
export function fromISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  // Rejects impossible dates such as 2026-02-30, which would otherwise roll
  // over into March and be silently accepted.
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return null;
  }

  return startOfDay(date);
}
