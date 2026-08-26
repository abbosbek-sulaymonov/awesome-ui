import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { UseFloatingReturn } from "../../hooks/useFloating";

export interface SelectContextValue {
  value: string;
  setValue: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;

  disabled: boolean;
  required: boolean;
  contentId: string;
  triggerId: string;
  labelId: string;
  isInvalid: boolean;

  floating: UseFloatingReturn;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;

  /** Items report their label so the trigger can display the selected one. */
  registerItem: (value: string, label: ReactNode) => () => void;
  getItemLabel: (value: string) => ReactNode;
}

export const SelectContext = createContext<SelectContextValue | null>(null);

export function useSelectContext(component: string): SelectContextValue {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error(`[awesome-ui] <${component}> must be used inside <Select.Root>.`);
  }
  return context;
}
