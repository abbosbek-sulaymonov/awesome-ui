import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useControllableState } from "../../hooks/useControllableState";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useField } from "../../hooks/useField";
import { useFloating } from "../../hooks/useFloating";
import { useId } from "../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useRovingFocus } from "../../hooks/useRovingFocus";
import { useTypeahead } from "../../hooks/useTypeahead";
import { DismissableLayer } from "../../primitives/DismissableLayer";
import { Portal } from "../../primitives/Portal";
import { usePresence } from "../../primitives/Presence";
import { cn } from "../../utils/cn";
import { composeEventHandlers } from "../../utils/composeEventHandlers";
import { useComposedRefs } from "../../utils/composeRefs";
import { SelectContext, useSelectContext } from "./SelectContext";
import styles from "./Select.module.css";
import type {
  SelectContentProps,
  SelectGroupProps,
  SelectItemProps,
  SelectLabelProps,
  SelectRootProps,
  SelectSeparatorProps,
  SelectTriggerProps,
  SelectValueProps,
} from "./Select.types";

function SelectRoot({
  children,
  value,
  defaultValue = "",
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  required = false,
  name,
  placement = "bottom-start",
}: SelectRootProps) {
  const [selected, setSelected] = useControllableState<string>({
    value,
    defaultValue,
    ...(onValueChange ? { onChange: onValueChange } : {}),
  });

  const { open: isOpen, setOpen } = useDisclosure({
    ...(open !== undefined ? { open } : {}),
    defaultOpen,
    ...(onOpenChange ? { onOpenChange } : {}),
  });

  const baseId = useId(undefined, "aui-select");
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const floating = useFloating({ open: isOpen, placement, offset: 4 });

  // Items report their labels so the trigger can render the selected one
  // without the consumer having to duplicate the list.
  //
  // The cache is deliberately sticky: Content unmounts when the list closes,
  // and dropping the labels with it would leave the trigger showing the raw
  // value of its own selection. Labels are stable metadata keyed by value, so
  // keeping them costs one entry per distinct option and nothing else.
  const labels = useRef(new Map<string, ReactNode>());
  const [, bumpVersion] = useState(0);

  const registerItem = useCallback((itemValue: string, label: ReactNode) => {
    if (!Object.is(labels.current.get(itemValue), label)) {
      labels.current.set(itemValue, label);
      bumpVersion((version) => version + 1);
    }
    return () => {};
  }, []);

  const getItemLabel = useCallback(
    (itemValue: string) => labels.current.get(itemValue),
    [],
  );

  const contextValue = useMemo(
    () => ({
      value: selected,
      setValue: setSelected,
      open: isOpen,
      setOpen,
      disabled,
      required,
      contentId: `${baseId}-content`,
      triggerId: `${baseId}-trigger`,
      labelId: `${baseId}-label`,
      isInvalid: false,
      floating,
      triggerRef,
      registerItem,
      getItemLabel,
    }),
    [
      selected,
      setSelected,
      isOpen,
      setOpen,
      disabled,
      required,
      baseId,
      floating,
      registerItem,
      getItemLabel,
    ],
  );

  return (
    <SelectContext.Provider value={contextValue}>
      {children}
      {/* Form participation: a custom listbox submits nothing on its own. */}
      {name ? (
        <input type="hidden" name={name} value={selected} disabled={disabled} />
      ) : null}
    </SelectContext.Provider>
  );
}

SelectRoot.displayName = "Select.Root";

