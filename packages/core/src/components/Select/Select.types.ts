import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { Placement } from "../../utils/position";

export type SelectSize = "sm" | "md" | "lg";

export interface SelectRootProps {
  children?: ReactNode;
  /** Controlled value. */
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  /** Submitted with the surrounding form via a hidden native input. */
  name?: string | undefined;
  /** @default "bottom-start" */
  placement?: Placement | undefined;
}

export interface SelectTriggerProps extends ComponentPropsWithoutRef<"button"> {
  /** @default "md" */
  size?: SelectSize | undefined;
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  invalid?: boolean | undefined;
  /** Class for the outer wrapper holding label, trigger and messages. */
  fieldClassName?: string | undefined;
}

export interface SelectValueProps extends ComponentPropsWithoutRef<"span"> {
  /** Shown when nothing is selected. */
  placeholder?: ReactNode;
}

export interface SelectContentProps extends ComponentPropsWithoutRef<"div"> {
  /** Shown when the list has no items. */
  emptyMessage?: ReactNode;
}

export interface SelectItemProps extends Omit<ComponentPropsWithoutRef<"div">, "onSelect"> {
  value: string;
  disabled?: boolean | undefined;
  /**
   * Text used for typeahead and for the trigger's display. Defaults to the
   * item's text content, which is right unless the item renders extra chrome.
   */
  textValue?: string | undefined;
}

export interface SelectGroupProps extends ComponentPropsWithoutRef<"div"> {}
export interface SelectLabelProps extends ComponentPropsWithoutRef<"div"> {}
export interface SelectSeparatorProps extends ComponentPropsWithoutRef<"div"> {}
