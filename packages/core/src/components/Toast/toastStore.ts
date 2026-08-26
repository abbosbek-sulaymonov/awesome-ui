import type { ReactNode } from "react";

export type ToastVariant = "info" | "success" | "warning" | "error";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  id?: string | undefined;
  title?: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant | undefined;
  /** ms on screen. `Infinity` keeps it until dismissed. */
  duration?: number | undefined;
  action?: ToastAction | undefined;
  /** Hide the close button on this toast. */
  dismissible?: boolean | undefined;
  onDismiss?: (() => void) | undefined;
}

export interface ToastRecord extends Required<Pick<ToastOptions, "variant" | "duration">> {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  action?: ToastAction | undefined;
  dismissible: boolean;
  onDismiss?: (() => void) | undefined;
  /** Set on dismiss so the item can animate out before it is removed. */
  dismissed: boolean;
  createdAt: number;
}

export interface ToastState {
  toasts: ToastRecord[];
}

const DEFAULT_DURATION = 5000;

/**
 * Module-level store rather than React state.
 *
 * `toast()` has to be callable from anywhere — an API client, a route handler,
 * an event listener — not only from inside a component. Keeping the queue
 * outside React makes that the normal case instead of an escape hatch, and
 * `useSyncExternalStore` keeps subscribers correct under concurrent rendering.
 */

let state: ToastState = { toasts: [] };
const listeners = new Set<() => void>();

interface TimerRecord {
  handle: ReturnType<typeof setTimeout> | null;
  /** ms left when paused. */
  remaining: number;
  startedAt: number;
}

const timers = new Map<string, TimerRecord>();
let paused = false;
let counter = 0;

function emit(): void {
  for (const listener of listeners) listener();
}

function setState(next: ToastState): void {
  // A fresh object each time, because getSnapshot identity is what
  // useSyncExternalStore compares.
  state = next;
  emit();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

export function getSnapshot(): ToastState {
  return state;
}

/** Server render has no queue; the viewport still renders so the live region exists. */
const SERVER_STATE: ToastState = { toasts: [] };
export function getServerSnapshot(): ToastState {
  return SERVER_STATE;
}

function clearTimer(id: string): void {
  const timer = timers.get(id);
  if (timer?.handle) clearTimeout(timer.handle);
  timers.delete(id);
}

function startTimer(id: string, duration: number): void {
  if (!Number.isFinite(duration)) return;

  clearTimer(id);
  const record: TimerRecord = {
    handle: null,
    remaining: duration,
    startedAt: Date.now(),
  };
  timers.set(id, record);

  if (paused) return;
  record.handle = setTimeout(() => dismiss(id), duration);
}

export function add(options: ToastOptions = {}): string {
  const id = options.id ?? `aui-toast-${++counter}`;

  const record: ToastRecord = {
    id,
    ...(options.title !== undefined ? { title: options.title } : {}),
    ...(options.description !== undefined ? { description: options.description } : {}),
    variant: options.variant ?? "info",
    duration: options.duration ?? DEFAULT_DURATION,
    action: options.action,
    dismissible: options.dismissible ?? true,
    onDismiss: options.onDismiss,
    dismissed: false,
    createdAt: Date.now(),
  };

  const existing = state.toasts.findIndex((toast) => toast.id === id);

  setState({
    toasts:
      existing === -1
        ? [...state.toasts, record]
        : state.toasts.map((toast) => (toast.id === id ? record : toast)),
  });

  startTimer(id, record.duration);
  return id;
}

/** Patch a live toast — the basis of `toast.promise`. */
export function update(id: string, patch: Partial<ToastOptions>): void {
  const existing = state.toasts.find((toast) => toast.id === id);
  if (!existing) return;

  const next: ToastRecord = {
    ...existing,
    ...(patch.title !== undefined ? { title: patch.title } : {}),
    ...(patch.description !== undefined ? { description: patch.description } : {}),
    ...(patch.variant !== undefined ? { variant: patch.variant } : {}),
    ...(patch.duration !== undefined ? { duration: patch.duration } : {}),
    ...(patch.action !== undefined ? { action: patch.action } : {}),
    // Re-showing an updated toast should restart its life, not inherit the
    // remainder of the old one.
    dismissed: false,
  };

  setState({
    toasts: state.toasts.map((toast) => (toast.id === id ? next : toast)),
  });

  startTimer(id, next.duration);
}

/** Begin the exit animation. `remove` finishes the job. */
export function dismiss(id: string): void {
  clearTimer(id);

  const existing = state.toasts.find((toast) => toast.id === id);
  if (!existing || existing.dismissed) return;

  existing.onDismiss?.();

  setState({
    toasts: state.toasts.map((toast) =>
      toast.id === id ? { ...toast, dismissed: true } : toast,
    ),
  });
}

export function dismissAll(): void {
  for (const toast of state.toasts) dismiss(toast.id);
}

/** Drop the record once its exit animation has finished. */
export function remove(id: string): void {
  clearTimer(id);
  setState({ toasts: state.toasts.filter((toast) => toast.id !== id) });
}

/**
 * Freeze every countdown.
 *
 * Called on pointer over the viewport and on window blur — a toast that expires
 * while the user is reading it, or is away in another tab, was never seen.
 */
export function pauseAll(): void {
  if (paused) return;
  paused = true;

  for (const [, timer] of timers) {
    if (!timer.handle) continue;
    clearTimeout(timer.handle);
    timer.handle = null;
    timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.startedAt));
  }
}

export function resumeAll(): void {
  if (!paused) return;
  paused = false;

  for (const [id, timer] of timers) {
    if (timer.handle) continue;
    timer.startedAt = Date.now();
    timer.handle = setTimeout(() => dismiss(id), timer.remaining);
  }
}

/** Test-only: drop every toast and timer so one test cannot leak into the next. */
export function resetToastStore(): void {
  for (const id of [...timers.keys()]) clearTimer(id);
  paused = false;
  counter = 0;
  setState({ toasts: [] });
}
