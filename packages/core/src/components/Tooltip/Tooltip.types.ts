import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { Placement } from "../../utils/position";
import type { AsChildProps } from "../../types/polymorphic";

export interface TooltipRootProps {
  children?: ReactNode;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** @default "top" */
  placement?: Placement | undefined;
  /** @default 6 */
  offset?: number | undefined;
  /** Delay before showing on hover, in ms. @default 500 */
  openDelay?: number | undefined;
  /** Grace period before hiding, in ms. @default 100 */
  closeDelay?: number | undefined;
  /** Never open. Useful for conditionally-labelled controls. */
  disabled?: boolean | undefined;
}

export interface TooltipTriggerProps
  extends AsChildProps,
    ComponentPropsWithoutRef<"button"> {}

export interface TooltipContentProps extends ComponentPropsWithoutRef<"div"> {}
export interface TooltipArrowProps extends ComponentPropsWithoutRef<"div"> {}
