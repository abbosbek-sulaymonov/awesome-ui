import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type CheckboxSize = "sm" | "md" | "lg";

export interface CheckboxOwnProps {
  /** @default "md" */
  size?: CheckboxSize | undefined;
  /** Controlled checked state. */
  checked?: boolean | undefined;
  defaultChecked?: boolean | undefined;
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  /**
   * Neither checked nor unchecked — a parent whose children disagree. Visual
   * and ARIA only; the underlying value stays whatever `checked` says.
   */
  indeterminate?: boolean | undefined;
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  invalid?: boolean | undefined;
  /** Class for the outer wrapper. */
  fieldClassName?: string | undefined;
}

export interface CheckboxProps
  extends CheckboxOwnProps,
    Omit<
      ComponentPropsWithoutRef<"input">,
      keyof CheckboxOwnProps | "type" | "size" | "checked" | "defaultChecked"
    > {}
