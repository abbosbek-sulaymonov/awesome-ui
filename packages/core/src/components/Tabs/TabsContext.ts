import { createContext, useContext } from "react";
import type { TabsActivation, TabsOrientation, TabsVariant } from "./Tabs.types";

export interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
  baseId: string;
  variant: TabsVariant;
  orientation: TabsOrientation;
  activation: TabsActivation;
  triggerId: (value: string) => string;
  panelId: (value: string) => string;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext(component: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`[awesome-ui] <${component}> must be used inside <Tabs.Root>.`);
  }
  return context;
}
