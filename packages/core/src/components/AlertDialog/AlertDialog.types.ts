import type { ComponentPropsWithoutRef, ReactNode, RefObject } from "react";
import type { AsChildProps } from "../../types/polymorphic";

export interface AlertDialogRootProps {
  children?: ReactNode;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * Allow Escape to dismiss.
   *
   * On by default because trapping someone in a dialog with no keyboard exit is
   * worse than an accidental cancel — Escape maps to the cancel action, which is
   * the safe one.
   */
  dismissOnEscape?: boolean | undefined;
}

export interface AlertDialogTriggerProps extends AsChildProps, ComponentPropsWithoutRef<"button"> {}
export interface AlertDialogOverlayProps extends ComponentPropsWithoutRef<"div"> {}

export interface AlertDialogContentProps extends ComponentPropsWithoutRef<"div"> {
  size?: "sm" | "md" | "lg" | undefined;
  /**
   * Focused on open. Point it at the cancelling control: a destructive dialog
   * should not open with the destructive button under the return key.
   */
  initialFocusRef?: RefObject<HTMLElement | null> | undefined;
}

export interface AlertDialogTitleProps extends ComponentPropsWithoutRef<"h2"> {}
export interface AlertDialogDescriptionProps extends ComponentPropsWithoutRef<"p"> {}
export interface AlertDialogActionProps extends AsChildProps, ComponentPropsWithoutRef<"button"> {}
