import { forwardRef } from "react";
import { useControllableState } from "../../hooks/useControllableState";
import { useField } from "../../hooks/useField";
import { cn } from "../../utils/cn";
import { composeEventHandlers } from "../../utils/composeEventHandlers";
import styles from "./Switch.module.css";
import type { SwitchProps } from "./Switch.types";

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    size = "md",
    checked,
    defaultChecked = false,
    onCheckedChange,
    label,
    description,
    errorMessage,
    invalid,
    labelFirst,
    fieldClassName,
    className,
    id: providedId,
    disabled,
    onChange,
    "aria-describedby": providedDescribedBy,
    ...rest
  },
  ref,
) {
  const [isChecked, setChecked] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    ...(onCheckedChange ? { onChange: onCheckedChange } : {}),
  });

  const { id, descriptionId, errorId, isInvalid, describedBy, errorMessageId } = useField({
    id: providedId,
    hasDescription: description != null,
    hasError: errorMessage != null,
    invalid,
    describedBy: providedDescribedBy,
    prefix: "aui-switch",
  });

  return (
    <div className={cn(styles.field, fieldClassName)}>
      <div className={cn(styles.row, labelFirst && styles.reversed)}>
        <input
          ref={ref}
          type="checkbox"
          // A switch is on or off, not selected — `role="switch"` makes screen
          // readers say so, and turns the state into on/off rather than
          // checked/unchecked.
          role="switch"
          id={id}
          className={cn(styles.input, className)}
          checked={isChecked}
          disabled={disabled}
          aria-checked={isChecked}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          aria-errormessage={errorMessageId}
          onChange={composeEventHandlers(onChange, (event) =>
            setChecked(event.currentTarget.checked),
          )}
          {...rest}
        />

        <span
          className={cn(styles.track, styles[size])}
          data-state={isChecked ? "checked" : "unchecked"}
          data-invalid={isInvalid || undefined}
          data-disabled={disabled || undefined}
          aria-hidden="true"
        >
          <span className={styles.thumb} />
        </span>

        {label != null || description != null ? (
          <span className={styles.labelGroup}>
            {label != null ? (
              <label className={styles.label} htmlFor={id} data-disabled={disabled || undefined}>
                {label}
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

Switch.displayName = "Switch";
