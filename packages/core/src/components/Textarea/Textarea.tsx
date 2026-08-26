import { forwardRef, useCallback, useState } from "react";
import { useControllableState } from "../../hooks/useControllableState";
import { useField } from "../../hooks/useField";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { cn } from "../../utils/cn";
import { composeEventHandlers } from "../../utils/composeEventHandlers";
import { useComposedRefs } from "../../utils/composeRefs";
import styles from "./Textarea.module.css";
import type { TextareaProps } from "./Textarea.types";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    variant = "outline",
    size = "md",
    label,
    description,
    errorMessage,
    invalid,
    autoResize,
    minRows = 3,
    maxRows,
    showCount,
    disableResize,
    fieldClassName,
    wrapperClassName,
    className,
    id: providedId,
    disabled,
    required,
    value,
    defaultValue,
    onChange,
    maxLength,
    "aria-describedby": providedDescribedBy,
    ...rest
  },
  forwardedRef,
) {
  const [node, setNode] = useState<HTMLTextAreaElement | null>(null);
  const ref = useComposedRefs<HTMLTextAreaElement>(forwardedRef, setNode);

  const [text, setText] = useControllableState<string>({
    value: value === undefined ? undefined : String(value),
    defaultValue: defaultValue === undefined ? "" : String(defaultValue),
  });

  const { id, descriptionId, errorId, isInvalid, describedBy, errorMessageId } = useField({
    id: providedId,
    hasDescription: description != null,
    hasError: errorMessage != null,
    invalid,
    describedBy: providedDescribedBy,
    prefix: "aui-textarea",
  });

  /**
   * Height is reset to `auto` before `scrollHeight` is read.
   *
   * `scrollHeight` never reports less than the element's current height, so
   * measuring without the reset means the box can only ever grow — delete a
   * paragraph and it keeps the space. The reset is what lets it shrink again.
   */
  const resize = useCallback(() => {
    if (!node || !autoResize) return;

    const style = window.getComputedStyle(node);
    const lineHeight = Number.parseFloat(style.lineHeight) || 20;
    const vertical =
      Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom) || 0;

    node.style.height = "auto";
    const contentHeight = node.scrollHeight;

    const min = lineHeight * minRows + vertical;
    const max = maxRows === undefined ? Infinity : lineHeight * maxRows + vertical;
    const next = Math.min(Math.max(contentHeight, min), max);

    node.style.height = `${next}px`;
    // Past the cap the box stops growing, so scrolling has to come back.
    node.style.overflowY = contentHeight > max ? "auto" : "hidden";
  }, [node, autoResize, minRows, maxRows]);

  // Before paint, so the box never renders at the wrong height for a frame.
  useIsomorphicLayoutEffect(resize, [resize, text]);

  const count = text.length;
  const over = maxLength !== undefined && count > maxLength;

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
        className={cn(styles.wrapper, styles[variant], styles[size], wrapperClassName)}
        data-invalid={isInvalid || undefined}
        data-disabled={disabled || undefined}
      >
        <textarea
          ref={ref}
          id={id}
          rows={minRows}
          className={cn(
            styles.textarea,
            autoResize && styles.autoResize,
            !autoResize && disableResize && styles.noResize,
            className,
          )}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          aria-errormessage={errorMessageId}
          {...(value === undefined ? { defaultValue } : { value })}
          onChange={composeEventHandlers(onChange, (event) => setText(event.currentTarget.value))}
          {...rest}
        />
      </div>

      {description != null || errorMessage != null || showCount ? (
        <div className={styles.footer}>
          <div>
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

          {showCount ? (
            <span className={styles.count} data-over={over || undefined}>
              {maxLength === undefined ? count : `${count}/${maxLength}`}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});

Textarea.displayName = "Textarea";
