import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type TextareaVariant = "outline" | "filled";
export type TextareaSize = "sm" | "md" | "lg";

export interface TextareaOwnProps {
  /** @default "outline" */
  variant?: TextareaVariant | undefined;
  /** @default "md" */
  size?: TextareaSize | undefined;
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  invalid?: boolean | undefined;
  /** Grow with the content instead of scrolling. Disables the drag handle. */
  autoResize?: boolean | undefined;
  /** Smallest height, in rows. @default 3 */
  minRows?: number | undefined;
  /** Largest height before scrolling resumes. Auto-resize only. */
  maxRows?: number | undefined;
  /** Show a character counter. Pair with `maxLength` for a limit. */
  showCount?: boolean | undefined;
  /** Remove the drag handle without auto-resizing. */
  disableResize?: boolean | undefined;
  fieldClassName?: string | undefined;
  wrapperClassName?: string | undefined;
}

export interface TextareaProps
  extends TextareaOwnProps,
    Omit<ComponentPropsWithoutRef<"textarea">, keyof TextareaOwnProps | "rows"> {}
