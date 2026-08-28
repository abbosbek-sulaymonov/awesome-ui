import type { ComponentPropsWithoutRef, ReactNode } from "react";

export type ToggleGroupOrientation = "horizontal" | "vertical";

interface SharedProps extends Omit<ComponentPropsWithoutRef<"div">, "onChange" | "defaultValue"> {
  children?: ReactNode;
  /** @default "horizontal" */
  orientation?: ToggleGroupOrientation | undefined;
  /** Join the buttons into one control instead of spacing them. @default true */
  joined?: boolean | undefined;
  disabled?: boolean | undefined;
  /** Accessible name for the group. */
  label?: string | undefined;
}

export interface ToggleGroupSingleProps extends SharedProps {
  /** @default "single" */
  type?: "single" | undefined;
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** Allow clearing the selection by pressing the active button. @default true */
  collapsible?: boolean | undefined;
}

export interface ToggleGroupMultipleProps extends SharedProps {
  type: "multiple";
  value?: string[] | undefined;
  defaultValue?: string[] | undefined;
  onValueChange?: ((value: string[]) => void) | undefined;
}

export type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;
