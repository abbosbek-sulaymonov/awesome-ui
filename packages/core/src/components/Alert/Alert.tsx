import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import styles from "./Alert.module.css";
import type { AlertProps, AlertTone } from "./Alert.types";

const ICON_PATHS: Record<AlertTone, string> = {
  info: "M12 16v-5M12 8h.01",
  success: "m8.5 12.5 2.5 2.5 4.5-5",
  warning: "M12 8v4.5M12 16h.01",
  danger: "M15 9l-6 6M9 9l6 6",
};

function ToneIcon({ tone, className }: { tone: AlertTone; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {tone === "warning" ? (
        <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      ) : (
        <circle cx="12" cy="12" r="9" />
      )}
      <path d={ICON_PATHS[tone]} />
    </svg>
  );
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    variant = "soft",
    tone = "info",
    title,
    icon,
    actions,
    onDismiss,
    dismissLabel = "Dismiss",
    live = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <div
      ref={ref}
      // `alert` is assertive and interrupts; `status` waits for a pause. Neither
      // belongs on a message that was already on the page when it loaded.
      role={live ? (tone === "danger" ? "alert" : "status") : undefined}
      data-tone={tone}
      data-variant={variant}
      className={cn(styles.root, styles[variant], styles[tone], className)}
      {...rest}
    >
      {icon === null ? null : (
        <span className={styles.icon} aria-hidden="true">
          {icon ?? <ToneIcon tone={tone} className={styles.icon} />}
        </span>
      )}

      <div className={styles.body}>
        {title != null ? <div className={styles.title}>{title}</div> : null}
        {children != null ? <div className={styles.description}>{children}</div> : null}
        {actions != null ? <div className={styles.actions}>{actions}</div> : null}
      </div>

      {onDismiss ? (
        <button type="button" className={styles.close} aria-label={dismissLabel} onClick={onDismiss}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      ) : null}
    </div>
  );
});

Alert.displayName = "Alert";
