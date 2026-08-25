import { useCallback } from "react";
import type { Ref, RefCallback } from "react";

function setRef<T>(ref: Ref<T> | undefined, value: T): (() => void) | void {
  if (typeof ref === "function") {
    // React 19 ref callbacks may return a cleanup function.
    return ref(value) as (() => void) | void;
  }
  if (ref !== null && ref !== undefined) {
    (ref as { current: T | null }).current = value;
  }
}

/** Fan one node out to several refs (ours + whatever the consumer passed). */
export function composeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (node: T | null) => {
    const cleanups = refs.map((ref) => setRef(ref, node as T));

    return () => {
      for (let i = 0; i < refs.length; i++) {
        const cleanup = cleanups[i];
        if (typeof cleanup === "function") cleanup();
        else setRef(refs[i], null as T);
      }
    };
  };
}

/** Memoized `composeRefs` for use inside components. */
export function useComposedRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(composeRefs(...refs), refs);
}
