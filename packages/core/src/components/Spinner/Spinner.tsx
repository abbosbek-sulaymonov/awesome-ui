import { forwardRef } from "react";
import { VisuallyHidden } from "../../primitives/VisuallyHidden";
import { cn } from "../../utils/cn";
import styles from "./Spinner.module.css";
import type { SpinnerProps } from "./Spinner.types";

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "md", tone = "current", label = "Loading", className, ...rest },
  ref,
) {
  // A spinner with no label is decorative; one with a label owns the
  // announcement. Never both, or the busy state is read twice.
  const isDecorative = label === null;

  return (
    <span
      ref={ref}
      role={isDecorative ? undefined : "status"}
      aria-hidden={isDecorative || undefined}
      data-size={size}
      className={cn(styles.root, styles[size], styles[tone], className)}
      {...rest}
    >
      {isDecorative ? null : <VisuallyHidden>{label}</VisuallyHidden>}
    </span>
  );
});

Spinner.displayName = "Spinner";
