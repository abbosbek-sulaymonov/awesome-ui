import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useControllableState } from "../../hooks/useControllableState";
import { useField } from "../../hooks/useField";
import { useFloating } from "../../hooks/useFloating";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { DismissableLayer } from "../../primitives/DismissableLayer";
import { Portal } from "../../primitives/Portal";
import { usePresence } from "../../primitives/Presence";
import { cn } from "../../utils/cn";
import { composeEventHandlers } from "../../utils/composeEventHandlers";
import { useComposedRefs } from "../../utils/composeRefs";
import styles from "./Combobox.module.css";
import type { ComboboxOption, ComboboxProps } from "./Combobox.types";

const defaultFilter = (options: ComboboxOption[], query: string): ComboboxOption[] => {
  const needle = query.trim().toLowerCase();
  if (!needle) return options;
  return options.filter((option) => option.label.toLowerCase().includes(needle));
};

/**
 * An editable combobox: type to filter, then pick.
 *
 * The focus model is deliberately different from Select's. Select moves real
 * DOM focus into the listbox and rows it around with the arrow keys. A combobox
 * cannot do that — focus has to stay in the text field so typing keeps working —
 * so the highlighted option is tracked with `aria-activedescendant` instead.
 *
 * That is the trade the pattern forces: the browser no longer scrolls the
 * highlight into view or paints `:focus`, so both are done by hand.
 */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    options,
    value,
    defaultValue = "",
    onValueChange,
    inputValue,
    onInputChange,
    open,
    onOpenChange,
    filter = defaultFilter,
    size = "md",
    placement = "bottom-start",
    label,
    description,
    errorMessage,
    invalid,
    placeholder,
    disabled = false,
    required = false,
    clearable = true,
    emptyMessage = "No results",
    name,
    fieldClassName,
    className,
    id: providedId,
    onKeyDown,
    onChange,
    onBlur,
    onClick,
    "aria-describedby": providedDescribedBy,
    ...rest
  },
  forwardedRef,
) {
  const [selected, setSelected] = useControllableState<string>({
    value,
    defaultValue,
    ...(onValueChange ? { onChange: onValueChange } : {}),
  });

  const selectedOption = useMemo(
    () => options.find((option) => option.value === selected),
    [options, selected],
  );

  const [query, setQuery] = useControllableState<string>({
    value: inputValue,
    defaultValue: "",
    ...(onInputChange ? { onChange: onInputChange } : {}),
  });

  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: false,
    ...(onOpenChange ? { onChange: onOpenChange } : {}),
  });

  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const ref = useComposedRefs<HTMLInputElement>(forwardedRef, inputRef);

  const { id, descriptionId, errorId, isInvalid, describedBy, errorMessageId } = useField({
    id: providedId,
    hasDescription: description != null,
    hasError: errorMessage != null,
    invalid,
    describedBy: providedDescribedBy,
    prefix: "aui-combobox",
  });

  const listId = `${id}-listbox`;
  const optionId = (index: number) => `${id}-option-${index}`;

  const floating = useFloating({ open: isOpen, placement, offset: 4 });
  const { isPresent, ref: presenceRef, state } = usePresence(isOpen);

  // Hoisted out of the JSX: the list is rendered conditionally, and a hook
  // called inside that branch would change the hook order every time the list
  // opens or closes.
  const listComposedRef = useComposedRefs<HTMLDivElement>(
    presenceRef,
    floating.setFloating,
    listRef,
  );

  const filtered = useMemo(() => filter(options, query), [filter, options, query]);
  const enabled = useMemo(() => filtered.filter((option) => !option.disabled), [filtered]);

  // While closed the field shows the selection; while open it shows the query,
  // so typing is never fighting the label of what is already chosen.
  const displayValue = isOpen ? query : (selectedOption?.label ?? "");

  const openList = useCallback(() => {
    if (disabled) return;
    setOpen(true);
  }, [disabled, setOpen]);

  const closeList = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
    setQuery("");
  }, [setOpen, setQuery]);

  const commit = useCallback(
    (option: ComboboxOption) => {
      if (option.disabled) return;
      setSelected(option.value);
      closeList();
      inputRef.current?.focus({ preventScroll: true });
    },
    [setSelected, closeList],
  );

  // Opening starts on the current selection if it survived the filter, so
  // reopening does not lose your place.
  useIsomorphicLayoutEffect(() => {
    if (!isOpen) return;
    const index = filtered.findIndex((option) => option.value === selected && !option.disabled);
    setActiveIndex(index >= 0 ? index : filtered.findIndex((option) => !option.disabled));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // A filter change can leave the highlight past the end of the list.
  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex((current) => {
      if (current < filtered.length && current >= 0 && !filtered[current]?.disabled) return current;
      return filtered.findIndex((option) => !option.disabled);
    });
  }, [isOpen, filtered]);

  /**
   * The browser scrolls a focused element into view on its own. Nothing here is
   * focused, so the highlight has to be scrolled by hand or it walks off the
   * bottom of the list.
   */
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    const node = listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(optionId(activeIndex))}`);
    node?.scrollIntoView?.({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeIndex]);

  const move = useCallback(
    (delta: number) => {
      if (enabled.length === 0) return;

      setActiveIndex((current) => {
        const order = filtered.map((_, index) => index).filter((index) => !filtered[index]?.disabled);
        const position = order.indexOf(current);
        const nextPosition =
          position === -1
            ? delta > 0
              ? 0
              : order.length - 1
            : (position + delta + order.length) % order.length;
        return order[nextPosition] ?? -1;
      });
    },
    [enabled.length, filtered],
  );

  return (
    <div className={cn(styles.field, fieldClassName)}>
      {label != null ? (
        <label className={styles.label} htmlFor={id}>
          {label}
          {required ? (
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <div
        className={cn(styles.control, styles[size])}
        ref={floating.setAnchor}
        data-state={isOpen ? "open" : "closed"}
        data-invalid={isInvalid || undefined}
        data-disabled={disabled || undefined}
      >
        <input
          ref={ref}
          id={id}
          type="text"
          role="combobox"
          className={cn(styles.input, className)}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listId : undefined}
          // Focus stays here, so this is what tells assistive tech which option
          // is currently highlighted.
          aria-activedescendant={
            isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined
          }
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          aria-errormessage={errorMessageId}
          onChange={composeEventHandlers(onChange, (event) => {
            setQuery(event.currentTarget.value);
            openList();
          })}
          // Opening on click rather than on focus: focus-to-open would pop the
          // list every time someone tabs through the surrounding form.
          onClick={composeEventHandlers(onClick, () => openList())}
          onBlur={composeEventHandlers(onBlur, () => {
            // Losing focus abandons an unconfirmed query rather than leaving
            // the field showing text that matches nothing selected.
            if (isOpen) closeList();
          })}
          onKeyDown={composeEventHandlers(onKeyDown, (event) => {
            switch (event.key) {
              case "ArrowDown":
                event.preventDefault();
                if (!isOpen) openList();
                else move(1);
                break;
              case "ArrowUp":
                event.preventDefault();
                if (!isOpen) openList();
                else move(-1);
                break;
              case "Home":
                if (!isOpen) return;
                event.preventDefault();
                setActiveIndex(filtered.findIndex((option) => !option.disabled));
                break;
              case "End": {
                if (!isOpen) return;
                event.preventDefault();
                const last = [...filtered].reverse().findIndex((option) => !option.disabled);
                setActiveIndex(last === -1 ? -1 : filtered.length - 1 - last);
                break;
              }
              case "Enter": {
                if (!isOpen || activeIndex < 0) return;
                // Only prevented when it selects something, so Enter still
                // submits the surrounding form when the list is closed.
                event.preventDefault();
                const option = filtered[activeIndex];
                if (option) commit(option);
                break;
              }
              case "Escape":
                if (!isOpen) return;
                event.preventDefault();
                closeList();
                break;
              case "Tab":
                if (isOpen) closeList();
                break;
              default:
                break;
            }
          })}
          {...rest}
        />

        {clearable && selected && !disabled ? (
          <button
            type="button"
            className={styles.clear}
            aria-label="Clear selection"
            onClick={() => {
              setSelected("");
              setQuery("");
              inputRef.current?.focus({ preventScroll: true });
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        ) : null}

        <button
          type="button"
          className={styles.toggle}
          // The input owns the combobox role and its expanded state; this is a
          // convenience, so it stays out of the accessibility tree.
          aria-hidden="true"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => {
            if (isOpen) closeList();
            else openList();
            inputRef.current?.focus({ preventScroll: true });
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </button>
      </div>

      {isPresent ? (
        <Portal>
          <DismissableLayer
            ref={listComposedRef}
            id={listId}
            role="listbox"
            aria-label={typeof label === "string" ? label : "Suggestions"}
            data-state={state}
            className={styles.content}
            style={floating.floatingStyles}
            onDismiss={closeList}
            excludedElements={[inputRef.current]}
          >
            {filtered.length === 0 ? (
              <div className={styles.empty}>{emptyMessage}</div>
            ) : (
              filtered.map((option, index) => (
                <div
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={option.value === selected}
                  aria-disabled={option.disabled || undefined}
                  data-active={index === activeIndex || undefined}
                  data-state={option.value === selected ? "checked" : "unchecked"}
                  data-disabled={option.disabled || undefined}
                  className={styles.option}
                  // Pointer down rather than click: a click fires after blur,
                  // and blur closes the list out from under the pointer.
                  onPointerDown={(event) => {
                    event.preventDefault();
                    commit(option);
                  }}
                  onPointerMove={() => setActiveIndex(index)}
                >
                  <span className={styles.indicator} aria-hidden="true">
                    {option.value === selected ? (
                      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3.5 8.5l3 3 6-6" />
                      </svg>
                    ) : null}
                  </span>
                  <span className={styles.optionText}>{option.label}</span>
                </div>
              ))
            )}
          </DismissableLayer>
        </Portal>
      ) : null}

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

      {name ? <input type="hidden" name={name} value={selected} disabled={disabled} /> : null}
    </div>
  );
});

Combobox.displayName = "Combobox";
