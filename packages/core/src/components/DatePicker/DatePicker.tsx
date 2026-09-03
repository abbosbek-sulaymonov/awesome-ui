import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { useControllableState } from "../../hooks/useControllableState";
import { useField } from "../../hooks/useField";
import { useFloating } from "../../hooks/useFloating";
import { DismissableLayer } from "../../primitives/DismissableLayer";
import { Portal } from "../../primitives/Portal";
import { usePresence } from "../../primitives/Presence";
import { cn } from "../../utils/cn";
import { composeEventHandlers } from "../../utils/composeEventHandlers";
import { useComposedRefs } from "../../utils/composeRefs";
import { fromISODate, isWithin, toISODate } from "../../utils/date";
import { Calendar } from "../Calendar/Calendar";
import styles from "./DatePicker.module.css";
import type { DatePickerProps } from "./DatePicker.types";

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="12" height="11" rx="2" />
      <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" />
    </svg>
  );
}

/**
 * A date field with a calendar attached.
 *
 * The text field stays editable rather than being a read-only trigger. Typing a
 * date is faster than paging a grid for anyone who knows the date they want,
 * and it is the only route for someone entering a birth year decades back.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  {
    value, defaultValue = null, onValueChange,
    open, onOpenChange,
    min, max, isDateDisabled,
    weekStartsOn = 1, locale,
    placement = "bottom-start", size = "md",
    label, description, errorMessage, invalid,
    placeholder = "YYYY-MM-DD",
    disabled = false, required = false,
    name, fieldClassName,
    calendarLabel = "Choose a date",
    openCalendarLabel = "Open calendar",
    className, id: providedId, onKeyDown, onChange, onBlur,
    "aria-describedby": providedDescribedBy,
    ...rest
  },
  forwardedRef,
) {
  const [selected, setSelected] = useControllableState<Date | null>({
    value,
    defaultValue,
    ...(onValueChange ? { onChange: onValueChange } : {}),
  });

  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: false,
    ...(onOpenChange ? { onChange: onOpenChange } : {}),
  });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const ref = useComposedRefs<HTMLInputElement>(forwardedRef, inputRef);

  /**
   * Text is held separately while the field has focus.
   *
   * Parsing on every keystroke makes a date impossible to type: "2026-0" is not
   * a date, and re-formatting from a partial value fights the caret. The text
   * is authoritative while editing; the date is authoritative once focus leaves.
   */
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? (selected ? toISODate(selected) : "");

  const { id, descriptionId, errorId, isInvalid, describedBy, errorMessageId } = useField({
    id: providedId,
    hasDescription: description != null,
    hasError: errorMessage != null,
    invalid,
    describedBy: providedDescribedBy,
    prefix: "aui-datepicker",
  });

  const dialogId = `${id}-calendar`;
  const floating = useFloating({ open: isOpen, placement, offset: 6 });
  const { isPresent, ref: presenceRef, state } = usePresence(isOpen);

  // Hoisted: the popover is rendered conditionally, and a hook inside that
  // branch would change the hook order every time it opens or closes.
  const popoverRef = useComposedRefs<HTMLDivElement>(presenceRef, floating.setFloating);

  const close = useCallback(
    (restoreFocus: boolean) => {
      setOpen(false);
      if (restoreFocus) inputRef.current?.focus({ preventScroll: true });
    },
    [setOpen],
  );

  // Choosing a day closes the calendar; the field then shows the result.
  const commit = useCallback(
    (date: Date) => {
      setSelected(date);
      setDraft(null);
      close(true);
    },
    [setSelected, close],
  );

  useEffect(() => {
    if (!isOpen) return;
    // Opening while a partial date is half-typed would otherwise leave the two
    // disagreeing about what is selected.
    setDraft(null);
  }, [isOpen]);

  return (
    <div className={cn(styles.field, fieldClassName)}>
      {label != null ? (
        <label className={styles.label} htmlFor={id}>
          {label}
          {required ? <span className={styles.required} aria-hidden="true">*</span> : null}
        </label>
      ) : null}

      <div
        className={cn(styles.control, styles[size])}
        ref={floating.setAnchor}
        data-invalid={isInvalid || undefined}
        data-disabled={disabled || undefined}
      >
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode="numeric"
          className={cn(styles.input, className)}
          value={display}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          aria-errormessage={errorMessageId}
          onChange={composeEventHandlers(onChange, (event) => {
            const text = event.currentTarget.value;
            setDraft(text);

            if (text.trim() === "") {
              setSelected(null);
              return;
            }
            const parsed = fromISODate(text);
            // Partial text such as "2026-0" stays in the draft untouched.
            if (parsed && isWithin(parsed, min, max)) setSelected(parsed);
          })}
          onBlur={composeEventHandlers(onBlur, () => {
            // Reformatting happens here rather than mid-typing, where it would
            // fight the caret.
            setDraft(null);
          })}
          onKeyDown={composeEventHandlers(onKeyDown, (event) => {
            if (event.key === "ArrowDown" && !isOpen) {
              event.preventDefault();
              setOpen(true);
            } else if (event.key === "Escape" && isOpen) {
              event.preventDefault();
              close(true);
            }
          })}
          {...rest}
        />

        <button
          ref={triggerRef}
          type="button"
          className={styles.trigger}
          aria-label={openCalendarLabel}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? dialogId : undefined}
          disabled={disabled}
          onClick={() => setOpen(!isOpen)}
        >
          <CalendarIcon />
        </button>
      </div>

      {isPresent ? (
        <Portal>
          <DismissableLayer
            ref={popoverRef}
            id={dialogId}
            role="dialog"
            aria-label={calendarLabel}
            aria-modal={false}
            data-state={state}
            className={styles.popover}
            style={floating.floatingStyles}
            onDismiss={(reason) => close(reason === "escape")}
            excludedElements={[inputRef.current, triggerRef.current]}
          >
            <Calendar
              plain
              autoFocus
              value={selected}
              onValueChange={commit}
              {...(min ? { min } : {})}
              {...(max ? { max } : {})}
              {...(isDateDisabled ? { isDateDisabled } : {})}
              weekStartsOn={weekStartsOn}
              {...(locale ? { locale } : {})}
              label={calendarLabel}
            />
          </DismissableLayer>
        </Portal>
      ) : null}

      {description != null ? (
        <p className={styles.description} id={descriptionId}>{description}</p>
      ) : null}
      {errorMessage != null ? (
        <p className={styles.error} id={errorId}>{errorMessage}</p>
      ) : null}

      {/* A text field of ISO dates submits its own value, but a named picker
          should submit the canonical form even if the draft is mid-edit. */}
      {name ? (
        <input type="hidden" name={name} value={selected ? toISODate(selected) : ""} disabled={disabled} />
      ) : null}
    </div>
  );
});

DatePicker.displayName = "DatePicker";
