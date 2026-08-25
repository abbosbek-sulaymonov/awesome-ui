import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useFloating } from "../../hooks/useFloating";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useId } from "../../hooks/useId";
import { DismissableLayer } from "../../primitives/DismissableLayer";
import { Portal } from "../../primitives/Portal";
import { usePresence } from "../../primitives/Presence";
import { Slot } from "../../primitives/Slot";
import { cn } from "../../utils/cn";
import { composeEventHandlers } from "../../utils/composeEventHandlers";
import { useComposedRefs } from "../../utils/composeRefs";
import { PopoverContext, usePopoverContext } from "./PopoverContext";
import styles from "./Popover.module.css";
import type {
  PopoverArrowProps,
  PopoverCloseProps,
  PopoverContentProps,
  PopoverRootProps,
  PopoverTriggerProps,
} from "./Popover.types";

const ARROW_SIZE = 8;

function PopoverRoot({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = "bottom",
  offset = 8,
  modal = false,
}: PopoverRootProps) {
  const { open: isOpen, setOpen } = useDisclosure({
    ...(open !== undefined ? { open } : {}),
    defaultOpen,
    ...(onOpenChange ? { onOpenChange } : {}),
  });

  const contentId = useId(undefined, "aui-popover");
  const triggerRef = useRef<HTMLElement | null>(null);

  const floating = useFloating({
    open: isOpen,
    placement,
    offset,
    arrowSize: ARROW_SIZE,
  });

  const value = useMemo(
    () => ({ open: isOpen, setOpen, contentId, floating, triggerRef, modal }),
    [isOpen, setOpen, contentId, floating, modal],
  );

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

PopoverRoot.displayName = "Popover.Root";

const PopoverTrigger = forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  function PopoverTrigger({ asChild, onClick, type, ...rest }, forwardedRef) {
    const { open, setOpen, contentId, floating, triggerRef } =
      usePopoverContext("Popover.Trigger");

    const ref = useComposedRefs<HTMLButtonElement>(
      forwardedRef,
      floating.setAnchor,
      (node) => void (triggerRef.current = node),
    );

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        {...(asChild ? {} : { type: type ?? "button" })}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? contentId : undefined}
        data-state={open ? "open" : "closed"}
        onClick={composeEventHandlers(onClick, () => setOpen(!open))}
        {...rest}
      />
    );
  },
);

PopoverTrigger.displayName = "Popover.Trigger";

const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(
    {
      autoFocus = true,
      initialFocusRef,
      dismissOnEscape = true,
      dismissOnOutsideClick = true,
      className,
      style,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const { open, setOpen, contentId, floating, triggerRef, modal } =
      usePopoverContext("Popover.Content");

    const { isPresent, ref: presenceRef, state } = usePresence(open);
    const [node, setNode] = useState<HTMLDivElement | null>(null);
    const ref = useComposedRefs<HTMLDivElement>(
      forwardedRef,
      presenceRef,
      floating.setFloating,
      setNode,
    );

    useFocusTrap({
      container: node,
      // A non-modal popover manages initial focus but does not hold it.
      active: open && isPresent && modal,
      initialFocus: initialFocusRef?.current ?? null,
      returnFocus: triggerRef.current,
      disableAutoFocus: !autoFocus,
    });

    const onDismiss = useCallback(
      (reason: "escape" | "outside-pointer" | "focus-outside") => {
        if (reason === "escape" && !dismissOnEscape) return;
        if (reason === "outside-pointer" && !dismissOnOutsideClick) return;
        setOpen(false);
        // Escape implies the keyboard is in use, so focus must go somewhere
        // sensible rather than back to <body>.
        if (reason === "escape") triggerRef.current?.focus({ preventScroll: true });
      },
      [dismissOnEscape, dismissOnOutsideClick, setOpen, triggerRef],
    );

    if (!isPresent) return null;

    return (
      <Portal>
        <DismissableLayer
          ref={ref}
          id={contentId}
          role="dialog"
          aria-modal={modal || undefined}
          data-state={state}
          data-side={floating.position?.side ?? "bottom"}
          data-align={floating.position?.align ?? "center"}
          className={cn(styles.content, className)}
          style={{ ...floating.floatingStyles, ...style }}
          onDismiss={onDismiss}
          excludedElements={[triggerRef.current]}
          {...rest}
        >
          {children}
        </DismissableLayer>
      </Portal>
    );
  },
);

PopoverContent.displayName = "Popover.Content";

const PopoverArrow = forwardRef<HTMLDivElement, PopoverArrowProps>(
  function PopoverArrow({ className, style, ...rest }, forwardedRef) {
    const { floating } = usePopoverContext("Popover.Arrow");
    const ref = useComposedRefs<HTMLDivElement>(forwardedRef, floating.setArrow);

    return (
      <div
        ref={ref}
        className={cn(styles.arrow, className)}
        style={{ ...floating.arrowStyles, ...style }}
        aria-hidden="true"
        {...rest}
      />
    );
  },
);

PopoverArrow.displayName = "Popover.Arrow";

const PopoverClose = forwardRef<HTMLButtonElement, PopoverCloseProps>(
  function PopoverClose({ asChild, onClick, type, ...rest }, ref) {
    const { setOpen, triggerRef } = usePopoverContext("Popover.Close");
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        {...(asChild ? {} : { type: type ?? "button" })}
        onClick={composeEventHandlers(onClick, () => {
          setOpen(false);
          triggerRef.current?.focus({ preventScroll: true });
        })}
        {...rest}
      />
    );
  },
);

PopoverClose.displayName = "Popover.Close";

export const Popover = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Arrow: PopoverArrow,
  Close: PopoverClose,
};

export { PopoverRoot, PopoverTrigger, PopoverContent, PopoverArrow, PopoverClose };
