import type { ComponentPropsWithoutRef, ReactNode, RefObject } from "react";
import type { Placement } from "../../utils/position";
import type { AsChildProps } from "../../types/polymorphic";

export interface PopoverRootProps {
  children?: ReactNode;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** @default "bottom" */
  placement?: Placement | undefined;
  /** Gap between trigger and content, in px. @default 8 */
  offset?: number | undefined;
  /** Trap focus and treat the content as blocking. @default false */
  modal?: boolean | undefined;
}

export interface PopoverTriggerProps
  extends AsChildProps,
    ComponentPropsWithoutRef<"button"> {}

export interface PopoverContentProps extends ComponentPropsWithoutRef<"div"> {
  /** Move focus into the content on open. @default true */
  autoFocus?: boolean | undefined;
  /** Focus this instead of the first tabbable element. */
  initialFocusRef?: RefObject<HTMLElement | null> | undefined;
  dismissOnEscape?: boolean | undefined;
  dismissOnOutsideClick?: boolean | undefined;
}

export interface PopoverArrowProps extends ComponentPropsWithoutRef<"div"> {}
export interface PopoverCloseProps
  extends AsChildProps,
    ComponentPropsWithoutRef<"button"> {}
