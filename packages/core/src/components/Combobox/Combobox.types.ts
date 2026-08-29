import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { Placement } from "../../utils/position";

export type ComboboxSize = "sm" | "md" | "lg";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean | undefined;
}

export interface ComboboxOwnProps {
  options: ComboboxOption[];

  /** Selected value. */
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;

  /** Text in the field. Controlled separately from the selection. */
  inputValue?: string | undefined;
  onInputChange?: ((value: string) => void) | undefined;

  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;

  /**
   * Decides which options survive the query. Replace it when filtering happens
   * on a server, in which case return the list unchanged.
   */
  filter?: ((options: ComboboxOption[], query: string) => ComboboxOption[]) | undefined;

  /** @default "md" */
  size?: ComboboxSize | undefined;
  /** @default "bottom-start" */
  placement?: Placement | undefined;

  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  invalid?: boolean | undefined;
  placeholder?: string | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;

  /** Show a button that clears the selection. @default true */
  clearable?: boolean | undefined;
  /** Shown when nothing matches. @default "No results" */
  emptyMessage?: ReactNode;
  /** Submitted with the surrounding form. */
  name?: string | undefined;

  fieldClassName?: string | undefined;
}

export interface ComboboxProps
  extends ComboboxOwnProps,
    Omit<ComponentPropsWithoutRef<"input">, keyof ComboboxOwnProps | "value" | "size" | "type"> {}
