import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import { useControllableState } from "../../hooks/useControllableState";
import { useId } from "../../hooks/useId";
import { cn } from "../../utils/cn";
import {
  addDays, addMonths, addYears, clampDate, compareDays, endOfMonth, formatFullDate,
  formatMonthYear, getMonthGrid, getWeekdayNames, isSameDay, isSameMonth, isWithin,
  startOfDay, startOfMonth,
} from "../../utils/date";
import styles from "./Calendar.module.css";
import type { CalendarProps } from "./Calendar.types";

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={direction === "left" ? "M10 4L6 8l4 4" : "M6 4l4 4-4 4"} />
    </svg>
  );
}

/**
 * A month grid.
 *
 * Marked up as a real `<table>` with `role="grid"`. A grid of buttons in divs
 * loses the row and column relationships, so a screen reader can no longer say
 * which week or weekday a day belongs to.
 *
 * Only one day is ever in the tab order. Arrow keys move a roving focus within
 * the grid, which is what the ARIA grid pattern specifies and what stops a
 * month costing 42 tab stops.
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  {
    value, defaultValue = null, onValueChange,
    month, defaultMonth, onMonthChange,
    min, max, isDateDisabled,
    weekStartsOn = 1, locale,
    plain, showToday = true,
    label = "Calendar",
    previousLabel = "Previous month",
    nextLabel = "Next month",
    todayLabel = "Today",
    className, id: providedId, ...rest
  },
  ref,
) {
  const [selected, setSelected] = useControllableState<Date | null>({
    value,
    defaultValue,
    ...(onValueChange ? { onChange: (next) => next && onValueChange(next) } : {}),
  });

  const [visibleMonth, setVisibleMonth] = useControllableState<Date>({
    value: month,
    defaultValue: startOfMonth(defaultMonth ?? selected ?? new Date()),
    ...(onMonthChange ? { onChange: onMonthChange } : {}),
  });

  const baseId = useId(providedId, "aui-calendar");
  const headingId = `${baseId}-heading`;
  const gridRef = useRef<HTMLTableElement | null>(null);

  const today = useMemo(() => startOfDay(new Date()), []);

  /**
   * The day the arrow keys move from.
   *
   * Held separately from the selection so the grid can be navigated without
   * choosing anything — a keyboard user has to be able to look before they
   * commit.
   */
  const [focusedDay, setFocusedDay] = useState<Date>(() =>
    clampDate(selected ?? startOfMonth(visibleMonth), min, max),
  );

  const grid = useMemo(
    () => getMonthGrid(visibleMonth, weekStartsOn),
    [visibleMonth, weekStartsOn],
  );
  const weekdays = useMemo(
    () => getWeekdayNames(locale, weekStartsOn),
    [locale, weekStartsOn],
  );

  const dayDisabled = useCallback(
    (date: Date) => !isWithin(date, min, max) || Boolean(isDateDisabled?.(date)),
    [min, max, isDateDisabled],
  );

  /** Moves focus, following it to another month when the move leaves this one. */
  const moveFocus = useCallback(
    (next: Date) => {
      const target = clampDate(next, min, max);
      setFocusedDay(target);

      if (!isSameMonth(target, visibleMonth)) setVisibleMonth(startOfMonth(target));

      // The node for the new day may not exist until after this render.
      requestAnimationFrame(() => {
        gridRef.current
          ?.querySelector<HTMLButtonElement>(`[data-day="${target.toDateString()}"]`)
          ?.focus({ preventScroll: true });
      });
    },
    [min, max, visibleMonth, setVisibleMonth],
  );

  const select = useCallback(
    (date: Date) => {
      if (dayDisabled(date)) return;
      setSelected(startOfDay(date));
      setFocusedDay(startOfDay(date));
      if (!isSameMonth(date, visibleMonth)) setVisibleMonth(startOfMonth(date));
    },
    [dayDisabled, setSelected, visibleMonth, setVisibleMonth],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLTableElement>) => {
    const map: Record<string, Date | undefined> = {
      ArrowLeft: addDays(focusedDay, -1),
      ArrowRight: addDays(focusedDay, 1),
      ArrowUp: addDays(focusedDay, -7),
      ArrowDown: addDays(focusedDay, 7),
      Home: startOfMonth(focusedDay),
      End: endOfMonth(focusedDay),
      PageUp: event.shiftKey ? addYears(focusedDay, -1) : addMonths(focusedDay, -1),
      PageDown: event.shiftKey ? addYears(focusedDay, 1) : addMonths(focusedDay, 1),
    };

    const next = map[event.key];
    if (!next) return;

    // Otherwise these scroll the page out from under the grid.
    event.preventDefault();
    moveFocus(next);
  };

  const canGoBack = !min || compareDays(startOfMonth(visibleMonth), min) > 0;
  const canGoForward = !max || compareDays(endOfMonth(visibleMonth), max) < 0;

  const goToMonth = (delta: number) => {
    const next = startOfMonth(addMonths(visibleMonth, delta));
    setVisibleMonth(next);
    // Keep the roving focus inside the month now on screen.
    setFocusedDay(clampDate(addMonths(focusedDay, delta), min, max));
  };

  return (
    <div ref={ref} id={baseId} className={cn(styles.root, plain && styles.plain, className)} {...rest}>
      <div className={styles.header}>
        <button type="button" className={styles.navButton} aria-label={previousLabel}
          disabled={!canGoBack} onClick={() => goToMonth(-1)}>
          <Chevron direction="left" />
        </button>

        {/* aria-live so paging the month is announced; a silent change leaves a
            screen-reader user reading days from a month they cannot see. */}
        <div className={styles.heading} id={headingId} aria-live="polite">
          {formatMonthYear(visibleMonth, locale)}
        </div>

        <button type="button" className={styles.navButton} aria-label={nextLabel}
          disabled={!canGoForward} onClick={() => goToMonth(1)}>
          <Chevron direction="right" />
        </button>
      </div>

      <table
        ref={gridRef}
        role="grid"
        aria-label={label}
        aria-labelledby={headingId}
        className={styles.grid}
        onKeyDown={onKeyDown}
      >
        <thead>
          <tr>
            {weekdays.map((day) => (
              <th key={day} scope="col" className={styles.weekday} abbr={day}>
                {day.slice(0, 2)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, week) => (
            <tr key={week}>
              {grid.slice(week * 7, week * 7 + 7).map((date) => {
                const outside = !isSameMonth(date, visibleMonth);
                const isSelected = isSameDay(date, selected);
                const disabled = dayDisabled(date);

                return (
                  <td key={date.toDateString()} className={styles.cell}>
                    <button
                      type="button"
                      className={styles.day}
                      data-day={date.toDateString()}
                      data-outside={outside || undefined}
                      data-today={isSameDay(date, today) || undefined}
                      // One tab stop for the whole grid; arrows do the rest.
                      tabIndex={isSameDay(date, focusedDay) ? 0 : -1}
                      aria-selected={isSelected}
                      // The visible label is a bare number, which says nothing
                      // on its own.
                      aria-label={formatFullDate(date, locale)}
                      aria-current={isSameDay(date, today) ? "date" : undefined}
                      disabled={disabled}
                      onClick={() => select(date)}
                      onFocus={() => setFocusedDay(startOfDay(date))}
                    >
                      {date.getDate()}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {showToday ? (
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.footerButton}
            disabled={dayDisabled(today)}
            onClick={() => { select(today); moveFocus(today); }}
          >
            {todayLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
});

Calendar.displayName = "Calendar";
