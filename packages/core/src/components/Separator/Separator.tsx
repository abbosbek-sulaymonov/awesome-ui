import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import styles from "./Separator.module.css";
import type { SeparatorProps } from "./Separator.types";

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { orientation = "horizontal", decorative = false, label, className, ...rest },
  ref,
) {
  const hasLabel = label != null && orientation === "horizontal";

  return (
    <div
      ref={ref}
      // A decorative rule divides nothing, so announcing it as a separator is
      // noise. `role="none"` keeps it out of the tree entirely.
      role={decorative ? "none" : "separator"}
      // Horizontal is the implicit default for role="separator", so only the
      // other case needs stating.
      aria-orientation={!decorative && orientation === "vertical" ? "vertical" : undefined}
      data-orientation={orientation}
      className={cn(styles.root, styles[orientation], hasLabel && styles.labelled, className)}
      {...rest}
    >
      {hasLabel ? <span className={styles.label}>{label}</span> : null}
    </div>
  );
});

Separator.displayName = "Separator";
