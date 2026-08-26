import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type ProgressSize = "sm" | "md" | "lg";
export type ProgressTone = "accent" | "success" | "warning" | "danger";

export interface ProgressOwnProps {
  /**
   * Completed amount. Omit — or pass `null` — when the total is unknown, which
   * switches the bar to its indeterminate state.
   */
  value?: number | null | undefined;
  /** @default 100 */
  max?: number | undefined;
  /** @default "md" */
  size?: ProgressSize | undefined;
  /** @default "accent" */
  tone?: ProgressTone | undefined;
  /** Visible label above the track. */
  label?: ReactNode;
  /** Show the percentage beside the label. */
  showValue?: boolean | undefined;
  /**
   * Spoken description of the current value. Defaults to a percentage; supply
   * your own for units that mean more, such as "3 of 8 files".
   */
  valueLabel?: string | undefined;
}

export interface ProgressProps
  extends ProgressOwnProps,
    Omit<ComponentPropsWithoutRef<"div">, keyof ProgressOwnProps> {}
