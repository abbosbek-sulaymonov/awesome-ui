import type { ComponentPropsWithoutRef } from "react";
import type { ToastRecord } from "./toastStore";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToasterProps extends Omit<ComponentPropsWithoutRef<"ol">, "children"> {
  /** @default "bottom-right" */
  position?: ToastPosition | undefined;
  /** Most toasts on screen at once; the rest wait their turn. @default 4 */
  limit?: number | undefined;
  /** Distance in px a swipe must travel to dismiss. @default 60 */
  swipeThreshold?: number | undefined;
  /** Disable swipe-to-dismiss. */
  disableSwipe?: boolean | undefined;
  /** Accessible name for the live region. @default "Notifications" */
  label?: string | undefined;
  /** Replace the default rendering of a toast. */
  renderToast?: ((toast: ToastRecord) => React.ReactNode) | undefined;
}

export interface ToastItemProps {
  toast: ToastRecord;
  swipeThreshold: number;
  disableSwipe: boolean;
  closeLabel: string;
}
