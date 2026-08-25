import { forwardRef, useCallback, useMemo, useRef, useState } from "react";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useId } from "../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useScrollLock } from "../../hooks/useScrollLock";
import { DismissableLayer } from "../../primitives/DismissableLayer";
import { Portal } from "../../primitives/Portal";
import { usePresence } from "../../primitives/Presence";
import { Slot } from "../../primitives/Slot";
import { cn } from "../../utils/cn";
import { composeEventHandlers } from "../../utils/composeEventHandlers";
import { useComposedRefs } from "../../utils/composeRefs";
import { DialogContext, useDialogContext } from "./DialogContext";
import styles from "./Dialog.module.css";
import type {
  DialogCloseProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogOverlayProps,
  DialogRootProps,
  DialogTitleProps,
  DialogTriggerProps,
} from "./Dialog.types";

function DialogRoot({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  dismissOnEscape = true,
  dismissOnOutsideClick = true,
  disableScrollLock = false,
  modal = true,
}: DialogRootProps) {
  const { open: isOpen, setOpen } = useDisclosure({
    ...(open !== undefined ? { open } : {}),
    defaultOpen,
    ...(onOpenChange ? { onOpenChange } : {}),
  });

  const baseId = useId(undefined, "aui-dialog");
  const triggerRef = useRef<HTMLElement | null>(null);

  // Title and description register themselves so the content only advertises
  // aria-labelledby / aria-describedby for nodes that actually exist.
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);

  const value = useMemo(
    () => ({
      open: isOpen,
      setOpen,
      titleId: `${baseId}-title`,
      descriptionId: `${baseId}-description`,
      hasTitle,
      registerTitle: setHasTitle,
      hasDescription,
      registerDescription: setHasDescription,
      dismissOnEscape,
      dismissOnOutsideClick,
      disableScrollLock,
      modal,
      triggerRef,
    }),
    [
      isOpen,
      setOpen,
      baseId,
      hasTitle,
      hasDescription,
      dismissOnEscape,
      dismissOnOutsideClick,
      disableScrollLock,
      modal,
    ],
  );

  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

DialogRoot.displayName = "Dialog.Root";

const DialogTrigger = forwardRef<HTMLButtonElement, DialogTriggerProps>(
  function DialogTrigger({ asChild, onClick, type, ...rest }, forwardedRef) {
    const { open, setOpen, triggerRef } = useDialogContext("Dialog.Trigger");
    const ref = useComposedRefs<HTMLButtonElement>(
      forwardedRef,
      (node) => void (triggerRef.current = node),
    );

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        {...(asChild ? {} : { type: type ?? "button" })}
        aria-haspopup="dialog"
        aria-expanded={open}
        data-state={open ? "open" : "closed"}
        onClick={composeEventHandlers(onClick, () => setOpen(true))}
        {...rest}
      />
    );
  },
);

DialogTrigger.displayName = "Dialog.Trigger";

const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(
  function DialogOverlay({ className, ...rest }, forwardedRef) {
    const { open } = useDialogContext("Dialog.Overlay");
    const { isPresent, ref: presenceRef, state } = usePresence(open);
    const ref = useComposedRefs<HTMLDivElement>(forwardedRef, presenceRef);

    if (!isPresent) return null;

    return (
      <div
        ref={ref}
        className={cn(styles.overlay, className)}
        data-state={state}
        // The content layer owns dismissal; the overlay is purely decorative.
        aria-hidden="true"
        {...rest}
      />
    );
  },
);

