import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { AsChildProps } from "../../types/polymorphic";

export type DialogSize = "sm" | "md" | "lg" | "xl" | "full";

export interface DialogRootProps {
  children?: ReactNode;
  /** Controlled open state. */
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Ignore Escape. Pair with `dismissOnOutsideClick={false}` for a forced choice. */
  dismissOnEscape?: boolean | undefined;
  /** Ignore clicks on the overlay. */
  dismissOnOutsideClick?: boolean | undefined;
  /** Leave background scrolling alone. */
  disableScrollLock?: boolean | undefined;
  /**
   * A dialog with no `aria-modal` semantics — for non-blocking surfaces that
   * still need focus management.
   */
  modal?: boolean | undefined;
}

export interface DialogTriggerProps
  extends AsChildProps,
    ComponentPropsWithoutRef<"button"> {}

export interface DialogContentProps extends ComponentPropsWithoutRef<"div"> {
  /** @default "md" */
  size?: DialogSize | undefined;
  /** Render the built-in close button in the top corner. @default true */
  showCloseButton?: boolean | undefined;
  /** Accessible name for the built-in close button. @default "Close dialog" */
  closeButtonLabel?: string | undefined;
  /** Focus this element on open instead of the first tabbable one. */
  initialFocusRef?: React.RefObject<HTMLElement | null> | undefined;
  /** Class for the fixed layer that centres the content. */
  positionerClassName?: string | undefined;
}

export interface DialogOverlayProps extends ComponentPropsWithoutRef<"div"> {}
export interface DialogTitleProps extends ComponentPropsWithoutRef<"h2"> {}
export interface DialogDescriptionProps extends ComponentPropsWithoutRef<"p"> {}
export interface DialogHeaderProps extends ComponentPropsWithoutRef<"div"> {}
export interface DialogFooterProps extends ComponentPropsWithoutRef<"div"> {}
export interface DialogCloseProps
  extends AsChildProps,
    ComponentPropsWithoutRef<"button"> {}