const SelectTrigger = forwardRef<HTMLButtonElement, SelectTriggerProps>(
  function SelectTrigger(
    {
      size = "md",
      label,
      description,
      errorMessage,
      invalid,
      fieldClassName,
      className,
      children,
      onClick,
      onKeyDown,
      id: providedId,
      "aria-describedby": providedDescribedBy,
      ...rest
    },
    forwardedRef,
  ) {
    const {
      open,
      setOpen,
      disabled,
      required,
      contentId,
      labelId,
      floating,
      triggerRef,
    } = useSelectContext("Select.Trigger");

    const { id, descriptionId, errorId, isInvalid, describedBy, errorMessageId } = useField({
      id: providedId,
      hasDescription: description != null,
      hasError: errorMessage != null,
      invalid,
      describedBy: providedDescribedBy,
      prefix: "aui-select",
    });

    const ref = useComposedRefs<HTMLButtonElement>(
      forwardedRef,
      floating.setAnchor,
      (node) => void (triggerRef.current = node),
    );

    return (
      <div className={cn(styles.field, fieldClassName)}>
        {label != null ? (
          <label className={styles.label} htmlFor={id} id={labelId}>
            {label}
            {required ? (
              <span className={styles.required} aria-hidden="true">
                *
              </span>
            ) : null}
          </label>
        ) : null}

        <button
          ref={ref}
          type="button"
          id={id}
          // ARIA 1.2 select-only combobox: the button is the combobox, the
          // popup is the listbox it controls.
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? contentId : undefined}
          aria-required={required || undefined}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          aria-errormessage={errorMessageId}
          disabled={disabled}
          data-state={open ? "open" : "closed"}
          data-invalid={isInvalid || undefined}
          data-disabled={disabled || undefined}
          className={cn(styles.trigger, styles[size], className)}
          onClick={composeEventHandlers(onClick, () => setOpen(!open))}
          onKeyDown={composeEventHandlers(onKeyDown, (event) => {
            // Arrow keys open the list rather than moving through it silently,
            // which is what a native select does.
            if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
              event.preventDefault();
              setOpen(true);
            }
          })}
          {...rest}
        >
          {children}
          <svg
            className={styles.icon}
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

        {description != null ? (
          <p className={styles.description} id={descriptionId}>
            {description}
          </p>
        ) : null}
        {errorMessage != null ? (
          <p className={styles.error} id={errorId}>
            {errorMessage}
          </p>
        ) : null}
      </div>
    );
  },
);

SelectTrigger.displayName = "Select.Trigger";

const SelectValue = forwardRef<HTMLSpanElement, SelectValueProps>(function SelectValue(
  { placeholder, className, ...rest },
  ref,
) {
  const { value, getItemLabel } = useSelectContext("Select.Value");
  const label = value ? getItemLabel(value) : undefined;

  // Until the matching item has mounted and registered, fall back to the raw
  // value rather than flashing the placeholder over a real selection.
  const display = value ? (label ?? value) : placeholder;

  return (
    <span
      ref={ref}
      className={cn(styles.value, !value && styles.placeholder, className)}
      {...rest}
    >
      {display}
    </span>
  );
});

SelectValue.displayName = "Select.Value";

const SelectContent = forwardRef<HTMLDivElement, SelectContentProps>(
  function SelectContent(
    { emptyMessage = "No options", className, style, children, ...rest },
    forwardedRef,
  ) {
    const { open, setOpen, value, contentId, triggerId, floating, triggerRef } =
      useSelectContext("Select.Content");

    const { isPresent, ref: presenceRef, state } = usePresence(open);
    const [node, setNode] = useState<HTMLDivElement | null>(null);
    const ref = useComposedRefs<HTMLDivElement>(
      forwardedRef,
      presenceRef,
      floating.setFloating,
      setNode,
    );

    const itemSelector = '[role="option"]:not([data-disabled])';

    const { getItems, focusItem, focusFirst } = useRovingFocus({
      container: node,
      active: open && isPresent,
      orientation: "vertical",
      itemSelector,
    });

    useTypeahead({
      active: open && isPresent,
      container: node,
      getItems,
      onMatch: focusItem,
    });

    /**
     * Open with focus on the selected item, or the first one — a native select
     * never opens with nothing highlighted.
     *
     * A plain effect, deliberately. Until useFloating has measured, the content
     * is `visibility: hidden`, and a hidden element cannot take focus — the call
     * would silently do nothing and leave focus on the trigger, where every
     * arrow press just reopens the list instead of moving through it. Effects
     * run after layout effects, so by this point the position has landed and the
     * element is focusable.
     */
    useEffect(() => {
      if (!open || !node) return;

      const selectedItem = value
        ? node.querySelector<HTMLElement>(`[role="option"][data-value="${CSS.escape(value)}"]`)
        : null;

      if (selectedItem && !selectedItem.hasAttribute("data-disabled")) focusItem(selectedItem);
      else focusFirst();
    }, [open, node, value, focusItem, focusFirst]);

    const onDismiss = useCallback(
      (reason: "escape" | "outside-pointer" | "focus-outside") => {
        setOpen(false);
        if (reason === "escape") triggerRef.current?.focus({ preventScroll: true });
      },
      [setOpen, triggerRef],
    );

    if (!isPresent) return null;

    const isEmpty = node !== null && getItems().length === 0;

    return (
      <Portal>
        <DismissableLayer
          ref={ref}
          id={contentId}
          role="listbox"
          aria-labelledby={triggerId}
          data-state={state}
          data-side={floating.position?.side ?? "bottom"}
          className={cn(styles.content, className)}
          style={{
            ...floating.floatingStyles,
            // Match the trigger's width, the way a native select does.
            minWidth: triggerRef.current?.offsetWidth,
            ...style,
          }}
          onDismiss={onDismiss}
          excludedElements={[triggerRef.current]}
          {...rest}
        >
          {children}
          {isEmpty ? <div className={styles.empty}>{emptyMessage}</div> : null}
        </DismissableLayer>
      </Portal>
    );
  },
);

