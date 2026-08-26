import { add, dismiss, dismissAll, update } from "./toastStore";
import type { ToastOptions, ToastVariant } from "./toastStore";

type Message = React.ReactNode;

function show(variant: ToastVariant) {
  return (title: Message, options: Omit<ToastOptions, "title" | "variant"> = {}) =>
    add({ ...options, title, variant });
}

export interface ToastPromiseMessages<T> {
  loading: Message;
  success: Message | ((value: T) => Message);
  error: Message | ((error: unknown) => Message);
}

/**
 * Imperative entry point. Callable from anywhere — the queue lives outside
 * React, so this works in an API client or an event listener, not only in a
 * component.
 *
 *   toast.success("Saved");
 *   toast.error("Could not save", { description: err.message });
 *   toast.promise(save(), { loading: "Saving…", success: "Saved", error: "Failed" });
 */
function toastFn(title: Message, options: Omit<ToastOptions, "title"> = {}): string {
  return add({ ...options, title });
}

export const toast = Object.assign(toastFn, {
  info: show("info"),
  success: show("success"),
  warning: show("warning"),
  error: show("error"),

  /** Show a toast directly from an options object. */
  custom: (options: ToastOptions) => add(options),

  dismiss,
  dismissAll,
  update,

  /**
   * Track a promise in one toast: a sticky loading state that becomes a
   * success or error toast in place.
   */
  promise<T>(promise: Promise<T>, messages: ToastPromiseMessages<T>): Promise<T> {
    const id = add({
      title: messages.loading,
      variant: "info",
      // Sticky — the promise decides when this ends, not a timer.
      duration: Number.POSITIVE_INFINITY,
      dismissible: false,
    });

    promise.then(
      (value) => {
        update(id, {
          title:
            typeof messages.success === "function"
              ? messages.success(value)
              : messages.success,
          variant: "success",
          duration: 5000,
        });
      },
      (error: unknown) => {
        update(id, {
          title:
            typeof messages.error === "function" ? messages.error(error) : messages.error,
          variant: "error",
          duration: 8000,
        });
      },
    );

    return promise;
  },
});
