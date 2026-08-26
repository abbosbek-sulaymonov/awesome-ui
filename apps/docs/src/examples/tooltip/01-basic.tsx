import { Button, Tooltip } from "@abek/awesome-ui";

export default function TooltipBasic() {
  return (
    <>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Button variant="ghost" size="sm">Hover me</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <Tooltip.Arrow />
          Waits 500ms on hover, opens instantly on focus
        </Tooltip.Content>
      </Tooltip.Root>

      <Tooltip.Root placement="right" openDelay={0}>
        <Tooltip.Trigger asChild>
          <Button variant="ghost" size="sm">No delay</Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <Tooltip.Arrow />
          Opens immediately
        </Tooltip.Content>
      </Tooltip.Root>
    </>
  );
}
