import { createContext, useContext } from "react";
import type { UseFloatingReturn } from "../../hooks/useFloating";

export interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  triggerId: string;
  floating: UseFloatingReturn;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
  /** Close and hand focus back to the trigger. */
  closeAndRestore: () => void;
}

export const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenuContext(component: string): MenuContextValue {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error(`[awesome-ui] <${component}> must be used inside <Menu.Root>.`);
  }
  return context;
}
