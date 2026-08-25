import { useCallback } from "react";
import { useControllableState } from "./useControllableState";

export interface UseDisclosureParams {
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
}

export interface UseDisclosureReturn {
  open: boolean;
  setOpen: (open: boolean) => void;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

/** Shared open/close state for Dialog, Popover, Drawer, Accordion, and friends. */
export function useDisclosure({
  open,
  defaultOpen = false,
  onOpenChange,
}: UseDisclosureParams = {}): UseDisclosureReturn {
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const onOpen = useCallback(() => setOpen(true), [setOpen]);
  const onClose = useCallback(() => setOpen(false), [setOpen]);
  const onToggle = useCallback(() => setOpen((prev) => !prev), [setOpen]);

  return { open: isOpen, setOpen, onOpen, onClose, onToggle };
}
