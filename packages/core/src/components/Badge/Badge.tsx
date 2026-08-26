import { forwardRef } from "react";
import type { ReactNode } from "react";
import { Slot, renderAsChild } from "../../primitives/Slot";
import { VisuallyHidden } from "../../primitives/VisuallyHidden";
import { cn } from "../../utils/cn";
import { badgeVariants } from "./Badge.variants";
import styles from "./Badge.module.css";
import type { BadgeProps } from "./Badge.types";

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    asChild,
    variant = "soft",
    tone = "neutral",
    size = "md",
    square,
    dot,
    srLabel,
    className,
    children,
    ...rest
  },
  ref,
) {
  const rootProps = {
    className: cn(
      badgeVariants({ variant, tone, size, square: square ? "true" : "false" }),
      className,
    ),
    "data-variant": variant,
    "data-tone": tone,
    ...rest,
  };

  /** Wraps the content in the dot and screen-reader-label scaffolding. */
  const withAffixes = (content: ReactNode) => (
    <>
      {dot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {content}
      {srLabel != null ? <VisuallyHidden>{srLabel}</VisuallyHidden> : null}
    </>
  );

  if (asChild) {
    const content = renderAsChild(children, withAffixes, "Badge");
    if (!content) return null;

    return (
      <Slot ref={ref} {...rootProps}>
        {content}
      </Slot>
    );
  }

  return (
    <span ref={ref} {...rootProps}>
      {withAffixes(children)}
    </span>
  );
});

Badge.displayName = "Badge";
