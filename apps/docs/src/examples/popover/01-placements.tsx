import { Button, Popover } from "@abek/awesome-ui";

export default function PopoverPlacements() {
  return (
    <>
      {(["top", "right", "bottom", "left"] as const).map((placement) => (
        <Popover.Root key={placement} placement={placement}>
          <Popover.Trigger asChild>
            <Button variant="outline" size="sm">{placement}</Button>
          </Popover.Trigger>
          <Popover.Content aria-label={`${placement} popover`}>
            <Popover.Arrow />
            <strong>Placement: {placement}</strong>
            <p style={{ margin: "var(--aui-space-2) 0 0" }}>
              Flips and shifts to stay on screen. Scroll or resize to see it.
            </p>
          </Popover.Content>
        </Popover.Root>
      ))}
    </>
  );
}
