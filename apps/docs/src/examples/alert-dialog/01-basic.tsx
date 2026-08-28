import { useRef } from "react";
import { AlertDialog, Button, toast } from "@abek/awesome-ui";

export default function AlertDialogBasic() {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <Button variant="danger">Delete project</Button>
      </AlertDialog.Trigger>
      <AlertDialog.Overlay />
      {/* Focus starts on Cancel: a destructive dialog should not open with the
          destructive button under the return key. */}
      <AlertDialog.Content initialFocusRef={cancelRef}>
        <AlertDialog.Header>
          <AlertDialog.Title>Delete project?</AlertDialog.Title>
          <AlertDialog.Description>
            This permanently removes the project and everything in it. Clicking outside
            will not dismiss this — you have to choose.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel asChild>
            <Button ref={cancelRef} variant="ghost">Cancel</Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <Button variant="danger" onClick={() => toast.success("Project deleted")}>
              Delete
            </Button>
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
