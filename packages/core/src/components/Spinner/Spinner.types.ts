import type { ComponentPropsWithoutRef } from "react";

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SpinnerTone = "accent" | "muted" | "current";

export interface SpinnerOwnProps {
  /** @default "md" */
  size?: SpinnerSize | undefined;
  /** `current` inherits the parent's color — use it inside buttons. @default "current" */
  tone?: SpinnerTone | undefined;
  /**
   * Announced to assistive tech. Pass `null` when a surrounding element already
   * describes the busy state, so it is not announced twice.
   * @default "Loading"
   */
  label?: string | null | undefined;
}

export interface SpinnerProps
  extends SpinnerOwnProps,
    Omit<ComponentPropsWithoutRef<"span">, keyof SpinnerOwnProps> {}
