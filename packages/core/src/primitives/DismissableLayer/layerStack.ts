/**
 * Module-level stack of open dismissable layers.
 *
 * Only the topmost layer reacts to Escape or an outside click. Without this,
 * a Popover opened from inside a Dialog would close both on a single Escape,
 * and an outside click would dismiss layers the user never interacted with.
 */

export interface Layer {
  id: string;
  element: HTMLElement | null;
  onDismiss: (reason: DismissReason) => void;
  /** Clicks outside this layer do not dismiss it. Used by tooltips. */
  disableOutsideDismiss: boolean;
  disableEscapeDismiss: boolean;
}

export type DismissReason = "escape" | "outside-pointer" | "focus-outside";

const layers: Layer[] = [];

export function pushLayer(layer: Layer): void {
  layers.push(layer);
}

export function removeLayer(id: string): void {
  const index = layers.findIndex((layer) => layer.id === id);
  if (index !== -1) layers.splice(index, 1);
}

export function updateLayer(id: string, patch: Partial<Layer>): void {
  const layer = layers.find((entry) => entry.id === id);
  if (layer) Object.assign(layer, patch);
}

export function getTopLayer(): Layer | undefined {
  return layers[layers.length - 1];
}

export function isTopLayer(id: string): boolean {
  return getTopLayer()?.id === id;
}

/** Layer count, so components can tell whether anything is stacked above them. */
export function getLayerCount(): number {
  return layers.length;
}

/** Test-only: drop every layer, so one test's leak cannot fail the next. */
export function resetLayerStack(): void {
  layers.length = 0;
}
