import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import styles from "./Skeleton.module.css";
import type { SkeletonProps } from "./Skeleton.types";

/**
 * A placeholder for content that has not arrived.
 *
 * Always hidden from assistive tech. A screen reader announcing a row of empty
 * boxes tells nobody anything; the busy state belongs on the region that is
 * loading, as `aria-busy`, where it can be announced once instead of once per
 * placeholder.
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { variant = "rect", animation = "pulse", width, height, lines = 1, className, style, ...rest },
  ref,
) {
  const animationClass = animation === "none" ? undefined : styles[animation];

  if (variant === "text" && lines > 1) {
    return (
      <div ref={ref} aria-hidden="true" className={className} style={style} {...rest}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={cn(styles.root, styles.text, animationClass)}
            style={{
              // The last line runs short, which is what makes a stack of bars
              // read as a paragraph rather than a table.
              width: index === lines - 1 ? "60%" : (width ?? "100%"),
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-variant={variant}
      className={cn(styles.root, styles[variant], animationClass, className)}
      style={{ width, height, ...style }}
      {...rest}
    />
  );
});

Skeleton.displayName = "Skeleton";
