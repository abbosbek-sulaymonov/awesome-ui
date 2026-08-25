import { useId as useReactId } from "react";

/**
 * Stable, SSR-safe id with an optional caller-supplied override.
 * Used to wire `aria-labelledby` / `aria-describedby` without collisions.
 */
export function useId(providedId?: string | undefined, prefix = "aui"): string {
  const generated = useReactId();
  return providedId ?? `${prefix}-${generated.replace(/[:«»]/g, "")}`;
}
