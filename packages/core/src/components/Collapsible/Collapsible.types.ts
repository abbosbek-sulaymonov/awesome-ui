import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { AsChildProps } from "../../types/polymorphic";

export interface CollapsibleRootProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  disabled?: boolean | undefined;
}

export interface CollapsibleTriggerProps
  extends AsChildProps,
    ComponentPropsWithoutRef<"button"> {
  /** Hide the built-in chevron. */
  hideIndicator?: boolean | undefined;
}

export interface CollapsiblePanelProps extends ComponentPropsWithoutRef<"div"> {
  /** Keep the panel mounted while closed, so its state survives. */
  keepMounted?: boolean | undefined;
}
