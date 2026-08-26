import { createContext, useContext } from "react";

export interface AccordionContextValue {
  /** Open item values, whether the accordion is single or multiple. */
  openValues: string[];
  toggle: (value: string) => void;
  disabled: boolean;
  baseId: string;
  triggerId: (value: string) => string;
  panelId: (value: string) => string;
}

export const AccordionContext = createContext<AccordionContextValue | null>(null);

export interface AccordionItemContextValue {
  value: string;
  open: boolean;
  disabled: boolean;
}

export const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

export function useAccordionContext(component: string): AccordionContextValue {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(`[awesome-ui] <${component}> must be used inside <Accordion.Root>.`);
  }
  return context;
}

export function useAccordionItemContext(component: string): AccordionItemContextValue {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error(`[awesome-ui] <${component}> must be used inside <Accordion.Item>.`);
  }
  return context;
}
