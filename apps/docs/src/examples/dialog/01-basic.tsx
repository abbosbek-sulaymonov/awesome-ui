import { Button, Dialog, Input } from "@abek/awesome-ui";

export default function DialogBasic() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="danger">Delete project</Button>
      </Dialog.Trigger>
      <Dialog.Overlay />
      <Dialog.Content size="sm">
        <Dialog.Header>
          <Dialog.Title>Delete project</Dialog.Title>
          <Dialog.Description>
            This permanently removes the project and everything in it.
          </Dialog.Description>
        </Dialog.Header>
        <Input label="Type the project name to confirm" placeholder="awesome-ui" />
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="ghost">Cancel</Button>
          </Dialog.Close>
          <Button variant="danger">Delete</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
