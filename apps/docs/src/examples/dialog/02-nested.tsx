import { Button, Dialog } from "@abek/awesome-ui";

// Escape peels one layer at a time: the inner dialog closes first, and the
// outer one stays open.
export default function DialogNested() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline">Open nested</Button>
      </Dialog.Trigger>
      <Dialog.Overlay />
      <Dialog.Content size="sm">
        <Dialog.Header>
          <Dialog.Title>Outer</Dialog.Title>
          <Dialog.Description>Press Escape and only the inner one closes.</Dialog.Description>
        </Dialog.Header>

        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button size="sm" variant="soft">Open inner</Button>
          </Dialog.Trigger>
          <Dialog.Overlay />
          <Dialog.Content size="sm">
            <Dialog.Header>
              <Dialog.Title>Inner</Dialog.Title>
              <Dialog.Description>Escape closes this one only.</Dialog.Description>
            </Dialog.Header>
          </Dialog.Content>
        </Dialog.Root>
      </Dialog.Content>
    </Dialog.Root>
  );
}
