import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type SliderSize = "sm" | "md" | "lg";
export type SliderTone = "accent" | "success" | "danger";

export interface SliderMark {
  value: number;
  label?: ReactNode;
}

export interface SliderOwnProps {
  /**
   * A single number, or a `[start, end]` pair for a range with two thumbs.
   * The shape of this value decides how many thumbs are rendered.
   */
  value?: number | [number, number] | undefined;
  defaultValue?: number | [number, number] | undefined;
  onValueChange?: ((value: number | [number, number]) => void) | undefined;
  /** Fired once when a drag or key repeat settles, for expensive commits. */
  onValueCommit?: ((value: number | [number, number]) => void) | undefined;

  /** @default 0 */
  min?: number | undefined;
  /** @default 100 */
  max?: number | undefined;
  /** @default 1 */
  step?: number | undefined;
  /** Step used with PageUp and PageDown. Defaults to ten steps. */
  largeStep?: number | undefined;
  /** Smallest gap between the two thumbs of a range. @default 0 */
  minStepsBetweenThumbs?: number | undefined;

  /** @default "md" */
  size?: SliderSize | undefined;
  /** @default "accent" */
  tone?: SliderTone | undefined;
  disabled?: boolean | undefined;

  label?: ReactNode;
  /** Show the current value beside the label. */
  showValue?: boolean | undefined;
  /** Ticks with optional labels under the track. */
  marks?: SliderMark[] | undefined;
  /** Spoken value. Use it for units — "42 percent" rather than "42". */
  formatValue?: ((value: number) => string) | undefined;
  /** Name for the hidden inputs, so a range submits with a form. */
  name?: string | undefined;
}

export interface SliderProps
  extends SliderOwnProps,
    Omit<ComponentPropsWithoutRef<"div">, keyof SliderOwnProps | "defaultValue"> {}
