import { forwardRef, useCallback, useMemo, useState } from "react";
import { useControllableState } from "../../hooks/useControllableState";
import { useId } from "../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useRovingFocus } from "../../hooks/useRovingFocus";
import { usePresence } from "../../primitives/Presence";
import { cn } from "../../utils/cn";
import { composeEventHandlers } from "../../utils/composeEventHandlers";
import { useComposedRefs } from "../../utils/composeRefs";
import {
  AccordionContext,
  AccordionItemContext,
  useAccordionContext,
  useAccordionItemContext,
} from "./AccordionContext";
import styles from "./Accordion.module.css";
import type {
  AccordionItemProps,
  AccordionPanelProps,
  AccordionRootProps,
  AccordionTriggerProps,
} from "./Accordion.types";

/** Both union members flattened, so the root can destructure once. */
type AccordionSharedRootProps = Omit<
  AccordionItemProps,
  "value" | "disabled" | "children"
> & {
  children?: React.ReactNode;
  variant?: import("./Accordion.types").AccordionVariant | undefined;
  collapsible?: boolean | undefined;
  disabled?: boolean | undefined;
  type?: "single" | "multiple" | undefined;
  value?: string | string[] | undefined;
  defaultValue?: string | string[] | undefined;
  onValueChange?: ((value: never) => void) | undefined;
};

function AccordionRoot(props: AccordionRootProps) {
  // The union has to be widened to destructure across both members. Pulling
  // type/value/defaultValue/onValueChange out here is not cosmetic: whatever
  // stays in `rest` is spread onto the root <div>, and React would put a
  // literal value="one" attribute on it and warn about onValueChange.
  const {
    children,
    variant = "outline",
    collapsible = true,
    disabled = false,
    className,
    type,
    value: valueProp,
    defaultValue: defaultValueProp,
    onValueChange,
    ...rest
  } = props as AccordionSharedRootProps;

  const isMultiple = type === "multiple";

  // One internal representation for both modes keeps every consumer of the
  // context — items, triggers, panels — from having to branch on `type`.
  const [openValues, setOpenValues] = useControllableState<string[]>({
    value: normalize(valueProp),
    defaultValue: normalize(defaultValueProp) ?? [],
    onChange: (next) => {
      if (isMultiple) (onValueChange as ((value: string[]) => void) | undefined)?.(next);
      else (onValueChange as ((value: string) => void) | undefined)?.(next[0] ?? "");
    },
  });

  const baseId = useId(undefined, "aui-accordion");
  const [node, setNode] = useState<HTMLDivElement | null>(null);

  // Arrow keys move between triggers, per the ARIA accordion pattern.
  useRovingFocus({
    container: node,
    active: true,
    orientation: "vertical",
    itemSelector: "[data-accordion-trigger]:not([disabled])",
  });

  const toggle = useCallback(
    (value: string) => {
      setOpenValues((current) => {
        const isOpen = current.includes(value);

        if (isMultiple) {
          return isOpen ? current.filter((entry) => entry !== value) : [...current, value];
        }

        if (!isOpen) return [value];
        // Single mode: closing the only open item is allowed only when the
        // accordion is collapsible, or it would leave nothing to read.
        return collapsible ? [] : current;
      });
    },
    [setOpenValues, isMultiple, collapsible],
  );

  const contextValue = useMemo(
    () => ({
      openValues,
      toggle,
      disabled,
      baseId,
      triggerId: (value: string) => `${baseId}-trigger-${value}`,
      panelId: (value: string) => `${baseId}-panel-${value}`,
    }),
    [openValues, toggle, disabled, baseId],
  );

  return (
    <AccordionContext.Provider value={contextValue}>
      <div
        ref={setNode}
        className={cn(styles.root, styles[variant], className)}
        data-variant={variant}
        {...rest}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

AccordionRoot.displayName = "Accordion.Root";

/** Both modes are stored as an array; this narrows the incoming prop to one. */
function normalize(value: string | string[] | undefined): string[] | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value;
  return value === "" ? [] : [value];
}

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { value, disabled, className, children, ...rest },
  ref,
) {
  const { openValues, disabled: groupDisabled } = useAccordionContext("Accordion.Item");

  const open = openValues.includes(value);
  const isDisabled = Boolean(disabled) || groupDisabled;

  const itemContext = useMemo(
    () => ({ value, open, disabled: isDisabled }),
    [value, open, isDisabled],
  );

  return (
    <AccordionItemContext.Provider value={itemContext}>
      <div
        ref={ref}
        className={cn(styles.item, className)}
        data-state={open ? "open" : "closed"}
        data-disabled={isDisabled || undefined}
        {...rest}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
});

AccordionItem.displayName = "Accordion.Item";

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger(
    { headingLevel = 3, className, children, onClick, type, ...rest },
    ref,
  ) {
    const { toggle, triggerId, panelId } = useAccordionContext("Accordion.Trigger");
    const { value, open, disabled } = useAccordionItemContext("Accordion.Trigger");

    // The button must sit inside a heading, or assistive tech cannot use the
    // accordion as a document outline to navigate by.
    const Heading = `h${headingLevel}` as "h3";

    return (
      <Heading className={styles.header}>
        <button
          ref={ref}
          type={type ?? "button"}
          id={triggerId(value)}
          aria-expanded={open}
          aria-controls={panelId(value)}
          disabled={disabled}
          data-accordion-trigger=""
          data-state={open ? "open" : "closed"}
          className={cn(styles.trigger, className)}
          onClick={composeEventHandlers(onClick, () => toggle(value))}
          {...rest}
        >
          <span>{children}</span>
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
        </button>
      </Heading>
    );
  },
);

AccordionTrigger.displayName = "Accordion.Trigger";

const AccordionPanel = forwardRef<HTMLDivElement, AccordionPanelProps>(function AccordionPanel(
  { keepMounted, className, children, style, ...rest },
  forwardedRef,
) {
  const { triggerId, panelId } = useAccordionContext("Accordion.Panel");
  const { value, open } = useAccordionItemContext("Accordion.Panel");

  const { isPresent, ref: presenceRef, state } = usePresence(open);
  const [inner, setInner] = useState<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const ref = useComposedRefs<HTMLDivElement>(forwardedRef, presenceRef);

  // `height: auto` cannot be animated, so the content is measured and handed
  // to the keyframes as a variable.
  useIsomorphicLayoutEffect(() => {
    if (inner) setHeight(inner.offsetHeight);
  }, [inner, children]);

  if (!isPresent && !keepMounted) return null;

  return (
    <div
      ref={ref}
      id={panelId(value)}
      role="region"
      aria-labelledby={triggerId(value)}
      hidden={!isPresent}
      data-state={state}
      className={cn(styles.panel, className)}
      style={
        {
          ...(height === null ? {} : { "--aui-accordion-height": `${height}px` }),
          ...style,
        } as React.CSSProperties
      }
      {...rest}
    >
      <div ref={setInner} className={styles.panelInner}>
        {children}
      </div>
    </div>
  );
});

AccordionPanel.displayName = "Accordion.Panel";

export const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Panel: AccordionPanel,
};

export { AccordionRoot, AccordionItem, AccordionTrigger, AccordionPanel };
