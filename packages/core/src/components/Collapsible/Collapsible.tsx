import { createContext, forwardRef, useContext, useMemo, useState } from "react";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useId } from "../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { usePresence } from "../../primitives/Presence";
import { Slot } from "../../primitives/Slot";
import { cn } from "../../utils/cn";
import { composeEventHandlers } from "../../utils/composeEventHandlers";
import { useComposedRefs } from "../../utils/composeRefs";
import styles from "./Collapsible.module.css";
import type {
  CollapsiblePanelProps,
  CollapsibleRootProps,
  CollapsibleTriggerProps,
} from "./Collapsible.types";

interface CollapsibleContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  disabled: boolean;
  triggerId: string;
  panelId: string;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext(component: string): CollapsibleContextValue {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error(`[awesome-ui] <${component}> must be used inside <Collapsible.Root>.`);
  }
  return context;
}

function CollapsibleRoot({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  className,
  ...rest
}: CollapsibleRootProps) {
  const { open: isOpen, setOpen } = useDisclosure({
    ...(open !== undefined ? { open } : {}),
    defaultOpen,
    ...(onOpenChange ? { onOpenChange } : {}),
  });

  const baseId = useId(undefined, "aui-collapsible");

  const value = useMemo(
    () => ({
      open: isOpen,
      setOpen,
      disabled,
      triggerId: `${baseId}-trigger`,
      panelId: `${baseId}-panel`,
    }),
    [isOpen, setOpen, disabled, baseId],
  );

  return (
    <CollapsibleContext.Provider value={value}>
      <div
        className={cn(styles.root, className)}
        data-state={isOpen ? "open" : "closed"}
        data-disabled={disabled || undefined}
        {...rest}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

CollapsibleRoot.displayName = "Collapsible.Root";

const CollapsibleTrigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger(
    { asChild, hideIndicator, className, children, onClick, type, disabled, ...rest },
    ref,
  ) {
    const context = useCollapsibleContext("Collapsible.Trigger");
    const isDisabled = Boolean(disabled) || context.disabled;
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        id={context.triggerId}
        {...(asChild ? {} : { type: type ?? "button", disabled: isDisabled })}
        aria-expanded={context.open}
        aria-controls={context.panelId}
        data-state={context.open ? "open" : "closed"}
        className={cn(styles.trigger, className)}
        onClick={composeEventHandlers(onClick, () => {
          if (!isDisabled) context.setOpen(!context.open);
        })}
        {...rest}
      >
        {children}
        {hideIndicator || asChild ? null : (
          <svg
            className={styles.indicator}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        )}
      </Comp>
    );
  },
);

CollapsibleTrigger.displayName = "Collapsible.Trigger";

const CollapsiblePanel = forwardRef<HTMLDivElement, CollapsiblePanelProps>(
  function CollapsiblePanel({ keepMounted, className, children, style, ...rest }, forwardedRef) {
    const context = useCollapsibleContext("Collapsible.Panel");
    const { isPresent, ref: presenceRef, state } = usePresence(context.open);

    const [inner, setInner] = useState<HTMLDivElement | null>(null);
    const [height, setHeight] = useState<number | null>(null);
    const ref = useComposedRefs<HTMLDivElement>(forwardedRef, presenceRef);

    // `height: auto` is not animatable, so the content is measured and handed
    // to the keyframes as a variable.
    useIsomorphicLayoutEffect(() => {
      if (inner) setHeight(inner.offsetHeight);
    }, [inner, children]);

    if (!isPresent && !keepMounted) return null;

    return (
      <div
        ref={ref}
        id={context.panelId}
        role="region"
        aria-labelledby={context.triggerId}
        hidden={!isPresent}
        data-state={state}
        className={cn(styles.panel, className)}
        style={
          {
            ...(height === null ? {} : { "--aui-collapsible-height": `${height}px` }),
            ...style,
          } as React.CSSProperties
        }
        {...rest}
      >
        <div ref={setInner}>{children}</div>
      </div>
    );
  },
);

CollapsiblePanel.displayName = "Collapsible.Panel";

export const Collapsible = {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Panel: CollapsiblePanel,
};

export { CollapsibleRoot, CollapsibleTrigger, CollapsiblePanel };
