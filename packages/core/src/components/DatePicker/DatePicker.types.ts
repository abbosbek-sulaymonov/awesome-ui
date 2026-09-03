import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { Weekday } from "../../utils/date";
import type { Placement } from "../../utils/position";

export type DatePickerSize = "sm" | "md" | "lg";

export interface DatePickerOwnProps {
  value?: Date | null | undefined;
  defaultValue?: Date | null | undefined;
  onValueChange?: ((value: Date | null) => void) | undefined;

  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;

  min?: Date | undefined;
  max?: Date | undefined;
  isDateDisabled?: ((date: Date) => boolean) | undefined;

  /** 0 is Sunday. @default 1 */
  weekStartsOn?: Weekday | undefined;
  locale?: string | undefined;
  /** @default "bottom-start" */
  placement?: Placement | undefined;
  /** @default "md" */
  size?: DatePickerSize | undefined;

  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  invalid?: boolean | undefined;
  /** @default "YYYY-MM-DD" */
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;

  /** Submitted with the surrounding form as `YYYY-MM-DD`. */
  name?: string | undefined;
  fieldClassName?: string | undefined;
  calendarLabel?: string | undefined;
  openCalendarLabel?: string | undefined;
}

export interface DatePickerProps
  extends DatePickerOwnProps,
    Omit<
      ComponentPropsWithoutRef<"input">,
      keyof DatePickerOwnProps | "value" | "defaultValue" | "size" | "type"
    > {}
