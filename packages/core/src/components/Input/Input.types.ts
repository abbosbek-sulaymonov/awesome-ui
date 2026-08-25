import type { InputHTMLAttributes, ReactNode } from "react";

export type InputVariant = "outline" | "filled" | "flushed";
export type InputSize = "sm" | "md" | "lg";

export interface InputOwnProps {
  /** @default "outline" */
  variant?: InputVariant | undefined;
  /** @default "md" */
  size?: InputSize | undefined;
  /** Visible label. Omit it only if you supply `aria-label` yourself. */
  label?: ReactNode;
  /** Helper text under the control, wired via `aria-describedby`. */
  description?: ReactNode;
  /**
   * Error text under the control. Its presence marks the field invalid and
   * wires `aria-errormessage`, so you never set `invalid` separately.
   */
  errorMessage?: ReactNode;
  /** Force the invalid state without an error message. */
  invalid?: boolean | undefined;
  /** Rendered inside the box, before the input. */
  startIcon?: ReactNode;
  /** Rendered inside the box, after the input. */
  endIcon?: ReactNode;
  /** Class for the outer field wrapper (label + control + messages). */
  fieldClassName?: string | undefined;
  /** Class for the bordered box around the input. */
  wrapperClassName?: string | undefined;
}

export interface InputProps
  extends InputOwnProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, keyof InputOwnProps | "size"> {}
