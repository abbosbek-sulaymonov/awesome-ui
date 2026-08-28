import type { ComponentPropsWithoutRef, ReactNode, RefObject } from "react";
import type { AsChildProps } from "../../types/polymorphic";

export type DrawerSide = "left" | "right" | "top" | "bottom";
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

export interface DrawerRootProps {
  children?: ReactNode;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Edge it slides in from. @default "right" */
  side?: DrawerSide | undefined;
  dismissOnEscape?: boolean | undefined;
  dismissOnOutsideClick?: boolean | undefined;
  disableScrollLock?: boolean | undefined;
}

export interface DrawerTriggerProps extends AsChildProps, ComponentPropsWithoutRef<"button"> {}
export interface DrawerOverlayProps extends ComponentPropsWithoutRef<"div"> {}

export interface DrawerContentProps extends ComponentPropsWithoutRef<"div"> {
  /** @default "md" */
  size?: DrawerSize | undefined;
  showCloseButton?: boolean | undefined;
  closeButtonLabel?: string | undefined;
  initialFocusRef?: RefObject<HTMLElement | null> | undefined;
}

export interface DrawerHeaderProps extends ComponentPropsWithoutRef<"div"> {}
export interface DrawerTitleProps extends ComponentPropsWithoutRef<"h2"> {}
export interface DrawerDescriptionProps extends ComponentPropsWithoutRef<"p"> {}
export interface DrawerBodyProps extends ComponentPropsWithoutRef<"div"> {}
export interface DrawerFooterProps extends ComponentPropsWithoutRef<"div"> {}
export interface DrawerCloseProps extends AsChildProps, ComponentPropsWithoutRef<"button"> {}
