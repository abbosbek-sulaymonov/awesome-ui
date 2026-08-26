import { forwardRef, useEffect, useState } from "react";
import { useControllableState } from "../../hooks/useControllableState";
import { useField } from "../../hooks/useField";
import { cn } from "../../utils/cn";
import { composeEventHandlers } from "../../utils/composeEventHandlers";
import { useComposedRefs } from "../../utils/composeRefs";
import styles from "./Checkbox.module.css";
import type { CheckboxProps } from "./Checkbox.types";

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    size = "md",
    checked,
    defaultChecked = false,
    onCheckedChange,
    indeterminate = false,
    label,
    description,
    errorMessage,
    invalid,
    fieldClassName,
    className,
    id: providedId,
    disabled,
    required,
    onChange,
    "aria-describedby": providedDescribedBy,
    ...rest
  },
  forwardedRef,
) {
  const [isChecked, setChecked] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    ...(onCheckedChange ? { onChange: onCheckedChange } : {}),
  });

  const [node, setNode] = useState<HTMLInputElement | null>(null);
  const ref = useComposedRefs<HTMLInputElement>(forwardedRef, setNode);

  // `indeterminate` exists only as a DOM property — there is no attribute for
  // it, so React cannot set it declaratively.
  useEffect(() => {
    if (node) node.indeterminate = indeterminate;
  }, [node, indeterminate]);

  const { id, descriptionId, errorId, isInvalid, describedBy, errorMessageId } = useField({
    id: providedId,
    hasDescription: description != null,
    hasError: errorMessage != null,
    invalid,
    describedBy: providedDescribedBy,
    prefix: "aui-checkbox",
  });

  const state = indeterminate ? "indeterminate" : isChecked ? "checked" : "unchecked";

  return (
    <div className={cn(styles.field, fieldClassName)}>
      <div className={styles.row}>
        <input
          ref={ref}
          type="checkbox"
          id={id}
          className={cn(styles.input, className)}
          checked={isChecked}
          disabled={disabled}
          required={required}
          aria-checked={indeterminate ? "mixed" : isChecked}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          aria-errormessage={errorMessageId}
          onChange={composeEventHandlers(onChange, (event) =>
            setChecked(event.currentTarget.checked),
          )}
          {...rest}
        />

        <span
          className={cn(styles.control, styles[size])}
          data-state={state}
          data-invalid={isInvalid || undefined}
          data-disabled={disabled || undefined}
          aria-hidden="true"
        >
          {state === "indeterminate" ? (
            <svg className={styles.icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 8h8" />
            </svg>
          ) : state === "checked" ? (
            <svg className={styles.icon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.5 8.5l3 3 6-6" />
            </svg>
          ) : null}
        </span>

        {label != null || description != null ? (
          <span className={styles.labelGroup}>
            {label != null ? (
              <label className={styles.label} htmlFor={id} data-disabled={disabled || undefined}>
                {label}
                {required ? (
                  <span className={styles.required} aria-hidden="true">
                    *
                  </span>
                ) : null}
              </label>
            ) : null}

            {description != null ? (
              <p className={styles.description} id={descriptionId}>
                {description}
              </p>
            ) : null}
          </span>
        ) : null}
      </div>

      {errorMessage != null ? (
        <p className={styles.error} id={errorId}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
});

Checkbox.displayName = "Checkbox";
