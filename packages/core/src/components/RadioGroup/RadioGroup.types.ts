import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type RadioSize = "sm" | "md" | "lg";
export type RadioOrientation = "vertical" | "horizontal";

export interface RadioGroupRootProps
  extends Omit<ComponentPropsWithoutRef<"fieldset">, "onChange"> {
  children?: ReactNode;
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** Shared across every radio, and what the form submits under. */
  name?: string | undefined;
  /** @default "md" */
  size?: RadioSize | undefined;
  /** @default "vertical" */
  orientation?: RadioOrientation | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  /** Visible group label, rendered as the fieldset's legend. */
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  invalid?: boolean | undefined;
}

export interface RadioGroupItemProps
  extends Omit<ComponentPropsWithoutRef<"input">, "type" | "size" | "value"> {
  value: string;
  label?: ReactNode;
  description?: ReactNode;
}