DialogOverlay.displayName = "Dialog.Overlay";

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(
    {
      size = "md",
      showCloseButton = true,
      closeButtonLabel = "Close dialog",
      initialFocusRef,
      positionerClassName,
      className,
      children,
      ...rest
    },
    forwardedRef,
  ) {
    const {
      open,
      setOpen,
      titleId,
      descriptionId,
      hasTitle,
      hasDescription,
      dismissOnEscape,
      dismissOnOutsideClick,
      disableScrollLock,
      modal,
      triggerRef,
    } = useDialogContext("Dialog.Content");

    const { isPresent, ref: presenceRef, state } = usePresence(open);
    const [contentNode, setContentNode] = useState<HTMLDivElement | null>(null);
    const ref = useComposedRefs<HTMLDivElement>(forwardedRef, presenceRef, setContentNode);

    // Lock scrolling for as long as the dialog is on screen, exit animation
    // included — releasing early makes the page jump under the closing dialog.
    useScrollLock(!disableScrollLock && isPresent && modal);

    useFocusTrap({
      container: contentNode,
      // Trap only while genuinely open; during the exit animation focus should
      // already be heading back to the trigger.
      active: open && isPresent,
      initialFocus: initialFocusRef?.current ?? null,
      returnFocus: triggerRef.current,
    });

    const onDismiss = useCallback(
      (reason: "escape" | "outside-pointer" | "focus-outside") => {
        if (reason === "escape" && !dismissOnEscape) return;
        if (reason === "outside-pointer" && !dismissOnOutsideClick) return;
        setOpen(false);
      },
      [dismissOnEscape, dismissOnOutsideClick, setOpen],
    );

    if (!isPresent) return null;

    return (
      <Portal>
        <div className={cn(styles.positioner, positionerClassName)}>
          <DismissableLayer
            ref={ref}
            role="dialog"
            aria-modal={modal || undefined}
            aria-labelledby={hasTitle ? titleId : undefined}
            aria-describedby={hasDescription ? descriptionId : undefined}
            data-state={state}
            data-size={size}
            className={cn(styles.content, styles[size], className)}
            onDismiss={onDismiss}
            excludedElements={[triggerRef.current]}
            {...rest}
          >
            {children}
            {showCloseButton ? (
              <button
                type="button"
                className={styles.closeButton}
                aria-label={closeButtonLabel}
                onClick={() => setOpen(false)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            ) : null}
          </DismissableLayer>
        </div>
      </Portal>
    );
  },
);

DialogContent.displayName = "Dialog.Content";

const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  function DialogTitle({ className, id, ...rest }, ref) {
    const { titleId, registerTitle } = useDialogContext("Dialog.Title");

    useIsomorphicLayoutEffect(() => {
      registerTitle(true);
      return () => registerTitle(false);
    }, [registerTitle]);

    return <h2 ref={ref} id={id ?? titleId} className={cn(styles.title, className)} {...rest} />;
  },
);

DialogTitle.displayName = "Dialog.Title";

const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  function DialogDescription({ className, id, ...rest }, ref) {
    const { descriptionId, registerDescription } = useDialogContext("Dialog.Description");

    useIsomorphicLayoutEffect(() => {
      registerDescription(true);
      return () => registerDescription(false);
    }, [registerDescription]);

    return (
      <p
        ref={ref}
        id={id ?? descriptionId}
        className={cn(styles.description, className)}
        {...rest}
      />
    );
  },
);

DialogDescription.displayName = "Dialog.Description";

const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  function DialogHeader({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(styles.header, className)} {...rest} />;
  },
);

DialogHeader.displayName = "Dialog.Header";

const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  function DialogFooter({ className, ...rest }, ref) {
    return <div ref={ref} className={cn(styles.footer, className)} {...rest} />;
  },
);

DialogFooter.displayName = "Dialog.Footer";

const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  function DialogClose({ asChild, onClick, type, ...rest }, ref) {
    const { setOpen } = useDialogContext("Dialog.Close");
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        {...(asChild ? {} : { type: type ?? "button" })}
        onClick={composeEventHandlers(onClick, () => setOpen(false))}
        {...rest}
      />
    );
  },
);

DialogClose.displayName = "Dialog.Close";

export const Dialog = {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Overlay: DialogOverlay,
  Content: DialogContent,
  Header: DialogHeader,
  Title: DialogTitle,
  Description: DialogDescription,
  Footer: DialogFooter,
  Close: DialogClose,
};

export {
  DialogRoot,
  DialogTrigger,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
};
