import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Portal } from "../../primitives/Portal";
import { usePresence } from "../../primitives/Presence";
import { cn } from "../../utils/cn";
import styles from "./Toast.module.css";
import { ToastIcon } from "./ToastIcon";
import { pauseAll, remove, resumeAll, dismiss as storeDismiss } from "./toastStore";
import { useToast } from "./useToast";
import type { ToastItemProps, ToasterProps } from "./Toast.types";

function ToastItem({ toast, swipeThreshold, disableSwipe, closeLabel }: ToastItemProps) {
  const { isPresent, ref: presenceRef, state } = usePresence(!toast.dismissed);
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const start = useRef<number | null>(null);

  // The record only leaves the store once its exit animation has finished.
  useEffect(() => {
    if (!isPresent && toast.dismissed) remove(toast.id);
  }, [isPresent, toast.dismissed, toast.id]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLLIElement>) => {
      if (disableSwipe || event.button !== 0) return;
      // Ignore drags that begin on a control — those are presses, not swipes.
      if ((event.target as HTMLElement).closest("button,a,input")) return;

      start.current = event.clientX;
      setSwiping(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [disableSwipe],
  );

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLLIElement>) => {
    if (start.current === null) return;
    setOffset(event.clientX - start.current);
  }, []);

  const endSwipe = useCallback(
    (event: React.PointerEvent<HTMLLIElement>) => {
      if (start.current === null) return;

      const travelled = event.clientX - start.current;
      start.current = null;
      setSwiping(false);

      if (Math.abs(travelled) >= swipeThreshold) storeDismiss(toast.id);
      else setOffset(0);
    },
    [swipeThreshold, toast.id],
  );

  if (!isPresent) return null;

  const hasTitle = toast.title != null;
  const hasDescription = toast.description != null;

  return (
    <li
      ref={presenceRef as React.Ref<HTMLLIElement>}
      className={styles.toast}
      data-state={state}
      data-variant={toast.variant}
      data-swiping={swiping || undefined}
      style={
        offset === 0
          ? undefined
          : { transform: `translateX(${offset}px)`, opacity: 1 - Math.min(Math.abs(offset) / 200, 0.7) }
      }
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endSwipe}
      onPointerCancel={endSwipe}
    >
      <ToastIcon variant={toast.variant} className={styles.indicator} />

      <div className={styles.body}>
        {hasTitle ? <div className={styles.title}>{toast.title}</div> : null}
        {hasDescription ? <div className={styles.description}>{toast.description}</div> : null}
        {toast.action ? (
          <button
            type="button"
            className={styles.action}
            onClick={() => {
              toast.action?.onClick();
              storeDismiss(toast.id);
            }}
          >
            {toast.action.label}
          </button>
        ) : null}
      </div>

      {toast.dismissible ? (
        <button
          type="button"
          className={styles.close}
          aria-label={closeLabel}
          onClick={() => storeDismiss(toast.id)}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      ) : null}
    </li>
  );
}

/**
 * The toast surface. Mount it once, near the root.
 *
 * The viewport renders whether or not there are toasts, because a live region
 * has to exist in the accessibility tree *before* content is inserted into it —
 * a region created at the same moment as its first message is usually not
 * announced at all.
 */
export const Toaster = forwardRef<HTMLOListElement, ToasterProps>(function Toaster(
  {
    position = "bottom-right",
    limit = 4,
    swipeThreshold = 60,
    disableSwipe = false,
    label = "Notifications",
    renderToast,
    className,
    ...rest
  },
  forwardedRef,
) {
  const { toasts } = useToast();

  // Countdowns freeze while the tab is in the background; a toast that expired
  // while the user was elsewhere was never actually seen.
  useEffect(() => {
    const onBlur = () => pauseAll();
    const onFocus = () => resumeAll();
    const onVisibility = () => (document.hidden ? pauseAll() : resumeAll());

    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Dismissed toasts still occupy a slot until their exit finishes, or the
  // queue would jump forward mid-animation.
  const visible = toasts.slice(0, limit);

  // Errors interrupt; everything else waits for a pause in speech.
  const hasError = visible.some((toast) => !toast.dismissed && toast.variant === "error");

  return (
    <Portal>
      <ol
        ref={forwardedRef}
        className={cn(styles.viewport, className)}
        data-position={position}
        aria-label={label}
        aria-live={hasError ? "assertive" : "polite"}
        aria-atomic="false"
        aria-relevant="additions text"
        tabIndex={-1}
        onPointerEnter={pauseAll}
        onPointerLeave={resumeAll}
        onFocusCapture={pauseAll}
        onBlurCapture={resumeAll}
        {...rest}
      >
        {visible.map((toast) =>
          renderToast ? (
            <li key={toast.id} className={styles.toast} data-variant={toast.variant}>
              {renderToast(toast)}
            </li>
          ) : (
            <ToastItem
              key={toast.id}
              toast={toast}
              swipeThreshold={swipeThreshold}
              disableSwipe={disableSwipe}
              closeLabel="Dismiss notification"
            />
          ),
        )}
      </ol>
    </Portal>
  );
});

Toaster.displayName = "Toaster";
