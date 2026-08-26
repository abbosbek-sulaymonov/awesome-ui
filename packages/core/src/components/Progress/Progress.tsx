import { forwardRef } from "react";
import { useId } from "../../hooks/useId";
import { cn } from "../../utils/cn";
import styles from "./Progress.module.css";
import type { ProgressProps } from "./Progress.types";

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    value,
    max = 100,
    size = "md",
    tone = "accent",
    label,
    showValue,
    valueLabel,
    className,
    id: providedId,
    "aria-label": ariaLabel,
    ...rest
  },
  ref,
) {
  const id = useId(providedId, "aui-progress");
  const labelId = `${id}-label`;

  const isIndeterminate = value === null || value === undefined;

  // Guard the arithmetic rather than the caller: a value outside the range, or
  // a max of zero, should render a sane bar instead of NaN% or a 400%-wide fill.
  const safeMax = max > 0 ? max : 100;
  const clamped = isIndeterminate ? 0 : Math.min(Math.max(value, 0), safeMax);
  const percent = isIndeterminate ? 0 : Math.round((clamped / safeMax) * 100);

  return (
    <div
      ref={ref}
      className={cn(styles.root, isIndeterminate && styles.indeterminate, className)}
      data-tone={tone}
      data-state={isIndeterminate ? "indeterminate" : "determinate"}
      {...rest}
    >
      {label != null || showValue ? (
        <div className={styles.header}>
          {label != null ? (
            <span className={styles.label} id={labelId}>
              {label}
            </span>
          ) : (
            <span />
          )}
          {showValue && !isIndeterminate ? (
            <span className={styles.value}>{percent}%</span>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(styles.track, styles[size])}
        role="progressbar"
        // An indeterminate bar must omit aria-valuenow entirely. Sending 0
        // instead announces "0 percent", which is a claim about progress rather
        // than an admission that the total is unknown.
        aria-valuemin={0}
        aria-valuemax={safeMax}
        {...(isIndeterminate ? {} : { "aria-valuenow": clamped })}
        aria-valuetext={isIndeterminate ? undefined : (valueLabel ?? `${percent}%`)}
        aria-labelledby={label != null ? labelId : undefined}
        aria-label={label == null ? (ariaLabel ?? "Progress") : undefined}
      >
        <div
          className={styles.indicator}
          style={isIndeterminate ? undefined : { width: `${percent}%` }}
        />
      </div>
    </div>
  );
});

Progress.displayName = "Progress";
