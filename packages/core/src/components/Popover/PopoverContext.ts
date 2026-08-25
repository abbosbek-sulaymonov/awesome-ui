import { createContext, useContext } from "react";
import type { UseFloatingReturn } from "../../hooks/useFloating";

export interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  floating: UseFloatingReturn;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  modal: boolean;
}

export const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopoverContext(component: string): PopoverContextValue {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error(`[awesome-ui] <${component}> must be used inside <Popover.Root>.`);
  }
  return context;
}
