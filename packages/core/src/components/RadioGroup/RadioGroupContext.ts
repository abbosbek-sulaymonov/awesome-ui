import { createContext, useContext } from "react";
import type { RadioSize } from "./RadioGroup.types";

export interface RadioGroupContextValue {
  value: string;
  setValue: (value: string) => void;
  name: string;
  size: RadioSize;
  disabled: boolean;
  required: boolean;
  isInvalid: boolean;
  /** Ids the group's own description and error live at. */
  describedBy: string | undefined;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function useRadioGroupContext(component: string): RadioGroupContextValue {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error(`[awesome-ui] <${component}> must be used inside <RadioGroup.Root>.`);
  }
  return context;
}
