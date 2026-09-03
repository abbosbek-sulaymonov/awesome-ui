import type { ComponentPropsWithoutRef } from "react";
import type { Weekday } from "../../utils/date";

export interface CalendarOwnProps {
  /** Selected day. `null` means nothing is selected. */
  value?: Date | null | undefined;
  defaultValue?: Date | null | undefined;
  onValueChange?: ((value: Date) => void) | undefined;

  /** Month on display. Controlled separately from the selection. */
  month?: Date | undefined;
  defaultMonth?: Date | undefined;
  onMonthChange?: ((month: Date) => void) | undefined;

  min?: Date | undefined;
  max?: Date | undefined;
  /** Rejects individual days inside the range — weekends, holidays, taken slots. */
  isDateDisabled?: ((date: Date) => boolean) | undefined;

  /** 0 is Sunday. @default 1 */
  weekStartsOn?: Weekday | undefined;
  /** BCP 47 tag for month and weekday names. Defaults to the browser's. */
  locale?: string | undefined;

  /** Drop the surrounding surface, for embedding in a popover that has its own. */
  plain?: boolean | undefined;
  /** Show the "Today" shortcut. @default true */
  showToday?: boolean | undefined;

  /** Accessible name for the grid. @default "Calendar" */
  label?: string | undefined;
  previousLabel?: string | undefined;
  nextLabel?: string | undefined;
  todayLabel?: string | undefined;
}

export interface CalendarProps
  extends CalendarOwnProps,
    Omit<ComponentPropsWithoutRef<"div">, keyof CalendarOwnProps | "defaultValue"> {}
