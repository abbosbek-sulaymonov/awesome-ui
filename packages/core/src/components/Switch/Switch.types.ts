import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type SwitchSize = "sm" | "md" | "lg";

export interface SwitchOwnProps {
  /** @default "md" */
  size?: SwitchSize | undefined;
  checked?: boolean | undefined;
  defaultChecked?: boolean | undefined;
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  invalid?: boolean | undefined;
  /** Put the label first and push the switch to the far end — settings-row layout. */
  labelFirst?: boolean | undefined;
  fieldClassName?: string | undefined;
}

export interface SwitchProps
  extends SwitchOwnProps,
    Omit<
      ComponentPropsWithoutRef<"input">,
      keyof SwitchOwnProps | "type" | "size" | "checked" | "defaultChecked"
    > {}
