import { useSyncExternalStore } from "react";
import { getServerSnapshot, getSnapshot, subscribe } from "./toastStore";
import type { ToastRecord } from "./toastStore";
import { toast } from "./toast";

export interface UseToastReturn {
  toasts: ToastRecord[];
  toast: typeof toast;
}

/**
 * Read the live queue from a component. Rarely needed — `toast()` can be
 * imported directly — but useful for a custom toast surface.
 */
export function useToast(): UseToastReturn {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { toasts: state.toasts, toast };
}
