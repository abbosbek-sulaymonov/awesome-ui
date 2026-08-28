import { Button, Drawer, Input } from "@abek/awesome-ui";

export default function DrawerSides() {
  return (
    <>
      {(["left", "right", "top", "bottom"] as const).map((side) => (
        <Drawer.Root key={side} side={side}>
          <Drawer.Trigger asChild>
            <Button variant="outline" size="sm">{side}</Button>
          </Drawer.Trigger>
          <Drawer.Overlay />
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Filters</Drawer.Title>
              <Drawer.Description>Slides in from the {side}.</Drawer.Description>
            </Drawer.Header>
            <Drawer.Body>
              <Input label="Search" placeholder="Type to filter" />
            </Drawer.Body>
            <Drawer.Footer>
              <Drawer.Close asChild>
                <Button variant="ghost">Cancel</Button>
              </Drawer.Close>
              <Button>Apply</Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Root>
      ))}
    </>
  );
}
