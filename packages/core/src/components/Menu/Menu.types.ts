import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { Placement } from "../../utils/position";
import type { AsChildProps } from "../../types/polymorphic";

export interface MenuRootProps {
  children?: ReactNode;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** @default "bottom-start" */
  placement?: Placement | undefined;
}

export interface MenuTriggerProps extends AsChildProps, ComponentPropsWithoutRef<"button"> {}

export interface MenuContentProps extends ComponentPropsWithoutRef<"div"> {
  /** Accessible name for the menu. */
  label?: string | undefined;
}

export interface MenuItemProps extends Omit<ComponentPropsWithoutRef<"div">, "onSelect"> {
  disabled?: boolean | undefined;
  /** Destructive styling. Does not change behaviour. */
  danger?: boolean | undefined;
  /** Keyboard hint rendered on the trailing edge. Display only. */
  shortcut?: ReactNode;
  /**
   * Called on click or Enter/Space. Call `event.preventDefault()` to keep the
   * menu open — useful for items that toggle something.
   */
  onSelect?: ((event: { preventDefault: () => void; defaultPrevented: boolean }) => void) | undefined;
}

export interface MenuCheckboxItemProps extends Omit<MenuItemProps, "onSelect"> {
  checked?: boolean | undefined;
  onCheckedChange?: ((checked: boolean) => void) | undefined;
}

export interface MenuGroupProps extends ComponentPropsWithoutRef<"div"> {}
export interface MenuLabelProps extends ComponentPropsWithoutRef<"div"> {}
export interface MenuSeparatorProps extends ComponentPropsWithoutRef<"div"> {}
