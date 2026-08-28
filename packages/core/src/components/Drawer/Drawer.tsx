import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { useId } from "../../hooks/useId";
import { useScrollLock } from "../../hooks/useScrollLock";
import { DismissableLayer } from "../../primitives/DismissableLayer";
import { Portal } from "../../primitives/Portal";
import { usePresence } from "../../primitives/Presence";
import { Slot } from "../../primitives/Slot";
import { cn } from "../../utils/cn";
import { composeEventHandlers } from "../../utils/composeEventHandlers";
import { useComposedRefs } from "../../utils/composeRefs";
import styles from "./Drawer.module.css";
import type {
  DrawerBodyProps,
  DrawerCloseProps,
  DrawerContentProps,
  DrawerDescriptionProps,
  DrawerFooterProps,
  DrawerHeaderProps,
  DrawerOverlayProps,
  DrawerRootProps,
  DrawerSide,
  DrawerTitleProps,
  DrawerTriggerProps,
} from "./Drawer.types";

interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  side: DrawerSide;
  titleId: string;
  descriptionId: string;
  hasTitle: boolean;
  registerTitle: (present: boolean) => void;
  hasDescription: boolean;
  registerDescription: (present: boolean) => void;
  dismissOnEscape: boolean;
  dismissOnOutsideClick: boolean;
  disableScrollLock: boolean;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

function useDrawerContext(component: string): DrawerContextValue {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error(`[awesome-ui] <${component}> must be used inside <Drawer.Root>.`);
  }
  return context;
}

/**
 * A dialog anchored to an edge of the viewport.
 *
 * Shares every behaviour with Dialog — focus trap, scroll lock, layered
 * dismissal — but keeps its own compound API, because a drawer is sized along
 * one axis and slides from the edge it lives on rather than being centred.
 */
