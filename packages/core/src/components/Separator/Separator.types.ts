import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorOwnProps {
  /** @default "horizontal" */
  orientation?: SeparatorOrientation | undefined;
  /**
   * Purely visual, with no structural meaning. Removes it from the
   * accessibility tree rather than announcing a separator that divides nothing.
   * @default false
   */
  decorative?: boolean | undefined;
  /** Text set into a gap in the rule. Horizontal only. */
  label?: ReactNode;
}

export interface SeparatorProps
  extends SeparatorOwnProps,
    Omit<ComponentPropsWithoutRef<"div">, keyof SeparatorOwnProps> {}
