import { useCallback, useRef, useState } from "react";

export interface UseControllableStateParams<T> {
  /** Controlled value. When not `undefined`, the component is controlled. */
  value?: T | undefined;
  /** Initial value for the uncontrolled case. */
  defaultValue: T;
  /** Called on every change, controlled or not. */
  onChange?: ((value: T) => void) | undefined;
}

/**
 * One state hook that covers both controlled and uncontrolled usage, so every
 * component supports `value` / `defaultValue` / `onChange` without branching.
 *
 * Warns in development if a component flips between the two modes, which is
 * almost always a bug (`value={maybeUndefined}`).
 */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateParams<T>): [T, (next: T | ((prev: T) => T)) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState<T>(defaultValue);

  const isControlled = value !== undefined;
  const current = isControlled ? value : uncontrolledValue;

  // Keep the latest onChange without making setValue's identity churn.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const wasControlled = useRef(isControlled);
  if (process.env.NODE_ENV !== "production" && wasControlled.current !== isControlled) {
    console.warn(
      `[awesome-ui] A component switched from ${
        wasControlled.current ? "controlled to uncontrolled" : "uncontrolled to controlled"
      }. Decide on one mode for the lifetime of the component.`,
    );
    wasControlled.current = isControlled;
  }

  const currentRef = useRef(current);
  currentRef.current = current;

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(currentRef.current)
          : next;

      if (Object.is(resolved, currentRef.current)) return;

      if (!isControlled) setUncontrolledValue(resolved);
      onChangeRef.current?.(resolved);
    },
    [isControlled],
  );

  return [current, setValue];
}
