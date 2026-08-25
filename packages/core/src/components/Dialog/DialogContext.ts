import { createContext, useContext } from "react";

export interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Ids wiring the content to its title and description. */
  titleId: string;
  descriptionId: string;
  /** Set once a <Dialog.Title> mounts, so aria-labelledby is only set if real. */
  hasTitle: boolean;
  registerTitle: (present: boolean) => void;
  hasDescription: boolean;
  registerDescription: (present: boolean) => void;
  dismissOnEscape: boolean;
  dismissOnOutsideClick: boolean;
  disableScrollLock: boolean;
  modal: boolean;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
}

export const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialogContext(component: string): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error(`[awesome-ui] <${component}> must be used inside <Dialog.Root>.`);
  }
  return context;
}
