import { forwardRef } from "react";
import { useId } from "../../hooks/useId";
import { cn } from "../../utils/cn";
import styles from "./Input.module.css";
import { inputWrapperVariants } from "./Input.variants";
import type { InputProps } from "./Input.types";

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    variant = "outline",
    size = "md",
    label,
    description,
    errorMessage,
    invalid,
    startIcon,
    endIcon,
    fieldClassName,
    wrapperClassName,
    className,
    id: providedId,
    disabled,
    required,
    "aria-describedby": providedDescribedBy,
    ...rest
  },
  ref,
) {
  const id = useId(providedId, "aui-input");
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const isInvalid = Boolean(invalid) || errorMessage != null;

  // Only reference ids for elements we actually render, or screen readers
  // announce nothing and swallow the rest of the list.
  const describedBy =
    [providedDescribedBy, description != null ? descriptionId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={cn(styles.field, fieldClassName)} data-invalid={isInvalid || undefined}>
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
        className={cn(inputWrapperVariants({ variant, size }), wrapperClassName)}
        data-invalid={isInvalid || undefined}
        data-disabled={disabled || undefined}
      >
        {startIcon ? (
          <span className={styles.affix} aria-hidden="true">
            {startIcon}
          </span>
        ) : null}

        <input
          ref={ref}
          id={id}
          className={cn(styles.input, className)}
          disabled={disabled}
          required={required}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          aria-errormessage={errorMessage != null ? errorId : undefined}
          {...rest}
        />

        {endIcon ? (
          <span className={styles.affix} aria-hidden="true">
            {endIcon}
          </span>
        ) : null}
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

Input.displayName = "Input";
