import { createContext, useContext } from "react";

export interface ToggleGroupContextValue {
  isSelected: (value: string) => boolean;
  toggle: (value: string) => void;
  disabled: boolean;
}

export const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

/** Returns null outside a group, so Toggle can work standalone. */
export function useToggleGroupContext(): ToggleGroupContextValue | null {
  return useContext(ToggleGroupContext);
}