SelectContent.displayName = "Select.Content";

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(function SelectItem(
  { value: itemValue, disabled, textValue, className, children, onClick, onKeyDown, ...rest },
  forwardedRef,
) {
  const { value, setValue, setOpen, registerItem, triggerRef } =
    useSelectContext("Select.Item");

  const isSelected = value === itemValue;

  useIsomorphicLayoutEffect(
    () => registerItem(itemValue, children),
    [registerItem, itemValue, children],
  );

  const select = useCallback(() => {
    if (disabled) return;
    setValue(itemValue);
    setOpen(false);
    // Focus goes back to the trigger, which is what now shows the value.
    triggerRef.current?.focus({ preventScroll: true });
  }, [disabled, setValue, itemValue, setOpen, triggerRef]);

  return (
    <div
      ref={forwardedRef}
      role="option"
      // Focusable but not tabbable: arrow keys move focus, Tab does not walk
      // the list.
      tabIndex={-1}
      aria-selected={isSelected}
      data-value={itemValue}
      data-state={isSelected ? "checked" : "unchecked"}
      data-disabled={disabled || undefined}
      aria-disabled={disabled || undefined}
      className={cn(styles.item, className)}
      onClick={composeEventHandlers(onClick, select)}
      onKeyDown={composeEventHandlers(onKeyDown, (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          select();
        }
      })}
      {...rest}
    >
      <span className={styles.itemIndicator} aria-hidden="true">
        {isSelected ? (
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 8.5l3 3 6-6" />
          </svg>
        ) : null}
      </span>
      <span className={styles.itemText}>{children}</span>
      {textValue ? <span hidden>{textValue}</span> : null}
    </div>
  );
});

SelectItem.displayName = "Select.Item";

const SelectGroup = forwardRef<HTMLDivElement, SelectGroupProps>(function SelectGroup(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} role="group" className={className} {...rest} />;
});

SelectGroup.displayName = "Select.Group";

const SelectLabel = forwardRef<HTMLDivElement, SelectLabelProps>(function SelectLabel(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cn(styles.groupLabel, className)} {...rest} />;
});

SelectLabel.displayName = "Select.Label";

const SelectSeparator = forwardRef<HTMLDivElement, SelectSeparatorProps>(
  function SelectSeparator({ className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        role="separator"
        aria-hidden="true"
        className={cn(styles.separator, className)}
        {...rest}
      />
    );
  },
);

SelectSeparator.displayName = "Select.Separator";

export const Select = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Content: SelectContent,
  Item: SelectItem,
  Group: SelectGroup,
  Label: SelectLabel,
  Separator: SelectSeparator,
};

export {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
};
