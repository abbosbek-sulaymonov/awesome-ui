import { forwardRef } from "react";
import { Dialog } from "../Dialog";
import type {
  AlertDialogActionProps,
  AlertDialogContentProps,
  AlertDialogDescriptionProps,
  AlertDialogOverlayProps,
  AlertDialogRootProps,
  AlertDialogTitleProps,
  AlertDialogTriggerProps,
} from "./AlertDialog.types";

/**
 * A dialog that interrupts to demand a decision.
 *
 * Built on Dialog rather than beside it — the machinery is identical, and only
 * the semantics differ:
 *
 *   - `role="alertdialog"`, which tells assistive tech this is urgent and makes
 *     it announce the description immediately rather than waiting to be read.
 *   - Clicking outside never dismisses. A confirmation is a question, and
 *     clicking away is an ambiguous answer to it; the user has to pick.
 *   - No close button in the corner, for the same reason. Cancelling is one of
 *     the actions, not a way out of the frame.
 *
 * Escape still dismisses by default, because trapping someone with no keyboard
 * exit is worse than an accidental cancel — and Escape maps to cancel, which is
 * the safe choice.
 */
function AlertDialogRoot({
  children,
  open,
  defaultOpen,
  onOpenChange,
  dismissOnEscape = true,
}: AlertDialogRootProps) {
  return (
    <Dialog.Root
      {...(open !== undefined ? { open } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange ? { onOpenChange } : {})}
      dismissOnEscape={dismissOnEscape}
      dismissOnOutsideClick={false}
    >
      {children}
    </Dialog.Root>
  );
}

AlertDialogRoot.displayName = "AlertDialog.Root";

const AlertDialogTrigger = forwardRef<HTMLButtonElement, AlertDialogTriggerProps>(
  function AlertDialogTrigger(props, ref) {
    return <Dialog.Trigger ref={ref} {...props} />;
  },
);

AlertDialogTrigger.displayName = "AlertDialog.Trigger";

const AlertDialogOverlay = forwardRef<HTMLDivElement, AlertDialogOverlayProps>(
  function AlertDialogOverlay(props, ref) {
    return <Dialog.Overlay ref={ref} {...props} />;
  },
);

AlertDialogOverlay.displayName = "AlertDialog.Overlay";

const AlertDialogContent = forwardRef<HTMLDivElement, AlertDialogContentProps>(
  function AlertDialogContent({ size = "sm", ...rest }, ref) {
    return (
      <Dialog.Content
        ref={ref}
        size={size}
        showCloseButton={false}
        {...rest}
        // After the spread, so it cannot be reverted to a plain dialog by a
        // stray `role` in the caller's props.
        role="alertdialog"
      />
    );
  },
);

AlertDialogContent.displayName = "AlertDialog.Content";

const AlertDialogTitle = forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  function AlertDialogTitle(props, ref) {
    return <Dialog.Title ref={ref} {...props} />;
  },
);

AlertDialogTitle.displayName = "AlertDialog.Title";

const AlertDialogDescription = forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(
  function AlertDialogDescription(props, ref) {
    return <Dialog.Description ref={ref} {...props} />;
  },
);

AlertDialogDescription.displayName = "AlertDialog.Description";

/** Closes the dialog and runs the action. */
const AlertDialogAction = forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  function AlertDialogAction(props, ref) {
    return <Dialog.Close ref={ref} {...props} />;
  },
);

AlertDialogAction.displayName = "AlertDialog.Action";

/** Closes the dialog without doing anything. */
const AlertDialogCancel = forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  function AlertDialogCancel(props, ref) {
    return <Dialog.Close ref={ref} {...props} />;
  },
);

AlertDialogCancel.displayName = "AlertDialog.Cancel";

export const AlertDialog = {
  Root: AlertDialogRoot,
  Trigger: AlertDialogTrigger,
  Overlay: AlertDialogOverlay,
  Content: AlertDialogContent,
  Header: Dialog.Header,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Footer: Dialog.Footer,
  Action: AlertDialogAction,
  Cancel: AlertDialogCancel,
};

export {
  AlertDialogRoot, AlertDialogTrigger, AlertDialogOverlay, AlertDialogContent,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
};
