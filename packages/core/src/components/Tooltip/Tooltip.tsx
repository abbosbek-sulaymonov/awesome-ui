import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useControllableState } from "../../hooks/useControllableState";
import { useFloating } from "../../hooks/useFloating";
import { useId } from "../../hooks/useId";
import { Portal } from "../../primitives/Portal";
import { usePresence } from "../../primitives/Presence";
import { Slot } from "../../primitives/Slot";
import { cn } from "../../utils/cn";
import { composeEventHandlers } from "../../utils/composeEventHandlers";
import { useComposedRefs } from "../../utils/composeRefs";
import styles from "./Tooltip.module.css";
import type {
  TooltipArrowProps,
  TooltipContentProps,
  TooltipRootProps,
  TooltipTriggerProps,
} from "./Tooltip.types";

const ARROW_SIZE = 8;

interface TooltipContextValue {
  open: boolean;
  contentId: string;
  floating: ReturnType<typeof useFloating>;
  onTriggerEnter: () => void;
  onTriggerLeave: () => void;
  onTriggerFocus: () => void;
  onTriggerBlur: () => void;
  disabled: boolean;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext(component: string): TooltipContextValue {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error(`[awesome-ui] <${component}> must be used inside <Tooltip.Root>.`);
  }
  return context;
}

function TooltipRoot({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  placement = "top",
  offset = 6,
  openDelay = 500,
  closeDelay = 100,
  disabled = false,
}: TooltipRootProps) {
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    ...(onOpenChange ? { onChange: onOpenChange } : {}),
  });

  const contentId = useId(undefined, "aui-tooltip");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const floating = useFloating({
    open: isOpen,
    placement,
    offset,
    arrowSize: ARROW_SIZE,
  });

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const scheduleOpen = useCallback(() => {
    if (disabled) return;
    clearTimer();
    if (openDelay <= 0) {
      setOpen(true);
      return;
    }
    timer.current = setTimeout(() => setOpen(true), openDelay);
  }, [clearTimer, disabled, openDelay, setOpen]);

  const scheduleClose = useCallback(() => {
    clearTimer();
    if (closeDelay <= 0) {
      setOpen(false);
      return;
    }
    timer.current = setTimeout(() => setOpen(false), closeDelay);
  }, [clearTimer, closeDelay, setOpen]);

  // Keyboard focus shows the tooltip immediately — a keyboard user has already
  // committed to the control, so the hover delay is only noise.
  const openNow = useCallback(() => {
    if (disabled) return;
    clearTimer();
    setOpen(true);
  }, [clearTimer, disabled, setOpen]);

  const closeNow = useCallback(() => {
    clearTimer();
    setOpen(false);
  }, [clearTimer, setOpen]);

  // Escape dismisses without waiting out the close delay.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeNow();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, closeNow]);

  const value = useMemo<TooltipContextValue>(
    () => ({
      open: isOpen,
      contentId,
      floating,
      onTriggerEnter: scheduleOpen,
      onTriggerLeave: scheduleClose,
      onTriggerFocus: openNow,
      onTriggerBlur: closeNow,
      disabled,
    }),
    [isOpen, contentId, floating, scheduleOpen, scheduleClose, openNow, closeNow, disabled],
  );

  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
}

TooltipRoot.displayName = "Tooltip.Root";

const TooltipTrigger = forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  function TooltipTrigger(
    { asChild, onPointerEnter, onPointerLeave, onFocus, onBlur, type, ...rest },
    forwardedRef,
  ) {
    const {
      open,
      contentId,
      floating,
      onTriggerEnter,
      onTriggerLeave,
      onTriggerFocus,
      onTriggerBlur,
      disabled,
    } = useTooltipContext("Tooltip.Trigger");

    const ref = useComposedRefs<HTMLButtonElement>(forwardedRef, floating.setAnchor);
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        {...(asChild ? {} : { type: type ?? "button" })}
        // `aria-describedby`, not `aria-labelledby`: a tooltip supplements the
        // control's name rather than replacing it.
        aria-describedby={open && !disabled ? contentId : undefined}
        data-state={open ? "open" : "closed"}
        onPointerEnter={composeEventHandlers(onPointerEnter, onTriggerEnter)}
        onPointerLeave={composeEventHandlers(onPointerLeave, onTriggerLeave)}
        onFocus={composeEventHandlers(onFocus, onTriggerFocus)}
        onBlur={composeEventHandlers(onBlur, onTriggerBlur)}
        {...rest}
      />
    );
  },
);

TooltipTrigger.displayName = "Tooltip.Trigger";

const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  function TooltipContent({ className, style, children, ...rest }, forwardedRef) {
    const { open, contentId, floating, disabled } = useTooltipContext("Tooltip.Content");
    const { isPresent, ref: presenceRef, state } = usePresence(open && !disabled);
    const ref = useComposedRefs<HTMLDivElement>(
      forwardedRef,
      presenceRef,
      floating.setFloating,
    );

    if (!isPresent) return null;

    return (
      <Portal>
        <div
          ref={ref}
          id={contentId}
          role="tooltip"
          data-state={state}
          data-side={floating.position?.side ?? "top"}
          className={cn(styles.content, className)}
          style={{ ...floating.floatingStyles, ...style }}
          {...rest}
        >
          {children}
        </div>
      </Portal>
    );
  },
);

TooltipContent.displayName = "Tooltip.Content";

const TooltipArrow = forwardRef<HTMLDivElement, TooltipArrowProps>(
  function TooltipArrow({ className, style, ...rest }, forwardedRef) {
    const { floating } = useTooltipContext("Tooltip.Arrow");
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

TooltipArrow.displayName = "Tooltip.Arrow";

export const Tooltip = {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Arrow: TooltipArrow,
};

export { TooltipRoot, TooltipTrigger, TooltipContent, TooltipArrow };