function DrawerRoot({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  side = "right",
  dismissOnEscape = true,
  dismissOnOutsideClick = true,
  disableScrollLock = false,
}: DrawerRootProps) {
  const { open: isOpen, setOpen } = useDisclosure({
    ...(open !== undefined ? { open } : {}),
    defaultOpen,
    ...(onOpenChange ? { onOpenChange } : {}),
  });

  const baseId = useId(undefined, "aui-drawer");
  const triggerRef = useRef<HTMLElement | null>(null);
  const [hasTitle, setHasTitle] = useState(false);
  const [hasDescription, setHasDescription] = useState(false);

  const value = useMemo(
    () => ({
      open: isOpen,
      setOpen,
      side,
      titleId: `${baseId}-title`,
      descriptionId: `${baseId}-description`,
      hasTitle,
      registerTitle: setHasTitle,
      hasDescription,
      registerDescription: setHasDescription,
      dismissOnEscape,
      dismissOnOutsideClick,
      disableScrollLock,
      triggerRef,
    }),
    [isOpen, setOpen, side, baseId, hasTitle, hasDescription, dismissOnEscape, dismissOnOutsideClick, disableScrollLock],
  );

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

DrawerRoot.displayName = "Drawer.Root";

const DrawerTrigger = forwardRef<HTMLButtonElement, DrawerTriggerProps>(function DrawerTrigger(
  { asChild, onClick, type, ...rest },
  forwardedRef,
) {
  const { open, setOpen, triggerRef } = useDrawerContext("Drawer.Trigger");
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
});

DrawerTrigger.displayName = "Drawer.Trigger";

const DrawerOverlay = forwardRef<HTMLDivElement, DrawerOverlayProps>(function DrawerOverlay(
  { className, ...rest },
  forwardedRef,
) {
  const { open } = useDrawerContext("Drawer.Overlay");
  const { isPresent, ref: presenceRef, state } = usePresence(open);
  const ref = useComposedRefs<HTMLDivElement>(forwardedRef, presenceRef);

  if (!isPresent) return null;

  return (
    <Portal>
      <div ref={ref} className={cn(styles.overlay, className)} data-state={state} aria-hidden="true" {...rest} />
    </Portal>
  );
});

DrawerOverlay.displayName = "Drawer.Overlay";

const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(function DrawerContent(
  {
    size = "md",
    showCloseButton = true,
    closeButtonLabel = "Close drawer",
    initialFocusRef,
    className,
    children,
    ...rest
  },
  forwardedRef,
) {
  const {
    open, setOpen, side, titleId, descriptionId, hasTitle, hasDescription,
    dismissOnEscape, dismissOnOutsideClick, disableScrollLock, triggerRef,
  } = useDrawerContext("Drawer.Content");

  const { isPresent, ref: presenceRef, state } = usePresence(open);
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const ref = useComposedRefs<HTMLDivElement>(forwardedRef, presenceRef, setNode);

  // Held for as long as the drawer is on screen, exit animation included —
  // releasing early makes the page jump underneath it as it slides away.
  useScrollLock(!disableScrollLock && isPresent);

  useFocusTrap({
    container: node,
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
      <DismissableLayer
        ref={ref}
        role="dialog"
        aria-modal
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-describedby={hasDescription ? descriptionId : undefined}
        data-state={state}
        data-side={side}
        data-size={size}
        className={cn(styles.content, styles[side], styles[size], className)}
        onDismiss={onDismiss}
        excludedElements={[triggerRef.current]}
        {...rest}
      >
        {children}
        {showCloseButton ? (
          <button type="button" className={styles.closeButton} aria-label={closeButtonLabel} onClick={() => setOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        ) : null}
      </DismissableLayer>
    </Portal>
  );
});

DrawerContent.displayName = "Drawer.Content";

const DrawerTitle = forwardRef<HTMLHeadingElement, DrawerTitleProps>(function DrawerTitle(
  { className, id, ...rest },
  ref,
) {
  const { titleId, registerTitle } = useDrawerContext("Drawer.Title");
  useEffect(() => {
    registerTitle(true);
    return () => registerTitle(false);
  }, [registerTitle]);

  return <h2 ref={ref} id={id ?? titleId} className={cn(styles.title, className)} {...rest} />;
});

DrawerTitle.displayName = "Drawer.Title";

const DrawerDescription = forwardRef<HTMLParagraphElement, DrawerDescriptionProps>(
  function DrawerDescription({ className, id, ...rest }, ref) {
    const { descriptionId, registerDescription } = useDrawerContext("Drawer.Description");
    useEffect(() => {
      registerDescription(true);
      return () => registerDescription(false);
    }, [registerDescription]);

    return <p ref={ref} id={id ?? descriptionId} className={cn(styles.description, className)} {...rest} />;
  },
);

DrawerDescription.displayName = "Drawer.Description";

const DrawerHeader = forwardRef<HTMLDivElement, DrawerHeaderProps>(function DrawerHeader({ className, ...rest }, ref) {
  return <div ref={ref} className={cn(styles.header, className)} {...rest} />;
});
DrawerHeader.displayName = "Drawer.Header";

const DrawerBody = forwardRef<HTMLDivElement, DrawerBodyProps>(function DrawerBody({ className, ...rest }, ref) {
  return <div ref={ref} className={cn(styles.body, className)} {...rest} />;
});
DrawerBody.displayName = "Drawer.Body";

const DrawerFooter = forwardRef<HTMLDivElement, DrawerFooterProps>(function DrawerFooter({ className, ...rest }, ref) {
  return <div ref={ref} className={cn(styles.footer, className)} {...rest} />;
});
DrawerFooter.displayName = "Drawer.Footer";

const DrawerClose = forwardRef<HTMLButtonElement, DrawerCloseProps>(function DrawerClose(
  { asChild, onClick, type, ...rest },
  ref,
) {
  const { setOpen } = useDrawerContext("Drawer.Close");
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      {...(asChild ? {} : { type: type ?? "button" })}
      onClick={composeEventHandlers(onClick, () => setOpen(false))}
      {...rest}
    />
  );
});

DrawerClose.displayName = "Drawer.Close";

export const Drawer = {
  Root: DrawerRoot,
  Trigger: DrawerTrigger,
  Overlay: DrawerOverlay,
  Content: DrawerContent,
  Header: DrawerHeader,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Close: DrawerClose,
};

export {
  DrawerRoot, DrawerTrigger, DrawerOverlay, DrawerContent, DrawerHeader,
  DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter, DrawerClose,
};
