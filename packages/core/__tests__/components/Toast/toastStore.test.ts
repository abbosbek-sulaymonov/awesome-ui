import { afterEach, describe, expect, it, vi } from "vitest";
import {
  add,
  dismiss,
  dismissAll,
  getSnapshot,
  pauseAll,
  remove,
  resetToastStore,
  resumeAll,
  subscribe,
  update,
} from "../../../src/components/Toast/toastStore";

afterEach(() => {
  resetToastStore();
  vi.useRealTimers();
});

describe("toastStore", () => {
  it("adds a toast and notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    const id = add({ title: "Saved" });

    expect(listener).toHaveBeenCalled();
    expect(getSnapshot().toasts).toHaveLength(1);
    expect(getSnapshot().toasts[0]).toMatchObject({ id, title: "Saved", variant: "info" });

    unsubscribe();
  });

  it("returns a new snapshot object on every change", () => {
    const before = getSnapshot();
    add({ title: "One" });
    expect(getSnapshot()).not.toBe(before);
  });

  it("replaces rather than duplicates when the same id is reused", () => {
    add({ id: "fixed", title: "First" });
    add({ id: "fixed", title: "Second" });

    expect(getSnapshot().toasts).toHaveLength(1);
    expect(getSnapshot().toasts[0]?.title).toBe("Second");
  });

  it("marks dismissed rather than removing, so the exit can animate", () => {
    const id = add({ title: "Saved" });
    dismiss(id);

    expect(getSnapshot().toasts).toHaveLength(1);
    expect(getSnapshot().toasts[0]?.dismissed).toBe(true);

    remove(id);
    expect(getSnapshot().toasts).toHaveLength(0);
  });

  it("fires onDismiss exactly once", () => {
    const onDismiss = vi.fn();
    const id = add({ title: "Saved", onDismiss });

    dismiss(id);
    dismiss(id);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("auto-dismisses after its duration", () => {
    vi.useFakeTimers();
    const id = add({ title: "Saved", duration: 1000 });

    vi.advanceTimersByTime(999);
    expect(getSnapshot().toasts[0]?.dismissed).toBe(false);

    vi.advanceTimersByTime(1);
    expect(getSnapshot().toasts.find((t) => t.id === id)?.dismissed).toBe(true);
  });

  it("never auto-dismisses an infinite duration", () => {
    vi.useFakeTimers();
    add({ title: "Sticky", duration: Number.POSITIVE_INFINITY });

    vi.advanceTimersByTime(60_000);
    expect(getSnapshot().toasts[0]?.dismissed).toBe(false);
  });

  it("freezes the countdown while paused and resumes with the remainder", () => {
    vi.useFakeTimers();
    add({ title: "Saved", duration: 1000 });

    vi.advanceTimersByTime(400);
    pauseAll();

    // Time passes, but a paused toast must not expire.
    vi.advanceTimersByTime(5000);
    expect(getSnapshot().toasts[0]?.dismissed).toBe(false);

    resumeAll();
    vi.advanceTimersByTime(599);
    expect(getSnapshot().toasts[0]?.dismissed).toBe(false);

    vi.advanceTimersByTime(1);
    expect(getSnapshot().toasts[0]?.dismissed).toBe(true);
  });

  it("starts new toasts paused while the queue is paused", () => {
    vi.useFakeTimers();
    pauseAll();
    add({ title: "Added while away", duration: 500 });

    vi.advanceTimersByTime(5000);
    expect(getSnapshot().toasts[0]?.dismissed).toBe(false);

    resumeAll();
    vi.advanceTimersByTime(500);
    expect(getSnapshot().toasts[0]?.dismissed).toBe(true);
  });

  it("restarts the timer when a toast is updated", () => {
    vi.useFakeTimers();
    const id = add({ title: "Saving", duration: 1000 });

    vi.advanceTimersByTime(900);
    update(id, { title: "Saved", variant: "success", duration: 1000 });

    // The old countdown must not carry over into the new state.
    vi.advanceTimersByTime(500);
    expect(getSnapshot().toasts[0]).toMatchObject({ title: "Saved", dismissed: false });

    vi.advanceTimersByTime(500);
    expect(getSnapshot().toasts[0]?.dismissed).toBe(true);
  });

  it("ignores updates for a toast that is gone", () => {
    update("missing", { title: "Nope" });
    expect(getSnapshot().toasts).toHaveLength(0);
  });

  it("dismisses every toast at once", () => {
    add({ title: "One" });
    add({ title: "Two" });
    dismissAll();

    expect(getSnapshot().toasts.every((toast) => toast.dismissed)).toBe(true);
  });
});
