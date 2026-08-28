import type { ComponentPropsWithoutRef } from "react";

export type ToggleVariant = "ghost" | "outline";
export type ToggleSize = "sm" | "md" | "lg";

export interface ToggleOwnProps {
  pressed?: boolean | undefined;
  defaultPressed?: boolean | undefined;
  onPressedChange?: ((pressed: boolean) => void) | undefined;
  /** @default "ghost" */
  variant?: ToggleVariant | undefined;
  /** @default "md" */
  size?: ToggleSize | undefined;
  /** Identifies this toggle within a ToggleGroup. */
  value?: string | undefined;
}

export interface ToggleProps
  extends ToggleOwnProps,
    Omit<ComponentPropsWithoutRef<"button">, keyof ToggleOwnProps | "type"> {}
