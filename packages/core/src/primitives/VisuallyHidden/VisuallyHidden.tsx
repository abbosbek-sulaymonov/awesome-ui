import type { ComponentPropsWithRef } from "react";
import { cn } from "../../utils/cn";
import styles from "./VisuallyHidden.module.css";

export type VisuallyHiddenProps = ComponentPropsWithRef<"span">;

/** Text for screen readers only — labels, live-region announcements, skip links. */
export function VisuallyHidden({ className, ...rest }: VisuallyHiddenProps) {
  return <span className={cn(styles.root, className)} {...rest} />;
}

VisuallyHidden.displayName = "VisuallyHidden";
