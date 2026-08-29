import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type NumberInputSize = "sm" | "md" | "lg";

export interface NumberInputOwnProps {
  /** Empty is represented as `null`, not as 0 — a blank field has no value. */
  value?: number | null | undefined;
  defaultValue?: number | null | undefined;
  onValueChange?: ((value: number | null) => void) | undefined;

  min?: number | undefined;
  max?: number | undefined;
  /** @default 1 */
  step?: number | undefined;
  /** Step used with PageUp and PageDown. Defaults to ten steps. */
  largeStep?: number | undefined;
  /** Decimal places to round to. Inferred from `step` when omitted. */
  precision?: number | undefined;

  /** @default "md" */
  size?: NumberInputSize | undefined;
  /** Hide the increment and decrement buttons. */
  hideSteppers?: boolean | undefined;
  /** Wrap past the ends instead of stopping. Requires both min and max. */
  wrap?: boolean | undefined;

  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  invalid?: boolean | undefined;

  fieldClassName?: string | undefined;
  wrapperClassName?: string | undefined;
  incrementLabel?: string | undefined;
  decrementLabel?: string | undefined;
}

export interface NumberInputProps
  extends NumberInputOwnProps,
    Omit<
      ComponentPropsWithoutRef<"input">,
      keyof NumberInputOwnProps | "type" | "size" | "value" | "defaultValue" | "onChange"
    > {}
