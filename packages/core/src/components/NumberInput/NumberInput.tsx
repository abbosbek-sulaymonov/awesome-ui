import { forwardRef, useCallback, useState } from "react";
import { useControllableState } from "../../hooks/useControllableState";
import { useField } from "../../hooks/useField";
import { cn } from "../../utils/cn";
import { composeEventHandlers } from "../../utils/composeEventHandlers";
import styles from "./NumberInput.module.css";
import type { NumberInputProps } from "./NumberInput.types";

/** Decimal places implied by a step, so 0.1 rounds to one place rather than fifteen. */
function precisionOf(step: number): number {
  const text = String(step);
  if (text.includes("e-")) return Number(text.split("e-")[1]);
  return (text.split(".")[1] ?? "").length;
}

const round = (value: number, precision: number): number =>
  precision > 0 ? Number(value.toFixed(precision)) : Math.round(value);

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    value,
    defaultValue = null,
    onValueChange,
    min,
    max,
    step = 1,
    largeStep,
    precision,
    size = "md",
    hideSteppers,
    wrap,
    label,
    description,
    errorMessage,
    invalid,
    fieldClassName,
    wrapperClassName,
    incrementLabel = "Increment",
    decrementLabel = "Decrement",
    className,
    id: providedId,
    disabled,
    required,
    onKeyDown,
    onBlur,
    "aria-describedby": providedDescribedBy,
    ...rest
  },
  ref,
) {
  const [current, setCurrent] = useControllableState<number | null>({
    value,
    defaultValue,
    ...(onValueChange ? { onChange: onValueChange } : {}),
  });

  /**
   * While the field has focus its text is held separately from the number.
   *
   * Parsing on every keystroke makes intermediate states impossible to type:
   * "-" is not a number, and "1." parses to 1 and immediately erases the dot
   * the user just typed. The text is authoritative while editing; the number is
   * authoritative once focus leaves.
   */
  const [draft, setDraft] = useState<string | null>(null);
  const decimals = precision ?? precisionOf(step);

  const clamp = useCallback(
    (n: number): number => {
      let result = n;
      if (min !== undefined) result = Math.max(result, min);
      if (max !== undefined) result = Math.min(result, max);
      return round(result, decimals);
    },
    [min, max, decimals],
  );

  const nudge = useCallback(
    (delta: number) => {
      if (disabled) return;

      // From empty, stepping starts at the minimum when there is one, so the
      // first press lands somewhere valid rather than at an arbitrary zero.
      const base = current ?? min ?? 0;
      const next = round(base + delta, decimals);

      if (wrap && min !== undefined && max !== undefined) {
        const span = max - min + (decimals > 0 ? 0 : 1);
        if (next > max) return setCurrent(round(min + (next - max - 1), decimals));
        if (next < min) return setCurrent(round(max - (min - next - 1), decimals));
        void span;
      }

      setCurrent(clamp(next));
      setDraft(null);
    },
    [disabled, current, min, max, decimals, wrap, clamp, setCurrent],
  );

  const { id, descriptionId, errorId, isInvalid, describedBy, errorMessageId } = useField({
    id: providedId,
    hasDescription: description != null,
    hasError: errorMessage != null,
    invalid,
    describedBy: providedDescribedBy,
    prefix: "aui-number",
  });

  const big = largeStep ?? step * 10;
  const atMin = current !== null && min !== undefined && current <= min && !wrap;
  const atMax = current !== null && max !== undefined && current >= max && !wrap;

  const display = draft ?? (current === null ? "" : String(current));

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
        className={cn(styles.wrapper, styles[size], wrapperClassName)}
        data-invalid={isInvalid || undefined}
        data-disabled={disabled || undefined}
      >
        <input
          ref={ref}
          id={id}
          // `text` with `inputMode`, not `type="number"`: a number input silently
          // reports an empty string for anything it considers invalid, so the
          // draft text cannot be read back while it is being typed.
          type="text"
          inputMode={decimals > 0 ? "decimal" : "numeric"}
          role="spinbutton"
          className={cn(styles.input, className)}
          value={display}
          disabled={disabled}
          required={required}
          aria-valuenow={current ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={current === null ? "Empty" : undefined}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          aria-errormessage={errorMessageId}
          onChange={(event) => {
            const text = event.currentTarget.value;
            setDraft(text);

            if (text.trim() === "") {
              setCurrent(null);
              return;
            }
            const parsed = Number(text);
            // Intermediate text such as "-" or "1." stays in the draft without
            // touching the value.
            if (Number.isFinite(parsed)) setCurrent(round(parsed, decimals));
          }}
          onBlur={composeEventHandlers(onBlur, () => {
            // Clamping happens here rather than on every keystroke, so typing
            // "15" into a field capped at 20 is not truncated to "1" at the
            // moment only the first digit exists.
            setDraft(null);
            if (current !== null) setCurrent(clamp(current));
          })}
          onKeyDown={composeEventHandlers(onKeyDown, (event) => {
            switch (event.key) {
              case "ArrowUp":
                event.preventDefault();
                nudge(step);
                break;
              case "ArrowDown":
                event.preventDefault();
                nudge(-step);
                break;
              case "PageUp":
                event.preventDefault();
                nudge(big);
                break;
              case "PageDown":
                event.preventDefault();
                nudge(-big);
                break;
              case "Home":
                if (min === undefined) return;
                event.preventDefault();
                setDraft(null);
                setCurrent(min);
                break;
              case "End":
                if (max === undefined) return;
                event.preventDefault();
                setDraft(null);
                setCurrent(max);
                break;
              default:
                break;
            }
          })}
          {...rest}
        />

        {hideSteppers ? null : (
          <div className={styles.steppers}>
            <button
              type="button"
              className={styles.stepper}
              aria-label={incrementLabel}
              // The input already announces the value; these would repeat it.
              tabIndex={-1}
              disabled={disabled || atMax}
              onClick={() => nudge(step)}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 10l4-4 4 4" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.stepper}
              aria-label={decrementLabel}
              tabIndex={-1}
              disabled={disabled || atMin}
              onClick={() => nudge(-step)}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>
          </div>
        )}
      </div>

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
});

NumberInput.displayName = "NumberInput";
